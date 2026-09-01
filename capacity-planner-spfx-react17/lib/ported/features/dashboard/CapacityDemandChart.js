import * as React from 'react';
import { Bar, ComposedChart, Area, XAxis as _XAxis, YAxis as _YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from 'recharts';
import { formatMonth } from '../../utils/months';
var XAxis = _XAxis;
var YAxis = _YAxis;
function CustomTooltip(_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (!active || !(payload === null || payload === void 0 ? void 0 : payload.length))
        return null;
    var visiblePayload = payload.filter(function (p) { return p.name !== 'Overload' || p.value > 0; });
    return (React.createElement("div", { className: "rounded-xl px-4 py-3 text-sm", style: {
            background: 'var(--surface-2)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        } },
        React.createElement("div", { className: "text-xs mb-2", style: { color: 'var(--text-muted)' } }, label),
        visiblePayload.map(function (p) { return (React.createElement("div", { key: p.name, className: "flex items-center gap-2" },
            React.createElement("span", { className: "w-2 h-2 rounded-full", style: { background: p.color } }),
            React.createElement("span", { className: "text-xs", style: { color: 'var(--text-muted)' } }, p.name),
            React.createElement("span", { className: "font-semibold tabular ml-auto pl-4", style: { color: 'var(--text)' } },
                p.value,
                "h"))); })));
}
export function CapacityDemandChart(_a) {
    var data = _a.data, months = _a.months, _b = _a.height, height = _b === void 0 ? 260 : _b;
    var chartData = months.map(function (m, i) {
        var _a, _b, _c, _d, _e, _f;
        return ({
            month: formatMonth(m),
            Capacity: Math.round((_b = (_a = data[i]) === null || _a === void 0 ? void 0 : _a.capacityHours) !== null && _b !== void 0 ? _b : 0),
            Allocation: Math.round((_d = (_c = data[i]) === null || _c === void 0 ? void 0 : _c.allocatedHours) !== null && _d !== void 0 ? _d : 0),
            Overload: Math.round((_f = (_e = data[i]) === null || _e === void 0 ? void 0 : _e.overloadHours) !== null && _f !== void 0 ? _f : 0),
        });
    });
    return (React.createElement("div", { style: { height: height } },
        React.createElement(ResponsiveContainer, { width: "100%", height: "100%" },
            React.createElement(ComposedChart, { data: chartData, margin: { top: 8, right: 12, left: -16, bottom: 0 } },
                React.createElement("defs", null,
                    React.createElement("linearGradient", { id: "gradCapacity", x1: "0", y1: "0", x2: "0", y2: "1" },
                        React.createElement("stop", { offset: "5%", stopColor: "#8b9eb7", stopOpacity: 0.16 }),
                        React.createElement("stop", { offset: "95%", stopColor: "#8b9eb7", stopOpacity: 0.02 })),
                    React.createElement("linearGradient", { id: "gradAllocation", x1: "0", y1: "0", x2: "0", y2: "1" },
                        React.createElement("stop", { offset: "5%", stopColor: "#ffbd66", stopOpacity: 0.5 }),
                        React.createElement("stop", { offset: "95%", stopColor: "#ffbd66", stopOpacity: 0.0 }))),
                React.createElement(CartesianGrid, { strokeDasharray: "1 0", vertical: false, stroke: "rgba(255,255,255,0.04)" }),
                React.createElement(XAxis, { dataKey: "month", tick: { fill: 'var(--text-faint)', fontSize: 11 }, axisLine: false, tickLine: false }),
                React.createElement(YAxis, { tick: { fill: 'var(--text-faint)', fontSize: 11 }, axisLine: false, tickLine: false, unit: "h" }),
                React.createElement(Tooltip, { content: React.createElement(CustomTooltip, null) }),
                React.createElement(Area, { type: "monotone", dataKey: "Capacity", stroke: "#8b9eb7", strokeWidth: 1.5, fill: "url(#gradCapacity)", strokeDasharray: "5 4", dot: false, activeDot: false }),
                React.createElement(Area, { type: "monotone", dataKey: "Allocation", stroke: "#ffbd66", strokeWidth: 2.5, fill: "url(#gradAllocation)", dot: { r: 2.5, fill: '#ffbd66', strokeWidth: 0 }, activeDot: { r: 5, fill: '#ffbd66', stroke: '#1b1006', strokeWidth: 1 } }),
                React.createElement(Bar, { dataKey: "Overload", fill: "#ef4444", opacity: 0.32, radius: [3, 3, 0, 0] })))));
}
//# sourceMappingURL=CapacityDemandChart.js.map