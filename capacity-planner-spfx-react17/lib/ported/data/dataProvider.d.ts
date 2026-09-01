import type { PlannerRepository } from '../repositories/PlannerRepository';
export type DataMode = 'mock' | 'sharepoint';
export interface DataProviderConfig {
    mode: DataMode;
    siteUrl?: string;
}
export declare function getDataProvider(config?: DataProviderConfig): PlannerRepository;
export declare function resetDataProvider(): void;
//# sourceMappingURL=dataProvider.d.ts.map