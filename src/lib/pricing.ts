import { daysBetween } from "./format";

/** Share of the total the renter pays up front to lock the dates. */
export const DEPOSIT_PERCENT = 30;

/** Fallback markup applied to a vendor cost price when suggesting a public price. */
export const DEFAULT_MARKUP_PERCENT = 20;

export function suggestedPublicPrice(vendorPrice: number, markupPercent = DEFAULT_MARKUP_PERCENT) {
  if (!Number.isFinite(vendorPrice) || vendorPrice <= 0) return 0;
  return Math.round((vendorPrice * (100 + markupPercent)) / 100);
}

export function markupPercent(vendorPrice: number | null | undefined, publicPrice: number) {
  if (!vendorPrice || vendorPrice <= 0) return null;
  return Math.round(((publicPrice - vendorPrice) / vendorPrice) * 100);
}

export function billableUnits(priceUnit: string, startDate: string, endDate: string) {
  if (priceUnit === "event") return 1;
  const days = daysBetween(startDate, endDate);
  return days > 0 ? days : 0;
}

export type BookingQuote = {
  units: number;
  total: number;
  vendorTotal: number;
  platformFee: number;
  depositAmount: number;
  balanceAmount: number;
  balanceDueDate: string | null;
};

/** Day before the rental starts — when the remaining balance is due. */
export function balanceDueDate(startDate: string): string | null {
  if (!startDate) return null;
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function quoteBooking(input: {
  price: number;
  vendorPrice?: number | null;
  priceUnit: string;
  minDays?: number;
  quantity: number;
  startDate: string;
  endDate: string;
}): BookingQuote {
  const rawUnits = billableUnits(input.priceUnit, input.startDate, input.endDate);
  const units = rawUnits > 0 ? Math.max(rawUnits, input.priceUnit === "event" ? 1 : (input.minDays ?? 1)) : 0;
  const quantity = Math.max(1, input.quantity || 1);
  const total = Math.round(input.price * units * quantity);
  const vendorTotal = Math.round((input.vendorPrice ?? input.price) * units * quantity);
  const platformFee = Math.max(0, total - vendorTotal);
  const depositAmount = Math.round((total * DEPOSIT_PERCENT) / 100);

  return {
    units,
    total,
    vendorTotal,
    platformFee,
    depositAmount,
    balanceAmount: total - depositAmount,
    balanceDueDate: balanceDueDate(input.startDate),
  };
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: "Awaiting review",
  confirmed: "Confirmed — deposit due",
  deposit_paid: "Deposit received",
  paid: "Fully paid",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: "No payment yet",
  deposit_paid: "Deposit paid",
  paid_in_full: "Paid in full",
  refunded: "Refunded",
};

export function bookingStatusTone(status: string): "neutral" | "positive" | "warning" | "danger" {
  if (status === "paid" || status === "completed" || status === "deposit_paid") return "positive";
  if (status === "confirmed") return "warning";
  if (status === "declined" || status === "cancelled") return "danger";
  return "neutral";
}
