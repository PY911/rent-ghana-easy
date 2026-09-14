export function formatCedis(amount: number) {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function priceLabel(price: number, unit: string) {
  const unitLabel = unit === "event" ? "per event" : `per ${unit}`;
  return `${formatCedis(price)} ${unitLabel}`;
}

export function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const a = new Date(start).getTime();
  const b = new Date(end).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

export const GHANA_CITIES = [
  "Accra",
  "Tema",
  "Kumasi",
  "Takoradi",
  "Cape Coast",
  "Tamale",
  "Ho",
  "Sunyani",
  "Koforidua",
];
