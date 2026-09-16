import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, CheckCircle2, MapPin, ShieldCheck, Truck } from "lucide-react";
import { listingBySlugQuery } from "@/lib/marketplace";
import { priceLabel } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/listings/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replaceAll("-", " ")} rental — Y3fr3 Wo` },
      { name: "description", content: "View rental details, pricing and availability from a verified Ghanaian vendor." },
      { property: "og:title", content: "Rental details — Y3fr3 Wo" },
      { property: "og:description", content: "View pricing and request rental dates from a verified vendor in Ghana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ListingDetail,
});

function ListingDetail() {
  const { slug } = Route.useParams();
  const { data: listing, isLoading } = useQuery(listingBySlugQuery(slug));

  if (isLoading) {
    return <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2"><Skeleton className="aspect-4/3 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!listing) {
    return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-3xl font-semibold">This item is unavailable</h1><p className="mt-3 text-muted-foreground">It may have been removed or paused by the vendor.</p><Button asChild className="mt-6"><Link to="/browse">Browse other rentals</Link></Button></div>;
  }

  const image = listing.images?.[0] ?? "/images/hero-event.jpg";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground"><Link to="/browse" className="hover:text-foreground">Browse</Link><span className="mx-2">/</span>{listing.category?.name ?? "Rental"}</nav>
      <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
        <div>
          <div className="aspect-4/3 overflow-hidden rounded-2xl bg-muted"><img src={image} alt={listing.title} className="size-full object-cover" /></div>
          <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">{listing.category?.name}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{listing.title}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin className="size-4" /> {listing.city}</p>
            </div>
            <p className="font-display text-2xl font-semibold text-primary">{priceLabel(Number(listing.price), listing.price_unit)}</p>
          </div>
          <p className="mt-7 max-w-3xl text-sm leading-7 text-muted-foreground">{listing.description}</p>
          <div className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-3">
            <p className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-primary" /> {listing.quantity} available</p>
            <p className="flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-primary" /> {listing.min_days} day minimum</p>
            <p className="flex items-center gap-2 text-sm"><Truck className="size-4 text-primary" /> Delivery available</p>
          </div>
        </div>

        <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <span className="brand-gradient flex size-11 items-center justify-center rounded-xl font-display text-xs font-semibold text-primary-foreground">{listing.vendor?.name.slice(0, 2).toUpperCase()}</span>
            <div><p className="flex items-center gap-1 font-display text-sm font-semibold">{listing.vendor?.name}{listing.vendor?.verified ? <BadgeCheck className="size-4 text-primary" /> : null}</p><p className="mt-1 text-xs text-muted-foreground">Verified vendor in {listing.vendor?.city}</p></div>
          </div>
          <h2 className="mt-6 font-display text-lg font-semibold">Request your dates</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="start">Start date</Label><Input id="start" type="date" /></div>
            <div className="space-y-2"><Label htmlFor="end">End date</Label><Input id="end" type="date" /></div>
          </div>
          <div className="mt-4 space-y-2"><Label htmlFor="location">Delivery area</Label><Input id="location" placeholder="e.g. East Legon, Accra" /></div>
          <Button asChild size="lg" className="mt-5 w-full"><Link to="/auth">Continue to request</Link></Button>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-3.5" /> You won&apos;t be charged yet</p>
        </aside>
      </div>
    </div>
  );
}