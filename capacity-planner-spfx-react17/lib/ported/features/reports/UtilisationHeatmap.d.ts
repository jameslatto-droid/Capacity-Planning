/// <reference types="react" />
interface HeatmapRow {
    id: string;
    label: string;
    values: {
        month: string;
        utilisation: number;
        allocatedHours: number;
    }[];
}
interface Props {
    rows: HeatmapRow[];
    months: string[];
}
export declare function UtilisationHeatmap({ rows, months }: Props): JSX.Element;
export {};
//# sourceMappingURL=UtilisationHeatmap.d.ts.map