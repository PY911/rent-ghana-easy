import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, ShieldCheck, Waves } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: "/vendor-application" } =>
    search["redirect"] === "/vendor-application" ? { redirect: "/vendor-application" } : {},
  head: () => ({
    meta: [
      { title: "Sign in to Yɛɛ Kɔ" },
      { name: "description", content: "Sign in to manage your Ghana rental requests, bookings and listings." },
      { property: "og:title", content: "Sign in to Yɛɛ Kɔ" },
      { property: "og:description", content: "Manage your rental requests and listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/bookings", replace: true });
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth${redirect ? "?redirect=%2Fvendor-application" : ""}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        toast.success("Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth${redirect ? "?redirect=%2Fvendor-application" : ""}` });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed");
    }
  }

  return (
    <div className="mx-auto grid min-h-[680px] w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <span className="brand-gradient inline-flex size-12 items-center justify-center rounded-xl">
          <Waves className="size-6 text-brand-foreground" />
        </span>
        <h1 className="mt-7 max-w-xl font-display text-5xl font-semibold leading-tight">
          Your rentals, dates and vendors — all in one place.
        </h1>
        <p className="mt-5 max-w-lg text-muted-foreground">
          Request dates, track confirmations and pay your deposit without starting the search again.
        </p>
        <p className="mt-8 flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="size-4 text-primary" /> Secure sign-in for renters and vendors
        </p>
      </div>

      <div className="surface-card mx-auto w-full max-w-md p-7 sm:p-9">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back home
        </Link>

        {checkEmail ? (
          <div className="mt-8 space-y-4">
            <h2 className="font-display text-2xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to
              finish creating your account, then come back here to sign in.
            </p>
            <Button variant="outline" className="w-full" onClick={() => { setCheckEmail(false); setMode("signin"); }}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <>
            <h2 className="mt-7 font-display text-2xl font-semibold">
              {mode === "signin" ? "Welcome to Yɛɛ Kɔ" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue your rental journey."
                : "One account for renting items and listing your own."}
            </p>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
              {mode === "signup" ? (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ama Mensah" required />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : null}
                {mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "New here? " : "Already have an account? "}
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
