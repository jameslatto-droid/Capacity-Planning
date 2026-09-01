import type { Resource, Allocation, CapacityAssumptions, PersonUtilisationResult, OptimisationRecommendation, ContractorRequirement, ResourceRole } from '../../types';
export declare function findOverloadedPersonMonths(results: PersonUtilisationResult[]): PersonUtilisationResult[];
export declare function findAvailableCapacity(resources: Resource[], results: PersonUtilisationResult[], month: string): Array<{
    resource: Resource;
    availableHours: number;
}>;
export declare function findCompatibleResources(overloadedResource: Resource, candidates: Resource[], requiredRole: ResourceRole): Resource[];
export declare function suggestSameRoleReallocations(overloads: PersonUtilisationResult[], allResources: Resource[], allResults: PersonUtilisationResult[], _allocations: Allocation[]): OptimisationRecommendation[];
export declare function suggestMonthSmoothing(overloads: PersonUtilisationResult[], allResults: PersonUtilisationResult[], allocations: Allocation[], _assumptions: CapacityAssumptions): OptimisationRecommendation[];
export declare function calculateResidualOverload(overloads: PersonUtilisationResult[], recommendations: OptimisationRecommendation[]): number;
export declare function calculateContractorFteRequirement(residualOverload: number, monthlyFteCapacity: number): ContractorRequirement[];
//# sourceMappingURL=optimisationRules.d.ts.map