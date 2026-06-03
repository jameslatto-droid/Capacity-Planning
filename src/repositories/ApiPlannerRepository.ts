import type { PlannerRepository } from './PlannerRepository'
import type { Resource, Project, Allocation, Scenario } from '../types'

/**
 * Repository that talks to the Express server (server/index.js).
 * When baseUrl is empty, uses relative URLs — works when the React app
 * is served by the same Express process.
 */
export class ApiPlannerRepository implements PlannerRepository {
  private base: string

  constructor(baseUrl: string) {
    this.base = baseUrl.replace(/\/$/, '')
  }

  private async get<T>(path: string): Promise<T> {
    const url = this.base ? `${this.base}${path}` : path
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`)
    return res.json() as Promise<T>
  }

  private async put<T>(path: string, body: T): Promise<void> {
    const url = this.base ? `${this.base}${path}` : path
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`PUT ${path} → ${res.status} ${res.statusText}`)
  }

  loadResources(): Promise<Resource[]>     { return this.get('/api/resources') }
  saveResources(r: Resource[]): Promise<void> { return this.put('/api/resources', r) }

  loadProjects(): Promise<Project[]>       { return this.get('/api/projects') }
  saveProjects(p: Project[]): Promise<void>  { return this.put('/api/projects', p) }

  loadAllocations(): Promise<Allocation[]>     { return this.get('/api/allocations') }
  saveAllocations(a: Allocation[]): Promise<void> { return this.put('/api/allocations', a) }

  loadScenarios(): Promise<Scenario[]>     { return this.get('/api/scenarios') }
  saveScenarios(s: Scenario[]): Promise<void>  { return this.put('/api/scenarios', s) }
}
