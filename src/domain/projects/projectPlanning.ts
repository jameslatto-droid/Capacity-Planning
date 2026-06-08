import type { Allocation, Project, ProjectType } from '../../types'

export function getProjectType(project: Project): ProjectType {
  return project.projectType ?? (project.status === 'opportunity' ? 'opportunity' : 'live')
}

export function isProjectIncludedInResourceCalculations(project: Project | undefined): boolean {
  if (!project) return true
  if (getProjectType(project) === 'live') return true
  return project.includeInResourceCalculations ?? true
}

export function filterResourceCalculationAllocations(
  allocations: Allocation[],
  projects: Project[]
): Allocation[] {
  const projectById = new Map(projects.map((project) => [project.id, project]))
  return allocations.filter((allocation) =>
    isProjectIncludedInResourceCalculations(projectById.get(allocation.projectId))
  )
}
