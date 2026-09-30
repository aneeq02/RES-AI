/** Adds whole calendar months, clamping to the last day of shorter months (Jan 31 + 1 → Feb 28). */
function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

/** The monthly credit window containing `now`, anchored on the subscription start. */
export function creditPeriod(startedAt: Date, now: Date): { index: number; start: Date; end: Date } {
  let index = Math.max(0, (now.getUTCFullYear() - startedAt.getUTCFullYear()) * 12 + now.getUTCMonth() - startedAt.getUTCMonth());
  while (index > 0 && addMonths(startedAt, index) > now) index--;
  while (addMonths(startedAt, index + 1) <= now) index++;
  return { index, start: addMonths(startedAt, index), end: addMonths(startedAt, index + 1) };
}
