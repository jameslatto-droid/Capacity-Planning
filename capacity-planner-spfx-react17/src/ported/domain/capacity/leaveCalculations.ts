import type { Resource, LeaveEntry, CapacityAssumptions } from '../../types'
import { calculateMonthlyProductiveCapacity } from './capacityCalculations'

/** Format a Date as YYYY-MM-DD in LOCAL time (avoids UTC shift via toISOString). */
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Count Mon–Fri days between two ISO date strings (inclusive). */
export function countWorkingDays(startDate: string, endDate: string): number {
  // Parse as local midnight — append T00:00:00 so JS uses local timezone, not UTC
  const start = new Date(startDate + 'T00:00:00')
  const end   = new Date(endDate   + 'T00:00:00')
  let count = 0
  const cur = new Date(start)
  while (cur <= end) {
    const d = cur.getDay()
    if (d !== 0 && d !== 6) count++
    cur.setDate(cur.getDate() + 1)
  }
  return count
}

/**
 * Total leave hours for a resource in a given month (YYYY-MM).
 * Entries that span multiple months are clamped to the target month.
 * Part-time workers are pro-rated by workingDaysPerWeek / 5.
 */
export function getLeaveHoursInMonth(
  resource: Resource,
  month: string,
  leaveEntries: LeaveEntry[]
): number {
  const [y, m] = month.split('-').map(Number)
  const monthStart = new Date(y!, m! - 1, 1)
  const monthEnd   = new Date(y!, m!, 0)          // last day of month

  const hoursPerDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek
  const partTimeRatio = resource.workingDaysPerWeek / 5

  return leaveEntries
    .filter((e) => e.resourceId === resource.id)
    .reduce((total, entry) => {
      const ls = new Date(entry.startDate + 'T00:00:00')
      const le = new Date(entry.endDate   + 'T00:00:00')
      // Clamp to this month
      const from = ls < monthStart ? monthStart : ls
      const to   = le > monthEnd   ? monthEnd   : le
      if (from > to) return total

      const rawDays    = countWorkingDays(localDateStr(from), localDateStr(to))
      const actualDays = rawDays * partTimeRatio
      return total + actualDays * hoursPerDay
    }, 0)
}

/**
 * Total leave working-days for a resource in a given month (display use).
 */
export function getLeaveDaysInMonth(
  resource: Resource,
  month: string,
  leaveEntries: LeaveEntry[]
): number {
  const hours = getLeaveHoursInMonth(resource, month, leaveEntries)
  const hoursPerDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek
  return hoursPerDay > 0 ? Math.round((hours / hoursPerDay) * 10) / 10 : 0
}

/**
 * Working days for one entry (for display in the form).
 * Pro-rated for part-time workers.
 */
export function getEntryWorkingDays(entry: LeaveEntry, resource: Resource): number {
  const raw = countWorkingDays(entry.startDate, entry.endDate)
  return Math.round(raw * (resource.workingDaysPerWeek / 5) * 10) / 10
}

/**
 * Monthly productive capacity using actual leave entries.
 *
 * When leave entries exist for this resource in this month, actual leave
 * hours replace the assumption-based average leave deduction.
 * When no entries exist, falls back to the assumption-based formula.
 */
export function calculateMonthlyCapacityWithLeave(
  resource: Resource,
  month: string,
  leaveEntries: LeaveEntry[],
  assumptions: CapacityAssumptions
): number {
  const resourceEntries = leaveEntries.filter((e) => e.resourceId === resource.id)

  if (resourceEntries.length === 0) {
    // No leave tracked for this person — use assumption-based average
    return calculateMonthlyProductiveCapacity(resource, assumptions)
  }

  // Use actual leave hours for this month
  const [y, m] = month.split('-').map(Number)

  // Does this person have any entry that overlaps this month?
  const monthStart = new Date(y!, m! - 1, 1)
  const monthEnd   = new Date(y!, m!, 0)
  const hasEntryThisMonth = resourceEntries.some((e) => {
    const ls = new Date(e.startDate + 'T00:00:00')
    const le = new Date(e.endDate   + 'T00:00:00')
    return ls <= monthEnd && le >= monthStart
  })

  if (!hasEntryThisMonth) {
    // Entries exist but not in this month — keep assumption-based for this month
    return calculateMonthlyProductiveCapacity(resource, assumptions)
  }

  // Base = contracted hours per month (no leave deducted yet)
  const baseContracted = (resource.contractHoursPerWeek * 52) / 12
  const actualLeaveHours = getLeaveHoursInMonth(resource, month, resourceEntries)
  const netAttendance = Math.max(0, baseContracted - actualLeaveHours)
  return netAttendance * (1 - assumptions.adminManagementAllowancePercent / 100)
}
