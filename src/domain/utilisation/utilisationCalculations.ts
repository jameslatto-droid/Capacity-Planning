import type {
  Resource,
  Allocation,
  CapacityAssumptions,
  PersonUtilisationResult,
  RoleUtilisationResult,
  TeamUtilisationResult,
  UtilisationStatus,
  ResourceRole,
  LeaveEntry,
} from '../../types'
import { calculateMonthlyProductiveCapacity } from '../capacity/capacityCalculations'
import { calculateMonthlyCapacityWithLeave } from '../capacity/leaveCalculations'

export function getUtilisationStatus(utilisation: number): UtilisationStatus {
  if (utilisation < 0.6) return 'underused'
  if (utilisation < 0.85) return 'healthy'
  if (utilisation < 1.0) return 'high'
  if (utilisation <= 1.15) return 'overloaded'
  return 'critical'
}

/** Resolve capacity for a resource in a month, using actual leave when available. */
function resolveCapacity(
  resource: Resource,
  month: string,
  assumptions: CapacityAssumptions,
  leaveEntries?: LeaveEntry[]
): number {
  if (leaveEntries && leaveEntries.length > 0) {
    return calculateMonthlyCapacityWithLeave(resource, month, leaveEntries, assumptions)
  }
  return calculateMonthlyProductiveCapacity(resource, assumptions)
}

export function calculatePersonUtilisation(
  resource: Resource,
  allocations: Allocation[],
  assumptions: CapacityAssumptions,
  month: string,
  leaveEntries?: LeaveEntry[]
): PersonUtilisationResult {
  const capacityHours = resolveCapacity(resource, month, assumptions, leaveEntries)
  const allocatedHours = allocations
    .filter((a) => a.resourceId === resource.id && a.month === month)
    .reduce((sum, a) => sum + a.hours, 0)

  const utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0
  const overloadHours = Math.max(0, allocatedHours - capacityHours)

  return {
    resourceId: resource.id,
    month,
    allocatedHours,
    capacityHours,
    utilisation,
    overloadHours,
    status: getUtilisationStatus(utilisation),
  }
}

export function calculatePersonUtilisationAllMonths(
  resource: Resource,
  allocations: Allocation[],
  assumptions: CapacityAssumptions,
  months: string[],
  leaveEntries?: LeaveEntry[]
): PersonUtilisationResult[] {
  return months.map((month) =>
    calculatePersonUtilisation(resource, allocations, assumptions, month, leaveEntries)
  )
}

export function calculateRoleUtilisation(
  role: ResourceRole,
  resources: Resource[],
  allocations: Allocation[],
  assumptions: CapacityAssumptions,
  month: string,
  leaveEntries?: LeaveEntry[]
): RoleUtilisationResult {
  const roleResources = resources.filter(
    (r) => r.active && (r.role === role || r.secondaryRoles?.includes(role))
  )

  const capacityHours = roleResources.reduce(
    (sum, r) => sum + resolveCapacity(r, month, assumptions, leaveEntries),
    0
  )

  const allocatedHours = allocations
    .filter((a) => a.role === role && a.month === month)
    .reduce((sum, a) => sum + a.hours, 0)

  const utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0
  const overloadHours = Math.max(0, allocatedHours - capacityHours)

  return {
    role,
    month,
    allocatedHours,
    capacityHours,
    utilisation,
    overloadHours,
    status: getUtilisationStatus(utilisation),
  }
}

export function calculateTeamUtilisation(
  resources: Resource[],
  allocations: Allocation[],
  assumptions: CapacityAssumptions,
  month: string,
  leaveEntries?: LeaveEntry[]
): TeamUtilisationResult {
  const activeResources = resources.filter((r) => r.active)
  const capacityHours = activeResources.reduce(
    (sum, r) => sum + resolveCapacity(r, month, assumptions, leaveEntries),
    0
  )

  const allocatedHours = allocations
    .filter((a) => a.month === month)
    .reduce((sum, a) => sum + a.hours, 0)

  const utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0
  const overloadHours = Math.max(0, allocatedHours - capacityHours)

  return {
    month,
    allocatedHours,
    capacityHours,
    utilisation,
    overloadHours,
    status: getUtilisationStatus(utilisation),
  }
}

export function identifyOverloads(
  personResults: PersonUtilisationResult[]
): PersonUtilisationResult[] {
  return personResults.filter((r) => r.status === 'overloaded' || r.status === 'critical')
}

export function calculateContractorRequirement(
  overloadHours: number,
  monthlyFteCapacity: number
): { contractorHoursRequired: number; contractorFte: number } {
  return {
    contractorHoursRequired: overloadHours,
    contractorFte: monthlyFteCapacity > 0 ? overloadHours / monthlyFteCapacity : 0,
  }
}
