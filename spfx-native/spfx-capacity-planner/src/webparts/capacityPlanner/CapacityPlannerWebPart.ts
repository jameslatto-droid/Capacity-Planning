import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IPropertyPaneConfiguration, PropertyPaneSlider, PropertyPaneTextField, PropertyPaneToggle } from '@microsoft/sp-property-pane';
import { spfi, SPFI, SPFx } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

import { CapacityPlannerApp } from './components/CapacityPlannerApp';
import { ICapacityPlannerAppProps } from './components/ICapacityPlannerAppProps';
import { SharePointResourcePlanningRepository } from './services/SharePointResourcePlanningRepository';
import { MockResourcePlanningRepository } from './services/MockResourcePlanningRepository';

export interface ICapacityPlannerWebPartProps {
  title: string;
  monthsToShow: number;
  useMockDataWhenListsMissing: boolean;
}

export default class CapacityPlannerWebPart extends BaseClientSideWebPart<ICapacityPlannerWebPartProps> {
  private _sp: SPFI;

  public async onInit(): Promise<void> {
    await super.onInit();
    this._sp = spfi().using(SPFx(this.context));
  }

  public render(): void {
    this.domElement.classList.add('capacityPlannerWebPartHost');
    this.domElement.style.width = '100%';
    this.domElement.style.maxWidth = '100%';
    this.domElement.style.boxSizing = 'border-box';
    this.domElement.style.overflowX = 'hidden';

    const sharePointRepository = new SharePointResourcePlanningRepository(this._sp, this.context.pageContext.web.absoluteUrl);
    const fallbackRepository = new MockResourcePlanningRepository();

    const element: React.ReactElement<ICapacityPlannerAppProps> = React.createElement(CapacityPlannerApp, {
      title: this.properties.title || 'Engineering Capacity Planner',
      monthsToShow: this.properties.monthsToShow || 12,
      repository: sharePointRepository,
      fallbackRepository,
      useMockDataWhenListsMissing: this.properties.useMockDataWhenListsMissing !== false,
      siteUrl: this.context.pageContext.web.absoluteUrl,
      currentUserDisplayName: this.context.pageContext.user.displayName,
      currentUserEmail: this.context.pageContext.user.email
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Capacity Planner settings' },
          groups: [
            {
              groupName: 'Display',
              groupFields: [
                PropertyPaneTextField('title', { label: 'Web part title' }),
                PropertyPaneSlider('monthsToShow', { label: 'Planning horizon in months', min: 3, max: 24, step: 1 }),
                PropertyPaneToggle('useMockDataWhenListsMissing', { label: 'Use mock data when SharePoint lists are missing', onText: 'Yes', offText: 'No' })
              ]
            }
          ]
        }
      ]
    };
  }
}
