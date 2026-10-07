import { useState } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Bot, Loader2, ShieldCheck, Waves } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search["authorization_id"] === "string" ? search["authorization_id"] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection request is missing its authorization code.");
    const { data } = await supabase.auth.getSession();
    const next = `${location.pathname}${location.searchStr}`;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id");
    if (!authorizationId) throw new Error("This connection request is missing its authorization code.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorizationId);
    if (error) throw error;
    if ("redirect_url" in data) throw redirect({ href: data.redirect_url });
    return data;
  },
  head: () => ({
    meta: [
      { title: "Authorize agent access — Yɛɛ Kɔ" },
      { name: "description", content: "Review and approve secure agent access to your Yɛɛ Kɔ account." },
      { property: "og:title", content: "Authorize agent access — Yɛɛ Kɔ" },
      { property: "og:description", content: "Review and approve secure agent access to your Yɛɛ Kɔ account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <Alert variant="destructive"><AlertDescription>Could not load this connection request: {error instanceof Error ? error.message : String(error)}</AlertDescription></Alert>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id: authorizationId } = Route.useSearch();
  const [busy, setBusy] = useState<"approve" | "deny" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function decide(approve: boolean) {
    setBusy(approve ? "approve" : "deny");
    setErrorMessage(null);
    const result = approve
      ? await supabase.auth.oauth.approveAuthorization(authorizationId, { skipBrowserRedirect: true })
      : await supabase.auth.oauth.denyAuthorization(authorizationId, { skipBrowserRedirect: true });
    if (result.error) {
      setBusy(null);
      setErrorMessage(result.error.message);
      return;
    }
    window.location.assign(result.data.redirect_url);
  }

  return (
    <main className="mx-auto flex min-h-[76vh] w-full max-w-lg items-center px-4 py-12">
      <section className="surface-card w-full p-7 sm:p-9" aria-labelledby="consent-title">
        <div className="flex items-center justify-between">
          <span className="brand-gradient flex size-11 items-center justify-center rounded-lg"><Waves className="size-5 text-brand-foreground" /></span>
          <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><ShieldCheck className="size-4 text-primary" /> Secure connection</span>
        </div>
        <div className="mt-7 flex items-center gap-3"><Bot className="size-6 text-primary" /><h1 id="consent-title" className="font-display text-2xl font-semibold">Connect {details.client.name}</h1></div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This lets {details.client.name} search rentals, check unavailable dates, view your bookings, and cancel only your pending requests.
        </p>
        <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4 text-sm">
          <p className="font-medium">Signed in as</p>
          <p className="mt-1 text-muted-foreground">{details.user.email}</p>
        </div>
        {errorMessage ? <Alert variant="destructive" className="mt-5"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" disabled={busy !== null} onClick={() => void decide(false)}>{busy === "deny" ? <Loader2 className="animate-spin" /> : null}Deny</Button>
          <Button disabled={busy !== null} onClick={() => void decide(true)}>{busy === "approve" ? <Loader2 className="animate-spin" /> : null}Approve connection</Button>
        </div>
      </section>
    </main>
  );
}