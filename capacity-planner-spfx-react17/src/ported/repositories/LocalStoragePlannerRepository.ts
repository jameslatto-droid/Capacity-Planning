import type { PlannerRepository } from './PlannerRepository'
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types'
import { seedResources } from '../data/seed/resources'
import { seedProjects } from '../data/seed/projects'
import { seedAllocations } from '../data/seed/allocations'
import { seedScenarios } from '../data/seed/scenarios'

// Bump this when seed data changes to force a reload of fresh data in the browser.
const SEED_VERSION = '4'

const KEYS = {
  version:  'erp:seed-version',
  resources: 'erp:resources',
  projects:  'erp:projects',
  allocations: 'erp:allocations',
  scenarios: 'erp:scenarios',
  leave:     'erp:leave',
} as const

const SEED_DATA_KEYS = [KEYS.resources, KEYS.projects, KEYS.allocations, KEYS.scenarios] as const
const ALL_DATA_KEYS = [...SEED_DATA_KEYS, KEYS.leave] as const

function backupExistingData(storedVersion: string | null): void {
  const backup: Record<string, string> = {}
  for (const key of ALL_DATA_KEYS) {
    const value = localStorage.getItem(key)
    if (value !== null) backup[key] = value
  }

  if (Object.keys(backup).length === 0) return

  const fromVersion = storedVersion ?? 'none'
  localStorage.setItem(
    `erp:migration-backup:${fromVersion}:to:${SEED_VERSION}:${new Date().toISOString()}`,
    JSON.stringify(backup),
  )
}

function clearSeedData(): void {
  for (const key of SEED_DATA_KEYS) localStorage.removeItem(key)
}

function clearAll(): void {
  for (const key of ALL_DATA_KEYS) localStorage.removeItem(key)
}

function migrateIfNeeded(): void {
  const stored = localStorage.getItem(KEYS.version)
  if (stored !== SEED_VERSION) {
    backupExistingData(stored)
    clearSeedData()
    localStorage.setItem(KEYS.version, SEED_VERSION)
  }
}

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
  constructor() {
    migrateIfNeeded()
  }

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

  loadLeaveEntries(): Promise<LeaveEntry[]> {
    return Promise.resolve(readKey<LeaveEntry[]>(KEYS.leave, []))
  }

  saveLeaveEntries(entries: LeaveEntry[]): Promise<void> {
    writeKey(KEYS.leave, entries)
    return Promise.resolve()
  }

  resetToSeedData(): Promise<void> {
    clearAll()
    localStorage.setItem(KEYS.version, SEED_VERSION)
    return Promise.resolve()
  }
}
