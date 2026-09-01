/// <reference types="react" />
import type { Resource, Project, Allocation, CapacityAssumptions, LeaveEntry } from '../../types';
interface Props {
    resources: Resource[];
    projects: Project[];
    allocations: Allocation[];
    assumptions: CapacityAssumptions;
    months: string[];
    leaveEntries: LeaveEntry[];
    startMonth: string;
    endMonth: string;
}
export declare function UnifiedTimeline({ resources, projects, allocations, assumptions, months, leaveEntries, startMonth, endMonth, }: Props): JSX.Element;
export {};
//# sourceMappingURL=UnifiedTimeline.d.ts.map