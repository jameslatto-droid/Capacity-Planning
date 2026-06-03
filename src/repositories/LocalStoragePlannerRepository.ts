import type { PlannerRepository } from './PlannerRepository'
import type { Resource, Project, Allocation, Scenario } from '../types'
import { seedResources } from '../data/seed/resources'
import { seedProjects } from '../data/seed/projects'
import { seedAllocations } from '../data/seed/allocations'
import { seedScenarios } from '../data/seed/scenarios'

const KEYS = {
  resources: 'erp:resources',
  projects: 'erp:projects',
  allocations: 'erp:allocations',
  scenarios: 'erp:scenarios',
} as const

function readKey<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeKey<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export class LocalStoragePlannerRepository implements PlannerRepository {
  loadResources(): Promise<Resource[]> {
    return Promise.resolve(readKey<Resource[]>(KEYS.resources, seedResources))
  }

  saveResources(resources: Resource[]): Promise<void> {
    writeKey(KEYS.resources, resources)
    return Promise.resolve()
  }

  loadProjects(): Promise<Project[]> {
    return Promise.resolve(readKey<Project[]>(KEYS.projects, seedProjects))
  }

  saveProjects(projects: Project[]): Promise<void> {
    writeKey(KEYS.projects, projects)
    return Promise.resolve()
  }

  loadAllocations(): Promise<Allocation[]> {
    return Promise.resolve(readKey<Allocation[]>(KEYS.allocations, seedAllocations))
  }

  saveAllocations(allocations: Allocation[]): Promise<void> {
    writeKey(KEYS.allocations, allocations)
    return Promise.resolve()
  }

  loadScenarios(): Promise<Scenario[]> {
    return Promise.resolve(readKey<Scenario[]>(KEYS.scenarios, seedScenarios))
  }

  saveScenarios(scenarios: Scenario[]): Promise<void> {
    writeKey(KEYS.scenarios, scenarios)
    return Promise.resolve()
  }

  resetToSeedData(): Promise<void> {
    localStorage.removeItem(KEYS.resources)
    localStorage.removeItem(KEYS.projects)
    localStorage.removeItem(KEYS.allocations)
    localStorage.removeItem(KEYS.scenarios)
    return Promise.resolve()
  }
}
