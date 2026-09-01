import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
export interface ICapacityPlannerWebPartProps {
    description: string;
}
export default class CapacityPlannerWebPart extends BaseClientSideWebPart<ICapacityPlannerWebPartProps> {
    render(): void;
    protected onDispose(): void;
    protected get dataVersion(): Version;
    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration;
}
//# sourceMappingURL=CapacityPlannerWebPart.d.ts.map