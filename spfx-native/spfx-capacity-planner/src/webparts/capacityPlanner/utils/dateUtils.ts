export function firstDayOfMonthIso(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

export function addMonths(value: Date | string, months: number): Date {
  const date = typeof value === 'string' ? new Date(value) : new Date(value.getTime());
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function buildMonthRange(monthsToShow: number): string[] {
  const start = firstDayOfMonthIso(new Date());
  return Array.from({ length: monthsToShow }, (_, index) => firstDayOfMonthIso(addMonths(start, index)));
}

export function monthLabel(monthIso: string): string {
  const date = new Date(monthIso);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}
