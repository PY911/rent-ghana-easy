import { test } from "node:test";
import assert from "node:assert/strict";
import { summarize } from "./dashboard";

const base = { payment_status: "unpaid", balance_paid_at: null, created_at: "2026-10-01", balance_due_date: null };

test("profit ignores pending and cancelled bookings", () => {
  const s = summarize(
    [
      { ...base, status: "confirmed", total: 1200, vendor_total: 1000, start_date: "2026-10-05" },
      { ...base, status: "pending", total: 500, vendor_total: 400, start_date: "2026-10-06" },
      { ...base, status: "cancelled", total: 900, vendor_total: 700, start_date: "2026-10-07" },
    ],
    "2026-10-10",
  );
  assert.equal(s.totalProfit, 200);
  assert.equal(s.pending, 1);
  assert.equal(s.months.at(-1)?.profit, 200);
});

test("upcoming due dates exclude paid and past balances", () => {
  const s = summarize(
    [
      { ...base, status: "deposit_paid", total: 1, vendor_total: 0, start_date: "2026-10-20", balance_due_date: "2026-10-19" },
      { ...base, status: "deposit_paid", total: 1, vendor_total: 0, start_date: "2026-10-21", balance_due_date: "2026-10-20", balance_paid_at: "x" },
      { ...base, status: "confirmed", total: 1, vendor_total: 0, start_date: "2026-10-02", balance_due_date: "2026-10-01" },
    ],
    "2026-10-10",
  );
  assert.equal(s.upcoming.length, 1);
  assert.equal(s.upcoming[0]?.balance_due_date, "2026-10-19");
});
