export function firstDayOfMonthIso(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = date.getMonth() + 1;
  const monthText = month < 10 ? `0${month}` : String(month);
  return `${date.getFullYear()}-${monthText}-01`;
}

export function addMonths(value: Date | string, months: number): Date {
  const date = typeof value === 'string' ? new Date(value) : new Date(value.getTime());
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function buildMonthRange(monthsToShow: number): string[] {
  const months: string[] = [];
  const start = firstDayOfMonthIso(new Date());
  for (let index = 0; index < monthsToShow; index++) {
    months.push(firstDayOfMonthIso(addMonths(start, index)));
  }
  return months;
}

export function monthLabel(monthIso: string): string {
  const date = new Date(monthIso);
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}
