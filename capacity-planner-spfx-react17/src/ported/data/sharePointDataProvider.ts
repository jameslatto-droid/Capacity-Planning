// SPFX_PORT_TODO: Full SharePoint data provider implementation.
// Wire this when switching from dataMode: 'mock' to dataMode: 'sharepoint'.
//
// Target lists are defined in sharePointMappings.ts:
//   PlannerResources, PlannerProjects, PlannerScenarios, PlannerAllocations,
//   PlannerLeaveEntries, PlannerRolesDisciplines, PlannerAssumptions,
//   PlannerSettings, PlannerAuditLog

import type { PlannerRepository } from '../repositories/PlannerRepository'
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types'
import { SP_LISTS } from './sharePointMappings'

export class SharePointPlannerRepository implements PlannerRepository {
  private siteUrl: string

  constructor(siteUrl: string) {
    this.siteUrl = siteUrl.replace(/\/$/, '')
  }

  private async getListItems<T>(listName: string): Promise<T[]> {
    // SPFX_PORT_TODO: implement via PnPjs or SPHttpClient
    throw new Error(`SharePoint read not yet implemented for list: ${listName}`)
  }

  private async upsertListItems<T>(listName: string, items: T[]): Promise<void> {
    // SPFX_PORT_TODO: implement via PnPjs or SPHttpClient
    throw new Error(`SharePoint write not yet implemented for list: ${listName}`)
  }

  loadResources(): Promise<Resource[]> {
    return this.getListItems<Resource>(SP_LISTS.resources)
  }

  saveResources(resources: Resource[]): Promise<void> {
    return this.upsertListItems(SP_LISTS.resources, resources)
  }

  loadProjects(): Promise<Project[]> {
    return this.getListItems<Project>(SP_LISTS.projects)
  }

  saveProjects(projects: Project[]): Promise<void> {
    return this.upsertListItems(SP_LISTS.projects, projects)
  }

  loadAllocations(): Promise<Allocation[]> {
    return this.getListItems<Allocation>(SP_LISTS.allocations)
  }

  saveAllocations(allocations: Allocation[]): Promise<void> {
    return this.upsertListItems(SP_LISTS.allocations, allocations)
  }

  loadScenarios(): Promise<Scenario[]> {
    return this.getListItems<Scenario>(SP_LISTS.scenarios)
  }

  saveScenarios(scenarios: Scenario[]): Promise<void> {
    return this.upsertListItems(SP_LISTS.scenarios, scenarios)
  }

  loadLeaveEntries(): Promise<LeaveEntry[]> {
    return this.getListItems<LeaveEntry>(SP_LISTS.leaveEntries)
  }

  saveLeaveEntries(entries: LeaveEntry[]): Promise<void> {
    return this.upsertListItems(SP_LISTS.leaveEntries, entries)
  }
}
