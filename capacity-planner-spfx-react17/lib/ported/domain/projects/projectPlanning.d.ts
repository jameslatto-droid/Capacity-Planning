import type { Allocation, Project, ProjectType } from '../../types';
export declare function getProjectType(project: Project): ProjectType;
export declare function isProjectIncludedInResourceCalculations(project: Project | undefined): boolean;
export declare function filterResourceCalculationAllocations(allocations: Allocation[], projects: Project[]): Allocation[];
//# sourceMappingURL=projectPlanning.d.ts.map