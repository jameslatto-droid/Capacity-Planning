/// <reference types="react" />
interface Props {
    scenarioId: string;
    startMonth: string;
    endMonth: string;
    viewMode: 'person' | 'project' | 'role';
    valueMode?: 'hours' | 'percent';
}
export declare function AllocationMatrixByPerson({ scenarioId, startMonth, endMonth, viewMode, valueMode }: Props): JSX.Element;
export {};
//# sourceMappingURL=AllocationMatrixByPerson.d.ts.map