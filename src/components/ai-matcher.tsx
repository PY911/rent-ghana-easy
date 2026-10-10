import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { recommendRentals, type RecommendResult } from "@/lib/recommend.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiMatcher() {
  const recommend = useServerFn(recommendRentals);
  const [need, setNeed] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (need.trim().length < 5) return;
    setLoading(true);
    setResult(null);
    try {
      setResult(await recommend({ data: { need } }));
    } catch (err) {
      setResult({ summary: "", items: [], error: err instanceof Error ? err.message : "Something went wrong." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-primary" />
        <h2 className="font-display text-lg font-semibold">Tell us what you need</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Describe your event or project and our AI-powered assistant will suggest matching rentals.
      </p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <Textarea
          value={need}
          onChange={(e) => setNeed(e.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="e.g. Outdoor wedding for 150 guests in Kumasi next month — need tents, chairs and a sound system"
        />
        <Button type="submit" disabled={loading || need.trim().length < 5}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {loading ? "Finding matches…" : "Find rentals"}
        </Button>
      </form>

      {result?.error ? <p className="mt-4 text-sm text-destructive">{result.error}</p> : null}
      {result && !result.error ? (
        <div className="mt-5 space-y-3">
          {result.summary ? <p className="text-sm">{result.summary}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {result.items.map((item) => (
              <Link
                key={item.slug}
                to="/listings/$slug"
                params={{ slug: item.slug }}
                className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted"
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="size-16 shrink-0 rounded-lg object-cover" loading="lazy" />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.city} · GHS {item.price.toLocaleString()} / {item.price_unit}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
