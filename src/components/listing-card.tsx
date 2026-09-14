import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin } from "lucide-react";
import type { ListingWithRelations } from "@/lib/marketplace";
import { priceLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const image = listing.images?.[0] ?? "/images/hero-event.jpg";

  return (
    <Link
      to="/listings/$slug"
      params={{ slug: listing.slug }}
      className="surface-card lift-hover group block overflow-hidden"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={image}
          alt={listing.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {listing.featured ? (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">Popular</Badge>
        ) : null}
        {listing.category ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">
            {listing.category.name}
          </span>
        ) : null}
      </div>

      <div className="space-y-2 p-4">
        <h3 className="font-display text-base font-semibold leading-snug">{listing.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {listing.city}
          {listing.vendor ? (
            <span className="ml-1 inline-flex items-center gap-1 truncate">
              · {listing.vendor.name}
              {listing.vendor.verified ? <BadgeCheck className="size-3.5 text-primary" /> : null}
            </span>
          ) : null}
        </p>
        <p className="pt-1 font-display text-lg font-semibold text-primary">
          {priceLabel(Number(listing.price), listing.price_unit)}
        </p>
      </div>
    </Link>
  );
}
