import * as React from 'react'
import * as ReactDom from 'react-dom'
import { Version } from '@microsoft/sp-core-library'
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base'
import { IPropertyPaneConfiguration, PropertyPaneTextField } from '@microsoft/sp-property-pane'
import CapacityPlannerApp from './components/CapacityPlannerApp'
import type { IAppContext } from './components/CapacityPlannerApp'

export interface ICapacityPlannerWebPartProps {
  description: string
}

export default class CapacityPlannerWebPart extends BaseClientSideWebPart<ICapacityPlannerWebPartProps> {
  public render(): void {
    const appContext: IAppContext = {
      siteUrl: this.context.pageContext.web.absoluteUrl,
      currentUserDisplayName: this.context.pageContext.user.displayName,
      currentUserEmail: this.context.pageContext.user.email,
      environment: 'sharepoint',
      dataMode: 'mock',
    }

    const element: React.ReactElement = React.createElement(CapacityPlannerApp, {
      appContext,
    })

    ReactDom.render(element, this.domElement)
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement)
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0')
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Capacity Planner Settings' },
          groups: [
            {
              groupName: 'Settings',
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description',
                }),
              ],
            },
          ],
        },
      ],
    }
  }
}
