import type { PlannerRepository } from './PlannerRepository'
import type { Resource, Project, Allocation, Scenario } from '../types'

export class ApiPlannerRepository implements PlannerRepository {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`)
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`)
    return res.json() as Promise<T>
  }

  private async put<T>(path: string, body: T): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`)
  }

  loadResources(): Promise<Resource[]> {
    return this.get<Resource[]>('/api/resources')
  }

  saveResources(resources: Resource[]): Promise<void> {
    return this.put('/api/resources', resources)
  }

  loadProjects(): Promise<Project[]> {
    return this.get<Project[]>('/api/projects')
  }

  saveProjects(projects: Project[]): Promise<void> {
    return this.put('/api/projects', projects)
  }

  loadAllocations(): Promise<Allocation[]> {
    return this.get<Allocation[]>('/api/allocations')
  }

  saveAllocations(allocations: Allocation[]): Promise<void> {
    return this.put('/api/allocations', allocations)
  }

  loadScenarios(): Promise<Scenario[]> {
    return this.get<Scenario[]>('/api/scenarios')
  }

  saveScenarios(scenarios: Scenario[]): Promise<void> {
    return this.put('/api/scenarios', scenarios)
  }
}
