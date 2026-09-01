import * as React from 'react';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { calculatePersonUtilisation, calculateTeamUtilisation } from '../../domain/utilisation/utilisationCalculations';
import { formatPercent, utilisationColor } from '../../utils/format';
import { isOutsideContract } from '../../utils/contractDates';
import { currentMonth } from '../../utils/months';
var LABEL_W = 140;
var COL_MIN_W = 60;
var brandColor = {
    DCT: { bar: 'rgba(124,58,237,0.55)', border: '#7c3aed', text: '#ede9fe' },
    PLK: { bar: 'rgba(37,99,235,0.55)', border: '#2563eb', text: '#dbeafe' },
};
var statusOpacity = {
    active: 1, planned: 0.75, opportunity: 0.45, 'on-hold': 0.3, complete: 0.25, cancelled: 0.15,
};
function UtilCell(_a) {
    var util = _a.util, isNow = _a.isNow, _b = _a.isTeam, isTeam = _b === void 0 ? false : _b, _c = _a.warning, warning = _c === void 0 ? false : _c;
    var textColor = util <= 0 ? 'var(--text-faint)'
        : util < 0.6 ? '#93c5fd'
            : util < 0.85 ? '#6ee7b7'
                : util < 1.0 ? '#fcd34d'
                    : util < 1.15 ? '#fb923c'
                        : '#f87171';
    return (React.createElement("div", { title: warning ? 'Allocated outside contract period' : undefined, style: {
            background: utilisationColor(util),
            color: warning ? '#fbbf24' : textColor,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            fontSize: 10,
            fontWeight: isTeam ? 700 : 500,
            fontVariantNumeric: 'tabular-nums',
            boxShadow: isNow ? 'inset 0 0 0 1px rgba(124,58,237,0.5)' : 'none',
            outline: warning ? '1.5px dashed rgba(245,158,11,0.75)' : 'none',
            outlineOffset: -1,
        } },
        warning && React.createElement("span", { style: { fontSize: 8, lineHeight: 1 } }, "\u26A0"),
        util > 0 ? formatPercent(util) : '—'));
}
export function UnifiedTimeline(_a) {
    var resources = _a.resources, projects = _a.projects, allocations = _a.allocations, assumptions = _a.assumptions, months = _a.months, leaveEntries = _a.leaveEntries, startMonth = _a.startMonth, endMonth = _a.endMonth;
    var now = currentMonth();
    var nowIdx = months.indexOf(now);
    var nowPct = nowIdx >= 0 ? ((nowIdx + 0.5) / months.length) * 100 : -1;
    var teamData = useMemo(function () { return months.map(function (m) { return calculateTeamUtilisation(resources, allocations, assumptions, m, leaveEntries); }); }, [resources, allocations, assumptions, months, leaveEntries]);
    var personData = useMemo(function () { return resources.map(function (r) { return ({
        resource: r,
        cells: months.map(function (m) { return calculatePersonUtilisation(r, allocations, assumptions, m, leaveEntries); }),
    }); }); }, [resources, allocations, assumptions, months, leaveEntries]);
    var visibleProjects = useMemo(function () { return projects
        .filter(function (p) { return p.status !== 'cancelled' && p.startMonth <= endMonth && p.endMonth >= startMonth; })
        .sort(function (a, b) { return a.startMonth.localeCompare(b.startMonth); }); }, [projects, startMonth, endMonth]);
    var gridCols = "".concat(LABEL_W, "px repeat(").concat(months.length, ", minmax(").concat(COL_MIN_W, "px, 1fr))");
    var minWidth = LABEL_W + months.length * COL_MIN_W;
    function barPos(p) {
        var cs = p.startMonth < startMonth ? startMonth : p.startMonth;
        var ce = p.endMonth > endMonth ? endMonth : p.endMonth;
        var si = months.indexOf(cs);
        var ei = months.indexOf(ce);
        var sIdx = si >= 0 ? si : 0;
        var eIdx = ei >= 0 ? ei : months.length - 1;
        return {
            left: (sIdx / months.length) * 100,
            width: ((eIdx - sIdx + 1) / months.length) * 100,
        };
    }
    return (React.createElement(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }, style: { overflowX: 'auto' } },
        React.createElement("div", { style: { minWidth: minWidth } },
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: gridCols, marginBottom: 3 } },
                React.createElement("div", null),
                " ",
                months.map(function (m, i) {
                    var prevYear = i > 0 ? months[i - 1].slice(0, 4) : null;
                    var showYear = i === 0 || (prevYear !== m.slice(0, 4));
                    var monthLabel = new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' });
                    return (React.createElement("div", { key: m, style: {
                            textAlign: 'center',
                            paddingBottom: 4,
                            fontSize: 9,
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: m === now ? 'var(--accent-text)' : 'var(--text-faint)',
                        } },
                        showYear && (React.createElement("div", { style: { fontSize: 8, opacity: 0.6, marginBottom: 1 } }, m.slice(0, 4))),
                        monthLabel));
                })),
            React.createElement("div", { style: { display: 'grid', gridTemplateColumns: gridCols, gap: '1px', marginBottom: 1 } },
                React.createElement("div", { style: {
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                        paddingRight: 10, fontSize: 10, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)',
                    } }, "Team"),
                teamData.map(function (data, i) { return (React.createElement(UtilCell, { key: months[i], util: data.utilisation, isNow: months[i] === now, isTeam: true })); })),
            React.createElement("div", { style: { height: 3 } }),
            personData.map(function (_a) {
                var resource = _a.resource, cells = _a.cells;
                return (React.createElement("div", { key: resource.id, style: { display: 'grid', gridTemplateColumns: gridCols, gap: '1px', marginBottom: 1 } },
                    React.createElement("div", { style: {
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                            paddingRight: 10, fontSize: 10, color: 'var(--text-muted)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        } }, resource.displayName),
                    cells.map(function (result, i) { return (React.createElement(UtilCell, { key: months[i], util: result.utilisation, isNow: months[i] === now, warning: result.allocatedHours > 0 && isOutsideContract(resource, months[i]) })); })));
            }),
            visibleProjects.length > 0 && (React.createElement(React.Fragment, null,
                React.createElement("div", { style: { height: 1, background: 'var(--border)', margin: '12px 0 8px' } }),
                React.createElement("div", { style: {
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: 'var(--text-faint)', marginBottom: 6,
                    } }, "Portfolio"),
                visibleProjects.map(function (p) {
                    var _a, _b;
                    var pos = barPos(p);
                    var col = (_a = brandColor[p.frontendBrand]) !== null && _a !== void 0 ? _a : brandColor.DCT;
                    var opacity = (_b = statusOpacity[p.status]) !== null && _b !== void 0 ? _b : 0.6;
                    return (React.createElement("div", { key: p.id, style: { display: 'flex', height: 26, marginBottom: 2 } },
                        React.createElement("div", { style: {
                                width: LABEL_W, flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                paddingRight: 12,
                            } },
                            React.createElement("span", { style: {
                                    fontSize: 10, fontWeight: 500, color: col.border,
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                }, title: "".concat(p.code, " ").concat(p.name) }, p.code)),
                        React.createElement("div", { style: { flex: 1, position: 'relative' } },
                            React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none' } }, months.map(function (_, mi) { return (React.createElement("div", { key: mi, style: {
                                    flex: 1,
                                    borderLeft: mi === 0 ? 'none' : '1px solid var(--border)',
                                } })); })),
                            nowPct >= 0 && (React.createElement("div", { style: {
                                    position: 'absolute', top: 0, bottom: 0, width: 1, zIndex: 5,
                                    left: "".concat(nowPct, "%"),
                                    background: 'rgba(124,58,237,0.5)',
                                    boxShadow: '0 0 4px rgba(124,58,237,0.3)',
                                } })),
                            React.createElement("div", { style: {
                                    position: 'absolute',
                                    left: "".concat(pos.left, "%"),
                                    width: "".concat(pos.width, "%"),
                                    top: 2, bottom: 2,
                                    background: col.bar,
                                    opacity: opacity,
                                    borderRadius: 6,
                                    outline: "1.5px solid ".concat(col.border),
                                    outlineOffset: -1,
                                    display: 'flex', alignItems: 'center', overflow: 'hidden',
                                    transition: 'opacity 0.12s',
                                }, onMouseEnter: function (e) { e.currentTarget.style.opacity = '1'; }, onMouseLeave: function (e) { e.currentTarget.style.opacity = String(opacity); }, title: "".concat(p.code, " ").concat(p.name, " \u00B7 ").concat(p.status) },
                                React.createElement("span", { style: {
                                        padding: '0 8px', fontSize: 10, fontWeight: 600,
                                        color: col.text,
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    } }, pos.width > 12 ? "".concat(p.code, "  ").concat(p.name) : p.code)))));
                }))))));
}
//# sourceMappingURL=UnifiedTimeline.js.map