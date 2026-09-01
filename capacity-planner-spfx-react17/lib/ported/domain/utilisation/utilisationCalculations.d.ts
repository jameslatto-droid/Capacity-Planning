import type { Resource, Allocation, CapacityAssumptions, PersonUtilisationResult, RoleUtilisationResult, TeamUtilisationResult, UtilisationStatus, ResourceRole, LeaveEntry } from '../../types';
export declare function getUtilisationStatus(utilisation: number): UtilisationStatus;
export declare function calculatePersonUtilisation(resource: Resource, allocations: Allocation[], assumptions: CapacityAssumptions, month: string, leaveEntries?: LeaveEntry[]): PersonUtilisationResult;
export declare function calculatePersonUtilisationAllMonths(resource: Resource, allocations: Allocation[], assumptions: CapacityAssumptions, months: string[], leaveEntries?: LeaveEntry[]): PersonUtilisationResult[];
export declare function calculateRoleUtilisation(role: ResourceRole, resources: Resource[], allocations: Allocation[], assumptions: CapacityAssumptions, month: string, leaveEntries?: LeaveEntry[]): RoleUtilisationResult;
export declare function calculateTeamUtilisation(resources: Resource[], allocations: Allocation[], assumptions: CapacityAssumptions, month: string, leaveEntries?: LeaveEntry[]): TeamUtilisationResult;
export declare function identifyOverloads(personResults: PersonUtilisationResult[]): PersonUtilisationResult[];
export declare function calculateContractorRequirement(overloadHours: number, monthlyFteCapacity: number): {
    contractorHoursRequired: number;
    contractorFte: number;
};
//# sourceMappingURL=utilisationCalculations.d.ts.map