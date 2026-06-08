import { create } from 'zustand'
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types'
import type { PlannerRepository } from '../repositories/PlannerRepository'
import { LocalStoragePlannerRepository } from '../repositories/LocalStoragePlannerRepository'
import { ApiPlannerRepository } from '../repositories/ApiPlannerRepository'
import { SupabasePlannerRepository } from '../repositories/SupabasePlannerRepository'
import { getStoredUser } from '../utils/auth'

function createRepository(): PlannerRepository {
  const mode = import.meta.env['VITE_STORAGE_MODE'] ?? 'local'
  const apiBase = import.meta.env['VITE_API_BASE_URL'] ?? ''
  const supabaseUrl = import.meta.env['VITE_SUPABASE_URL'] ?? ''
  const supabasePublishableKey = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ?? ''
  if (mode === 'supabase' && supabaseUrl && supabasePublishableKey) {
    return new SupabasePlannerRepository(supabaseUrl, supabasePublishableKey)
  }
  if (mode === 'api' && apiBase) {
    return new ApiPlannerRepository(apiBase)
  }
  return new LocalStoragePlannerRepository()
}

const repository = createRepository()

type AuditedRecord = {
  createdAt?: string
  createdBy?: string
  lastModifiedAt?: string
  lastModifiedBy?: string
}

function currentUserId(): string | undefined {
  return getStoredUser()?.id
}

function stampCreated<T extends AuditedRecord>(record: T): T {
  const now = new Date().toISOString()
  const userId = currentUserId()
  return {
    ...record,
    createdAt: record.createdAt ?? now,
    createdBy: record.createdBy ?? userId,
    lastModifiedAt: now,
    lastModifiedBy: userId ?? record.lastModifiedBy,
  }
}

function stampModified<T extends AuditedRecord>(record: T): T {
  const now = new Date().toISOString()
  const userId = currentUserId()
  return {
    ...record,
    lastModifiedAt: now,
    lastModifiedBy: userId ?? record.lastModifiedBy,
  }
}

function allocationChanged(previous: Allocation, next: Allocation): boolean {
  return (
    previous.scenarioId !== next.scenarioId ||
    previous.projectId !== next.projectId ||
    previous.resourceId !== next.resourceId ||
    previous.role !== next.role ||
    previous.month !== next.month ||
    previous.hours !== next.hours ||
    previous.locked !== next.locked ||
    previous.notes !== next.notes
  )
}

function stampChangedAllocations(previous: Allocation[], next: Allocation[]): Allocation[] {
  const previousById = new Map(previous.map((allocation) => [allocation.id, allocation]))
  return next.map((allocation) => {
    const existing = previousById.get(allocation.id)
    if (!existing) return stampCreated(allocation)
    if (!allocationChanged(existing, allocation)) return existing
    return stampModified({
      ...allocation,
      createdAt: allocation.createdAt ?? existing.createdAt,
      createdBy: allocation.createdBy ?? existing.createdBy,
    })
  })
}

interface PlannerState {
  resources: Resource[]
  projects: Project[]
  allocations: Allocation[]
  scenarios: Scenario[]
  leaveEntries: LeaveEntry[]
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

  setLeaveEntries(entries: LeaveEntry[]): Promise<void>
  addLeaveEntry(entry: LeaveEntry): Promise<void>
  updateLeaveEntry(entry: LeaveEntry): Promise<void>
  deleteLeaveEntry(id: string): Promise<void>

  resetToSeedData(): Promise<void>
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  resources: [],
  projects: [],
  allocations: [],
  scenarios: [],
  leaveEntries: [],
  activeScenarioId: 's-baseline',
  isLoading: false,
  error: null,

  async loadAll() {
    set({ isLoading: true, error: null })
    try {
      const [resources, projects, allocations, scenarios, leaveEntries] = await Promise.all([
        repository.loadResources(),
        repository.loadProjects(),
        repository.loadAllocations(),
        repository.loadScenarios(),
        repository.loadLeaveEntries(),
      ])
      set({ resources, projects, allocations, scenarios, leaveEntries, isLoading: false })
    } catch (e) {
      set({ error: String(e), isLoading: false })
    }
  },

  async setResources(resources) {
    await repository.saveResources(resources)
    set({ resources })
  },
  async addResource(resource) {
    const resources = [...get().resources, stampCreated(resource)]
    await repository.saveResources(resources)
    set({ resources })
  },
  async updateResource(resource) {
    const resources = get().resources.map((r) => (r.id === resource.id ? stampModified({ ...r, ...resource }) : r))
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
    const projects = [...get().projects, stampCreated(project)]
    await repository.saveProjects(projects)
    set({ projects })
  },
  async updateProject(project) {
    const projects = get().projects.map((p) => (p.id === project.id ? stampModified({ ...p, ...project }) : p))
    await repository.saveProjects(projects)
    set({ projects })
  },
  async deleteProject(id) {
    const projects = get().projects.filter((p) => p.id !== id)
    await repository.saveProjects(projects)
    set({ projects })
  },

  async setAllocations(allocations) {
    const stampedAllocations = stampChangedAllocations(get().allocations, allocations)
    await repository.saveAllocations(stampedAllocations)
    set({ allocations: stampedAllocations })
  },
  async addAllocation(allocation) {
    const allocations = [...get().allocations, stampCreated(allocation)]
    await repository.saveAllocations(allocations)
    set({ allocations })
  },
  async updateAllocation(allocation) {
    const allocations = get().allocations.map((a) => (a.id === allocation.id ? stampModified({ ...a, ...allocation }) : a))
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

  async setLeaveEntries(entries) {
    await repository.saveLeaveEntries(entries)
    set({ leaveEntries: entries })
  },
  async addLeaveEntry(entry) {
    const leaveEntries = [...get().leaveEntries, stampCreated(entry)]
    await repository.saveLeaveEntries(leaveEntries)
    set({ leaveEntries })
  },
  async updateLeaveEntry(entry) {
    const leaveEntries = get().leaveEntries.map((e) => (e.id === entry.id ? stampModified({ ...e, ...entry }) : e))
    await repository.saveLeaveEntries(leaveEntries)
    set({ leaveEntries })
  },
  async deleteLeaveEntry(id) {
    const leaveEntries = get().leaveEntries.filter((e) => e.id !== id)
    await repository.saveLeaveEntries(leaveEntries)
    set({ leaveEntries })
  },

  async resetToSeedData() {
    if (repository instanceof LocalStoragePlannerRepository) {
      await repository.resetToSeedData()
    }
    await get().loadAll()
  },
}))
