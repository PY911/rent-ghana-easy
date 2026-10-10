import { queryOptions, useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { summarize, type DashBooking } from "@/lib/dashboard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

type Row = DashBooking & { id: string; reference: string | null; balance_amount: number | null; contact_name: string | null; listing: { title: string } | null };

const dashQuery = queryOptions({
  queryKey: ["admin", "bookings", "dashboard"],
  queryFn: async (): Promise<Row[]> => {
    const { data, error } = await supabase
      .from("bookings")
      .select("id, reference, status, payment_status, total, vendor_total, balance_amount, start_date, balance_due_date, balance_paid_at, created_at, contact_name, listing:listings(title)")
      .limit(5000);
    if (error) throw error;
    return (data ?? []) as unknown as Row[];
  },
});

const ghs = (n: number) => `GHS ${Math.round(n).toLocaleString()}`;

export function AdminDashboard() {
  const { data, isLoading, error } = useQuery(dashQuery);
  if (isLoading) return <Skeleton className="mt-6 h-96 rounded-xl" />;
  if (error) return <p className="mt-6 text-sm text-destructive">Couldn't load the dashboard.</p>;
  const today = new Date().toISOString().slice(0, 10);
  const s = summarize(data ?? [], today);
  const chartData = s.months.map((m) => ({
    label: new Date(`${m.month}-01T00:00:00Z`).toLocaleString("en-GB", { month: "short", timeZone: "UTC" }),
    profit: m.profit,
  }));

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Total profit" value={ghs(s.totalProfit)} hint={`From ${ghs(s.revenue)} in confirmed bookings`} />
        <Stat label="Pending bookings" value={String(s.pending)} hint="Waiting for you to confirm" />
        <Stat label="Upcoming balances" value={String(s.upcoming.length)} hint={ghs(s.upcoming.reduce((a, b) => a + Number((b as Row).balance_amount ?? 0), 0)) + " still to collect"} />
      </div>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Monthly earnings</h2>
        <p className="text-xs text-muted-foreground">Your profit by rental start month, last 6 months</p>
        <ChartContainer config={{ profit: { label: "Profit", color: "var(--primary)" } }} className="mt-4 h-64 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={60} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="profit" fill="var(--color-profit)" radius={6} />
          </BarChart>
        </ChartContainer>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-display text-base font-semibold">Upcoming due dates</h2>
        {s.upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No balances due.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {(s.upcoming as Row[]).slice(0, 10).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                <span>
                  <span className="font-medium">{b.listing?.title ?? "Booking"}</span>
                  <span className="text-muted-foreground"> · {b.reference} · {b.contact_name}</span>
                </span>
                <span>
                  {ghs(Number(b.balance_amount ?? 0))} due <span className="font-medium">{b.balance_due_date}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="surface-card p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
