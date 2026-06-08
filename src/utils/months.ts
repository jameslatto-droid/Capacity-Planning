export function generateMonthRange(startMonth: string, endMonth: string): string[] {
  const months: string[] = []
  if (!/^\d{4}-\d{2}$/.test(startMonth) || !/^\d{4}-\d{2}$/.test(endMonth)) return months
  const [sy, sm] = startMonth.split('-').map(Number)
  const [ey, em] = endMonth.split('-').map(Number)
  if (!sy || !ey || !sm || !em || sm < 1 || sm > 12 || em < 1 || em > 12) return months
  let year = sy!
  let month = sm!
  while (year < ey! || (year === ey! && month <= em!)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`)
    month++
    if (month > 12) {
      month = 1
      year++
    }
  }
  return months
}

export function formatMonth(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(Number(year), Number(m) - 1, 1)
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function addMonths(month: string, n: number): string {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(y!, m! - 1 + n, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function defaultForecastRange(monthsAhead = 6, startMonth = currentMonth()): { startMonth: string; endMonth: string } {
  return {
    startMonth,
    endMonth: addMonths(startMonth, monthsAhead),
  }
}
