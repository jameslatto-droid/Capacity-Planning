import * as React from 'react';
export interface IAppContext {
    siteUrl: string;
    currentUserDisplayName: string;
    currentUserEmail: string;
    environment: 'sharepoint';
    dataMode: 'mock' | 'sharepoint';
}
export interface ICapacityPlannerAppProps {
    appContext: IAppContext;
}
declare const CapacityPlannerApp: React.FC<ICapacityPlannerAppProps>;
export default CapacityPlannerApp;
//# sourceMappingURL=CapacityPlannerApp.d.ts.map