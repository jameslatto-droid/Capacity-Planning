import { type ReactNode } from 'react';
import type { Resource, Allocation, CapacityAssumptions, LeaveEntry } from '../../types';
interface Props {
    resources: Resource[];
    allocations: Allocation[];
    leaveEntries: LeaveEntry[];
    assumptions: CapacityAssumptions;
    months: string[];
    leadingPanel?: ReactNode;
}
export declare function DisciplineCharts({ resources, allocations, leaveEntries, assumptions, months, leadingPanel }: Props): JSX.Element;
export {};
//# sourceMappingURL=DisciplineCharts.d.ts.map