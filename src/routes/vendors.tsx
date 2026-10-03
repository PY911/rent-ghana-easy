import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Vendor } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const allVendorsQuery = queryOptions({
  queryKey: ["vendors", "all"],
  queryFn: async (): Promise<Vendor[]> => {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("verified", { ascending: false })
      .order("rating", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const Route = createFileRoute("/vendors")({
  head: () => ({
    meta: [
      { title: "Rental vendors in Ghana — Y3fr3 Wo" },
      {
        name: "description",
        content:
          "Browse verified rental vendors across Accra, Kumasi, Tema and Takoradi. See ratings, specialities and the equipment each vendor offers.",
      },
      { property: "og:title", content: "Verified rental vendors in Ghana" },
      {
        property: "og:description",
        content: "Ratings, specialities and locations for rental vendors across Ghana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Vendors,
});

function Vendors() {
  const { data, isLoading } = useQuery(allVendorsQuery);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Vendor directory</h1>
        <p className="mt-4 text-base text-muted-foreground">
          The businesses behind the gear. Every verified vendor has had their identity and equipment
          checked before listing.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
          : (data ?? []).map((vendor) => (
              <Link
                key={vendor.id}
                to="/browse"
                className="surface-card lift-hover block p-6"
              >
                <div className="flex items-start gap-3">
                  <span className="brand-gradient flex size-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-semibold text-primary-foreground">
                    {vendor.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-1.5 font-display text-base font-semibold">
                      <span className="truncate">{vendor.name}</span>
                      {vendor.verified ? <BadgeCheck className="size-4 shrink-0 text-primary" /> : null}
                    </h2>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {vendor.city}
                    </p>
                  </div>
                </div>
                <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
                  {vendor.about}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  <Star className="size-4 fill-accent text-accent" />
                  {Number(vendor.rating).toFixed(1)}
                  <span className="text-xs font-normal text-muted-foreground">verified renter rating</span>
                </p>
              </Link>
            ))}
      </div>

      <div className="brand-gradient mt-14 flex flex-col items-start gap-5 rounded-3xl p-8 sm:flex-row sm:items-center sm:justify-between sm:p-12">
        <div>
          <h2 className="font-display text-2xl font-semibold text-primary-foreground">
            Run a rental business?
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/85">
            Join the directory and start receiving booking requests.
          </p>
        </div>
        <Button asChild size="lg" variant="secondary">
          <Link to="/vendor-application">Become a vendor</Link>
        </Button>
      </div>
    </div>
  );
}
