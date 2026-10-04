import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cancelBooking } from "@/lib/bookings";
import type { BookingWithListing } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/bookings")({
  head: () => ({
    meta: [
      { title: "My bookings — Y3fr3 Wo" },
      { name: "description", content: "Track your rental booking requests on Y3fr3 Wo." },
      { property: "og:title", content: "My bookings — Y3fr3 Wo" },
      { property: "og:description", content: "Track your rental booking requests on Y3fr3 Wo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyBookings,
});

function MyBookings() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings", user.id],
    queryFn: async (): Promise<BookingWithListing[]> => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, listing:listings(id,title,slug,images,price,price_unit)")
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BookingWithListing[];
    },
  });

  async function onCancel(id: string) {
    try {
      await cancelBooking(id);
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    } catch {
      toast.error("Could not cancel this booking");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">My bookings</h1>
      <div className="mt-8 space-y-4">
        {isLoading ? (
          <Skeleton className="h-24 rounded-xl" />
        ) : !data?.length ? (
          <div className="surface-card p-8 text-center">
            <p className="text-muted-foreground">No bookings yet.</p>
            <Button asChild className="mt-4">
              <Link to="/browse">Browse rentals</Link>
            </Button>
          </div>
        ) : (
          data.map((b) => (
            <div key={b.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display font-semibold">{b.listing?.title ?? "Rental"}</p>
                <p className="text-sm text-muted-foreground">
                  {b.reference} · {b.start_date} → {b.end_date} · GH₵ {Number(b.total).toLocaleString()}
                </p>
                <p className="mt-1 text-xs font-medium uppercase text-primary">{b.status}</p>
              </div>
              {b.status === "pending" && (
                <Button variant="outline" size="sm" onClick={() => onCancel(b.id)}>
                  Cancel
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
