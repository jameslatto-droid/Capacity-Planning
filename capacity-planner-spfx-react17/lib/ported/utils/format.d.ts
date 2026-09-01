export declare function formatHours(hours: number): string;
export declare function formatPercent(ratio: number): string;
export declare function formatFte(fte: number): string;
/** Returns a CSS background colour for a utilisation ratio — used in heatmaps */
export declare function utilisationColor(ratio: number): string;
/** Returns a text colour class for a utilisation ratio */
export declare function utilisationTextColor(ratio: number): string;
/** Glow shadow for overloaded states */
export declare function utilisationGlow(ratio: number): string;
export declare function utilisationBgColor(ratio: number): string;
export declare function statusLabel(ratio: number): string;
export declare function statAccent(ratio: number): 'red' | 'amber' | 'emerald' | 'default';
//# sourceMappingURL=format.d.ts.map