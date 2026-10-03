import { Link } from "@tanstack/react-router";
import { Heart, MapPin, ShieldCheck, Store, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-secondary/50">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6">
        <section className="overflow-hidden rounded-3xl bg-accent px-6 py-10 text-accent-foreground shadow-lift sm:px-10 sm:py-12 lg:px-14 lg:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:gap-14">
            <div className="min-w-0">
              <p className="mb-3 text-xs font-bold uppercase text-primary-deep">For rental businesses</p>
              <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                Monetize Your Assets Today
              </h2>
              <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-primary-deep/80 sm:text-base">
                Turn your idle equipment and vehicles into a new source of income. Reach renters
                across Ghana through Y3fr3 Wo.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-primary-deep text-primary-foreground hover:bg-primary">
                  <Link to="/vendors">
                    <Store className="size-4" /> Become a vendor
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-deep/20 bg-background/45 text-primary-deep hover:bg-background/70 hover:text-primary-deep"
                >
                  <Link to="/how-it-works">Learn how it works</Link>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl bg-background px-4 text-center shadow-soft">
                <strong className="font-display text-3xl font-bold text-primary sm:text-4xl">50+</strong>
                <span className="mt-2 text-xs font-bold uppercase text-muted-foreground">Local vendors</span>
              </div>
              <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl bg-clay px-4 text-center text-clay-foreground shadow-soft">
                <strong className="font-display text-3xl font-bold sm:text-4xl">4</strong>
                <span className="mt-2 text-xs font-bold uppercase">Major cities</span>
              </div>
              <div className="col-span-2 grid min-h-28 grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-primary-deep px-5 py-5 text-primary-foreground shadow-soft sm:px-7">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ShieldCheck className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <strong className="block font-display text-base font-semibold sm:text-lg">Built for Ghana</strong>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-primary-foreground/75 sm:text-sm">
                    <MapPin className="size-3.5 shrink-0" aria-hidden="true" /> Accra, Tema, Kumasi &amp; Takoradi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="border-t border-border">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="brand-gradient flex size-9 items-center justify-center rounded-xl">
              <Waves className="size-5 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-semibold">Y3fr3 Wo.</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Ghana&apos;s rental marketplace. Compare verified vendors for events, construction, power,
            vehicles and production gear — then book in minutes.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/browse" className="hover:text-foreground">
                Browse rentals
              </Link>
            </li>
            <li>
              <Link to="/vendors" className="hover:text-foreground">
                Vendor directory
              </Link>
            </li>
            <li>
              <Link to="/how-it-works" className="hover:text-foreground">
                How it works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">For vendors</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/vendors" className="hover:text-foreground">
                List your items
              </Link>
            </li>
            <li>
              <Link to="/browse" className="hover:text-foreground">
                My bookings
              </Link>
            </li>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        <span>© {new Date().getFullYear()} Y3fr3 Wo.</span>
        <span className="mx-2">·</span>
        <span className="inline-flex items-center gap-1">
          Built with <Heart className="size-3 fill-clay text-clay" aria-label="love" /> in Accra
        </span>
      </div>
      </div>
    </footer>
  );
}
