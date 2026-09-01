"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_1 = require("react");
var zustand_1 = require("zustand");
var recharts_1 = require("recharts");
var framer_motion_1 = require("framer-motion");
// Cast recharts class components for TypeScript JSX compatibility (TS2786 guard)
var XAxis = recharts_1.XAxis;
var YAxis = recharts_1.YAxis;
var LOG = function (msg) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return console.log.apply(console, tslib_1.__spreadArray(["[CapacityPlannerStackTest] ".concat(msg)], tslib_1.__read(args), false));
};
var ErrorBoundary = /** @class */ (function (_super) {
    tslib_1.__extends(ErrorBoundary, _super);
    function ErrorBoundary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = { hasError: false, error: null, info: null };
        return _this;
    }
    ErrorBoundary.prototype.componentDidCatch = function (error, info) {
        LOG('ERROR CAUGHT IN BOUNDARY', { error: error, info: info });
        this.setState({ hasError: true, error: error, info: info });
    };
    ErrorBoundary.prototype.render = function () {
        var _a;
        var _b = this.state, hasError = _b.hasError, error = _b.error, info = _b.info;
        if (!hasError)
            return this.props.children;
        var isErr = error instanceof Error;
        var safeProp = function (o, k) {
            var _a;
            try {
                return String((_a = o === null || o === void 0 ? void 0 : o[k]) !== null && _a !== void 0 ? _a : 'n/a');
            }
            catch (_b) {
                return 'n/a';
            }
        };
        return (React.createElement("div", { style: { padding: 24, background: '#1a0000', color: '#ff9999', fontFamily: 'monospace', borderRadius: 8 } },
            React.createElement("h2", { style: { margin: '0 0 12px', color: '#ff6b6b' } }, "[CapacityPlannerStackTest] Error Boundary Triggered"),
            React.createElement("p", null,
                React.createElement("strong", null, "Type:"),
                " ",
                typeof error),
            React.createElement("p", null,
                React.createElement("strong", null, "Constructor:"),
                " ",
                safeProp(error === null || error === void 0 ? void 0 : error.constructor, 'name')),
            React.createElement("p", null,
                React.createElement("strong", null, "isError:"),
                " ",
                String(isErr)),
            React.createElement("p", null,
                React.createElement("strong", null, "Message:"),
                " ",
                isErr ? error.message : JSON.stringify(error)),
            React.createElement("details", { open: true },
                React.createElement("summary", { style: { cursor: 'pointer', color: '#ffbd66' } }, "Stack trace"),
                React.createElement("pre", { style: { overflow: 'auto', maxHeight: 300, background: '#0f0000', padding: 12, borderRadius: 4 } }, isErr ? error.stack : JSON.stringify(error, null, 2))),
            React.createElement("details", null,
                React.createElement("summary", { style: { cursor: 'pointer', color: '#ffbd66' } }, "Component stack"),
                React.createElement("pre", { style: { overflow: 'auto', maxHeight: 200, background: '#0f0000', padding: 12, borderRadius: 4 } }, (_a = info === null || info === void 0 ? void 0 : info.componentStack) !== null && _a !== void 0 ? _a : 'n/a'))));
    };
    return ErrorBoundary;
}(React.Component));
var useStore = (0, zustand_1.create)(function (set) { return ({
    activeTab: 'dashboard',
    resourceCount: 4,
    setTab: function (tab) { return set({ activeTab: tab }); },
    addResource: function () { return set(function (s) { return ({ resourceCount: Math.min(s.resourceCount + 1, 8) }); }); },
}); });
// ── Mock data ──────────────────────────────────────────────────────────────
var CHART_DATA = [
    { month: 'Jan', capacity: 160, allocated: 140 },
    { month: 'Feb', capacity: 160, allocated: 155 },
    { month: 'Mar', capacity: 160, allocated: 170 },
    { month: 'Apr', capacity: 160, allocated: 130 },
    { month: 'May', capacity: 160, allocated: 150 },
    { month: 'Jun', capacity: 160, allocated: 160 },
];
var RESOURCES = [
    { id: '1', name: 'Alice Smith', role: 'Engineer', util: 87 },
    { id: '2', name: 'Bob Jones', role: 'Designer', util: 92 },
    { id: '3', name: 'Carol White', role: 'Manager', util: 65 },
    { id: '4', name: 'Dave Brown', role: 'Engineer', util: 78 },
    { id: '5', name: 'Eve Davis', role: 'Analyst', util: 85 },
    { id: '6', name: 'Frank Wilson', role: 'Engineer', util: 55 },
    { id: '7', name: 'Grace Lee', role: 'Designer', util: 95 },
    { id: '8', name: 'Hank Taylor', role: 'Manager', util: 70 },
];
// ── Dashboard ──────────────────────────────────────────────────────────────
var DashboardPage = function () {
    (0, react_1.useEffect)(function () { LOG('DashboardPage mounted — recharts rendering'); }, []);
    return (React.createElement("div", null,
        React.createElement("h3", { style: { color: '#ffbd66', margin: '0 0 16px' } }, "Capacity vs Demand (6 months)"),
        React.createElement("div", { style: { height: 240 } },
            React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                React.createElement(recharts_1.BarChart, { data: CHART_DATA, margin: { top: 4, right: 8, left: -16, bottom: 0 } },
                    React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.06)" }),
                    React.createElement(XAxis, { dataKey: "month", tick: { fill: '#94a3b8', fontSize: 11 }, axisLine: false, tickLine: false }),
                    React.createElement(YAxis, { tick: { fill: '#94a3b8', fontSize: 11 }, axisLine: false, tickLine: false, unit: "h" }),
                    React.createElement(recharts_1.Tooltip, { contentStyle: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' } }),
                    React.createElement(recharts_1.Bar, { dataKey: "capacity", fill: "#334155", radius: [3, 3, 0, 0] }),
                    React.createElement(recharts_1.Bar, { dataKey: "allocated", fill: "#ffbd66", radius: [3, 3, 0, 0] })))),
        React.createElement("div", { style: { display: 'flex', gap: 12, marginTop: 16 } }, [
            { label: 'Total Capacity', value: '960h', color: '#334155' },
            { label: 'Allocated', value: '905h', color: '#ffbd66' },
            { label: 'Utilisation', value: '94%', color: '#22c55e' },
        ].map(function (k) { return (React.createElement("div", { key: k.label, style: { flex: 1, background: '#1e293b', borderRadius: 8, padding: '12px 16px', borderTop: "3px solid ".concat(k.color) } },
            React.createElement("div", { style: { fontSize: 11, color: '#64748b', marginBottom: 4 } }, k.label),
            React.createElement("div", { style: { fontSize: 22, fontWeight: 700, color: k.color } }, k.value))); }))));
};
// ── Resources ──────────────────────────────────────────────────────────────
var ResourcesPage = function () {
    var _a = useStore(), resourceCount = _a.resourceCount, addResource = _a.addResource;
    (0, react_1.useEffect)(function () { LOG('ResourcesPage mounted — framer-motion cards active'); }, []);
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 } },
            React.createElement("h3", { style: { color: '#ffbd66', margin: 0 } },
                "Team Members (",
                resourceCount,
                ")"),
            React.createElement(framer_motion_1.motion.button, { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 }, onClick: addResource, style: { background: '#ffbd66', color: '#000', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 } }, "+ Add Resource")),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 } }, RESOURCES.slice(0, resourceCount).map(function (r, i) { return (React.createElement(framer_motion_1.motion.div, { key: r.id, initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25, delay: i * 0.04 }, style: { background: '#1e293b', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.07)' } },
            React.createElement("div", { style: { fontWeight: 600, color: '#e2e8f0', marginBottom: 2 } }, r.name),
            React.createElement("div", { style: { color: '#94a3b8', fontSize: 12, marginBottom: 10 } }, r.role),
            React.createElement("div", { style: { background: '#0f172a', borderRadius: 4, height: 5 } },
                React.createElement("div", { style: { width: "".concat(r.util, "%"), background: r.util > 90 ? '#ef4444' : r.util > 80 ? '#f59e0b' : '#22c55e', height: '100%', borderRadius: 4, transition: 'width 0.4s' } })),
            React.createElement("div", { style: { color: '#64748b', fontSize: 11, marginTop: 4 } },
                r.util,
                "% utilised"))); }))));
};
// ── Planning ───────────────────────────────────────────────────────────────
var PlanningPage = function () {
    (0, react_1.useEffect)(function () { LOG('PlanningPage mounted — table rendered'); }, []);
    var _a = tslib_1.__read((0, react_1.useState)(null), 2), hoveredRow = _a[0], setHoveredRow = _a[1];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return (React.createElement("div", null,
        React.createElement("h3", { style: { color: '#ffbd66', margin: '0 0 16px' } }, "Allocation Matrix"),
        React.createElement("div", { style: { overflow: 'auto' } },
            React.createElement("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", { style: { padding: '8px 12px', textAlign: 'left', color: '#64748b', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' } }, "Resource"),
                        months.map(function (m) { return (React.createElement("th", { key: m, style: { padding: '8px 10px', textAlign: 'right', color: '#64748b', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' } }, m)); }))),
                React.createElement("tbody", null, RESOURCES.slice(0, 6).map(function (r) {
                    var isHov = hoveredRow === r.id;
                    return (React.createElement("tr", { key: r.id, onMouseEnter: function () { return setHoveredRow(r.id); }, onMouseLeave: function () { return setHoveredRow(null); }, style: { background: isHov ? '#1e293b' : 'transparent', transition: 'background 0.15s', cursor: 'default' } },
                        React.createElement("td", { style: { padding: '8px 12px', color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.04)' } }, r.name),
                        months.map(function (m) {
                            var h = Math.round(100 + Math.random() * 60);
                            return React.createElement("td", { key: m, style: { padding: '8px 10px', textAlign: 'right', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' } },
                                h,
                                "h");
                        })));
                }))))));
};
var StackTestApp = function (_a) {
    var spfxVersion = _a.spfxVersion;
    var _b = useStore(), activeTab = _b.activeTab, setTab = _b.setTab;
    (0, react_1.useEffect)(function () {
        LOG('===== Stack Test App Mounted =====');
        LOG('SPFx version:', spfxVersion);
        LOG('React version:', React.version);
        LOG('Library imports: zustand ✓  recharts ✓  framer-motion ✓');
        LOG('Tab state via zustand: ✓');
    }, []);
    var tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'resources', label: 'Resources' },
        { id: 'planning', label: 'Planning' },
    ];
    return (React.createElement(ErrorBoundary, null,
        React.createElement("div", { style: { fontFamily: 'Inter, -apple-system, system-ui, sans-serif', background: '#0f172a', minHeight: 440, color: '#e2e8f0', borderRadius: 12, overflow: 'hidden' } },
            React.createElement("div", { style: { background: '#1e293b', padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'stretch', height: 48 } },
                React.createElement("div", { style: { display: 'flex', alignItems: 'center', marginRight: 24, whiteSpace: 'nowrap' } },
                    React.createElement("span", { style: { fontWeight: 700, fontSize: 13, color: '#ffbd66' } }, "Capacity Planner"),
                    React.createElement("span", { style: { fontSize: 10, color: '#475569', background: '#0f172a', padding: '2px 7px', borderRadius: 4, marginLeft: 8 } },
                        "SPFx ",
                        spfxVersion,
                        " \u00B7 Stack Test")),
                React.createElement("nav", { style: { display: 'flex', alignItems: 'stretch' } }, tabs.map(function (t) {
                    var active = activeTab === t.id;
                    return (React.createElement("button", { key: t.id, onClick: function () { LOG('Tab changed to:', t.id); setTab(t.id); }, style: {
                            padding: '0 14px', border: 'none', background: 'transparent', cursor: 'pointer',
                            fontSize: 13, fontWeight: active ? 600 : 400,
                            color: active ? '#ffbd66' : '#94a3b8',
                            borderBottom: active ? '2px solid #ffbd66' : '2px solid transparent',
                            transition: 'color 0.12s',
                        } }, t.label));
                }))),
            React.createElement("div", { style: { padding: 20 } },
                React.createElement(framer_motion_1.AnimatePresence, { mode: "wait" },
                    React.createElement(framer_motion_1.motion.div, { key: activeTab, initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -8 }, transition: { duration: 0.18 } },
                        activeTab === 'dashboard' && React.createElement(DashboardPage, null),
                        activeTab === 'resources' && React.createElement(ResourcesPage, null),
                        activeTab === 'planning' && React.createElement(PlanningPage, null)))),
            React.createElement("div", { style: { padding: '8px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 10, color: '#334155', display: 'flex', gap: 16 } },
                React.createElement("span", null,
                    "React ",
                    React.version),
                React.createElement("span", null, "zustand 4.5.6"),
                React.createElement("span", null, "recharts 2.13.3"),
                React.createElement("span", null, "framer-motion 10.18.0"),
                React.createElement("span", null,
                    "SPFx ",
                    spfxVersion)))));
};
exports.default = StackTestApp;
//# sourceMappingURL=StackTestApp.js.map