import { __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis as _XAxis, YAxis as _YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ROLE_LABELS } from '../../types';
import { calculateMonthlyCapacityWithLeave } from '../../domain/capacity/leaveCalculations';
import { formatHours } from '../../utils/format';
var XAxis = _XAxis;
var YAxis = _YAxis;
// Primary disciplines only — secondary/overhead roles excluded from display
var PRIMARY_ROLES = [
    'project-management',
    'process-engineering',
    'mechanical-engineering',
    'drafting',
    'procurement',
    'quality',
];
function utilColor(avgUtil) {
    if (avgUtil > 1)
        return '#e45b4f';
    if (avgUtil > 0.85)
        return '#e8703a';
    return '#ffbd66';
}
function RolePanel(_a) {
    var _b, _c;
    var role = _a.role, data = _a.data, avgUtil = _a.avgUtil;
    var color = utilColor(avgUtil);
    var gradId = "dc-".concat(role);
    var maxVal = Math.max.apply(Math, __spreadArray(__spreadArray([], __read(data.map(function (d) { return Math.max(d.capacity, d.allocated); })), false), [1], false));
    var firstCap = Math.round((_c = (_b = data[0]) === null || _b === void 0 ? void 0 : _b.capacity) !== null && _c !== void 0 ? _c : 0);
    return (React.createElement("div", { style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
        } },
        React.createElement("div", { style: { height: 3, background: color } }),
        React.createElement("div", { style: {
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6,
                padding: '10px 14px 0',
            } }, ROLE_LABELS[role]),
        React.createElement("div", { style: { height: 100, padding: '0 14px 8px' } },
            React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
                React.createElement(AreaChart, { data: data, margin: { top: 4, right: 4, left: 0, bottom: 0 } },
                    React.createElement("defs", null,
                        React.createElement("linearGradient", { id: gradId, x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: color, stopOpacity: 0.5 }),
                            React.createElement("stop", { offset: "95%", stopColor: color, stopOpacity: 0.05 }))),
                    React.createElement(XAxis, { dataKey: "month", tick: { fill: 'var(--text-faint)', fontSize: 9 }, axisLine: false, tickLine: false }),
                    React.createElement(YAxis, { domain: [0, maxVal * 1.15], ticks: [firstCap], tick: { fill: 'rgba(148,163,184,0.45)', fontSize: 9 }, axisLine: false, tickLine: false, width: 28, tickFormatter: function (v) { return "".concat(v, "h"); } }),
                    React.createElement(Tooltip, { contentStyle: {
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                            borderRadius: 6,
                            fontSize: 11,
                            color: 'var(--text)',
                        }, formatter: function (v, name) { return [
                            formatHours(v),
                            name === 'capacity' ? 'Capacity' : 'Allocated',
                        ]; } }),
                    React.createElement(Area, { type: "monotone", dataKey: "capacity", stroke: "rgba(148,163,184,0.4)", strokeWidth: 1, strokeDasharray: "4 3", fill: "none", dot: false, isAnimationActive: false }),
                    React.createElement(Area, { type: "monotone", dataKey: "allocated", stroke: color, strokeWidth: 2, fill: "url(#".concat(gradId, ")"), dot: false, isAnimationActive: false }))))));
}
export function DisciplineCharts(_a) {
    var resources = _a.resources, allocations = _a.allocations, leaveEntries = _a.leaveEntries, assumptions = _a.assumptions, months = _a.months, leadingPanel = _a.leadingPanel;
    var activeResources = useMemo(function () { return resources.filter(function (r) { return r.active; }); }, [resources]);
    var roleData = useMemo(function () {
        return PRIMARY_ROLES.map(function (role) {
            // Capacity: only people whose PRIMARY role is this discipline
            var primaryResources = activeResources.filter(function (r) { return r.role === role; });
            var data = months.map(function (m) {
                var capacity = primaryResources.reduce(function (s, r) { return s + calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions); }, 0);
                var allocated = allocations
                    .filter(function (a) { return a.role === role && a.month === m; })
                    .reduce(function (s, a) { return s + a.hours; }, 0);
                return {
                    month: new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' }),
                    capacity: Math.round(capacity),
                    allocated: Math.round(allocated),
                };
            });
            var totalCap = data.reduce(function (s, d) { return s + d.capacity; }, 0);
            var totalAlloc = data.reduce(function (s, d) { return s + d.allocated; }, 0);
            var avgUtil = totalCap > 0 ? totalAlloc / totalCap : 0;
            var hasData = totalCap > 0 || totalAlloc > 0;
            return { role: role, data: data, avgUtil: avgUtil, hasData: hasData };
        }).filter(function (r) { return r.hasData; });
    }, [activeResources, allocations, assumptions, months, leaveEntries]);
    if (!roleData.length)
        return null;
    return (React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 } },
        leadingPanel,
        roleData.map(function (_a) {
            var role = _a.role, data = _a.data, avgUtil = _a.avgUtil;
            return (React.createElement(RolePanel, { key: role, role: role, data: data, avgUtil: avgUtil }));
        })));
}
//# sourceMappingURL=DisciplineCharts.js.map