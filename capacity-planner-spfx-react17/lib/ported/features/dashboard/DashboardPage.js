import { __read } from "tslib";
import * as React from 'react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { addMonths, currentMonth, generateMonthRange } from '../../utils/months';
import { useDateRange } from '../../utils/useDateRange';
import { usePageBackground } from '../../utils/usePageBackground';
import { calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations';
import { CapacityDemandChart } from './CapacityDemandChart';
import { DisciplineCharts } from './DisciplineCharts';
import { PlanGantt } from './PlanGantt';
import { filterResourceCalculationAllocations } from '../../domain/projects/projectPlanning';
export function DashboardPage() {
    var _a;
    usePageBackground('1.png');
    var _b = usePlannerStore(), resources = _b.resources, projects = _b.projects, allocations = _b.allocations, scenarios = _b.scenarios, leaveEntries = _b.leaveEntries, activeScenarioId = _b.activeScenarioId;
    var _c = useDateRange(), startMonth = _c.startMonth, endMonth = _c.endMonth, setStartMonth = _c.setStartMonth, setEndMonth = _c.setEndMonth, minMonth = _c.minMonth, maxMonth = _c.maxMonth;
    var _d = __read(useState('both'), 2), brandFilter = _d[0], setBrandFilter = _d[1];
    var assumptions = (_a = scenarios.find(function (s) { return s.id === activeScenarioId; })) === null || _a === void 0 ? void 0 : _a.assumptions;
    var filteredMonths = useMemo(function () { return generateMonthRange(startMonth, endMonth); }, [startMonth, endMonth]);
    var filteredProjects = useMemo(function () { return projects.filter(function (p) { return brandFilter === 'both' || p.frontendBrand === brandFilter; }); }, [projects, brandFilter]);
    var filteredProjectIds = useMemo(function () { return new Set(filteredProjects.map(function (p) { return p.id; })); }, [filteredProjects]);
    var visibleAllocations = useMemo(function () { return allocations.filter(function (a) { return a.scenarioId === activeScenarioId && filteredProjectIds.has(a.projectId) && filteredMonths.includes(a.month); }); }, [allocations, activeScenarioId, filteredProjectIds, filteredMonths]);
    var portfolioAllocations = useMemo(function () { return allocations.filter(function (a) { return a.scenarioId === activeScenarioId && filteredProjectIds.has(a.projectId); }); }, [allocations, activeScenarioId, filteredProjectIds]);
    var calculationAllocations = useMemo(function () { return filterResourceCalculationAllocations(visibleAllocations, projects); }, [visibleAllocations, projects]);
    var portfolioRange = useMemo(function () {
        var portfolioProjects = filteredProjects.filter(function (p) { return p.status !== 'cancelled'; });
        var timelineStart = addMonths(currentMonth(), -2);
        if (!portfolioProjects.length)
            return { startMonth: timelineStart, endMonth: endMonth };
        return {
            startMonth: timelineStart,
            endMonth: portfolioProjects.reduce(function (max, p) { return p.endMonth > max ? p.endMonth : max; }, portfolioProjects[0].endMonth),
        };
    }, [filteredProjects, endMonth]);
    var activeResources = resources.filter(function (r) { return r.active; });
    if (!assumptions)
        return React.createElement(PageLayout, { title: "Dashboard" },
            React.createElement("div", { style: { color: 'var(--text-muted)' } }, "No data."));
    var teamByMonth = filteredMonths.map(function (m) {
        return calculateTeamUtilisation(activeResources, calculationAllocations, assumptions, m, leaveEntries);
    });
    var totalCapacity = teamByMonth.reduce(function (s, m) { return s + m.capacityHours; }, 0);
    var totalDemand = teamByMonth.reduce(function (s, m) { return s + m.allocatedHours; }, 0);
    var overallUtil = totalCapacity > 0 ? totalDemand / totalCapacity : 0;
    var overallChartPanel = (React.createElement("div", { style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
        } },
        React.createElement("div", { style: { height: 3, background: overallUtil > 1 ? '#ef4444' : overallUtil > 0.85 ? '#f59e0b' : '#10b981' } }),
        React.createElement("div", { style: {
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: 6,
                padding: '10px 14px 0',
            } }, "Overall Capacity"),
        React.createElement("div", { style: { height: 100, padding: '0 14px 8px' } },
            React.createElement(CapacityDemandChart, { data: teamByMonth, months: filteredMonths, height: 100 }))));
    return (React.createElement(PageLayout, { title: "Dashboard" },
        React.createElement("div", { className: "flex flex-wrap gap-3 mb-5" },
            React.createElement(Input, { label: "From", type: "month", value: startMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setStartMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Input, { label: "To", type: "month", value: endMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setEndMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Select, { label: "Brand", value: brandFilter, onChange: function (e) { return setBrandFilter(e.target.value); }, options: [{ value: 'both', label: 'Both brands' }, { value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }] })),
        React.createElement(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "mb-8" },
            React.createElement("div", { style: {
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10,
                } }, "Charts"),
            React.createElement(DisciplineCharts, { resources: activeResources, allocations: calculationAllocations, leaveEntries: leaveEntries, assumptions: assumptions, months: filteredMonths, leadingPanel: overallChartPanel })),
        React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.1, duration: 0.3 } },
            React.createElement("div", { style: {
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                    textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: 10,
                } }, "Portfolio"),
            React.createElement(PlanGantt, { projects: projects, allocations: portfolioAllocations, brandFilter: brandFilter, startMonth: portfolioRange.startMonth, endMonth: portfolioRange.endMonth }))));
}
//# sourceMappingURL=DashboardPage.js.map