import type {
  Resource,
  Allocation,
  CapacityAssumptions,
  PersonUtilisationResult,
  OptimisationRecommendation,
  ContractorRequirement,
  ResourceRole,
} from '../../types'

export function findOverloadedPersonMonths(
  results: PersonUtilisationResult[]
): PersonUtilisationResult[] {
  return results.filter((r) => r.status === 'overloaded' || r.status === 'critical')
}

export function findAvailableCapacity(
  resources: Resource[],
  results: PersonUtilisationResult[],
  month: string
): Array<{ resource: Resource; availableHours: number }> {
  return resources
    .filter((r) => r.active)
    .map((r) => {
      const result = results.find((ur) => ur.resourceId === r.id && ur.month === month)
      const allocated = result?.allocatedHours ?? 0
      const capacity = result?.capacityHours ?? 0
      const availableHours = Math.max(0, capacity - allocated)
      return { resource: r, availableHours }
    })
    .filter((entry) => entry.availableHours > 0)
}

export function findCompatibleResources(
  overloadedResource: Resource,
  candidates: Resource[],
  requiredRole: ResourceRole
): Resource[] {
  return candidates.filter(
    (r) =>
      r.id !== overloadedResource.id &&
      r.active &&
      (r.role === requiredRole || r.secondaryRoles?.includes(requiredRole))
  )
}

export function suggestSameRoleReallocations(
  overloads: PersonUtilisationResult[],
  allResources: Resource[],
  allResults: PersonUtilisationResult[],
  _allocations: Allocation[]
): OptimisationRecommendation[] {
  const recommendations: OptimisationRecommendation[] = []

  for (const overload of overloads) {
    if (overload.overloadHours <= 0) continue

    const overloadedResource = allResources.find((r) => r.id === overload.resourceId)
    if (!overloadedResource) continue

    const available = findAvailableCapacity(allResources, allResults, overload.month)

    for (const { resource: candidate, availableHours } of available) {
      const isCompatible =
        candidate.role === overloadedResource.role ||
        candidate.secondaryRoles?.includes(overloadedResource.role)

      if (!isCompatible) continue

      const hoursToMove = Math.min(overload.overloadHours, availableHours)
      const type =
        candidate.role === overloadedResource.role
          ? 'same-role-reallocation'
          : 'secondary-role-reallocation'

      recommendations.push({
        type,
        overloadedResourceId: overload.resourceId,
        month: overload.month,
        hoursToMove,
        targetResourceId: candidate.id,
        description: `Move ${hoursToMove.toFixed(0)}h from ${overloadedResource.displayName} to ${candidate.displayName} in ${overload.month}`,
      })
    }
  }

  return recommendations
}

export function suggestMonthSmoothing(
  overloads: PersonUtilisationResult[],
  allResults: PersonUtilisationResult[],
  allocations: Allocation[],
  _assumptions: CapacityAssumptions
): OptimisationRecommendation[] {
  const recommendations: OptimisationRecommendation[] = []

  for (const overload of overloads) {
    if (overload.overloadHours <= 0) continue

    const flexibleAllocations = allocations.filter(
      (a) =>
        a.resourceId === overload.resourceId &&
        a.month === overload.month &&
        !a.locked
    )

    for (const alloc of flexibleAllocations) {
      const nextMonth = getNextMonth(overload.month)
      const nextMonthResult = allResults.find(
        (r) => r.resourceId === overload.resourceId && r.month === nextMonth
      )
      const nextAvailable = nextMonthResult
        ? Math.max(0, nextMonthResult.capacityHours - nextMonthResult.allocatedHours)
        : 0

      if (nextAvailable > 0) {
        const hoursToMove = Math.min(alloc.hours, overload.overloadHours)
        recommendations.push({
          type: 'month-smoothing',
          overloadedResourceId: overload.resourceId,
          month: overload.month,
          hoursToMove,
          targetMonth: nextMonth,
          description: `Move ${hoursToMove.toFixed(0)}h of flexible work from ${overload.month} to ${nextMonth}`,
        })
      }
    }
  }

  return recommendations
}

export function calculateResidualOverload(
  overloads: PersonUtilisationResult[],
  recommendations: OptimisationRecommendation[]
): number {
  const totalOverload = overloads.reduce((sum, o) => sum + o.overloadHours, 0)
  const totalRecommended = recommendations.reduce((sum, r) => sum + r.hoursToMove, 0)
  return Math.max(0, totalOverload - totalRecommended)
}

export function calculateContractorFteRequirement(
  residualOverload: number,
  monthlyFteCapacity: number
): ContractorRequirement[] {
  if (residualOverload <= 0) return []
  return [
    {
      month: 'aggregate',
      residualOverloadHours: residualOverload,
      contractorFte: monthlyFteCapacity > 0 ? residualOverload / monthlyFteCapacity : 0,
    },
  ]
}

function getNextMonth(month: string): string {
  const [year, m] = month.split('-').map(Number)
  const date = new Date(year!, (m! - 1) + 1, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
