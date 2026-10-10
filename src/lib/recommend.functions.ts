import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type Recommendation = { slug: string; title: string; price: number; price_unit: string; city: string; image: string | null; reason: string };
export type RecommendResult = { summary: string; items: Recommendation[]; error?: string };

const schema = z.object({
  summary: z.string(),
  picks: z.array(z.object({ id: z.string(), reason: z.string() })),
});

export const recommendRentals = createServerFn({ method: "POST" })
  .inputValidator((input: { need: string }) => {
    const need = String(input?.need ?? "").trim();
    if (need.length < 5 || need.length > 1000) throw new Error("Describe your need in 5–1000 characters.");
    return { need };
  })
  .handler(async ({ data }): Promise<RecommendResult> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { summary: "", items: [], error: "AI recommendations are not configured." };
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const db = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await db
      .from("public_listings")
      .select("id, title, slug, description, price, price_unit, city, quantity, images, category:categories(name)")
      .eq("status", "published")
      .limit(250);
    if (error || !rows?.length) return { summary: "", items: [], error: "No listings are available right now." };

    const catalogue = rows
      .map((r) => {
        const cat = (r.category as { name?: string } | null)?.name ?? "";
        return `${r.id} | ${r.title} | ${cat} | ${r.city} | GHS ${r.price}/${r.price_unit} | qty ${r.quantity} | ${(r.description ?? "").slice(0, 140)}`;
      })
      .join("\n");

    let runId: string | undefined;
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
      fetch: async (input, init) => {
        const headers = new Headers(init?.headers);
        if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
        const res = await fetch(input, { ...init, headers });
        runId ??= res.headers.get("X-Lovable-AIG-Run-ID") ?? undefined;
        return res;
      },
    });

    try {
      const result = streamText({
        model: provider.responses("openai/gpt-6-astra"),
        instructions:
          "You are the rental assistant for Yɛɛ Kɔ, a rental marketplace in Ghana. Recommend up to 6 listings from the catalogue that best match the renter's need. Only use ids from the catalogue. Prefer the city the renter mentions. Give a one-sentence reason per pick and a short overall summary (mention if nothing fits well). Never invent items, prices or availability.",
        prompt: `Catalogue (id | title | category | city | price | quantity | description):\n${catalogue}\n\nRenter's need: ${data.need}`,
        output: Output.object({ schema }),
        maxRetries: 0,
        providerOptions: {
          openai: {
            forceReasoning: true,
            reasoningEffort: "low",
            reasoningSummary: "auto",
            store: false,
            include: ["reasoning.encrypted_content"],
          },
        },
      });
      const out = await result.output;
      const byId = new Map(rows.map((r) => [r.id, r]));
      const items: Recommendation[] = out.picks.flatMap((p) => {
        const r = byId.get(p.id);
        if (!r) return [];
        return [{ slug: r.slug!, title: r.title!, price: Number(r.price), price_unit: r.price_unit!, city: r.city!, image: r.images?.[0] ?? null, reason: p.reason }];
      });
      return { summary: out.summary, items };
    } catch (e) {
      const status = (e as { statusCode?: number }).statusCode;
      console.error("recommendRentals failed", status, e);
      const msg =
        status === 429 ? "Too many requests right now — please try again in a moment."
        : status === 402 ? "AI credits have run out. Please try again later."
        : "We couldn't get recommendations right now. Please try again.";
      return { summary: "", items: [], error: msg };
    }
  });
