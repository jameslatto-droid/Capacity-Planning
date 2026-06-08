import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { PlannerRepository } from './PlannerRepository'
import type { Allocation, LeaveEntry, Project, Resource, Scenario } from '../types'
import { seedAllocations } from '../data/seed/allocations'
import { seedLeaveEntries } from '../data/seed/leaveEntries'
import { seedProjects } from '../data/seed/projects'
import { seedResources } from '../data/seed/resources'
import { seedScenarios } from '../data/seed/scenarios'
import { getStoredUser } from '../utils/auth'

const STATE_ID = 'main'
const TABLE = 'planner_state'

type PlannerStateRow = {
  id: string
  resources: Resource[]
  projects: Project[]
  allocations: Allocation[]
  scenarios: Scenario[]
  leave_entries: LeaveEntry[]
  version: number
  updated_at: string | null
  updated_by: string | null
}

type PlannerStateColumn = Exclude<keyof PlannerStateRow, 'id' | 'version' | 'updated_at' | 'updated_by'>

type SupabasePlannerStateColumn = {
  resources: Resource[]
  projects: Project[]
  allocations: Allocation[]
  scenarios: Scenario[]
  leave_entries: LeaveEntry[]
}

const seedState: SupabasePlannerStateColumn = {
  resources: seedResources,
  projects: seedProjects,
  allocations: seedAllocations,
  scenarios: seedScenarios,
  leave_entries: seedLeaveEntries,
}

function isMissingTableError(error: { code?: string; message?: string }): boolean {
  return error.code === '42P01' || error.message?.toLowerCase().includes(TABLE) === true
}

function setupMessage(error: { code?: string; message?: string }): string {
  if (isMissingTableError(error)) {
    return `Supabase table "${TABLE}" is not set up. Run docs/supabase-setup.sql in the Supabase SQL editor, then reload the app.`
  }
  return error.message ?? 'Supabase request failed'
}

export class SupabasePlannerRepository implements PlannerRepository {
  private client: SupabaseClient
  private initPromise: Promise<void> | null = null

  constructor(url: string, publishableKey: string) {
    this.client = createClient(url, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  private async ensureState(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.createStateIfMissing()
    }
    return this.initPromise
  }

  private async createStateIfMissing(): Promise<void> {
    const { data, error } = await this.client
      .from(TABLE)
      .select('id')
      .eq('id', STATE_ID)
      .maybeSingle()

    if (error) throw new Error(setupMessage(error))
    if (data) return

    const { error: insertError } = await this.client
      .from(TABLE)
      .insert({
        id: STATE_ID,
        ...seedState,
        version: 1,
        updated_at: new Date().toISOString(),
        updated_by: getStoredUser()?.id ?? 'system',
      })

    if (insertError) throw new Error(setupMessage(insertError))
  }

  private async loadColumn<K extends PlannerStateColumn>(column: K): Promise<PlannerStateRow[K]> {
    await this.ensureState()

    const { data, error } = await this.client
      .from(TABLE)
      .select(column)
      .eq('id', STATE_ID)
      .single()

    if (error) throw new Error(setupMessage(error))
    return (data as Record<K, PlannerStateRow[K]>)[column]
  }

  private async saveColumn<K extends PlannerStateColumn>(column: K, value: PlannerStateRow[K]): Promise<void> {
    await this.ensureState()

    const { error } = await this.client
      .from(TABLE)
      .update({
        [column]: value,
        updated_at: new Date().toISOString(),
        updated_by: getStoredUser()?.id ?? null,
      })
      .eq('id', STATE_ID)

    if (error) throw new Error(setupMessage(error))
  }

  loadResources(): Promise<Resource[]> {
    return this.loadColumn('resources')
  }

  saveResources(resources: Resource[]): Promise<void> {
    return this.saveColumn('resources', resources)
  }

  loadProjects(): Promise<Project[]> {
    return this.loadColumn('projects')
  }

  saveProjects(projects: Project[]): Promise<void> {
    return this.saveColumn('projects', projects)
  }

  loadAllocations(): Promise<Allocation[]> {
    return this.loadColumn('allocations')
  }

  saveAllocations(allocations: Allocation[]): Promise<void> {
    return this.saveColumn('allocations', allocations)
  }

  loadScenarios(): Promise<Scenario[]> {
    return this.loadColumn('scenarios')
  }

  saveScenarios(scenarios: Scenario[]): Promise<void> {
    return this.saveColumn('scenarios', scenarios)
  }

  loadLeaveEntries(): Promise<LeaveEntry[]> {
    return this.loadColumn('leave_entries')
  }

  saveLeaveEntries(entries: LeaveEntry[]): Promise<void> {
    return this.saveColumn('leave_entries', entries)
  }
}
