export function localISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function dateLabel(from?: string, to?: string, today = new Date()): string | undefined {
  if (!from && !to) return undefined;
  const todayIso = localISO(today);
  if (from === todayIso && to === todayIso) return "Today";
  if (from === localISO(addDays(today, -6)) && to === todayIso) return "Last 7 days";
  if (from === localISO(addDays(today, -29)) && to === todayIso) return "Last 30 days";
  if (from && to) return `${from} – ${to}`;
  if (from) return `From ${from}`;
  return `Until ${to}`;
}
