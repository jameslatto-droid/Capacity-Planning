import { __extends, __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useState, useEffect } from 'react';
var LOG = function (msg) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return console.log.apply(console, __spreadArray(["[CapacityPlannerStackTest] ".concat(msg)], __read(args), false));
};
var ErrorBoundary = /** @class */ (function (_super) {
    __extends(ErrorBoundary, _super);
    function ErrorBoundary() {
        var _this = _super.apply(this, __spreadArray([], __read(arguments), false)) || this;
        _this.state = { hasError: false, error: null, info: null };
        return _this;
    }
    ErrorBoundary.prototype.componentDidCatch = function (error, info) {
        LOG('ERROR CAUGHT IN BOUNDARY', { error: error, info: info });
        this.setState({ hasError: true, error: error, info: info });
    };
    ErrorBoundary.prototype.render = function () {
        var _a, _b, _c;
        var _d = this.state, hasError = _d.hasError, error = _d.error, info = _d.info;
        if (!hasError)
            return this.props.children;
        var isErr = error instanceof Error;
        return (React.createElement("div", { style: { padding: 24, background: '#1a0000', color: '#ff9999', fontFamily: 'monospace', borderRadius: 8 } },
            React.createElement("h2", { style: { margin: '0 0 12px', color: '#ff6b6b' } },
                "Error Boundary \u2014 React ",
                React.version),
            React.createElement("p", null,
                React.createElement("b", null, "Type:"),
                " ",
                typeof error),
            React.createElement("p", null,
                React.createElement("b", null, "Constructor:"),
                " ",
                String((_b = (_a = error === null || error === void 0 ? void 0 : error.constructor) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'n/a')),
            React.createElement("p", null,
                React.createElement("b", null, "Message:"),
                " ",
                isErr ? error.message : JSON.stringify(error)),
            React.createElement("details", { open: true },
                React.createElement("summary", { style: { cursor: 'pointer', color: '#ffbd66' } }, "Stack"),
                React.createElement("pre", { style: { overflow: 'auto', maxHeight: 300, background: '#0f0000', padding: 12, borderRadius: 4 } }, isErr ? error.stack : JSON.stringify(error, null, 2))),
            React.createElement("details", null,
                React.createElement("summary", { style: { cursor: 'pointer', color: '#ffbd66' } }, "Component stack"),
                React.createElement("pre", { style: { overflow: 'auto', maxHeight: 200, background: '#0f0000', padding: 12, borderRadius: 4 } }, (_c = info === null || info === void 0 ? void 0 : info.componentStack) !== null && _c !== void 0 ? _c : 'n/a'))));
    };
    return ErrorBoundary;
}(React.Component));
var StackTestApp = function (_a) {
    var spfxVersion = _a.spfxVersion;
    var _b = __read(useState(0), 2), count = _b[0], setCount = _b[1];
    var _c = __read(useState('a'), 2), tab = _c[0], setTab = _c[1];
    useEffect(function () {
        LOG('===== Stack Test App Mounted (React-only build) =====');
        LOG('SPFx version:', spfxVersion);
        LOG('React version:', React.version);
        LOG('NO external libraries — pure React test');
    }, []);
    var tabs = [
        { id: 'a', label: 'Tab A' },
        { id: 'b', label: 'Tab B' },
        { id: 'c', label: 'Tab C' },
    ];
    return (React.createElement(ErrorBoundary, null,
        React.createElement("div", { style: { fontFamily: 'Inter, system-ui, sans-serif', background: '#0f172a', minHeight: 400, color: '#e2e8f0', borderRadius: 12, padding: 0, overflow: 'hidden' } },
            React.createElement("div", { style: { background: '#1e293b', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                React.createElement("span", { style: { fontWeight: 700, color: '#ffbd66', fontSize: 14 } },
                    "Stack Test \u2014 SPFx ",
                    spfxVersion),
                React.createElement("span", { style: { fontSize: 10, color: '#475569', background: '#0f172a', padding: '2px 8px', borderRadius: 4 } },
                    "React ",
                    React.version,
                    " \u00B7 pure React only")),
            React.createElement("div", { style: { display: 'flex', gap: 4, padding: '12px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' } }, tabs.map(function (t) { return (React.createElement("button", { key: t.id, onClick: function () { LOG('Tab:', t.id); setTab(t.id); }, style: {
                    padding: '6px 16px', border: 'none', borderRadius: '6px 6px 0 0', cursor: 'pointer',
                    background: tab === t.id ? '#334155' : 'transparent',
                    color: tab === t.id ? '#ffbd66' : '#64748b',
                    fontWeight: tab === t.id ? 600 : 400, fontSize: 13,
                } }, t.label)); })),
            React.createElement("div", { style: { padding: 20 } },
                tab === 'a' && (React.createElement("div", null,
                    React.createElement("h3", { style: { color: '#ffbd66', margin: '0 0 16px', fontSize: 15 } }, "React State Test"),
                    React.createElement("p", { style: { color: '#94a3b8', fontSize: 13 } },
                        "Counter: ",
                        React.createElement("b", { style: { color: '#e2e8f0' } }, count)),
                    React.createElement("div", { style: { display: 'flex', gap: 8, marginTop: 12 } },
                        React.createElement("button", { onClick: function () { LOG('Increment'); setCount(function (c) { return c + 1; }); }, style: { padding: '6px 14px', background: '#ffbd66', color: '#000', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 } }, "+1"),
                        React.createElement("button", { onClick: function () { LOG('Reset'); setCount(0); }, style: { padding: '6px 14px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 } }, "Reset")),
                    React.createElement("div", { style: { marginTop: 20, background: '#1e293b', borderRadius: 8, padding: 16 } },
                        React.createElement("p", { style: { fontSize: 12, color: '#64748b', margin: '0 0 8px' } }, "Environment"),
                        [
                            ['React version', React.version],
                            ['SPFx version', spfxVersion],
                            ['Libraries', 'pure React only (no zustand / recharts / framer-motion)'],
                            ['window.location', typeof window !== 'undefined' ? window.location.host : 'n/a'],
                        ].map(function (_a) {
                            var _b = __read(_a, 2), k = _b[0], v = _b[1];
                            return (React.createElement("div", { key: k, style: { display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 } },
                                React.createElement("span", { style: { color: '#64748b', width: 140, flexShrink: 0 } }, k),
                                React.createElement("span", { style: { color: '#e2e8f0' } }, v)));
                        })))),
                tab === 'b' && (React.createElement("div", null,
                    React.createElement("h3", { style: { color: '#ffbd66', margin: '0 0 16px', fontSize: 15 } }, "Conditional Render Test"),
                    Array.from({ length: 6 }, function (_, i) { return (React.createElement("div", { key: i, style: { padding: '8px 12px', margin: '4px 0', background: '#1e293b', borderRadius: 6, fontSize: 13, color: '#94a3b8' } },
                        "Row ",
                        i + 1,
                        " \u2014 clicks: ",
                        count)); }))),
                tab === 'c' && (React.createElement("div", null,
                    React.createElement("h3", { style: { color: '#ffbd66', margin: '0 0 16px', fontSize: 15 } }, "Lifecycle Test"),
                    React.createElement(LifecycleTest, null)))),
            React.createElement("div", { style: { padding: '6px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155' } },
                "SPFx ",
                spfxVersion,
                " \u00B7 React ",
                React.version,
                " \u00B7 no external libs"))));
};
var LifecycleTest = function () {
    var _a = __read(React.useState(false), 2), mounted = _a[0], setMounted = _a[1];
    useEffect(function () {
        LOG('LifecycleTest useEffect — mounted');
        setMounted(true);
        return function () { LOG('LifecycleTest cleanup'); };
    }, []);
    return (React.createElement("div", { style: { background: '#1e293b', borderRadius: 8, padding: 16 } },
        React.createElement("p", { style: { fontSize: 13, color: '#94a3b8' } },
            "useEffect fired: ",
            React.createElement("b", { style: { color: mounted ? '#22c55e' : '#ef4444' } }, mounted ? 'YES ✓' : 'NO')),
        React.createElement("p", { style: { fontSize: 12, color: '#64748b', marginTop: 8 } }, "If this shows YES, React hooks are fully functional in this SPFx environment.")));
};
export default StackTestApp;
//# sourceMappingURL=StackTestApp.js.map