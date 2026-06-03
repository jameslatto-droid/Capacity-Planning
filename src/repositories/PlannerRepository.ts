import type { Resource, Project, Allocation, Scenario } from '../types'

export interface PlannerRepository {
  loadResources(): Promise<Resource[]>
  saveResources(resources: Resource[]): Promise<void>

  loadProjects(): Promise<Project[]>
  saveProjects(projects: Project[]): Promise<void>

  loadAllocations(): Promise<Allocation[]>
  saveAllocations(allocations: Allocation[]): Promise<void>

  loadScenarios(): Promise<Scenario[]>
  saveScenarios(scenarios: Scenario[]): Promise<void>
}
