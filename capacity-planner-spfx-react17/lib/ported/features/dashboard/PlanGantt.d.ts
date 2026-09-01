/// <reference types="react" />
import type { Project, Allocation } from '../../types';
interface Props {
    projects: Project[];
    allocations: Allocation[];
    brandFilter: 'DCT' | 'PLK' | 'both';
    startMonth: string;
    endMonth: string;
}
export declare function PlanGantt({ projects, allocations, brandFilter, startMonth, endMonth }: Props): JSX.Element;
export {};
//# sourceMappingURL=PlanGantt.d.ts.map