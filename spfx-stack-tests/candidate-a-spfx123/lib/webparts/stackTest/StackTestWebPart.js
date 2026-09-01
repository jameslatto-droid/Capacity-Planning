import { __extends, __read, __spreadArray } from "tslib";
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import StackTestApp from './components/StackTestApp';
var StackTestWebPart = /** @class */ (function (_super) {
    __extends(StackTestWebPart, _super);
    function StackTestWebPart() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StackTestWebPart.prototype.render = function () {
        var _a, _b;
        var LOG = function (msg) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return console.log.apply(console, __spreadArray(["[CapacityPlannerStackTest] ".concat(msg)], __read(args), false));
        };
        try {
            LOG('WebPart.render() called — SPFx 1.23.1');
            var element = React.createElement(StackTestApp, { spfxVersion: '1.23.1' });
            ReactDom.render(element, this.domElement);
            LOG('ReactDom.render() succeeded');
        }
        catch (e) {
            var msg = e instanceof Error ? e.message : JSON.stringify(e);
            var stack = e instanceof Error ? e.stack : String(e);
            console.error('[CapacityPlannerStackTest] FATAL render() error:', e);
            this.domElement.innerHTML = "\n        <div style=\"padding:20px;background:#1a0000;color:#ff9999;font-family:monospace;border-radius:8px\">\n          <h3 style=\"color:#ff6b6b;margin:0 0 12px\">[CapacityPlannerStackTest] FATAL: WebPart Render Error</h3>\n          <p><b>SPFx version:</b> 1.23.1</p>\n          <p><b>Type:</b> ".concat(typeof e, "</p>\n          <p><b>Constructor:</b> ").concat((_b = (_a = e === null || e === void 0 ? void 0 : e.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'unknown', "</p>\n          <p><b>Message:</b> ").concat(msg, "</p>\n          <pre style=\"overflow:auto;max-height:300px;background:#0f0000;padding:12px;border-radius:4px\">").concat(stack, "</pre>\n        </div>\n      ");
        }
    };
    StackTestWebPart.prototype.onDispose = function () {
        ReactDom.unmountComponentAtNode(this.domElement);
    };
    return StackTestWebPart;
}(BaseClientSideWebPart));
export default StackTestWebPart;
//# sourceMappingURL=StackTestWebPart.js.map