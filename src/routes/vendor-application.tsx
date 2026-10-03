import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/vendor-application")({
  head: () => ({
    meta: [
      { title: "Apply to become a rental provider — Y3fr3 Wo" },
      { name: "description", content: "Apply to offer your rental equipment, vehicles or event supplies on Y3fr3 Wo in Ghana." },
      { property: "og:title", content: "Become a rental provider — Y3fr3 Wo" },
      { property: "og:description", content: "Tell us about your rental business and inventory to join Y3fr3 Wo in Ghana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: VendorApplicationPage,
});

const inputClass = "h-11 bg-card";
const labelClass = "text-sm font-semibold";

function VendorApplicationPage() {
  const { user, loading } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const applications = useQuery({
    queryKey: ["vendor-applications", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("id, business_name, status, created_at")
        .eq("applicant_id", user?.id ?? "")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || submitting) return;
    setErrorMessage("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    try {
      const { error } = await supabase.from("vendor_applications").insert({
        applicant_id: user.id,
        business_name: value("business_name"),
        contact_name: value("contact_name"),
        email: value("email"),
        phone: value("phone"),
        whatsapp: value("whatsapp") || null,
        city: value("city"),
        address: value("address"),
        business_description: value("business_description"),
        inventory_details: value("inventory_details"),
      });
      if (error) throw error;
      setSubmitted(true);
      await applications.refetch();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "We couldn't send your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-primary">
          <Store className="size-4" /> For Ghanaian rental providers
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Grow your rental business with Y3fr3 Wo.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
          Tell us about your business and the items you rent out. We&apos;ll review your application before anything goes live.
        </p>
      </div>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-16">
        <div className="min-w-0">
          {loading ? (
            <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Checking your account…</div>
          ) : !user ? (
            <div className="border-t border-border pt-8">
              <h2 className="font-display text-2xl font-semibold">Start your application</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Sign in or create an account to send your business and inventory details securely. Return to this page after signing in.
              </p>
              <Button asChild size="lg" className="mt-6"><Link to="/auth">Sign in or create an account <ArrowRight /></Link></Button>
            </div>
          ) : submitted ? (
            <div role="status" className="border-t border-border pt-10">
              <CheckCircle2 className="size-12 text-primary" />
              <h2 className="mt-5 font-display text-3xl font-semibold">Application received</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
                Thanks for sharing your business with us. Your details are private while we review them. We&apos;ll reach out using the contact information you provided.
              </p>
              <Button asChild variant="outline" className="mt-7"><Link to="/">Back to home</Link></Button>
            </div>
          ) : (
            <>
              {applications.isError ? (
                <p role="alert" className="mb-6 border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  We couldn&apos;t load your previous applications. You can still submit a new one.
                </p>
              ) : null}
              {applications.data && applications.data.length > 0 ? (
                <div className="mb-10 border-l-2 border-primary bg-secondary px-5 py-4">
                  <h2 className="font-display text-base font-semibold">Your applications</h2>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {applications.data.map((application) => (
                      <li key={application.id} className="flex flex-wrap justify-between gap-x-4">
                        <span className="font-medium text-foreground">{application.business_name}</span>
                        <span className="capitalize">{application.status === "pending" ? "Under review" : application.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <form onSubmit={handleSubmit} className="space-y-10">
                <section aria-labelledby="business-heading" className="border-t border-border pt-7">
                  <p className="text-xs font-bold uppercase text-primary">01 / Your business</p>
                  <h2 id="business-heading" className="mt-2 font-display text-2xl font-semibold">Business details</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2"><Label className={labelClass} htmlFor="business_name">Business name *</Label><Input className={inputClass} id="business_name" name="business_name" placeholder="e.g. Akosua Events & Rentals" required minLength={2} maxLength={150} /></div>
                    <div className="space-y-2"><Label className={labelClass} htmlFor="city">City or town *</Label><Input className={inputClass} id="city" name="city" placeholder="e.g. Accra" required minLength={2} maxLength={100} /></div>
                    <div className="space-y-2"><Label className={labelClass} htmlFor="address">Business address or area *</Label><Input className={inputClass} id="address" name="address" placeholder="e.g. East Legon, Accra" required minLength={5} maxLength={300} /></div>
                    <div className="space-y-2 sm:col-span-2"><Label className={labelClass} htmlFor="business_description">Tell us about your business *</Label><Textarea className="min-h-28 bg-card" id="business_description" name="business_description" placeholder="What do you specialise in, and where do you serve customers?" required minLength={20} maxLength={2000} /></div>
                  </div>
                </section>

                <section aria-labelledby="contact-heading" className="border-t border-border pt-7">
                  <p className="text-xs font-bold uppercase text-primary">02 / Your contact</p>
                  <h2 id="contact-heading" className="mt-2 font-display text-2xl font-semibold">Who should we speak to?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">These details are only for our team to contact you about your application.</p>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2"><Label className={labelClass} htmlFor="contact_name">Contact name *</Label><Input className={inputClass} id="contact_name" name="contact_name" placeholder="Your full name" required minLength={2} maxLength={150} /></div>
                    <div className="space-y-2"><Label className={labelClass} htmlFor="email">Email address *</Label><Input className={inputClass} id="email" name="email" type="email" defaultValue={user.email ?? ""} required maxLength={254} /></div>
                    <div className="space-y-2"><Label className={labelClass} htmlFor="phone">Phone number *</Label><Input className={inputClass} id="phone" name="phone" type="tel" placeholder="e.g. +233 24 123 4567" required minLength={7} maxLength={30} /></div>
                    <div className="space-y-2"><Label className={labelClass} htmlFor="whatsapp">WhatsApp number <span className="font-normal text-muted-foreground">(optional)</span></Label><Input className={inputClass} id="whatsapp" name="whatsapp" type="tel" placeholder="If different from your phone" maxLength={30} /></div>
                  </div>
                </section>

                <section aria-labelledby="inventory-heading" className="border-t border-border pt-7">
                  <p className="text-xs font-bold uppercase text-primary">03 / Your inventory</p>
                  <h2 id="inventory-heading" className="mt-2 font-display text-2xl font-semibold">What do you rent out?</h2>
                  <p className="mt-2 text-sm text-muted-foreground">List your main items, available quantities and your own rental rates in GH₵. Approximate rates are fine for now.</p>
                  <div className="mt-6 space-y-2">
                    <Label className={labelClass} htmlFor="inventory_details">Items, quantities and rates *</Label>
                    <Textarea className="min-h-44 bg-card" id="inventory_details" name="inventory_details" placeholder={"e.g. 100 banquet chairs — GH₵15 per chair per day\n2 canopies — GH₵450 each per day\nDelivery available in Accra and Tema"} required minLength={10} maxLength={4000} />
                  </div>
                </section>

                {errorMessage ? <p role="alert" className="border-l-2 border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">{errorMessage}</p> : null}
                <div className="flex flex-col items-start gap-3 border-t border-border pt-7">
                  <Button type="submit" size="lg" disabled={submitting}>{submitting ? <Loader2 className="animate-spin" /> : <ArrowRight />} {submitting ? "Sending application…" : "Submit application"}</Button>
                  <p className="text-xs leading-5 text-muted-foreground">Submitting an application does not publish your business or items. We review everything first.</p>
                </div>
              </form>
            </>
          )}
        </div>

        <aside className="border-t border-border pt-6 lg:border-t-0 lg:border-l lg:pl-8">
          <ShieldCheck className="size-7 text-primary" />
          <h2 className="mt-4 font-display text-lg font-semibold">A thoughtful way to rent</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">You share your business details and your own prices. We review your inventory and agree on the public listing prices before your items appear on Y3fr3 Wo.</p>
          <div className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
            <p><span className="font-semibold">01.</span> Send your details</p>
            <p><span className="font-semibold">02.</span> We review your inventory</p>
            <p><span className="font-semibold">03.</span> Listings go live after approval</p>
          </div>
        </aside>
      </div>
    </div>
  );
}