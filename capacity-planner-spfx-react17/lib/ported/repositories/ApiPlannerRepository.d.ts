import type { PlannerRepository } from './PlannerRepository';
import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types';
export declare class ApiPlannerRepository implements PlannerRepository {
    private baseUrl;
    constructor(baseUrl: string);
    private get;
    private put;
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
//# sourceMappingURL=ApiPlannerRepository.d.ts.map