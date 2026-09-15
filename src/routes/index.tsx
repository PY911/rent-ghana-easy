import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarCheck, MapPin, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useState } from "react";
import {
  categoriesQuery,
  featuredListingsQuery,
  newestListingsQuery,
  topVendorsQuery,
} from "@/lib/marketplace";
import { GHANA_CITIES } from "@/lib/format";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rentafro — Rent event, construction & power gear in Ghana" },
      {
        name: "description",
        content:
          "Rent chairs, canopies, sound systems, generators, excavators, vehicles and camera kits from verified Ghanaian vendors. Compare prices in cedis and book online.",
      },
      { property: "og:title", content: "Rentafro — Ghana's rental marketplace" },
      {
        property: "og:description",
        content:
          "Compare verified vendors across Ghana for events, construction, power, vehicles and production gear.",
      },
    ],
  }),
  component: Home,
});

const categoryImages: Record<string, string> = {
  "events-parties": "/images/chairs-tables.jpg",
  "sound-lighting": "/images/sound-system.jpg",
  construction: "/images/excavator.jpg",
  "power-generators": "/images/generator.jpg",
  vehicles: "/images/suv.jpg",
  "decor-furniture": "/images/decor-backdrop.jpg",
  "kids-play": "/images/bouncy-castle.jpg",
  "photo-video": "/images/camera-kit.jpg",
  scaffolding: "/images/scaffolding.jpg",
};

function Hero() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState<string>("");

  return (
    <section className="relative isolate">
      <img
        src="/images/hero-event.jpg"
        alt="Event setup with canopies and chairs in Accra"
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="hero-overlay absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-24 sm:pt-32">
        <span className="inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur">
          <Sparkles className="size-3.5" /> 250+ verified vendors across Ghana
        </span>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] text-primary-foreground sm:text-6xl">
          Rent anything you need,
          <br />
          anywhere in Ghana.
        </h1>
        <p className="mt-5 max-w-xl text-base text-primary-foreground/85 sm:text-lg">
          Chairs and canopies for the wedding. A generator for the site. An excavator, a pickup, a
          full camera kit. One place, cedi prices, no endless phone calls.
        </p>

        <div className="surface-card mt-8 flex max-w-3xl flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="What do you want to rent?"
              className="h-12 border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="h-12 border-0 shadow-none focus-visible:ring-0 sm:w-44">
              <SelectValue placeholder="Any city" />
            </SelectTrigger>
            <SelectContent>
              {GHANA_CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild size="lg" className="h-12">
            <Link
              to="/browse"
              search={{ ...(q ? { q } : {}), ...(city ? { city } : {}) }}
            >
              Search
            </Link>
          </Button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Canopies", "Sound system", "Generator", "Excavator", "Pickup truck"].map((tag) => (
            <Link
              key={tag}
              to="/browse"
              search={{ q: tag }}
              className="rounded-full bg-background/15 px-3 py-1.5 text-xs font-medium text-primary-foreground backdrop-blur transition-colors hover:bg-background/30"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryStrip() {
  const { data, isLoading } = useQuery(categoriesQuery);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Browse by category</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From wedding decor to heavy plant — everything vetted before it goes live.
          </p>
        </div>
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/browse">
            See all <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-4/3 rounded-xl" />
            ))
          : (data ?? []).map((cat) => (
              <Link
                key={cat.id}
                to="/browse"
                search={{ category: cat.slug }}
                className="surface-card lift-hover group relative block overflow-hidden"
              >
                <div className="aspect-4/3 overflow-hidden">
                  <img
                    src={categoryImages[cat.slug] ?? "/images/hero-event.jpg"}
                    alt={cat.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/80 to-transparent p-4">
                  <p className="font-display text-sm font-semibold text-primary-foreground">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
}

function ListingSection({
  title,
  subtitle,
  query,
}: {
  title: string;
  subtitle: string;
  query: typeof featuredListingsQuery;
}) {
  const { data, isLoading } = useQuery(query);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button asChild variant="ghost" className="hidden sm:inline-flex">
          <Link to="/browse">
            View more <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))
          : (data ?? []).map((listing) => <ListingCard key={listing.id} listing={listing} />)}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Search,
    title: "Find it",
    body: "Search by item, city or category and compare real cedi prices side by side.",
  },
  {
    icon: CalendarCheck,
    title: "Book your dates",
    body: "Send a request with your dates and delivery spot. Vendors confirm quickly.",
  },
  {
    icon: Truck,
    title: "Delivered & set up",
    body: "Pickup or delivery, your choice. Pay online or on delivery.",
  },
];

function HowItWorksTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="surface-card grid gap-8 p-8 sm:p-12 lg:grid-cols-3">
        {steps.map((step, i) => (
          <div key={step.title}>
            <span className="brand-gradient inline-flex size-11 items-center justify-center rounded-xl">
              <step.icon className="size-5 text-primary-foreground" />
            </span>
            <h3 className="mt-4 font-display text-lg font-semibold">
              {i + 1}. {step.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VendorStrip() {
  const { data } = useQuery(topVendorsQuery);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <h2 className="font-display text-2xl font-semibold sm:text-3xl">Top rated vendors</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Rated by renters who actually collected the gear.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((vendor) => (
          <Link
            key={vendor.id}
            to="/vendors/$slug"
            params={{ slug: vendor.slug }}
            className="surface-card lift-hover block p-5"
          >
            <div className="flex items-center gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-display text-sm font-semibold">
                {vendor.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold">{vendor.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" /> {vendor.city}
                </p>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{vendor.description}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              <ShieldCheck className="size-3.5" /> {Number(vendor.rating).toFixed(1)} rating
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function VendorCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6">
      <div className="brand-gradient flex flex-col items-start gap-6 rounded-3xl p-8 sm:p-14 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-2xl font-semibold text-primary-foreground sm:text-3xl">
            Got gear sitting idle? Put it to work.
          </h2>
          <p className="mt-3 text-sm text-primary-foreground/85 sm:text-base">
            List your equipment free, set your own prices and get booking requests from renters
            across Ghana.
          </p>
        </div>
        <Button asChild size="lg" variant="secondary">
          <Link to="/vendor">Become a vendor</Link>
        </Button>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <Hero />
      <CategoryStrip />
      <ListingSection
        title="Popular right now"
        subtitle="The items renters book most this month."
        query={featuredListingsQuery}
      />
      <HowItWorksTeaser />
      <ListingSection
        title="Newly listed"
        subtitle="Fresh gear from vendors who just joined."
        query={newestListingsQuery}
      />
      <VendorStrip />
      <VendorCta />
    </>
  );
}
