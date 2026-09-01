import * as React from 'react';
import { useEffect } from 'react';
import { App } from '../../../ported/app/App';
import appCss from '../../../ported/styles/app.css';
var STYLE_ID = 'capacity-planner-app-styles';
var CapacityPlannerApp = function (_a) {
    var appContext = _a.appContext;
    useEffect(function () {
        if (!document.getElementById(STYLE_ID)) {
            var styleEl = document.createElement('style');
            styleEl.id = STYLE_ID;
            styleEl.textContent = appCss;
            document.head.appendChild(styleEl);
        }
        return function () {
            // Leave styles in place — removing them on unmount would break re-mounts
        };
    }, []);
    return (React.createElement("div", { style: { fontFamily: 'Inter, system-ui, -apple-system, sans-serif', height: '100%' } },
        React.createElement(App, { spfxContext: appContext })));
};
export default CapacityPlannerApp;
//# sourceMappingURL=CapacityPlannerApp.js.map