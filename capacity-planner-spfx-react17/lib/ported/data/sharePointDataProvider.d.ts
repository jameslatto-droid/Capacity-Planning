import type { PlannerRepository } from '../repositories/PlannerRepository';
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types';
export declare class SharePointPlannerRepository implements PlannerRepository {
    private siteUrl;
    constructor(siteUrl: string);
    private getListItems;
    private upsertListItems;
    loadResources(): Promise<Resource[]>;
    saveResources(resources: Resource[]): Promise<void>;
    loadProjects(): Promise<Project[]>;
    saveProjects(projects: Project[]): Promise<void>;
    loadAllocations(): Promise<Allocation[]>;
    saveAllocations(allocations: Allocation[]): Promise<void>;
    loadScenarios(): Promise<Scenario[]>;
    saveScenarios(scenarios: Scenario[]): Promise<void>;
    loadLeaveEntries(): Promise<LeaveEntry[]>;
    saveLeaveEntries(entries: LeaveEntry[]): Promise<void>;
}
//# sourceMappingURL=sharePointDataProvider.d.ts.map