import { __assign, __read } from "tslib";
import * as React from 'react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis as _XAxis, YAxis as _YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, } from 'recharts';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { formatHours, formatPercent } from '../../utils/format';
import { formatMonth, generateMonthRange } from '../../utils/months';
import { useDateRange } from '../../utils/useDateRange';
import { usePageBackground } from '../../utils/usePageBackground';
import { calculatePersonUtilisation, calculateRoleUtilisation } from '../../domain/utilisation/utilisationCalculations';
import { exportCsv, exportJson } from '../../utils/export';
import { ROLE_LABELS, ALL_ROLES } from '../../types';
import { UtilisationHeatmap } from './UtilisationHeatmap';
import { filterResourceCalculationAllocations } from '../../domain/projects/projectPlanning';
var XAxis = _XAxis;
var YAxis = _YAxis;
// Shared dark tooltip
function DarkTooltip(_a) {
    var active = _a.active, payload = _a.payload, label = _a.label;
    if (!active || !(payload === null || payload === void 0 ? void 0 : payload.length))
        return null;
    return (React.createElement("div", { className: "rounded-xl px-4 py-3 text-xs", style: { background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' } },
        React.createElement("div", { className: "mb-2", style: { color: 'var(--text-muted)' } }, label),
        payload.map(function (p) { return (React.createElement("div", { key: p.name, className: "flex items-center gap-2" },
            React.createElement("span", { className: "w-2 h-2 rounded-full shrink-0", style: { background: p.color } }),
            React.createElement("span", { style: { color: 'var(--text-muted)' } }, p.name),
            React.createElement("span", { className: "font-semibold tabular ml-auto pl-4", style: { color: 'var(--text)' } },
                p.value,
                "h"))); })));
}
// Colour palette for stacked charts
var PERSON_COLORS = ['#e8703a', '#5b9bd5', '#6cb86a', '#d4a843', '#d4515e', '#4daacc', '#c47c3a', '#9b72c1', '#78b87a', '#e8a86b'];
var ROLE_COLORS = {
    'project-management': '#d8892f',
    'process-engineering': '#5b9bd5',
    'mechanical-engineering': '#6cb86a',
    'drafting': '#d4a843',
    'procurement': '#e8703a',
    'quality': '#9b72c1',
    'technical-review': '#4daacc',
    'management': '#d4515e',
    'other': '#8b9eb7',
};
export function ReportsPage() {
    var _a;
    usePageBackground('8.png');
    var _b = usePlannerStore(), resources = _b.resources, projects = _b.projects, allocations = _b.allocations, scenarios = _b.scenarios, activeScenarioId = _b.activeScenarioId, leaveEntries = _b.leaveEntries;
    var _c = useDateRange(), startMonth = _c.startMonth, endMonth = _c.endMonth, setStartMonth = _c.setStartMonth, setEndMonth = _c.setEndMonth, minMonth = _c.minMonth, maxMonth = _c.maxMonth;
    var _d = __read(useState('both'), 2), brandFilter = _d[0], setBrandFilter = _d[1];
    var _e = __read(useState('person'), 2), activeTab = _e[0], setActiveTab = _e[1];
    var assumptions = (_a = scenarios.find(function (s) { return s.id === activeScenarioId; })) === null || _a === void 0 ? void 0 : _a.assumptions;
    var filteredMonths = useMemo(function () { return generateMonthRange(startMonth, endMonth); }, [startMonth, endMonth]);
    var visibleAllocations = useMemo(function () {
        return allocations.filter(function (a) {
            if (a.scenarioId !== activeScenarioId)
                return false;
            if (!filteredMonths.includes(a.month))
                return false;
            if (brandFilter !== 'both') {
                var proj = projects.find(function (p) { return p.id === a.projectId; });
                if ((proj === null || proj === void 0 ? void 0 : proj.frontendBrand) !== brandFilter)
                    return false;
            }
            return true;
        });
    }, [allocations, activeScenarioId, filteredMonths, brandFilter, projects]);
    var filteredAllocations = useMemo(function () { return filterResourceCalculationAllocations(visibleAllocations, projects); }, [visibleAllocations, projects]);
    var activeResources = resources.filter(function (r) { return r.active; });
    // ── Person heatmap rows ──────────────────────────────────────────────
    var personHeatmapRows = useMemo(function () {
        if (!assumptions)
            return [];
        return activeResources.map(function (r) { return ({
            id: r.id,
            label: r.displayName,
            values: filteredMonths.map(function (m) {
                var res = calculatePersonUtilisation(r, filteredAllocations, assumptions, m, leaveEntries);
                return { month: m, utilisation: res.utilisation, allocatedHours: res.allocatedHours };
            }),
        }); });
    }, [activeResources, filteredAllocations, assumptions, filteredMonths]);
    // ── Role heatmap rows ────────────────────────────────────────────────
    var roleHeatmapRows = useMemo(function () {
        if (!assumptions)
            return [];
        return ALL_ROLES
            .map(function (role) { return ({
            id: role,
            label: ROLE_LABELS[role],
            values: filteredMonths.map(function (m) {
                var res = calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m, leaveEntries);
                return { month: m, utilisation: res.utilisation, allocatedHours: res.allocatedHours };
            }),
        }); })
            .filter(function (row) { return row.values.some(function (v) { return v.allocatedHours > 0; }); });
    }, [activeResources, filteredAllocations, assumptions, filteredMonths]);
    // ── Project demand stacked chart ─────────────────────────────────────
    var projectDemandData = useMemo(function () {
        var activeProjects = projects.filter(function (p) { return brandFilter === 'both' || p.frontendBrand === brandFilter; });
        return filteredMonths.map(function (m) {
            var row = { month: formatMonth(m) };
            activeProjects.forEach(function (p) {
                var hrs = filteredAllocations.filter(function (a) { return a.projectId === p.id && a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                if (hrs > 0)
                    row[p.code] = hrs;
            });
            return row;
        });
    }, [filteredMonths, filteredAllocations, projects, brandFilter]);
    var activeProjectsForChart = useMemo(function () {
        return projects.filter(function (p) {
            return (brandFilter === 'both' || p.frontendBrand === brandFilter) &&
                filteredAllocations.some(function (a) { return a.projectId === p.id; });
        });
    }, [projects, brandFilter, filteredAllocations]);
    // ── Brand split pie ──────────────────────────────────────────────────
    var brandSplitData = useMemo(function () {
        var dct = filteredAllocations.filter(function (a) { var _a; return ((_a = projects.find(function (p) { return p.id === a.projectId; })) === null || _a === void 0 ? void 0 : _a.frontendBrand) === 'DCT'; }).reduce(function (s, a) { return s + a.hours; }, 0);
        var plk = filteredAllocations.filter(function (a) { var _a; return ((_a = projects.find(function (p) { return p.id === a.projectId; })) === null || _a === void 0 ? void 0 : _a.frontendBrand) === 'PLK'; }).reduce(function (s, a) { return s + a.hours; }, 0);
        return [
            { name: 'DCT', value: Math.round(dct) },
            { name: 'PLK', value: Math.round(plk) },
        ].filter(function (d) { return d.value > 0; });
    }, [filteredAllocations, projects]);
    // ── Brand demand over time ────────────────────────────────────────────
    var brandTimeData = useMemo(function () {
        return filteredMonths.map(function (m) { return ({
            month: formatMonth(m),
            DCT: Math.round(filteredAllocations.filter(function (a) { var _a; return a.month === m && ((_a = projects.find(function (p) { return p.id === a.projectId; })) === null || _a === void 0 ? void 0 : _a.frontendBrand) === 'DCT'; }).reduce(function (s, a) { return s + a.hours; }, 0)),
            PLK: Math.round(filteredAllocations.filter(function (a) { var _a; return a.month === m && ((_a = projects.find(function (p) { return p.id === a.projectId; })) === null || _a === void 0 ? void 0 : _a.frontendBrand) === 'PLK'; }).reduce(function (s, a) { return s + a.hours; }, 0)),
        }); });
    }, [filteredMonths, filteredAllocations, projects]);
    // ── Overload data ─────────────────────────────────────────────────────
    var personResults = useMemo(function () {
        if (!assumptions)
            return [];
        return activeResources.flatMap(function (r) {
            return filteredMonths.map(function (m) { return ({ resource: r, result: calculatePersonUtilisation(r, filteredAllocations, assumptions, m, leaveEntries) }); });
        });
    }, [activeResources, filteredAllocations, assumptions, filteredMonths]);
    function exportPersonCsv() {
        exportCsv('person-utilisation.csv', personResults.map(function (_a) {
            var resource = _a.resource, result = _a.result;
            return ({
                Person: resource.displayName, Month: result.month, Capacity: Math.round(result.capacityHours),
                Allocated: Math.round(result.allocatedHours), Utilisation: formatPercent(result.utilisation),
                Overload: Math.round(result.overloadHours), Status: result.status,
            });
        }));
    }
    function exportAllJson() {
        exportJson('erp-export.json', { resources: resources, projects: projects, allocations: allocations, scenarios: scenarios });
    }
    var tabs = [
        { key: 'person', label: 'Person' },
        { key: 'role', label: 'Role' },
        { key: 'brand', label: 'Brand' },
        { key: 'project', label: 'Projects' },
        { key: 'overload', label: 'Overloads' },
    ];
    if (!assumptions)
        return React.createElement(PageLayout, { title: "Reports" },
            React.createElement("p", { style: { color: 'var(--text-faint)' } }, "No scenario."));
    var chartWrapper = function (children, title) { return (React.createElement(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, className: "rounded-2xl p-6", style: { background: 'var(--surface)', border: '1px solid var(--border)' } },
        React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-5", style: { color: 'var(--text-faint)' } }, title),
        children)); };
    var axisProps = { tick: { fill: 'var(--text-faint)', fontSize: 11 }, axisLine: false, tickLine: false };
    return (React.createElement(PageLayout, { title: "Reports", actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(Button, { size: "sm", variant: "secondary", onClick: exportPersonCsv }, "Person CSV"),
            React.createElement(Button, { size: "sm", variant: "primary", onClick: exportAllJson }, "Export JSON")) },
        React.createElement("div", { className: "flex flex-wrap gap-4 mb-8" },
            React.createElement(Input, { label: "From", type: "month", value: startMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setStartMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Input, { label: "To", type: "month", value: endMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setEndMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Select, { label: "Brand", value: brandFilter, onChange: function (e) { return setBrandFilter(e.target.value); }, options: [{ value: 'both', label: 'Both' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }] })),
        React.createElement("div", { className: "flex items-center gap-3 mb-8 flex-wrap" },
            React.createElement("div", { className: "flex gap-1 flex-wrap" }, tabs.map(function (t) { return (React.createElement(motion.button, { key: t.key, whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, onClick: function () { return setActiveTab(t.key); }, className: "px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150", style: {
                    background: activeTab === t.key ? 'var(--accent-light)' : 'var(--surface-2)',
                    border: activeTab === t.key ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                    color: activeTab === t.key ? 'var(--accent-text)' : 'var(--text-muted)',
                    boxShadow: activeTab === t.key ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
                } }, t.label)); }))),
        activeTab === 'person' && (React.createElement("div", { className: "space-y-8" }, chartWrapper(React.createElement(UtilisationHeatmap, { rows: personHeatmapRows, months: filteredMonths }), 'Person Utilisation'))),
        activeTab === 'role' && (React.createElement("div", { className: "space-y-8" },
            chartWrapper(React.createElement(UtilisationHeatmap, { rows: roleHeatmapRows, months: filteredMonths }), 'Role Utilisation'),
            chartWrapper(React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
                React.createElement(BarChart, { data: filteredMonths.map(function (m) {
                        var row = { month: formatMonth(m) };
                        ALL_ROLES.forEach(function (role) {
                            var res = calculateRoleUtilisation(role, activeResources, filteredAllocations, assumptions, m, leaveEntries);
                            if (res.allocatedHours > 0)
                                row[ROLE_LABELS[role]] = Math.round(res.allocatedHours);
                        });
                        return row;
                    }), margin: { top: 0, right: 0, left: -16, bottom: 0 } },
                    React.createElement(CartesianGrid, { strokeDasharray: "1 0", vertical: false, stroke: "rgba(255,255,255,0.04)" }),
                    React.createElement(XAxis, __assign({ dataKey: "month" }, axisProps)),
                    React.createElement(YAxis, __assign({}, axisProps, { unit: "h" })),
                    React.createElement(Tooltip, { content: React.createElement(DarkTooltip, null) }),
                    React.createElement(Legend, { wrapperStyle: { fontSize: 11, color: 'var(--text-muted)' } }),
                    ALL_ROLES.filter(function (role) { return filteredAllocations.some(function (a) { return a.role === role; }); }).map(function (role) { return (React.createElement(Bar, { key: role, dataKey: ROLE_LABELS[role], stackId: "a", fill: ROLE_COLORS[role], radius: [0, 0, 0, 0] })); }))), 'Role Demand (stacked hours)'))),
        activeTab === 'brand' && (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            chartWrapper(React.createElement("div", { className: "flex items-center justify-center" },
                React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
                    React.createElement(PieChart, null,
                        React.createElement(Pie, { data: brandSplitData, cx: "50%", cy: "50%", innerRadius: 70, outerRadius: 110, dataKey: "value", paddingAngle: 3 },
                            React.createElement(Cell, { fill: "#d8892f", style: { filter: 'drop-shadow(0 0 10px rgba(216,137,47,0.5))' } }),
                            React.createElement(Cell, { fill: "#5b9bd5", style: { filter: 'drop-shadow(0 0 10px rgba(91,155,213,0.4))' } })),
                        React.createElement(Tooltip, { formatter: function (v) { return "".concat(v, "h"); }, contentStyle: { background: 'var(--surface-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }, labelStyle: { color: 'var(--text-muted)' }, itemStyle: { color: 'var(--text)' } }),
                        React.createElement(Legend, { wrapperStyle: { fontSize: 12, color: 'var(--text-muted)' } })))), 'DCT vs PLK Split'),
            chartWrapper(React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
                React.createElement(AreaChart, { data: brandTimeData, margin: { top: 0, right: 0, left: -16, bottom: 0 } },
                    React.createElement("defs", null,
                        React.createElement("linearGradient", { id: "gDCT", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "#d8892f", stopOpacity: 0.4 }),
                            React.createElement("stop", { offset: "95%", stopColor: "#d8892f", stopOpacity: 0 })),
                        React.createElement("linearGradient", { id: "gPLK", x1: "0", y1: "0", x2: "0", y2: "1" },
                            React.createElement("stop", { offset: "5%", stopColor: "#5b9bd5", stopOpacity: 0.4 }),
                            React.createElement("stop", { offset: "95%", stopColor: "#5b9bd5", stopOpacity: 0 }))),
                    React.createElement(CartesianGrid, { strokeDasharray: "1 0", vertical: false, stroke: "rgba(255,255,255,0.04)" }),
                    React.createElement(XAxis, __assign({ dataKey: "month" }, axisProps)),
                    React.createElement(YAxis, __assign({}, axisProps, { unit: "h" })),
                    React.createElement(Tooltip, { content: React.createElement(DarkTooltip, null) }),
                    React.createElement(Legend, { wrapperStyle: { fontSize: 11, color: 'var(--text-muted)' } }),
                    React.createElement(Area, { type: "monotone", dataKey: "DCT", stroke: "#d8892f", strokeWidth: 2, fill: "url(#gDCT)" }),
                    React.createElement(Area, { type: "monotone", dataKey: "PLK", stroke: "#5b9bd5", strokeWidth: 2, fill: "url(#gPLK)" }))), 'Brand Demand Over Time'))),
        activeTab === 'project' && chartWrapper(React.createElement(ResponsiveContainer, { width: "100%", height: 320 },
            React.createElement(BarChart, { data: projectDemandData, margin: { top: 0, right: 0, left: -16, bottom: 0 } },
                React.createElement(CartesianGrid, { strokeDasharray: "1 0", vertical: false, stroke: "rgba(255,255,255,0.04)" }),
                React.createElement(XAxis, __assign({ dataKey: "month" }, axisProps)),
                React.createElement(YAxis, __assign({}, axisProps, { unit: "h" })),
                React.createElement(Tooltip, { content: React.createElement(DarkTooltip, null) }),
                React.createElement(Legend, { wrapperStyle: { fontSize: 11, color: 'var(--text-muted)' } }),
                activeProjectsForChart.map(function (p, i) { return (React.createElement(Bar, { key: p.id, dataKey: p.code, stackId: "a", fill: PERSON_COLORS[i % PERSON_COLORS.length] })); }))), 'Project Demand (stacked hours)'),
        activeTab === 'overload' && (React.createElement("div", { className: "space-y-8" },
            chartWrapper(React.createElement(UtilisationHeatmap, { rows: personHeatmapRows.filter(function (row) { return row.values.some(function (v) { return v.utilisation > 1; }); }), months: filteredMonths }), 'Overloaded People'),
            React.createElement("div", null,
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-4", style: { color: 'var(--text-faint)' } }, "All Overloads"),
                personResults.filter(function (_a) {
                    var result = _a.result;
                    return result.overloadHours > 0;
                }).length === 0 ? (React.createElement("p", { className: "text-sm text-emerald-500/60" }, "No overloads in selected period.")) : (React.createElement("table", { className: "w-full text-xs" },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { borderBottom: '1px solid var(--border)' } }, ['Person', 'Month', 'Capacity', 'Allocated', 'Overload', 'Util'].map(function (h, i) { return (React.createElement("th", { key: h, className: "pb-3 text-[10px] uppercase tracking-wider font-semibold ".concat(i === 0 ? 'text-left' : 'text-right'), style: { color: 'var(--text-faint)' } }, h)); }))),
                    React.createElement("tbody", null, personResults
                        .filter(function (_a) {
                        var result = _a.result;
                        return result.overloadHours > 0;
                    })
                        .sort(function (a, b) { return b.result.overloadHours - a.result.overloadHours; })
                        .map(function (_a) {
                        var resource = _a.resource, result = _a.result;
                        return (React.createElement("tr", { key: "".concat(resource.id, "-").concat(result.month), style: { borderBottom: '1px solid var(--row-divider)' } },
                            React.createElement("td", { className: "py-2.5 font-medium", style: { color: 'var(--text)' } }, resource.displayName),
                            React.createElement("td", { className: "py-2.5 text-right", style: { color: 'var(--text-muted)' } }, formatMonth(result.month)),
                            React.createElement("td", { className: "py-2.5 text-right tabular", style: { color: 'var(--text-faint)' } }, formatHours(result.capacityHours)),
                            React.createElement("td", { className: "py-2.5 text-right tabular", style: { color: 'var(--text-muted)' } }, formatHours(result.allocatedHours)),
                            React.createElement("td", { className: "py-2.5 text-right tabular font-bold text-red-400", style: { textShadow: '0 0 10px rgba(239,68,68,0.5)' } },
                                "+",
                                formatHours(result.overloadHours)),
                            React.createElement("td", { className: "py-2.5 text-right tabular font-semibold text-orange-400" }, formatPercent(result.utilisation))));
                    })))))))));
}
//# sourceMappingURL=ReportsPage.js.map