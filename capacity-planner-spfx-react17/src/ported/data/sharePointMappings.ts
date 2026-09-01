// SharePoint list names for the Capacity Planner solution.
// Use ONLY these names — never the legacy PPM_* prefix.

export const SP_LISTS = {
  resources: 'PlannerResources',
  projects: 'PlannerProjects',
  scenarios: 'PlannerScenarios',
  allocations: 'PlannerAllocations',
  leaveEntries: 'PlannerLeaveEntries',
  rolesDisciplines: 'PlannerRolesDisciplines',
  assumptions: 'PlannerAssumptions',
  settings: 'PlannerSettings',
  auditLog: 'PlannerAuditLog',
} as const

export type SpListName = typeof SP_LISTS[keyof typeof SP_LISTS]

export const SP_SITE_URL = 'https://narwal.sharepoint.com/sites/CapacityPlanning'
