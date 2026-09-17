import { LocateFixed, Loader2, X } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import { Button } from "@/components/ui/button";

export function LocationBanner({ className = "" }: { className?: string }) {
  const { status, city, request, dismiss } = useUserLocation();

  if (status === "unsupported" || status === "idle") return null;

  if (status === "granted" && city) {
    return (
      <p className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground ${className}`}>
        <LocateFixed className="size-4 text-primary" />
        Showing vendors closest to you — nearest hub is {city}.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>
        Location is off, so distances are hidden. Turn it on in your browser to see the closest
        vendors.
      </p>
    );
  }

  return (
    <div className={`surface-card flex flex-wrap items-center gap-3 p-4 ${className}`}>
      <LocateFixed className="size-5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1 text-sm">
        <span className="font-medium">Find vendors near you.</span>{" "}
        <span className="text-muted-foreground">
          Share your location and we&apos;ll show how far each vendor is from you.
        </span>
      </p>
      <Button size="sm" onClick={request} disabled={status === "locating"}>
        {status === "locating" ? <Loader2 className="size-4 animate-spin" /> : null}
        {status === "locating" ? "Locating…" : "Use my location"}
      </Button>
      <Button size="icon" variant="ghost" aria-label="Dismiss" onClick={dismiss}>
        <X className="size-4" />
      </Button>
    </div>
  );
}
