import { __assign, __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useMemo } from 'react';
import { usePlannerStore } from '../../store/plannerStore';
import { generateMonthRange, formatMonth } from '../../utils/months';
import { calculateMonthlyCapacityWithLeave, getLeaveDaysInMonth } from '../../domain/capacity/leaveCalculations';
import { utilisationColor, utilisationTextColor } from '../../utils/format';
import { isOutsideContract } from '../../utils/contractDates';
import { ROLE_LABELS } from '../../types';
import { filterResourceCalculationAllocations, getProjectType, isProjectIncludedInResourceCalculations, } from '../../domain/projects/projectPlanning';
var ROW = { borderBottom: '1px solid var(--row-divider)' };
var HEAD = { borderBottom: '1px solid var(--border-s)' };
export function AllocationMatrixByPerson(_a) {
    var scenarioId = _a.scenarioId, startMonth = _a.startMonth, endMonth = _a.endMonth, viewMode = _a.viewMode, _b = _a.valueMode, valueMode = _b === void 0 ? 'hours' : _b;
    var isPct = valueMode === 'percent';
    var _c = usePlannerStore(), resources = _c.resources, projects = _c.projects, allocations = _c.allocations, scenarios = _c.scenarios, leaveEntries = _c.leaveEntries;
    var months = generateMonthRange(startMonth, endMonth);
    var scenario = scenarios.find(function (s) { return s.id === scenarioId; });
    var assumptions = scenario === null || scenario === void 0 ? void 0 : scenario.assumptions;
    var filteredAllocations = useMemo(function () { return allocations.filter(function (a) { return a.scenarioId === scenarioId && months.includes(a.month); }); }, [allocations, scenarioId, months]);
    var calculationAllocations = useMemo(function () { return filterResourceCalculationAllocations(filteredAllocations, projects); }, [filteredAllocations, projects]);
    if (!assumptions)
        return React.createElement("div", { style: { color: 'var(--text-faint)' } }, "No scenario found.");
    var thCls = 'text-right pb-2.5text-[11px] uppercase tracking-wider font-semibold whitespace-nowrap px-2';
    var thLeft = 'text-left pb-2.5text-[11px] uppercase tracking-wider font-semibold';
    var thStyle = { color: 'var(--text-faint)' };
    if (viewMode === 'person') {
        return (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "text-xs w-full" },
                React.createElement("thead", null,
                    React.createElement("tr", { style: HEAD },
                        React.createElement("th", { className: thLeft, style: thStyle }, "Person / Project"),
                        months.map(function (m) { return React.createElement("th", { key: m, className: thCls, style: thStyle }, formatMonth(m)); }))),
                React.createElement("tbody", null, resources.filter(function (r) { return r.active; }).map(function (r) {
                    var personAllocs = filteredAllocations.filter(function (a) { return a.resourceId === r.id; });
                    var personCalcAllocs = calculationAllocations.filter(function (a) { return a.resourceId === r.id; });
                    var projectIds = __spreadArray([], __read(new Set(personAllocs.map(function (a) { return a.projectId; }))), false);
                    var personLeave = leaveEntries.filter(function (e) { return e.resourceId === r.id; });
                    var hasLeaveInView = months.some(function (m) { return getLeaveDaysInMonth(r, m, personLeave) > 0; });
                    // Pre-compute capacity per month so project sub-rows can use it for % mode
                    var capByMonth = Object.fromEntries(months.map(function (m) { return [m, calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions)]; }));
                    return __spreadArray(__spreadArray([
                        // ── Capacity header row ──────────────────────────────────
                        React.createElement("tr", { key: "".concat(r.id, "-cap"), style: __assign(__assign({}, ROW), { background: 'rgba(124,58,237,0.06)' }) },
                            React.createElement("td", { className: "py-2 font-semibold", style: { color: 'var(--text)' } }, r.displayName),
                            months.map(function (m) {
                                var _a;
                                var capacity = (_a = capByMonth[m]) !== null && _a !== void 0 ? _a : 0;
                                var allocated = personCalcAllocs.filter(function (a) { return a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                                var util = capacity > 0 ? allocated / capacity : 0;
                                var outsideContract = allocated > 0 && isOutsideContract(r, m);
                                var label = isPct
                                    ? (allocated > 0 ? "".concat(Math.round(util * 100), "%") : '—')
                                    : (allocated > 0 ? "".concat(Math.round(allocated), "/").concat(Math.round(capacity), "h") : "\u2014/".concat(Math.round(capacity), "h"));
                                return (React.createElement("td", { key: m, className: "px-2 py-2.5 text-right" },
                                    React.createElement("span", { className: "tabular font-semibold text-xs px-1.5 py-0.5 rounded ".concat(utilisationTextColor(util)), style: {
                                            background: allocated > 0 ? utilisationColor(util) : 'transparent',
                                            outline: outsideContract ? '1.5px solid rgba(245,158,11,0.8)' : 'none',
                                            outlineOffset: 1,
                                        }, title: outsideContract ? 'Allocated outside contract period' : undefined },
                                        outsideContract && React.createElement("span", { style: { marginRight: 3, fontSize: 9 } }, "\u26A0"),
                                        label)));
                            }))
                    ], __read((hasLeaveInView ? [
                        React.createElement("tr", { key: "".concat(r.id, "-leave"), style: ROW },
                            React.createElement("td", { className: "py-1.5 pl-6 font-medium flex items-center gap-1.5", style: { color: '#d97706' } },
                                React.createElement("span", { style: { fontSize: 10 } }, "\u25F7"),
                                " Leave"),
                            months.map(function (m) {
                                var _a, _b;
                                var days = getLeaveDaysInMonth(r, m, personLeave);
                                // Pick dominant leave type for colour
                                var _c = __read(m.split('-').map(Number), 2), y = _c[0], mo = _c[1];
                                var ms2 = new Date(y, mo - 1, 1);
                                var me2 = new Date(y, mo, 0);
                                var monthEntries = personLeave.filter(function (e) {
                                    var s = new Date(e.startDate + 'T00:00:00');
                                    var end2 = new Date(e.endDate + 'T00:00:00');
                                    return s <= me2 && end2 >= ms2;
                                });
                                var type = (_b = (_a = monthEntries[0]) === null || _a === void 0 ? void 0 : _a.type) !== null && _b !== void 0 ? _b : 'annual';
                                var typeColor = {
                                    'annual': 'rgba(37,99,235,0.55)',
                                    'sick': 'rgba(217,119,6,0.6)',
                                    'public-holiday': 'rgba(124,58,237,0.55)',
                                    'unpaid': 'rgba(107,114,128,0.5)',
                                    'other': 'rgba(75,85,99,0.45)',
                                };
                                var typeText = {
                                    'annual': '#93c5fd',
                                    'sick': '#fde68a',
                                    'public-holiday': '#c4b5fd',
                                    'unpaid': '#d1d5db',
                                    'other': '#9ca3af',
                                };
                                return (React.createElement("td", { key: m, className: "px-2 py-1.5 text-right" }, days > 0 ? (React.createElement("span", { className: "tabular font-semibold text-[11px] px-1.5 py-0.5 rounded", style: { background: typeColor[type], color: typeText[type] }, title: monthEntries.map(function (e) { return "".concat(e.type, ": ").concat(e.startDate, " \u2013 ").concat(e.endDate); }).join('\n') },
                                    days,
                                    "d")) : (React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014"))));
                            }))
                    ] : [])), false), __read(projectIds.map(function (pid) {
                        var proj = projects.find(function (p) { return p.id === pid; });
                        var excluded = proj ? !isProjectIncludedInResourceCalculations(proj) : false;
                        return (React.createElement("tr", { key: "".concat(r.id, "-").concat(pid), style: ROW },
                            React.createElement("td", { className: "py-1 pl-6", style: { color: excluded ? 'var(--text-faint)' : 'var(--text-muted)' } }, proj === null || proj === void 0 ? void 0 :
                                proj.code,
                                " \u2014 ", proj === null || proj === void 0 ? void 0 :
                                proj.name,
                                excluded && (React.createElement("span", { className: "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", style: { background: 'var(--surface-2)', border: '1px solid var(--border-s)', color: 'var(--text-faint)' } }, "Excluded"))),
                            months.map(function (m) {
                                var _a;
                                var hrs = personAllocs.filter(function (a) { return a.projectId === pid && a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                                var cap = (_a = capByMonth[m]) !== null && _a !== void 0 ? _a : 1;
                                var display = hrs > 0
                                    ? (isPct ? "".concat(Math.round(hrs / cap * 100), "%") : "".concat(hrs, "h"))
                                    : null;
                                return (React.createElement("td", { key: m, className: "px-2 py-1 text-right tabular", style: { color: 'var(--text-muted)' } }, display !== null && display !== void 0 ? display : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014")));
                            })));
                    })), false);
                })))));
    }
    if (viewMode === 'project') {
        return (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "text-xs w-full" },
                React.createElement("thead", null,
                    React.createElement("tr", { style: HEAD },
                        React.createElement("th", { className: thLeft, style: thStyle }, "Project / Person"),
                        months.map(function (m) { return React.createElement("th", { key: m, className: thCls, style: thStyle }, formatMonth(m)); }))),
                React.createElement("tbody", null, projects.map(function (proj) {
                    var projAllocs = filteredAllocations.filter(function (a) { return a.projectId === proj.id; });
                    if (!projAllocs.length)
                        return null;
                    var resourceIds = __spreadArray([], __read(new Set(projAllocs.map(function (a) { return a.resourceId; }).filter(Boolean))), false);
                    var projectType = getProjectType(proj);
                    var included = isProjectIncludedInResourceCalculations(proj);
                    var projectColor = included ? '#34d399' : 'var(--text-faint)';
                    return __spreadArray([
                        React.createElement("tr", { key: "".concat(proj.id, "-total"), style: __assign(__assign({}, ROW), { background: 'rgba(16,185,129,0.04)' }) },
                            React.createElement("td", { className: "py-2.5 font-semibold", style: { color: projectColor } },
                                proj.code,
                                " \u2014 ",
                                proj.name,
                                projectType === 'opportunity' && (React.createElement("span", { className: "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold", style: {
                                        background: included ? 'rgba(5,150,105,0.12)' : 'var(--surface-2)',
                                        border: "1px solid ".concat(included ? 'rgba(5,150,105,0.3)' : 'var(--border-s)'),
                                        color: included ? '#059669' : 'var(--text-faint)',
                                    } }, included ? 'Opportunity included' : 'Opportunity excluded'))),
                            months.map(function (m) {
                                var hrs = projAllocs.filter(function (a) { return a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                                return React.createElement("td", { key: m, className: "px-2 py-2.5 text-right tabular font-semibold", style: { color: projectColor } }, hrs > 0 ? "".concat(hrs, "h") : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014"));
                            }))
                    ], __read(resourceIds.map(function (rid) {
                        var _a;
                        var res = resources.find(function (r) { return r.id === rid; });
                        return (React.createElement("tr", { key: "".concat(proj.id, "-").concat(rid), style: ROW },
                            React.createElement("td", { className: "py-1 pl-6", style: { color: 'var(--text-faint)' } }, (_a = res === null || res === void 0 ? void 0 : res.displayName) !== null && _a !== void 0 ? _a : rid),
                            months.map(function (m) {
                                var hrs = projAllocs.filter(function (a) { return a.resourceId === rid && a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                                return React.createElement("td", { key: m, className: "px-2 py-1 text-right tabular", style: { color: 'var(--text-muted)' } }, hrs > 0 ? "".concat(hrs, "h") : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014"));
                            })));
                    })), false);
                })))));
    }
    var activeResources = resources.filter(function (r) { return r.active; });
    var roles = ['project-management', 'process-engineering', 'mechanical-engineering', 'drafting', 'procurement', 'quality', 'technical-review', 'management', 'other'];
    return (React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("table", { className: "text-xs w-full" },
            React.createElement("thead", null,
                React.createElement("tr", { style: HEAD },
                    React.createElement("th", { className: thLeft, style: thStyle }, "Role"),
                    months.map(function (m) { return React.createElement("th", { key: m, className: thCls, style: thStyle }, formatMonth(m)); }))),
            React.createElement("tbody", null, roles.map(function (role) {
                var roleAllocs = calculationAllocations.filter(function (a) { return a.role === role; });
                var roleResources = activeResources.filter(function (r) { var _a; return r.role === role || ((_a = r.secondaryRoles) === null || _a === void 0 ? void 0 : _a.includes(role)); });
                if (!roleAllocs.length && !roleResources.length)
                    return null;
                return (React.createElement("tr", { key: role, style: ROW, className: "group" },
                    React.createElement("td", { className: "py-2.5 font-medium".concat(role === 'quality' ? ' text-violet-400' : ''), style: role === 'quality' ? undefined : { color: 'var(--text-muted)' } }, ROLE_LABELS[role]),
                    months.map(function (m) {
                        var totalCap = roleResources.reduce(function (s, r) { return s + calculateMonthlyCapacityWithLeave(r, m, leaveEntries, assumptions); }, 0);
                        var totalAlloc = roleAllocs.filter(function (a) { return a.month === m; }).reduce(function (s, a) { return s + a.hours; }, 0);
                        var util = totalCap > 0 ? totalAlloc / totalCap : 0;
                        var roleLabel = totalAlloc > 0
                            ? (isPct ? "".concat(Math.round(util * 100), "%") : "".concat(Math.round(totalAlloc), "h"))
                            : null;
                        return (React.createElement("td", { key: m, className: "px-2 py-2.5 text-right" }, roleLabel ? (React.createElement("span", { className: "tabular text-xs font-semibold px-1.5 py-0.5 rounded ".concat(utilisationTextColor(util)), style: { background: utilisationColor(util) } }, roleLabel)) : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014")));
                    })));
            })))));
}
//# sourceMappingURL=AllocationMatrixByPerson.js.map