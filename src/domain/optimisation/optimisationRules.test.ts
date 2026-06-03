import { describe, it, expect } from 'vitest'
import {
  findOverloadedPersonMonths,
  findAvailableCapacity,
  calculateResidualOverload,
  calculateContractorFteRequirement,
} from './optimisationRules'
import type { PersonUtilisationResult, Resource } from '../../types'

const makeResult = (
  resourceId: string,
  utilisation: number,
  capacityHours = 129
): PersonUtilisationResult => {
  const allocatedHours = capacityHours * utilisation
  const overloadHours = Math.max(0, allocatedHours - capacityHours)
  const status =
    utilisation < 0.6 ? 'underused'
    : utilisation < 0.85 ? 'healthy'
    : utilisation < 1.0 ? 'high'
    : utilisation <= 1.15 ? 'overloaded'
    : 'critical'
  return { resourceId, month: '2025-06', allocatedHours, capacityHours, utilisation, overloadHours, status }
}

const makeResource = (id: string, role = 'process-engineering' as const): Resource => ({
  id,
  displayName: id,
  role,
  employmentType: 'employee',
  contractHoursPerWeek: 40,
  workingDaysPerWeek: 5,
  fullTimeHoursPerWeek: 40,
  active: true,
})

describe('findOverloadedPersonMonths', () => {
  it('returns only overloaded and critical entries', () => {
    const results = [
      makeResult('r1', 0.7),
      makeResult('r2', 1.05),
      makeResult('r3', 1.2),
    ]
    const overloaded = findOverloadedPersonMonths(results)
    expect(overloaded).toHaveLength(2)
    expect(overloaded.map((r) => r.resourceId)).toEqual(['r2', 'r3'])
  })
})

describe('findAvailableCapacity', () => {
  it('returns resources with spare capacity', () => {
    const resources = [makeResource('r1'), makeResource('r2')]
    const results = [makeResult('r1', 0.6), makeResult('r2', 1.1)]
    const available = findAvailableCapacity(resources, results, '2025-06')
    expect(available).toHaveLength(1)
    expect(available[0]?.resource.id).toBe('r1')
    expect(available[0]?.availableHours).toBeGreaterThan(0)
  })
})

describe('calculateResidualOverload', () => {
  it('subtracts recommended hours from total overload', () => {
    const overloads = [makeResult('r1', 1.2)]
    const residual = calculateResidualOverload(overloads, [
      { type: 'same-role-reallocation', month: '2025-06', hoursToMove: 10, description: '' },
    ])
    expect(residual).toBeCloseTo(overloads[0]!.overloadHours - 10, 1)
  })
})

describe('calculateContractorFteRequirement', () => {
  it('returns correct FTE for residual overload', () => {
    const result = calculateContractorFteRequirement(129, 129)
    expect(result[0]?.contractorFte).toBeCloseTo(1.0, 2)
  })

  it('returns empty array when no overload', () => {
    expect(calculateContractorFteRequirement(0, 129)).toHaveLength(0)
  })
})
