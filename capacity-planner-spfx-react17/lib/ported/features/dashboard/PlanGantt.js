import * as React from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { generateMonthRange, currentMonth } from '../../utils/months';
import { formatHours } from '../../utils/format';
import { getProjectType, isProjectIncludedInResourceCalculations } from '../../domain/projects/projectPlanning';
var brandColor = {
    DCT: { bar: 'rgba(216,137,47,0.58)', border: '#d8892f', text: '#fff3dc' },
    PLK: { bar: 'rgba(91,155,213,0.55)', border: '#5b9bd5', text: '#dbeafe' },
};
var statusOpacity = {
    active: 1, planned: 0.75, opportunity: 0.45, 'on-hold': 0.3, complete: 0.25, cancelled: 0.15,
};
var statusDash = {
    opportunity: '4 3', planned: '0', active: '0', 'on-hold': '3 3',
};
export function PlanGantt(_a) {
    var projects = _a.projects, allocations = _a.allocations, brandFilter = _a.brandFilter, startMonth = _a.startMonth, endMonth = _a.endMonth;
    var months = useMemo(function () { return generateMonthRange(startMonth, endMonth); }, [startMonth, endMonth]);
    var now = currentMonth();
    var minWidth = Math.max(960, months.length * 58);
    var nowIdx = months.indexOf(now);
    var nowPct = nowIdx >= 0 ? ((nowIdx + 0.5) / months.length) * 100 : -1;
    // Year boundary positions
    var yearBoundaries = useMemo(function () {
        var seen = new Set();
        return months.reduce(function (acc, m, i) {
            var year = m.slice(0, 4);
            if (!seen.has(year)) {
                seen.add(year);
                acc.push({ label: year, pct: (i / months.length) * 100 });
            }
            return acc;
        }, []);
    }, [months]);
    var visibleProjects = useMemo(function () {
        return projects
            .filter(function (p) {
            if (brandFilter !== 'both' && p.frontendBrand !== brandFilter)
                return false;
            if (p.status === 'cancelled')
                return false;
            // overlaps with window
            return p.startMonth <= endMonth && p.endMonth >= startMonth;
        })
            .sort(function (a, b) { return a.startMonth.localeCompare(b.startMonth); });
    }, [projects, brandFilter, startMonth, endMonth]);
    function barPosition(p) {
        var clampedStart = p.startMonth < startMonth ? startMonth : p.startMonth;
        var clampedEnd = p.endMonth > endMonth ? endMonth : p.endMonth;
        var si = months.indexOf(clampedStart);
        var ei = months.indexOf(clampedEnd);
        if (si === -1 && ei === -1)
            return null;
        var sIdx = si >= 0 ? si : 0;
        var eIdx = ei >= 0 ? ei : months.length - 1;
        var left = (sIdx / months.length) * 100;
        var width = ((eIdx - sIdx + 1) / months.length) * 100;
        return { left: left, width: width };
    }
    if (!visibleProjects.length) {
        return (React.createElement("div", { className: "flex items-center justify-center h-32 text-sm", style: { color: 'var(--text-muted)' } }, "No projects in this range."));
    }
    var ROW_H = 34;
    return (React.createElement("div", { className: "overflow-x-auto select-none" },
        React.createElement("div", { style: { minWidth: minWidth } },
            React.createElement("div", { className: "relative", style: { marginLeft: 0 } },
                yearBoundaries.map(function (_a) {
                    var label = _a.label, pct = _a.pct;
                    return (React.createElement("div", { key: label, className: "absolute top-0 text-[10px] font-bold uppercase tracking-wider", style: { left: "".concat(pct, "%"), color: 'var(--text-faint)', transform: 'translateX(-2px)' } }, label));
                }),
                React.createElement("div", { className: "flex mt-4 mb-2" }, months.map(function (m) { return (React.createElement("div", { key: m, className: "flex-1 text-center text-[9px] uppercase tracking-wide", style: { color: 'var(--text-faint)' } }, new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' }))); }))),
            React.createElement("div", { className: "relative", style: { marginLeft: 0 } },
                React.createElement("div", { className: "absolute inset-0 flex pointer-events-none", style: { zIndex: 0 } }, months.map(function (m, i) { return (React.createElement("div", { key: m, className: "flex-1 border-l", style: { borderColor: i === 0 ? 'transparent' : 'var(--border)' } })); })),
                nowPct >= 0 && nowPct <= 100 && (React.createElement("div", { className: "absolute top-0 bottom-0 w-px z-10", style: {
                        left: "".concat(nowPct, "%"),
                        background: 'rgba(124,58,237,0.6)',
                        boxShadow: '0 0 6px rgba(124,58,237,0.4)',
                    } })),
                visibleProjects.map(function (p, i) {
                    var _a, _b, _c;
                    var pos = barPosition(p);
                    if (!pos)
                        return null;
                    var col = (_a = brandColor[p.frontendBrand]) !== null && _a !== void 0 ? _a : brandColor['DCT'];
                    var projectType = getProjectType(p);
                    var included = isProjectIncludedInResourceCalculations(p);
                    var opacity = !included ? 0.3 : projectType === 'opportunity' ? 0.55 : (_b = statusOpacity[p.status]) !== null && _b !== void 0 ? _b : 0.6;
                    var dash = projectType === 'opportunity' ? '4 3' : (_c = statusDash[p.status]) !== null && _c !== void 0 ? _c : '0';
                    var totalHours = allocations
                        .filter(function (a) { return a.projectId === p.id; })
                        .reduce(function (s, a) { return s + a.hours; }, 0);
                    var isNarrow = pos.width < 12;
                    return (React.createElement(motion.div, { key: p.id, initial: { opacity: 0, scaleX: 0.85 }, animate: { opacity: 1, scaleX: 1 }, transition: { delay: i * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }, className: "relative", style: { height: ROW_H, marginBottom: 3 } },
                        React.createElement("div", { className: "absolute top-1 rounded-md flex items-center overflow-hidden group cursor-default", style: {
                                left: "".concat(pos.left, "%"),
                                width: "".concat(pos.width, "%"),
                                height: ROW_H - 8,
                                background: col.bar,
                                opacity: opacity,
                                outline: "1.5px ".concat(dash !== '0' ? 'dashed' : 'solid', " ").concat(col.border),
                                outlineOffset: -1,
                                transition: 'opacity 0.12s',
                            }, onMouseEnter: function (e) { e.currentTarget.style.opacity = '1'; }, onMouseLeave: function (e) { e.currentTarget.style.opacity = String(opacity); }, title: "".concat(p.code, " ").concat(p.name, " \u00B7 ").concat(projectType, " \u00B7 ").concat(included ? 'included' : 'excluded', " \u00B7 ").concat(formatHours(totalHours)) },
                            React.createElement("span", { className: "px-2 text-[11px] font-semibold truncate whitespace-nowrap leading-none", style: { color: col.text } }, isNarrow ? p.code : "".concat(p.code, "  ").concat(p.name)))));
                }))),
        React.createElement("div", { className: "flex items-center gap-5 mt-4 pl-0 flex-wrap" },
            [
                { label: 'DCT', color: '#d8892f' },
                { label: 'PLK', color: '#5b9bd5' },
            ].map(function (_a) {
                var label = _a.label, color = _a.color;
                return (React.createElement("div", { key: label, className: "flex items-center gap-1.5" },
                    React.createElement("div", { className: "w-3 h-3 rounded-sm", style: { background: color, opacity: 0.6, outline: "1.5px solid ".concat(color) } }),
                    React.createElement("span", { className: "text-[10px] uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label)));
            }),
            [{ label: 'Planned' }, { label: 'Opportunity' }, { label: 'Excluded' }].map(function (_a) {
                var label = _a.label;
                return (React.createElement("div", { key: label, className: "flex items-center gap-1.5" },
                    React.createElement("div", { className: "w-3 h-3 rounded-sm border border-dashed", style: { borderColor: '#9b72c1', opacity: label === 'Excluded' ? 0.25 : 0.5 } }),
                    React.createElement("span", { className: "text-[10px] uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label)));
            }))));
}
//# sourceMappingURL=PlanGantt.js.map