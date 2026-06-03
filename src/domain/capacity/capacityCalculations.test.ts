import { describe, it, expect } from 'vitest'
import { calculateAnnualProductiveCapacity, calculateMonthlyProductiveCapacity } from './capacityCalculations'
import type { Resource, CapacityAssumptions } from '../../types'
import { DEFAULT_ASSUMPTIONS } from '../../types'

const fullTimeResource: Resource = {
  id: 'r1',
  displayName: 'Full-Time Engineer',
  role: 'process-engineering',
  employmentType: 'employee',
  contractHoursPerWeek: 40,
  workingDaysPerWeek: 5,
  fullTimeHoursPerWeek: 40,
  active: true,
}

const fourDayResource: Resource = {
  id: 'r2',
  displayName: 'Part-Time Engineer',
  role: 'drafting',
  employmentType: 'employee',
  contractHoursPerWeek: 32,
  workingDaysPerWeek: 4,
  fullTimeHoursPerWeek: 40,
  active: true,
}

describe('calculateAnnualProductiveCapacity', () => {
  it('returns ~1550 hours/year for a full-time 40h/week resource', () => {
    const result = calculateAnnualProductiveCapacity(fullTimeResource, DEFAULT_ASSUMPTIONS)
    expect(result).toBeGreaterThanOrEqual(1540)
    expect(result).toBeLessThanOrEqual(1560)
  })

  it('pro-rates leave and public holidays for part-time workers', () => {
    const result = calculateAnnualProductiveCapacity(fourDayResource, DEFAULT_ASSUMPTIONS)
    const fullTime = calculateAnnualProductiveCapacity(fullTimeResource, DEFAULT_ASSUMPTIONS)
    const expectedFteRatio = 32 / 40
    expect(result / fullTime).toBeCloseTo(expectedFteRatio, 2)
  })

  it('uses fixed days when leaveModel is fixed-days', () => {
    const fixedAssumptions: CapacityAssumptions = { ...DEFAULT_ASSUMPTIONS, leaveModel: 'fixed-days' }
    const partTimeFixed = calculateAnnualProductiveCapacity(fourDayResource, fixedAssumptions)
    const partTimeProRated = calculateAnnualProductiveCapacity(fourDayResource, DEFAULT_ASSUMPTIONS)
    // Fixed leave gives more productive hours for part-timer (same leave days, fewer contracted hours)
    expect(partTimeFixed).toBeLessThan(partTimeProRated)
  })
})

describe('calculateMonthlyProductiveCapacity', () => {
  it('returns ~129 hours/month for full-time resource', () => {
    const result = calculateMonthlyProductiveCapacity(fullTimeResource, DEFAULT_ASSUMPTIONS)
    expect(result).toBeGreaterThanOrEqual(128)
    expect(result).toBeLessThanOrEqual(130)
  })

  it('returns ~103 hours/month for 4-day/32h resource with pro-rated leave', () => {
    const result = calculateMonthlyProductiveCapacity(fourDayResource, DEFAULT_ASSUMPTIONS)
    expect(result).toBeGreaterThanOrEqual(102)
    expect(result).toBeLessThanOrEqual(104)
  })
})
