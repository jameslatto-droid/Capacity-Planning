import type { Resource, Project, Allocation, Scenario, LeaveEntry } from '../types';
interface PlannerState {
    resources: Resource[];
    projects: Project[];
    allocations: Allocation[];
    scenarios: Scenario[];
    leaveEntries: LeaveEntry[];
    activeScenarioId: string;
    isLoading: boolean;
    error: string | null;
    loadAll(): Promise<void>;
    setResources(resources: Resource[]): Promise<void>;
    addResource(resource: Resource): Promise<void>;
    updateResource(resource: Resource): Promise<void>;
    deleteResource(id: string): Promise<void>;
    setProjects(projects: Project[]): Promise<void>;
    addProject(project: Project): Promise<void>;
    updateProject(project: Project): Promise<void>;
    deleteProject(id: string): Promise<void>;
    setAllocations(allocations: Allocation[]): Promise<void>;
    addAllocation(allocation: Allocation): Promise<void>;
    updateAllocation(allocation: Allocation): Promise<void>;
    deleteAllocation(id: string): Promise<void>;
    setScenarios(scenarios: Scenario[]): Promise<void>;
    addScenario(scenario: Scenario): Promise<void>;
    updateScenario(scenario: Scenario): Promise<void>;
    deleteScenario(id: string): Promise<void>;
    setActiveScenario(id: string): void;
    setLeaveEntries(entries: LeaveEntry[]): Promise<void>;
    addLeaveEntry(entry: LeaveEntry): Promise<void>;
    updateLeaveEntry(entry: LeaveEntry): Promise<void>;
    deleteLeaveEntry(id: string): Promise<void>;
    resetToSeedData(): Promise<void>;
}
export declare const usePlannerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<PlannerState>>;
export {};
//# sourceMappingURL=plannerStore.d.ts.map