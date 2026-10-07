import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_rentals",
  title: "Search rentals",
  description: "Search approved rental listings in Ghana by keyword and city.",
  inputSchema: {
    query: z.string().trim().max(100).optional().describe("Words in the rental item title."),
    city: z.string().trim().max(80).optional().describe("Ghanaian city, such as Accra or Kumasi."),
    limit: z.number().int().min(1).max(25).default(10).describe("Maximum listings to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, city, limit }, ctx) => {
    if (!ctx.isAuthenticated()) throw new ToolError("Sign in to Yɛɛ Kɔ to search rentals.");
    const supabase = supabaseForUser(ctx);
    let request = supabase
      .from("public_listings")
      .select("id,title,slug,description,price,price_unit,min_days,city,quantity,images,vendor_id")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .limit(limit);
    if (query) request = request.ilike("title", `%${query}%`);
    if (city) request = request.ilike("city", city);
    const { data, error } = await request;
    if (error) throw new ToolError("Rental search could not be completed.");
    const listings = (data ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      priceGhs: item.price,
      priceUnit: item.price_unit,
      minimumDays: item.min_days,
      city: item.city,
      availableQuantity: item.quantity,
      image: item.images?.[0] ?? null,
      vendorId: item.vendor_id,
    }));
    return {
      content: [{ type: "text", text: listings.length ? `Found ${listings.length} rentals.` : "No matching rentals were found." }],
      structuredContent: { listings },
    };
  },
});