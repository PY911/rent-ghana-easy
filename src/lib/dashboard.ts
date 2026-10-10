export type DashBooking = {
  status: string;
  payment_status: string;
  total: number | null;
  vendor_total: number | null;
  start_date: string;
  balance_due_date: string | null;
  balance_paid_at: string | null;
  created_at: string;
};

const EXCLUDED = new Set(["pending", "cancelled", "declined", "rejected"]);

/** Profit counts only bookings you've confirmed (or later); pending/cancelled/declined earn nothing. */
export function bookingProfit(b: DashBooking) {
  if (EXCLUDED.has(b.status)) return 0;
  return Math.max(0, Number(b.total ?? 0) - Number(b.vendor_total ?? 0));
}

export function summarize(bookings: DashBooking[], today: string) {
  const earning = bookings.filter((b) => !EXCLUDED.has(b.status));
  const totalProfit = earning.reduce((s, b) => s + bookingProfit(b), 0);
  const revenue = earning.reduce((s, b) => s + Number(b.total ?? 0), 0);
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = earning
    .filter((b) => b.balance_due_date && !b.balance_paid_at && b.balance_due_date >= today && b.status !== "completed")
    .sort((a, b) => a.balance_due_date!.localeCompare(b.balance_due_date!));
  const months: { month: string; profit: number }[] = [];
  const [y, m] = today.split("-").map(Number) as [number, number];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    months.push({ month: d.toISOString().slice(0, 7), profit: 0 });
  }
  for (const b of earning) {
    const slot = months.find((x) => x.month === b.start_date.slice(0, 7));
    if (slot) slot.profit += bookingProfit(b);
  }
  return { totalProfit, revenue, pending, upcoming, months };
}
