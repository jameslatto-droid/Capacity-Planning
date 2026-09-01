import * as React from 'react';
import { motion } from 'framer-motion';
import { formatPercent, utilisationColor } from '../../utils/format';
import { formatMonth } from '../../utils/months';
function glowStyle(util) {
    if (util > 1.15)
        return '0 0 0 1px rgba(220,38,38,0.6)';
    if (util > 1.0)
        return '0 0 0 1px rgba(234,88,12,0.5)';
    return 'none';
}
function labelColor(util) {
    if (util <= 0)
        return 'transparent';
    // Use high-contrast white for all filled cells — the coloured bg handles meaning
    return 'rgba(255,255,255,0.92)';
}
export function UtilisationHeatmap(_a) {
    var rows = _a.rows, months = _a.months;
    if (!rows.length)
        return React.createElement("p", { className: "text-sm", style: { color: 'var(--text-faint)' } }, "No data.");
    var minWidth = 144 + months.length * 58;
    return (React.createElement("div", { className: "overflow-x-auto" },
        React.createElement("div", { style: { minWidth: minWidth } },
            React.createElement("div", { className: "flex mb-2 pl-36" }, months.map(function (m) { return (React.createElement("div", { key: m, className: "flex-1 text-center text-[10px] uppercase tracking-wider px-1", style: { color: 'var(--text-muted)' } }, formatMonth(m))); })),
            React.createElement("div", { className: "space-y-1" }, rows.map(function (row, ri) { return (React.createElement(motion.div, { key: row.id, initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 }, transition: { delay: ri * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }, className: "flex items-center" },
                React.createElement("div", { className: "w-36 shrink-0 pr-3 text-right text-xs font-medium truncate", style: { color: 'var(--text-muted)' }, title: row.label }, row.label),
                React.createElement("div", { className: "flex flex-1 rounded-lg overflow-hidden h-10", style: { gap: '1px' } }, row.values.map(function (v) {
                    var isEmpty = v.allocatedHours <= 0;
                    var bg = isEmpty ? 'var(--surface-2)' : utilisationColor(v.utilisation);
                    return (React.createElement("div", { key: v.month, className: "heatmap-cell flex-1 flex items-center justify-center", style: { background: bg, boxShadow: glowStyle(v.utilisation) }, title: "".concat(row.label, " \u00B7 ").concat(formatMonth(v.month), " \u00B7 ").concat(formatPercent(v.utilisation), " \u00B7 ").concat(Math.round(v.allocatedHours), "h") }, !isEmpty && (React.createElement("span", { className: "flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tabular select-none leading-none", style: {
                            color: labelColor(v.utilisation),
                            textShadow: v.utilisation > 1 ? '0 0 6px rgba(0,0,0,0.4)' : 'none',
                        } },
                        React.createElement("span", null, formatPercent(v.utilisation)),
                        React.createElement("span", { style: { opacity: 0.78 } },
                            Math.round(v.allocatedHours),
                            "h")))));
                })))); }))),
        React.createElement("div", { className: "flex items-center gap-5 mt-5 pl-36 flex-wrap" }, [
            { label: 'Low', color: utilisationColor(0.3) },
            { label: 'Healthy', color: utilisationColor(0.72) },
            { label: 'High', color: utilisationColor(0.92) },
            { label: 'Overload', color: utilisationColor(1.08) },
            { label: 'Critical', color: utilisationColor(1.2) },
        ].map(function (_a) {
            var label = _a.label, color = _a.color;
            return (React.createElement("div", { key: label, className: "flex items-center gap-1.5" },
                React.createElement("div", { className: "w-3 h-3 rounded-sm", style: { background: color } }),
                React.createElement("span", { className: "text-[10px] uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label)));
        }))));
}
//# sourceMappingURL=UtilisationHeatmap.js.map