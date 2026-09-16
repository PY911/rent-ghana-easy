import { Link } from "@tanstack/react-router";
import { Heart, Waves } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/50">
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
    </footer>
  );
}
