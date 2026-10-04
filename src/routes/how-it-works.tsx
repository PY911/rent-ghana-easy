import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CreditCard,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Y3fr3 Wo works — Ghana rentals" },
      {
        name: "description",
        content:
          "Search, request your dates, get confirmed by a verified Ghanaian vendor, then pay by Mobile Money or card. Here's how renting and listing on Y3fr3 Wo works.",
      },
      { property: "og:title", content: "How Y3fr3 Wo works" },
      {
        property: "og:description",
        content: "Renting and listing on Ghana's rental marketplace, step by step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const renterSteps = [
  {
    icon: Search,
    title: "Search what you need",
    body: "Filter by item, category, city and price. Every listing shows the real cedi rate, the minimum rental period and whether delivery is available.",
  },
  {
    icon: CalendarCheck,
    title: "Request your dates",
    body: "Pick start and end dates, add your delivery location and any notes. You'll see the estimated total before you send it.",
  },
  {
    icon: MessageCircle,
    title: "Vendor confirms",
    body: "The vendor reviews availability and confirms. You can reach them on phone or WhatsApp straight from your bookings page.",
  },
  {
    icon: Wallet,
    title: "Pay and collect",
    body: "Pay by Mobile Money or card online, or settle on delivery when the vendor allows it.",
  },
];

const vendorSteps = [
  {
    icon: Store,
    title: "Create your vendor profile",
    body: "Tell renters who you are, where you're based and what you specialise in. Verification is free.",
  },
  {
    icon: PackageCheck,
    title: "List your items",
    body: "Add photos, daily or event pricing, quantity and the cities you serve. Edit any time.",
  },
  {
    icon: CreditCard,
    title: "Get paid",
    body: "Accept requests, fulfil them, and get your payouts to Mobile Money or bank.",
  },
];

const faqs = [
  {
    q: "Is there a deposit?",
    a: "It depends on the vendor and the item. Any deposit or security requirement is shown on the listing before you send a request.",
  },
  {
    q: "Who handles delivery?",
    a: "Most vendors deliver within their city for a fee, and many cover nearby regions. Pickup is always an option where the vendor allows it.",
  },
  {
    q: "What if the item arrives damaged or late?",
    a: "Report it from your bookings page. We hold the payment while the issue is reviewed and step in when a vendor doesn't resolve it.",
  },
  {
    q: "Does it cost anything to list?",
    a: "Listing is free. A small service fee applies only on completed bookings.",
  },
  {
    q: "Which cities do you cover?",
    a: "Accra, Tema, Kumasi, Takoradi, Cape Coast, Tamale and more — vendors set the areas they serve.",
  },
];

function HowItWorks() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
      <div className="max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium">
          <ShieldCheck className="size-3.5 text-primary" /> Verified vendors only
        </span>
        <h1 className="mt-5 font-display text-4xl font-semibold sm:text-5xl">How Y3fr3 Wo works</h1>
        <p className="mt-4 text-base text-muted-foreground">
          Renting gear in Ghana usually means a dozen phone calls and no clear price. Y3fr3 Wo puts
          the vendors, the rates and the dates in one place.
        </p>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-semibold">For renters</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {renterSteps.map((step, i) => (
            <div key={step.title} className="surface-card p-6">
              <div className="flex items-center gap-3">
                <span className="brand-gradient flex size-10 items-center justify-center rounded-xl">
                  <step.icon className="size-5 text-brand-foreground" />
                </span>
                <span className="font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <Button asChild size="lg" className="mt-8">
          <Link to="/browse">Start browsing rentals</Link>
        </Button>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">For vendors</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {vendorSteps.map((step) => (
            <div key={step.title} className="surface-card p-6">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <step.icon className="size-5 text-primary" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
        <Button asChild size="lg" variant="outline" className="mt-8">
          <Link to="/vendor-application">List your items</Link>
        </Button>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold">Common questions</h2>
        <Accordion type="single" collapsible className="mt-4">
          {faqs.map((faq) => (
            <AccordionItem key={faq.q} value={faq.q}>
              <AccordionTrigger className="text-left font-display">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
