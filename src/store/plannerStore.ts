import { create } from 'zustand'
import type { Resource, Project, Allocation, Scenario } from '../types'
import type { PlannerRepository } from '../repositories/PlannerRepository'
import { LocalStoragePlannerRepository } from '../repositories/LocalStoragePlannerRepository'
import { ApiPlannerRepository } from '../repositories/ApiPlannerRepository'

function createRepository(): PlannerRepository {
  const mode    = import.meta.env['VITE_STORAGE_MODE'] ?? 'local'
  const apiBase = import.meta.env['VITE_API_BASE_URL'] ?? ''
  // api mode: use ApiPlannerRepository regardless of whether baseUrl is set.
  // Empty baseUrl → relative URLs (works when served by the same Express process).
  if (mode === 'api') {
    return new ApiPlannerRepository(apiBase)
  }
  return new LocalStoragePlannerRepository()
}

const repository = createRepository()

interface PlannerState {
  resources: Resource[]
  projects: Project[]
  allocations: Allocation[]
  scenarios: Scenario[]
  activeScenarioId: string
  isLoading: boolean
  error: string | null

  loadAll(): Promise<void>

  setResources(resources: Resource[]): Promise<void>
  addResource(resource: Resource): Promise<void>
  updateResource(resource: Resource): Promise<void>
  deleteResource(id: string): Promise<void>

  setProjects(projects: Project[]): Promise<void>
  addProject(project: Project): Promise<void>
  updateProject(project: Project): Promise<void>
  deleteProject(id: string): Promise<void>

  setAllocations(allocations: Allocation[]): Promise<void>
  addAllocation(allocation: Allocation): Promise<void>
  updateAllocation(allocation: Allocation): Promise<void>
  deleteAllocation(id: string): Promise<void>

  setScenarios(scenarios: Scenario[]): Promise<void>
  addScenario(scenario: Scenario): Promise<void>
  updateScenario(scenario: Scenario): Promise<void>
  deleteScenario(id: string): Promise<void>
  setActiveScenario(id: string): void

  resetToSeedData(): Promise<void>
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  resources: [],
  projects: [],
  allocations: [],
  scenarios: [],
  activeScenarioId: 's-baseline',
  isLoading: false,
  error: null,

  async loadAll() {
    set({ isLoading: true, error: null })
    try {
      const [resources, projects, allocations, scenarios] = await Promise.all([
        repository.loadResources(),
        repository.loadProjects(),
        repository.loadAllocations(),
        repository.loadScenarios(),
      ])
      set({ resources, projects, allocations, scenarios, isLoading: false })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  async setResources(resources) {
    await repository.saveResources(resources)
    set({ resources })
  },
  async addResource(resource) {
    const resources = [...get().resources, resource]
    await repository.saveResources(resources)
    set({ resources })
  },
  async updateResource(resource) {
    const resources = get().resources.map((r) => (r.id === resource.id ? resource : r))
    await repository.saveResources(resources)
    set({ resources })
  },
  async deleteResource(id) {
    const resources = get().resources.filter((r) => r.id !== id)
    await repository.saveResources(resources)
    set({ resources })
  },

  async setProjects(projects) {
    await repository.saveProjects(projects)
    set({ projects })
  },
  async addProject(project) {
    const projects = [...get().projects, project]
    await repository.saveProjects(projects)
    set({ projects })
  },
  async updateProject(project) {
    const projects = get().projects.map((p) => (p.id === project.id ? project : p))
    await repository.saveProjects(projects)
    set({ projects })
  },
  async deleteProject(id) {
    const projects = get().projects.filter((p) => p.id !== id)
    await repository.saveProjects(projects)
    set({ projects })
  },

  async setAllocations(allocations) {
    await repository.saveAllocations(allocations)
    set({ allocations })
  },
  async addAllocation(allocation) {
    const allocations = [...get().allocations, allocation]
    await repository.saveAllocations(allocations)
    set({ allocations })
  },
  async updateAllocation(allocation) {
    const allocations = get().allocations.map((a) => (a.id === allocation.id ? allocation : a))
    await repository.saveAllocations(allocations)
    set({ allocations })
  },
  async deleteAllocation(id) {
    const allocations = get().allocations.filter((a) => a.id !== id)
    await repository.saveAllocations(allocations)
    set({ allocations })
  },

  async setScenarios(scenarios) {
    await repository.saveScenarios(scenarios)
    set({ scenarios })
  },
  async addScenario(scenario) {
    const scenarios = [...get().scenarios, scenario]
    await repository.saveScenarios(scenarios)
    set({ scenarios })
  },
  async updateScenario(scenario) {
    const scenarios = get().scenarios.map((s) => (s.id === scenario.id ? scenario : s))
    await repository.saveScenarios(scenarios)
    set({ scenarios })
  },
  async deleteScenario(id) {
    const scenarios = get().scenarios.filter((s) => s.id !== id)
    await repository.saveScenarios(scenarios)
    set({ scenarios })
  },
  setActiveScenario(id) {
    set({ activeScenarioId: id })
  },

  async resetToSeedData() {
    if (repository instanceof LocalStoragePlannerRepository) {
      await repository.resetToSeedData()
    }
    await get().loadAll()
  },
}))
