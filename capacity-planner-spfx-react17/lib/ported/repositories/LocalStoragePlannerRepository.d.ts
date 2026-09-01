import type { PlannerRepository } from './PlannerRepository';
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types';
export declare class LocalStoragePlannerRepository implements PlannerRepository {
    constructor();
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
    resetToSeedData(): Promise<void>;
}
//# sourceMappingURL=LocalStoragePlannerRepository.d.ts.map