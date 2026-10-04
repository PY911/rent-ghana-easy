import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, CalendarDays, CheckCircle2, Loader2, MapPin, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { listingBySlugQuery } from "@/lib/marketplace";
import { createBookingRequest } from "@/lib/bookings";
import { quoteBooking, DEPOSIT_PERCENT } from "@/lib/pricing";
import { formatCedis, priceLabel } from "@/lib/format";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const navigate = useNavigate();
  const { user } = useSession();
  const { data: listing, isLoading } = useQuery(listingBySlugQuery(slug));

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const quote = useMemo(() => {
    if (!listing) return null;
    return quoteBooking({
      price: Number(listing.price),
      priceUnit: listing.price_unit,
      minDays: listing.min_days,
      quantity,
      startDate,
      endDate,
    });
  }, [listing, quantity, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-4/3 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">This item is unavailable</h1>
        <p className="mt-3 text-muted-foreground">It may have been removed or paused by the vendor.</p>
        <Button asChild className="mt-6"><Link to="/browse">Browse other rentals</Link></Button>
      </div>
    );
  }

  const image = listing.images?.[0] ?? "/images/hero-event.jpg";
  const today = new Date().toISOString().slice(0, 10);

  async function handleRequest(event: React.FormEvent) {
    event.preventDefault();
    if (!listing) return;

    if (!user) {
      toast.info("Please sign in to send your request");
      navigate({ to: "/auth" });
      return;
    }
    if (!quote || quote.units === 0) {
      toast.error("Choose your start and end dates");
      return;
    }

    setSubmitting(true);
    try {
      const booking = await createBookingRequest({
        listing,
        startDate,
        endDate,
        quantity,
        contactName,
        contactPhone,
        deliveryAddress,
        notes,
      });
      toast.success(`Request sent — reference ${booking.reference}`);
      navigate({ to: "/bookings" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send your request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link to="/browse" className="hover:text-foreground">Browse</Link>
        <span className="mx-2">/</span>
        {listing.category?.name ?? "Rental"}
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
        <div>
          <div className="aspect-4/3 overflow-hidden rounded-2xl bg-muted">
            <img src={image} alt={listing.title} className="size-full object-cover" />
          </div>
          <div className="mt-7 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">{listing.category?.name}</p>
              <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{listing.title}</h1>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="size-4" /> {listing.city}
              </p>
            </div>
            <p className="font-display text-2xl font-semibold text-primary">
              {priceLabel(Number(listing.price), listing.price_unit)}
            </p>
          </div>
          <p className="mt-7 max-w-3xl text-sm leading-7 text-muted-foreground">{listing.description}</p>
          <div className="mt-8 grid gap-4 border-y border-border py-6 sm:grid-cols-3">
            <p className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-primary" /> {listing.quantity} available</p>
            <p className="flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-primary" /> {listing.min_days} day minimum</p>
            <p className="flex items-center gap-2 text-sm"><Truck className="size-4 text-primary" /> Delivery available</p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { title: "1. Request your dates", body: "Tell us when you need the item and where to deliver." },
              { title: "2. We confirm", body: "Our team checks availability and confirms within a few hours." },
              { title: "3. Deposit, then balance", body: `Pay ${DEPOSIT_PERCENT}% to lock the dates, the rest the day before.` },
            ].map((step) => (
              <div key={step.title} className="surface-card p-5">
                <p className="font-display text-sm font-semibold">{step.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="surface-card h-fit p-6 lg:sticky lg:top-24">
          <div className="flex items-center gap-3 border-b border-border pb-5">
            <span className="brand-gradient flex size-11 items-center justify-center rounded-xl font-display text-xs font-semibold text-primary-foreground">
              {listing.vendor?.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="flex items-center gap-1 font-display text-sm font-semibold">
                {listing.vendor?.name}
                {listing.vendor?.verified ? <BadgeCheck className="size-4 text-primary" /> : null}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Verified vendor in {listing.vendor?.city}</p>
            </div>
          </div>

          <h2 className="mt-6 font-display text-lg font-semibold">Request your dates</h2>
          <form className="mt-4 space-y-4" onSubmit={handleRequest}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start">Start date</Label>
                <Input id="start" type="date" min={today} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End date</Label>
                <Input id="end" type="date" min={startDate || today} value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={listing.quantity}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">Your name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ama Mensah" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone / WhatsApp</Label>
              <Input id="contactPhone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="024 000 0000" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Delivery address</Label>
              <Input id="location" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="e.g. East Legon, Accra" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Anything else? (optional)</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Setup time, event type, extra items…" rows={3} />
            </div>

            {quote && quote.units > 0 ? (
              <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {formatCedis(Number(listing.price))} × {quote.units} {listing.price_unit === "event" ? "event" : "day(s)"} × {quantity}
                  </span>
                  <span className="font-medium">{formatCedis(quote.total)}</span>
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Deposit now ({DEPOSIT_PERCENT}%)</span>
                  <span className="font-semibold text-primary">{formatCedis(quote.depositAmount)}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-muted-foreground">Balance by {quote.balanceDueDate ?? "delivery day"}</span>
                  <span className="font-medium">{formatCedis(quote.balanceAmount)}</span>
                </div>
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              {user ? "Send booking request" : "Sign in to request"}
            </Button>
          </form>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> No payment now — we confirm availability first
          </p>
        </aside>
      </div>
    </div>
  );
}
