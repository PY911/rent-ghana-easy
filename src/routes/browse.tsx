import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { browseListingsQuery, categoriesQuery } from "@/lib/marketplace";
import { GHANA_CITIES } from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { AiMatcher } from "@/components/ai-matcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BrowseSearch = {
  q?: string | undefined;
  category?: string | undefined;
  city?: string | undefined;
  sort?: string | undefined;
  max?: number | undefined;
};

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    city: typeof search["city"] === "string" ? search["city"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
    max: search["max"] ? Number(search["max"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse rentals in Ghana — Yɛɛ Kɔ" },
      {
        name: "description",
        content:
          "Search rental equipment across Ghana: canopies, chairs, sound systems, generators, excavators, vehicles and camera gear. Filter by city, category and price.",
      },
      { property: "og:title", content: "Browse rentals across Ghana" },
      {
        property: "og:description",
        content: "Filter thousands of rental items by city, category and price in cedis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Browse,
});

const ALL = "all";

function Browse() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: categories } = useQuery(categoriesQuery);
  const { data: listings, isLoading } = useQuery(browseListingsQuery(search));

  function setFilter(patch: Partial<BrowseSearch>) {
    navigate({ search: (prev) => ({ ...prev, ...patch }) });
  }

  const activeCategory = categories?.find((c) => c.slug === search.category);
  const hasFilters = Boolean(search.q || search.category || search.city || search.max);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {activeCategory ? activeCategory.name : "Browse rentals"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {activeCategory?.description ?? "Everything available to rent across Ghana today."}
        </p>
      </div>

      <div className="mt-6">
        <AiMatcher />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="surface-card h-fit p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <h2 className="font-display text-sm font-semibold">Filters</h2>
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 px-2 text-xs"
                onClick={() =>
                  navigate({ search: {} })
                }
              >
                <X className="size-3" /> Clear
              </Button>
            ) : null}
          </div>

          <div className="mt-5 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="q">Keyword</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  className="pl-9"
                  defaultValue={search.q ?? ""}
                  placeholder="e.g. canopy"
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setFilter({ q: (e.target as HTMLInputElement).value || undefined });
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={search.category ?? ALL}
                onValueChange={(v) => setFilter({ category: v === ALL ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All categories</SelectItem>
                  {(categories ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={search.city ?? ALL}
                onValueChange={(v) => setFilter({ city: v === ALL ? undefined : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Anywhere in Ghana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Anywhere in Ghana</SelectItem>
                  {GHANA_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max">Max price (GHS)</Label>
              <Input
                id="max"
                type="number"
                min={0}
                defaultValue={search.max ?? ""}
                placeholder="Any price"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = Number((e.target as HTMLInputElement).value);
                    setFilter({ max: value > 0 ? value : undefined });
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">Press Enter to apply.</p>
            </div>
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading…" : `${listings?.length ?? 0} items available`}
            </p>
            <Select
              value={search.sort ?? "recommended"}
              onValueChange={(v) => setFilter({ sort: v === "recommended" ? undefined : v })}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl" />
              ))}
            </div>
          ) : (listings?.length ?? 0) === 0 ? (
            <div className="surface-card mt-6 p-12 text-center">
              <h2 className="font-display text-lg font-semibold">Nothing matches those filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different city, widen your price range, or clear the filters.
              </p>
              <Button asChild className="mt-5">
                <Link to="/browse" search={{}}>
                  Reset filters
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(listings ?? []).map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
