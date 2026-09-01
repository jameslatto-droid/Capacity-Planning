import * as React from 'react';
import { motion } from 'framer-motion';
var accentBar = {
    default: 'var(--border-s)',
    violet: '#7c3aed',
    emerald: '#059669',
    amber: '#d97706',
    red: '#dc2626',
};
var accentVal = {
    default: 'var(--text)',
    violet: 'var(--accent-text)',
    emerald: '#059669',
    amber: '#d97706',
    red: '#dc2626',
};
export function StatCard(_a) {
    var label = _a.label, value = _a.value, sub = _a.sub, _b = _a.accent, accent = _b === void 0 ? 'default' : _b;
    return (React.createElement(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }, className: "flex flex-col gap-1.5" },
        React.createElement("div", { className: "w-5 h-0.5 rounded-full", style: { background: accentBar[accent] } }),
        React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label),
        React.createElement("div", { className: "text-3xl font-bold tracking-tight tabular", style: { color: accentVal[accent] } }, value),
        sub && React.createElement("div", { className: "text-xs", style: { color: 'var(--text-muted)' } }, sub)));
}
//# sourceMappingURL=StatCard.js.map