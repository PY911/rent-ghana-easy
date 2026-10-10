import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-role";
import { adminBookingsQuery, updateBookingStatus } from "@/lib/bookings";
import { adminListingsQuery, approveVendor, pendingVendorsQuery, updateListingPricing } from "@/lib/admin";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, markupPercent, suggestedPublicPrice } from "@/lib/pricing";
import type { BookingWithListing, ListingWithRelations } from "@/lib/marketplace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminDashboard } from "@/components/admin-dashboard";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Yɛɛ Kɔ" },
      { name: "description", content: "Manage Yɛɛ Kɔ bookings, items, prices and vendors." },
      { property: "og:title", content: "Admin — Yɛɛ Kɔ" },
      { property: "og:description", content: "Manage Yɛɛ Kɔ bookings, items, prices and vendors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const cedi = (n: number | null | undefined) => `GH₵ ${Number(n ?? 0).toLocaleString()}`;

function AdminPage() {
  const { isAdmin, loading } = useIsAdmin();
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-12"><Skeleton className="h-40 rounded-xl" /></div>;
  if (!isAdmin)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Admins only</h1>
        <p className="mt-2 text-muted-foreground">Your account doesn't have access to this area.</p>
        <Button asChild className="mt-6"><Link to="/">Back home</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Admin</h1>
      <p className="mt-1 text-muted-foreground">Bookings, prices, items and vendors in one place.</p>
      <Tabs defaultValue="dashboard" className="mt-8">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="items">Items & prices</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard"><AdminDashboard /></TabsContent>
        <TabsContent value="bookings"><BookingsPanel /></TabsContent>
        <TabsContent value="items"><ItemsPanel /></TabsContent>
        <TabsContent value="vendors"><VendorsPanel /></TabsContent>
        <TabsContent value="applications"><ApplicationsPanel /></TabsContent>
      </Tabs>
    </div>
  );
}

function errMsg(e: unknown) {
  return e instanceof Error ? e.message : (e as { message?: string })?.message ?? "Something went wrong";
}

function BookingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(adminBookingsQuery);
  const [filter, setFilter] = useState("open");

  async function act(b: BookingWithListing, patch: Parameters<typeof updateBookingStatus>[1], msg: string) {
    try {
      await updateBookingStatus(b.id, patch);
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  const rows = (data ?? []).filter((b) =>
    filter === "all" ? true : !["completed", "declined", "cancelled"].includes(b.status),
  );
  const now = new Date().toISOString();

  return (
    <div className="mt-4 space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant={filter === "open" ? "default" : "outline"} onClick={() => setFilter("open")}>Open</Button>
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
      </div>
      {isLoading ? <Skeleton className="h-24 rounded-xl" /> : !rows.length ? (
        <p className="surface-card p-8 text-center text-muted-foreground">No bookings here.</p>
      ) : rows.map((b) => (
        <div key={b.id} className="surface-card space-y-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold">{b.listing?.title ?? "Rental"} <span className="text-sm font-normal text-muted-foreground">· {b.vendor?.name}</span></p>
              <p className="text-sm text-muted-foreground">{b.reference} · {b.start_date} → {b.end_date} · qty {b.quantity}</p>
              <p className="text-sm text-muted-foreground">{b.contact_name} · {b.contact_phone} · {b.delivery_address}</p>
              {b.notes && <p className="mt-1 text-sm italic text-muted-foreground">“{b.notes}”</p>}
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold">{cedi(b.total)}</p>
              <p className="text-muted-foreground">Vendor {cedi(b.vendor_total)} · You {cedi(b.platform_fee)}</p>
              <p className="text-muted-foreground">Deposit {cedi(b.deposit_amount)} · Balance {cedi(b.balance_amount)} by {b.balance_due_date}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{BOOKING_STATUS_LABELS[b.status] ?? b.status}</span>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">{PAYMENT_STATUS_LABELS[b.payment_status] ?? b.payment_status}</span>
            <div className="ml-auto flex flex-wrap gap-2">
              {b.status === "pending" && (<>
                <Button size="sm" onClick={() => act(b, { status: "confirmed" }, "Booking confirmed")}>Confirm</Button>
                <Button size="sm" variant="outline" onClick={() => act(b, { status: "declined" }, "Booking declined")}>Decline</Button>
              </>)}
              {b.status === "confirmed" && (
                <Button size="sm" onClick={() => act(b, { status: "deposit_paid", payment_status: "deposit_paid", deposit_paid_at: now }, "Deposit recorded")}>Mark deposit paid</Button>
              )}
              {b.status === "deposit_paid" && (
                <Button size="sm" onClick={() => act(b, { status: "paid", payment_status: "paid_in_full", balance_paid_at: now }, "Balance recorded")}>Mark balance paid</Button>
              )}
              {b.status === "paid" && (
                <Button size="sm" onClick={() => act(b, { status: "completed" }, "Marked completed")}>Mark completed</Button>
              )}
              {["confirmed", "deposit_paid"].includes(b.status) && (
                <Button size="sm" variant="outline" onClick={() => act(b, { status: "cancelled" }, "Booking cancelled")}>Cancel</Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ItemsPanel() {
  const { data, isLoading } = useQuery(adminListingsQuery);
  const [q, setQ] = useState("");
  const [onlyPending, setOnlyPending] = useState(true);
  const rows = (data ?? []).filter((l) => {
    const full = l as ListingWithRelations & { admin_approved?: boolean };
    if (onlyPending && full.admin_approved) return false;
    return !q || l.title.toLowerCase().includes(q.toLowerCase()) || l.vendor?.name.toLowerCase().includes(q.toLowerCase());
  });
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search items or vendors" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Button size="sm" variant={onlyPending ? "default" : "outline"} onClick={() => setOnlyPending(true)}>Awaiting approval</Button>
        <Button size="sm" variant={!onlyPending ? "default" : "outline"} onClick={() => setOnlyPending(false)}>All items</Button>
      </div>
      {isLoading ? <Skeleton className="h-24 rounded-xl" /> : !rows.length ? (
        <p className="surface-card p-8 text-center text-muted-foreground">Nothing to review.</p>
      ) : rows.map((l) => <ItemRow key={l.id} listing={l} />)}
    </div>
  );
}

type AdminListing = ListingWithRelations & { vendor_price?: number | null; admin_approved?: boolean };

function ItemRow({ listing }: { listing: ListingWithRelations }) {
  const l = listing as AdminListing;
  const qc = useQueryClient();
  const [vendorPrice, setVendorPrice] = useState(String(l.vendor_price ?? ""));
  const [price, setPrice] = useState(String(l.price));
  const vp = Number(vendorPrice) || 0;
  const pp = Number(price) || 0;
  const markup = markupPercent(vp, pp);

  async function save(approve?: boolean) {
    if (pp <= 0) { toast.error("Public price must be above zero"); return; }
    if (vp > 0 && pp < vp) { toast.error("Public price is below the vendor's price"); return; }
    try {
      await updateListingPricing(l.id, {
        price: pp,
        ...(vp > 0 ? { vendor_price: vp } : {}),
        ...(approve !== undefined ? { admin_approved: approve } : {}),
      });
      toast.success(approve === true ? "Approved and live" : approve === false ? "Hidden from site" : "Prices saved");
      qc.invalidateQueries({ queryKey: ["admin", "listings"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    } catch (e) {
      toast.error(errMsg(e));
    }
  }

  return (
    <div className="surface-card flex flex-wrap items-end gap-4 p-4">
      {l.images?.[0] && <img src={l.images[0]} alt="" className="size-16 rounded-lg object-cover" />}
      <div className="min-w-48 flex-1">
        <p className="font-medium">{l.title}</p>
        <p className="text-sm text-muted-foreground">{l.vendor?.name} · {l.city} · per {l.price_unit}</p>
        <p className="mt-1 text-xs font-medium">{l.admin_approved ? "Live on site" : "Awaiting approval"}{markup !== null && ` · margin ${markup}%`}</p>
      </div>
      <label className="text-xs text-muted-foreground">Vendor price
        <Input type="number" min={0} value={vendorPrice} onChange={(e) => setVendorPrice(e.target.value)} className="mt-1 w-28" />
      </label>
      <label className="text-xs text-muted-foreground">Public price
        <Input type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-28" />
      </label>
      <div className="flex flex-wrap gap-2">
        {vp > 0 && <Button size="sm" variant="ghost" onClick={() => setPrice(String(suggestedPublicPrice(vp)))}>+20%</Button>}
        <Button size="sm" variant="outline" onClick={() => save()}>Save</Button>
        {l.admin_approved
          ? <Button size="sm" variant="outline" onClick={() => save(false)}>Hide</Button>
          : <Button size="sm" onClick={() => save(true)}>Approve</Button>}
      </div>
    </div>
  );
}

function VendorsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(pendingVendorsQuery);
  async function approve(id: string) {
    try {
      await approveVendor(id, true);
      toast.success("Vendor approved");
      qc.invalidateQueries({ queryKey: ["admin", "vendors"] });
    } catch (e) { toast.error(errMsg(e)); }
  }
  return (
    <div className="mt-4 space-y-3">
      {isLoading ? <Skeleton className="h-24 rounded-xl" /> : !data?.length ? (
        <p className="surface-card p-8 text-center text-muted-foreground">No vendors waiting for approval.</p>
      ) : data.map((v) => (
        <div key={v.id} className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-medium">{v.name}</p>
            <p className="text-sm text-muted-foreground">{v.city} · {v.phone ?? "no phone"} · {v.address}</p>
          </div>
          <Button size="sm" onClick={() => approve(v.id)}>Approve vendor</Button>
        </div>
      ))}
    </div>
  );
}

function ApplicationsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("vendor_applications").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Application updated");
    qc.invalidateQueries({ queryKey: ["admin", "applications"] });
  }
  return (
    <div className="mt-4 space-y-3">
      {isLoading ? <Skeleton className="h-24 rounded-xl" /> : !data?.length ? (
        <p className="surface-card p-8 text-center text-muted-foreground">No applications yet.</p>
      ) : data.map((a) => (
        <div key={a.id} className="surface-card space-y-2 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold">{a.business_name}</p>
              <p className="text-sm text-muted-foreground">{a.contact_name} · {a.phone} · {a.email} · {a.city}</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium capitalize">{a.status}</span>
          </div>
          <p className="text-sm">{a.business_description}</p>
          <p className="whitespace-pre-line text-sm text-muted-foreground">{a.inventory_details}</p>
          {a.status !== "approved" && a.status !== "declined" && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setStatus(a.id, "approved")}>Approve</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "reviewed")}>Mark reviewed</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "declined")}>Decline</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
