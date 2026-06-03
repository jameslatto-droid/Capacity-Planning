import { describe, it, expect } from 'vitest'
import { countWorkingDays, getLeaveHoursInMonth, calculateMonthlyCapacityWithLeave } from './leaveCalculations'
import { calculateMonthlyProductiveCapacity } from './capacityCalculations'
import type { Resource, LeaveEntry, CapacityAssumptions } from '../../types'
import { DEFAULT_ASSUMPTIONS } from '../../types'

const ftResource: Resource = {
  id: 'r1', displayName: 'Alice', role: 'process-engineering',
  employmentType: 'employee', contractHoursPerWeek: 40, workingDaysPerWeek: 5,
  fullTimeHoursPerWeek: 40, active: true,
}

const ptResource: Resource = {
  id: 'r2', displayName: 'Bob', role: 'drafting',
  employmentType: 'employee', contractHoursPerWeek: 32, workingDaysPerWeek: 4,
  fullTimeHoursPerWeek: 40, active: true,
}

const baseAssumptions: CapacityAssumptions = {
  ...DEFAULT_ASSUMPTIONS,
  leaveModel: 'fixed-days',
  publicHolidayDaysPerYear: 0,
  adminManagementAllowancePercent: 15,
}

function entry(resourceId: string, start: string, end: string): LeaveEntry {
  return { id: 'e1', resourceId, type: 'annual', startDate: start, endDate: end, createdAt: '2026-01-01T00:00:00Z' }
}

describe('countWorkingDays', () => {
  it('counts Mon-Fri only for a full week', () => {
    // Mon 2 Jun to Fri 6 Jun 2026 = 5 days
    expect(countWorkingDays('2026-06-01', '2026-06-05')).toBe(5)
  })
  it('skips weekends in a two-week span', () => {
    // Mon 1 Jun to Fri 12 Jun = 10 working days
    expect(countWorkingDays('2026-06-01', '2026-06-12')).toBe(10)
  })
  it('single day on a Friday = 1', () => {
    expect(countWorkingDays('2026-06-05', '2026-06-05')).toBe(1)
  })
  it('Saturday–Sunday = 0', () => {
    expect(countWorkingDays('2026-06-06', '2026-06-07')).toBe(0)
  })
})

describe('getLeaveHoursInMonth', () => {
  it('deducts 5 leave days for a FT worker (one week off in June)', () => {
    const e = entry('r1', '2026-06-01', '2026-06-05')
    const hours = getLeaveHoursInMonth(ftResource, '2026-06', [e])
    expect(hours).toBeCloseTo(40, 0)   // 5 days × 8h
  })

  it('pro-rates for a 4-day worker', () => {
    const e = entry('r2', '2026-06-01', '2026-06-05')
    const hours = getLeaveHoursInMonth(ptResource, '2026-06', [e])
    // 5 Mon-Fri days × 0.8 ratio × 8h/day = 32h
    expect(hours).toBeCloseTo(32, 0)
  })

  it('clamps multi-month entry to the target month', () => {
    // Entry covers all of June and July; query June only
    const e = entry('r1', '2026-06-01', '2026-07-31')
    const hoursJune = getLeaveHoursInMonth(ftResource, '2026-06', [e])
    // June 2026 has 22 working days
    expect(hoursJune).toBeCloseTo(22 * 8, 0)
  })

  it('returns 0 when entry is in a different month', () => {
    const e = entry('r1', '2026-07-01', '2026-07-05')
    expect(getLeaveHoursInMonth(ftResource, '2026-06', [e])).toBe(0)
  })
})

describe('calculateMonthlyCapacityWithLeave', () => {
  it('falls back to assumption-based when no leave entries', () => {
    const withLeave = calculateMonthlyCapacityWithLeave(ftResource, '2026-06', [], baseAssumptions)
    const assumption = calculateMonthlyProductiveCapacity(ftResource, baseAssumptions)
    expect(withLeave).toBeCloseTo(assumption, 1)
  })

  it('reduces capacity by actual leave hours in the specific month', () => {
    // 5 days off in June → 40h leave → capacity drops by 40h × 0.85 (admin)
    const e = entry('r1', '2026-06-01', '2026-06-05')
    const withLeave = calculateMonthlyCapacityWithLeave(ftResource, '2026-06', [e], baseAssumptions)
    const base = (ftResource.contractHoursPerWeek * 52) / 12
    const expected = (base - 40) * 0.85
    expect(withLeave).toBeCloseTo(expected, 1)
  })

  it('uses assumption for months where the person has no entries', () => {
    // Entry is in June, querying July — should fall back to assumption-based
    const e = entry('r1', '2026-06-01', '2026-06-05')
    const july = calculateMonthlyCapacityWithLeave(ftResource, '2026-07', [e], baseAssumptions)
    const assumption = calculateMonthlyProductiveCapacity(ftResource, baseAssumptions)
    expect(july).toBeCloseTo(assumption, 1)
  })
})
