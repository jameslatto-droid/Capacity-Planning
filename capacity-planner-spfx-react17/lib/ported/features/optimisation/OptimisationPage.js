import { __read } from "tslib";
import * as React from 'react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { StatCard } from '../../components/ui/StatCard';
import { formatHours, formatPercent, formatFte, utilisationGlow } from '../../utils/format';
import { formatMonth, generateMonthRange } from '../../utils/months';
import { useDateRange } from '../../utils/useDateRange';
import { usePageBackground } from '../../utils/usePageBackground';
import { calculatePersonUtilisation } from '../../domain/utilisation/utilisationCalculations';
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations';
import { findOverloadedPersonMonths, suggestSameRoleReallocations, calculateResidualOverload, calculateContractorFteRequirement, } from '../../domain/optimisation/optimisationRules';
import { ROLE_LABELS } from '../../types';
import { filterResourceCalculationAllocations } from '../../domain/projects/projectPlanning';
var ROW = { borderBottom: '1px solid var(--row-divider)' };
function plainUtilisationColor(utilisation) {
    if (utilisation > 1.15)
        return '#dc2626';
    if (utilisation > 1.0)
        return '#ea580c';
    return 'var(--text-muted)';
}
export function OptimisationPage() {
    var _a;
    usePageBackground('7.png');
    var _b = usePlannerStore(), resources = _b.resources, projects = _b.projects, allocations = _b.allocations, scenarios = _b.scenarios, activeScenarioId = _b.activeScenarioId, leaveEntries = _b.leaveEntries;
    var _c = useDateRange(), startMonth = _c.startMonth, endMonth = _c.endMonth, setStartMonth = _c.setStartMonth, setEndMonth = _c.setEndMonth, minMonth = _c.minMonth, maxMonth = _c.maxMonth;
    var _d = __read(useState('6'), 2), capacityLookAhead = _d[0], setCapacityLookAhead = _d[1];
    var assumptions = (_a = scenarios.find(function (s) { return s.id === activeScenarioId; })) === null || _a === void 0 ? void 0 : _a.assumptions;
    var filteredMonths = useMemo(function () { return generateMonthRange(startMonth, endMonth); }, [startMonth, endMonth]);
    var availableCapacityMonths = useMemo(function () { return capacityLookAhead === 'all' ? filteredMonths : filteredMonths.slice(0, Number(capacityLookAhead)); }, [capacityLookAhead, filteredMonths]);
    var visibleAllocations = useMemo(function () { return allocations.filter(function (a) { return a.scenarioId === activeScenarioId && filteredMonths.includes(a.month); }); }, [allocations, activeScenarioId, filteredMonths]);
    var scenarioAllocations = useMemo(function () { return filterResourceCalculationAllocations(visibleAllocations, projects); }, [visibleAllocations, projects]);
    var activeResources = resources.filter(function (r) { return r.active; });
    var allPersonResults = useMemo(function () {
        if (!assumptions)
            return [];
        return activeResources.flatMap(function (r) {
            return filteredMonths.map(function (m) { return calculatePersonUtilisation(r, scenarioAllocations, assumptions, m, leaveEntries); });
        });
    }, [activeResources, scenarioAllocations, assumptions, filteredMonths]);
    var overloads = useMemo(function () { return findOverloadedPersonMonths(allPersonResults); }, [allPersonResults]);
    var recommendations = useMemo(function () { return suggestSameRoleReallocations(overloads, activeResources, allPersonResults, scenarioAllocations); }, [overloads, activeResources, allPersonResults, scenarioAllocations]);
    var residualOverload = useMemo(function () { return calculateResidualOverload(overloads, recommendations); }, [overloads, recommendations]);
    var monthlyFteCapacity = assumptions
        ? calculateMonthlyProductiveCapacity({ id: '', displayName: '', role: 'other', employmentType: 'employee', contractHoursPerWeek: 40, workingDaysPerWeek: 5, fullTimeHoursPerWeek: 40, active: true }, assumptions)
        : 133;
    var contractorReqs = useMemo(function () { return calculateContractorFteRequirement(residualOverload, monthlyFteCapacity); }, [residualOverload, monthlyFteCapacity]);
    if (!assumptions)
        return React.createElement(PageLayout, { title: "Optimisation" },
            React.createElement("p", { style: { color: 'var(--text-faint)' } }, "No data."));
    return (React.createElement(PageLayout, { title: "Optimisation", subtitle: "Recommendations only \u2014 no changes are made automatically" },
        React.createElement("div", { className: "flex flex-wrap gap-4 mb-10" },
            React.createElement(Input, { label: "From", type: "month", value: startMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setStartMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Input, { label: "To", type: "month", value: endMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setEndMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Select, { label: "Capacity look-ahead", value: capacityLookAhead, onChange: function (e) { return setCapacityLookAhead(e.target.value); }, options: [
                    { value: '4', label: '4 months' },
                    { value: '6', label: '6 months' },
                    { value: '12', label: '12 months' },
                    { value: 'all', label: 'All selected' },
                ] })),
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8 mb-12" },
            React.createElement(StatCard, { label: "Person overloads", value: String(overloads.length), accent: overloads.length > 0 ? 'red' : 'emerald' }),
            React.createElement(StatCard, { label: "Total overload", value: formatHours(overloads.reduce(function (s, o) { return s + o.overloadHours; }, 0)), accent: overloads.length > 0 ? 'red' : 'emerald' }),
            React.createElement(StatCard, { label: "Residual after recs", value: formatHours(residualOverload), accent: residualOverload > 0 ? 'amber' : 'emerald' }),
            React.createElement(StatCard, { label: "Contractor FTE", value: contractorReqs[0] ? formatFte(contractorReqs[0].contractorFte) : '0.00', accent: residualOverload > 0 ? 'amber' : 'default' })),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12" },
            React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.15 } },
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-4", style: { color: 'var(--text-faint)' } }, "Person-Month Overloads"),
                overloads.length === 0 ? (React.createElement("p", { className: "text-sm text-emerald-500/60" }, "No overloads detected.")) : (React.createElement("table", { className: "w-full text-xs" },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { borderBottom: '1px solid var(--border)' } }, ['Person', 'Month', 'Overload', 'Util'].map(function (h, i) { return (React.createElement("th", { key: h, className: "pb-3 text-[10px] uppercase tracking-wider font-semibold ".concat(i === 0 ? 'text-left' : 'text-right'), style: { color: 'var(--text-faint)' } }, h)); }))),
                    React.createElement("tbody", null, overloads.map(function (o) {
                        var _a, _b;
                        var name = (_b = (_a = resources.find(function (r) { return r.id === o.resourceId; })) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : o.resourceId;
                        return (React.createElement("tr", { key: "".concat(o.resourceId, "-").concat(o.month), style: ROW },
                            React.createElement("td", { className: "py-2.5 font-medium", style: { color: 'var(--text)' } }, name),
                            React.createElement("td", { className: "py-2.5 text-right", style: { color: 'var(--text-muted)' } }, formatMonth(o.month)),
                            React.createElement("td", { className: "py-2.5 text-right font-bold tabular text-red-400", style: { textShadow: utilisationGlow(o.utilisation) } },
                                "+",
                                formatHours(o.overloadHours)),
                            React.createElement("td", { className: "py-2.5 text-right font-semibold tabular", style: { color: plainUtilisationColor(o.utilisation) } }, formatPercent(o.utilisation))));
                    }))))),
            React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 } },
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-4", style: { color: 'var(--text-faint)' } }, "Reallocation Recommendations"),
                recommendations.length === 0 ? (React.createElement("p", { className: "text-sm", style: { color: 'var(--text-faint)' } }, overloads.length === 0 ? 'No overloads to resolve.' : 'No compatible spare capacity found.')) : (React.createElement("div", { className: "space-y-2" }, recommendations.map(function (r, i) { return (React.createElement("div", { key: i, className: "rounded-xl px-4 py-3 text-xs", style: { background: 'var(--accent-light)', border: '1px solid rgba(124,58,237,0.2)' } },
                    React.createElement("div", { className: "font-semibold text-violet-300 mb-0.5 capitalize" }, r.type.replace(/-/g, ' ')),
                    React.createElement("div", { style: { color: 'var(--text-muted)' } }, r.description))); })))),
            React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.25 }, className: "lg:col-span-2" },
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-4", style: { color: 'var(--text-faint)' } }, "Available Capacity"),
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-xs" },
                        React.createElement("thead", null,
                            React.createElement("tr", { style: { borderBottom: '1px solid var(--border)' } },
                                React.createElement("th", { className: "text-left pb-3 text-[10px] uppercase tracking-wider font-semibold", style: { color: 'var(--text-faint)' } }, "Person"),
                                React.createElement("th", { className: "text-left pb-3 text-[10px] uppercase tracking-wider font-semibold", style: { color: 'var(--text-faint)' } }, "Role"),
                                availableCapacityMonths.map(function (m) { return (React.createElement("th", { key: m, className: "text-right pb-3 text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap px-2", style: { color: 'var(--text-faint)' } }, formatMonth(m))); }))),
                        React.createElement("tbody", null, activeResources.map(function (r) {
                            var monthData = availableCapacityMonths.map(function (m) {
                                var _a, _b;
                                var result = allPersonResults.find(function (pr) { return pr.resourceId === r.id && pr.month === m; });
                                return { month: m, available: Math.max(0, ((_a = result === null || result === void 0 ? void 0 : result.capacityHours) !== null && _a !== void 0 ? _a : 0) - ((_b = result === null || result === void 0 ? void 0 : result.allocatedHours) !== null && _b !== void 0 ? _b : 0)) };
                            });
                            if (!monthData.some(function (d) { return d.available > 0; }))
                                return null;
                            return (React.createElement("tr", { key: r.id, style: ROW },
                                React.createElement("td", { className: "py-2.5 font-medium whitespace-nowrap pr-4", style: { color: 'var(--text-muted)' } }, r.displayName),
                                React.createElement("td", { className: "py-2.5 whitespace-nowrap pr-4", style: { color: 'var(--text-faint)' } }, ROLE_LABELS[r.role]),
                                monthData.map(function (d) { return (React.createElement("td", { key: d.month, className: "py-2.5 text-right tabular text-emerald-400/70 font-medium px-2" }, d.available > 0 ? formatHours(d.available) : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014"))); })));
                        }))))),
            React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.3 } },
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider mb-4", style: { color: 'var(--text-faint)' } }, "Contractor Requirement"),
                contractorReqs.length === 0 ? (React.createElement("p", { className: "text-sm text-emerald-500/60" }, "No contractor capacity required.")) : (contractorReqs.map(function (req) { return (React.createElement("div", { key: req.month, className: "rounded-xl px-4 py-4 text-sm", style: { background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)' } },
                    React.createElement("div", { className: "text-xs mb-1", style: { color: 'var(--text-muted)' } }, "Residual after recommendations"),
                    React.createElement("div", { className: "text-2xl font-bold tabular text-amber-400" },
                        formatFte(req.contractorFte),
                        " FTE"),
                    React.createElement("div", { className: "text-xs mt-1", style: { color: 'var(--text-faint)' } },
                        formatHours(req.residualOverloadHours),
                        " / month"))); }))))));
}
//# sourceMappingURL=OptimisationPage.js.map