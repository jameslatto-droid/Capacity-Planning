import { describe, it, expect } from 'vitest'
import {
  calculatePersonUtilisation,
  calculateRoleUtilisation,
  calculateTeamUtilisation,
  getUtilisationStatus,
  calculateContractorRequirement,
} from './utilisationCalculations'
import type { Resource, Allocation } from '../../types'
import { DEFAULT_ASSUMPTIONS } from '../../types'

const resource: Resource = {
  id: 'r1',
  displayName: 'Alice',
  role: 'process-engineering',
  employmentType: 'employee',
  contractHoursPerWeek: 40,
  workingDaysPerWeek: 5,
  fullTimeHoursPerWeek: 40,
  active: true,
}

const makeAllocation = (resourceId: string, hours: number, month = '2025-06'): Allocation => ({
  id: 'a1',
  scenarioId: 's1',
  projectId: 'p1',
  resourceId,
  role: 'process-engineering',
  month,
  hours,
  locked: false,
})

describe('getUtilisationStatus', () => {
  it('underused below 60%', () => expect(getUtilisationStatus(0.5)).toBe('underused'))
  it('healthy 60-85%', () => expect(getUtilisationStatus(0.7)).toBe('healthy'))
  it('high 85-100%', () => expect(getUtilisationStatus(0.9)).toBe('high'))
  it('overloaded 100-115%', () => expect(getUtilisationStatus(1.1)).toBe('overloaded'))
  it('critical above 115%', () => expect(getUtilisationStatus(1.2)).toBe('critical'))
})

describe('calculatePersonUtilisation', () => {
  it('returns 124% utilisation when 160h allocated against ~129h capacity', () => {
    const allocation = makeAllocation('r1', 160)
    const result = calculatePersonUtilisation(resource, [allocation], DEFAULT_ASSUMPTIONS, '2025-06')
    expect(result.utilisation).toBeGreaterThan(1.2)
    expect(result.utilisation).toBeLessThan(1.3)
    expect(result.status).toBe('critical')
    expect(result.overloadHours).toBeGreaterThan(0)
  })

  it('returns 0 overload when under capacity', () => {
    const allocation = makeAllocation('r1', 80)
    const result = calculatePersonUtilisation(resource, [allocation], DEFAULT_ASSUMPTIONS, '2025-06')
    expect(result.overloadHours).toBe(0)
  })

  it('ignores allocations for other months', () => {
    const allocation = makeAllocation('r1', 160, '2025-07')
    const result = calculatePersonUtilisation(resource, [allocation], DEFAULT_ASSUMPTIONS, '2025-06')
    expect(result.allocatedHours).toBe(0)
  })
})

describe('calculateRoleUtilisation', () => {
  it('aggregates capacity and demand across all role resources', () => {
    const r2: Resource = { ...resource, id: 'r2', displayName: 'Bob' }
    const allocs = [makeAllocation('r1', 50), makeAllocation('r2', 60)]
    const result = calculateRoleUtilisation(
      'process-engineering',
      [resource, r2],
      allocs,
      DEFAULT_ASSUMPTIONS,
      '2025-06'
    )
    expect(result.allocatedHours).toBe(110)
    expect(result.capacityHours).toBeCloseTo(result.capacityHours, 0)
  })
})

describe('calculateTeamUtilisation', () => {
  it('sums all active resource capacity', () => {
    const r2: Resource = { ...resource, id: 'r2', displayName: 'Bob' }
    const inactive: Resource = { ...resource, id: 'r3', displayName: 'Carol', active: false }
    const allocs = [makeAllocation('r1', 50), makeAllocation('r2', 60)]
    const result = calculateTeamUtilisation([resource, r2, inactive], allocs, DEFAULT_ASSUMPTIONS, '2025-06')
    expect(result.allocatedHours).toBe(110)
    // capacity should only count 2 active resources
    const singleCapacity = result.capacityHours / 2
    expect(singleCapacity).toBeGreaterThan(128)
    expect(singleCapacity).toBeLessThan(130)
  })
})

describe('calculateContractorRequirement', () => {
  it('calculates FTE from residual overload', () => {
    const result = calculateContractorRequirement(129, 129)
    expect(result.contractorFte).toBeCloseTo(1.0, 2)
    expect(result.contractorHoursRequired).toBe(129)
  })
})
