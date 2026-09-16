import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in to Y3fr3 Wo" },
      { name: "description", content: "Sign in to manage your Ghana rental requests, bookings and listings." },
      { property: "og:title", content: "Sign in to Y3fr3 Wo" },
      { property: "og:description", content: "Manage your rental requests and listings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  return (
    <div className="mx-auto grid min-h-[680px] w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div className="hidden lg:block">
        <span className="brand-gradient inline-flex size-12 items-center justify-center rounded-xl"><Waves className="size-6 text-primary-foreground" /></span>
        <h1 className="mt-7 max-w-xl font-display text-5xl font-semibold leading-tight">Your rentals, dates and vendors — all in one place.</h1>
        <p className="mt-5 max-w-lg text-muted-foreground">Save items, request dates, track confirmations and reach vendors without starting the search again.</p>
        <p className="mt-8 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="size-4 text-primary" /> Secure sign-in for renters and vendors</p>
      </div>
      <div className="surface-card mx-auto w-full max-w-md p-7 sm:p-9">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back home</Link>
        <h2 className="mt-7 font-display text-2xl font-semibold">Welcome to Y3fr3 Wo</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue your rental journey.</p>
        <form className="mt-7 space-y-4" onSubmit={(event) => event.preventDefault()}>
          <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" type="email" placeholder="you@example.com" /></div>
          <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" placeholder="Enter your password" /></div>
          <Button type="submit" size="lg" className="w-full">Sign in</Button>
        </form>
        <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">or</span><span className="h-px flex-1 bg-border" /></div>
        <Button type="button" variant="outline" size="lg" className="w-full">Continue with Google</Button>
        <p className="mt-6 text-center text-sm text-muted-foreground">New here? <span className="font-semibold text-primary">Create an account</span></p>
      </div>
    </div>
  );
}