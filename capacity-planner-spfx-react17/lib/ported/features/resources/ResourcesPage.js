import { __assign, __read } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { usePageBackground } from '../../utils/usePageBackground';
import { Badge } from '../../components/ui/Badge';
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations';
import { formatHours } from '../../utils/format';
import { fmtContractDate } from '../../utils/contractDates';
import { ROLE_LABELS } from '../../types';
import { ResourceForm } from './ResourceForm';
import { v4 as uuidv4 } from 'uuid';
var employmentBadge = {
    employee: 'blue',
    contractor: 'amber',
    freelancer: 'violet',
    placeholder: 'default',
};
export function ResourcesPage() {
    usePageBackground('2.png');
    var _a = usePlannerStore(), resources = _a.resources, scenarios = _a.scenarios, activeScenarioId = _a.activeScenarioId, addResource = _a.addResource, updateResource = _a.updateResource, deleteResource = _a.deleteResource;
    var _b = __read(useState(null), 2), editingResource = _b[0], setEditingResource = _b[1];
    var _c = __read(useState(false), 2), showForm = _c[0], setShowForm = _c[1];
    var _d = __read(useState(null), 2), hoveredId = _d[0], setHoveredId = _d[1];
    var scenario = scenarios.find(function (s) { return s.id === activeScenarioId; });
    var assumptions = scenario === null || scenario === void 0 ? void 0 : scenario.assumptions;
    function handleSave(data) {
        if (editingResource)
            updateResource(__assign(__assign({}, data), { id: editingResource.id }));
        else
            addResource(__assign(__assign({}, data), { id: uuidv4() }));
        setShowForm(false);
        setEditingResource(null);
    }
    return (React.createElement(PageLayout, { title: "Resources", subtitle: "".concat(resources.filter(function (r) { return r.active; }).length, " active"), actions: React.createElement(Button, { variant: "primary", onClick: function () { setEditingResource(null); setShowForm(true); } }, "+ Add resource") },
        showForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { background: 'rgba(0,0,0,0.7)' } },
            React.createElement(motion.div, { initial: { opacity: 0, scale: 0.96, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }, className: "w-full max-w-lg rounded-2xl p-6", style: { background: 'var(--surface)', border: '1px solid var(--border-s)' } },
                React.createElement("h2", { className: "text-base font-semibold mb-5", style: { color: 'var(--text)' } }, editingResource ? 'Edit Resource' : 'Add Resource'),
                React.createElement(ResourceForm, { initial: editingResource !== null && editingResource !== void 0 ? editingResource : undefined, onSave: handleSave, onCancel: function () { setShowForm(false); setEditingResource(null); } })))),
        resources.length === 0 && (React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-3" },
            React.createElement("div", { style: { fontSize: 36, opacity: 0.2 } }, "\u25CE"),
            React.createElement("div", { style: { fontSize: 13, color: 'var(--text-faint)' } }, "No team members yet \u2014 add your first resource above"))),
        resources.length > 0 && React.createElement("table", { className: "w-full text-sm" },
            React.createElement("thead", null,
                React.createElement("tr", { style: { borderBottom: '1px solid var(--border-s)' } }, ['Name', 'Role', 'Type', 'h/wk', 'Days', 'Monthly cap.', 'Active', ''].map(function (h, i) { return (React.createElement("th", { key: h + i, className: "pb-2.5 text-[11px] uppercase tracking-wider font-semibold ".concat(i === 0 ? 'text-left' : i < 7 ? 'text-right' : ''), style: { color: 'var(--text-faint)' } }, h)); }))),
            React.createElement("tbody", null, resources.map(function (r, i) {
                var _a;
                var capacity = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : null;
                var isHovered = hoveredId === r.id;
                return (React.createElement(motion.tr, { key: r.id, initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }, style: {
                        borderBottom: '1px solid var(--row-divider)',
                        background: isHovered ? 'var(--row-hover)' : 'transparent',
                        transition: 'background 0.1s ease',
                    }, onMouseEnter: function () { return setHoveredId(r.id); }, onMouseLeave: function () { return setHoveredId(null); } },
                    React.createElement("td", { className: "py-2.5 font-medium", style: { color: 'var(--text)' } },
                        r.displayName,
                        r.notes && React.createElement("span", { className: "ml-2 text-[11px]", style: { color: 'var(--text-faint)' } }, r.notes),
                        r.secondaryRoles && r.secondaryRoles.length > 0 && (React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: 'var(--text-faint)' } },
                            "+",
                            r.secondaryRoles.map(function (sr) { return ROLE_LABELS[sr]; }).join(', '))),
                        (r.contractStart || r.contractEnd) && (React.createElement("div", { className: "text-[11px] mt-0.5 font-mono", style: { color: 'var(--text-faint)' } },
                            "\u25F7 ",
                            r.contractStart ? fmtContractDate(r.contractStart) : '…',
                            " \u2192 ",
                            r.contractEnd ? fmtContractDate(r.contractEnd) : '…'))),
                    React.createElement("td", { className: "py-2.5 text-right", style: { color: 'var(--text-muted)' } }, ROLE_LABELS[r.role]),
                    React.createElement("td", { className: "py-2.5 text-right" },
                        React.createElement(Badge, { variant: (_a = employmentBadge[r.employmentType]) !== null && _a !== void 0 ? _a : 'default' }, r.employmentType)),
                    React.createElement("td", { className: "py-3 text-right tabular", style: { color: 'var(--text-muted)' } }, r.contractHoursPerWeek),
                    React.createElement("td", { className: "py-3 text-right tabular", style: { color: 'var(--text-muted)' } }, r.workingDaysPerWeek),
                    React.createElement("td", { className: "py-3 text-right font-semibold tabular", style: { color: 'var(--text)' } }, capacity !== null ? formatHours(capacity) : '—'),
                    React.createElement("td", { className: "py-2.5 text-right" },
                        React.createElement("span", { className: "inline-block w-2 h-2 rounded-full ".concat(r.active ? 'bg-emerald-500' : 'bg-slate-700'), style: r.active ? { boxShadow: '0 0 6px rgba(16,185,129,0.6)' } : {} })),
                    React.createElement("td", { className: "py-2.5 text-right" },
                        React.createElement("div", { className: "flex gap-1 justify-end transition-opacity duration-150", style: { opacity: isHovered ? 1 : 0 } },
                            React.createElement(Button, { size: "sm", variant: "ghost", onClick: function () { setEditingResource(r); setShowForm(true); } }, "Edit"),
                            React.createElement(Button, { size: "sm", variant: "danger", onClick: function () { if (confirm('Delete?'))
                                    deleteResource(r.id); } }, "Del")))));
            })))));
}
//# sourceMappingURL=ResourcesPage.js.map