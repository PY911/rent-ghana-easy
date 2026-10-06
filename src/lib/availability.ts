export function enumerateDates(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || endDate < startDate) return [];

  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return [];

  const dates: string[] = [];
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export function rangeContainsUnavailableDate(
  startDate: string,
  endDate: string,
  unavailableDates: ReadonlySet<string>,
) {
  return enumerateDates(startDate, endDate).some((date) => unavailableDates.has(date));
}

export function formatUnavailableDate(date: string) {
  return new Intl.DateTimeFormat("en-GH", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}