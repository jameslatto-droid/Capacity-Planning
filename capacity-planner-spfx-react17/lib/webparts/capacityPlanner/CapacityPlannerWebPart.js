import { __extends } from "tslib";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { PropertyPaneTextField } from '@microsoft/sp-property-pane';
import CapacityPlannerApp from './components/CapacityPlannerApp';
var CapacityPlannerWebPart = /** @class */ (function (_super) {
    __extends(CapacityPlannerWebPart, _super);
    function CapacityPlannerWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CapacityPlannerWebPart.prototype.render = function () {
        var appContext = {
            siteUrl: this.context.pageContext.web.absoluteUrl,
            currentUserDisplayName: this.context.pageContext.user.displayName,
            currentUserEmail: this.context.pageContext.user.email,
            environment: 'sharepoint',
            dataMode: 'mock',
        };
        var element = React.createElement(CapacityPlannerApp, {
            appContext: appContext,
        });
        ReactDom.render(element, this.domElement);
    };
    CapacityPlannerWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    Object.defineProperty(CapacityPlannerWebPart.prototype, "dataVersion", {
        get: function () {
            return Version.parse('1.0');
        },
        enumerable: false,
        configurable: true
    });
    CapacityPlannerWebPart.prototype.getPropertyPaneConfiguration = function () {
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
        };
    };
    return CapacityPlannerWebPart;
}(BaseClientSideWebPart));
export default CapacityPlannerWebPart;
//# sourceMappingURL=CapacityPlannerWebPart.js.map