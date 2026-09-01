import { __assign, __read } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { usePageBackground } from '../../utils/usePageBackground';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatHours } from '../../utils/format';
import { formatMonth } from '../../utils/months';
import { ProjectForm } from './ProjectForm';
import { getProjectType, isProjectIncludedInResourceCalculations } from '../../domain/projects/projectPlanning';
import { formatAuditUser } from '../../utils/auth';
import { v4 as uuidv4 } from 'uuid';
var statusVariant = {
    active: 'emerald', planned: 'blue', opportunity: 'amber', 'on-hold': 'default', complete: 'default', cancelled: 'red',
};
export function ProjectsPage() {
    var navigate = useNavigate();
    usePageBackground('4.png');
    var _a = usePlannerStore(), projects = _a.projects, allocations = _a.allocations, resources = _a.resources, addProject = _a.addProject, updateProject = _a.updateProject, deleteProject = _a.deleteProject;
    var _b = __read(useState(null), 2), editingProject = _b[0], setEditingProject = _b[1];
    var _c = __read(useState(false), 2), showForm = _c[0], setShowForm = _c[1];
    var _d = __read(useState(null), 2), hoveredId = _d[0], setHoveredId = _d[1];
    function handleSave(data) {
        if (editingProject)
            updateProject(__assign(__assign({}, data), { id: editingProject.id }));
        else
            addProject(__assign(__assign({}, data), { id: uuidv4() }));
        setShowForm(false);
        setEditingProject(null);
    }
    function toggleProjectCalculations(project) {
        updateProject(__assign(__assign({}, project), { projectType: 'opportunity', includeInResourceCalculations: !isProjectIncludedInResourceCalculations(project) }));
    }
    return (React.createElement(PageLayout, { title: "Projects", subtitle: "".concat(projects.filter(function (p) { return p.status === 'active'; }).length, " active"), actions: React.createElement(Button, { variant: "primary", onClick: function () { setEditingProject(null); setShowForm(true); } }, "+ Add project") },
        showForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { background: 'rgba(0,0,0,0.5)' } },
            React.createElement(motion.div, { initial: { opacity: 0, scale: 0.97, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] }, className: "w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh]", style: { background: 'var(--surface)', border: '1px solid var(--border-s)' } },
                React.createElement("h2", { className: "text-base font-semibold mb-5", style: { color: 'var(--text)' } }, editingProject ? 'Edit Project' : 'Add Project'),
                React.createElement(ProjectForm, { initial: editingProject !== null && editingProject !== void 0 ? editingProject : undefined, resources: resources, onSave: handleSave, onCancel: function () { setShowForm(false); setEditingProject(null); } })))),
        projects.length === 0 && (React.createElement("div", { className: "flex flex-col items-center justify-center py-20 gap-3" },
            React.createElement("div", { style: { fontSize: 36, opacity: 0.2 } }, "\u25C8"),
            React.createElement("div", { style: { fontSize: 13, color: 'var(--text-faint)' } }, "No projects yet \u2014 add your first project above"))),
        projects.length > 0 && (React.createElement("div", { className: "overflow-x-auto" },
            React.createElement("table", { className: "w-full min-w-[920px] text-sm" },
                React.createElement("thead", null,
                    React.createElement("tr", { style: { borderBottom: '1px solid var(--border-s)' } }, ['Code', 'Project', 'Type', 'Brand', 'Status', 'Period', 'Hours', ''].map(function (h, i) { return (React.createElement("th", { key: h + i, className: "pb-2.5 text-[11px] uppercase tracking-wider font-semibold ".concat(i <= 1 ? 'text-left' : i < 7 ? 'text-right' : ''), style: { color: 'var(--text-faint)' } }, h)); }))),
                React.createElement("tbody", null, projects.map(function (p, i) {
                    var _a;
                    var totalHours = allocations.filter(function (a) { return a.projectId === p.id; }).reduce(function (s, a) { return s + a.hours; }, 0);
                    var pm = resources.find(function (r) { return r.id === p.projectManager; });
                    var projectType = getProjectType(p);
                    var isIncluded = isProjectIncludedInResourceCalculations(p);
                    var latestAllocation = allocations
                        .filter(function (a) { return a.projectId === p.id && a.lastModifiedAt; })
                        .sort(function (a, b) { var _a, _b; return ((_a = b.lastModifiedAt) !== null && _a !== void 0 ? _a : '').localeCompare((_b = a.lastModifiedAt) !== null && _b !== void 0 ? _b : ''); })[0];
                    var lastSaved = latestAllocation === null || latestAllocation === void 0 ? void 0 : latestAllocation.lastModifiedAt;
                    var lastSavedBy = formatAuditUser(latestAllocation === null || latestAllocation === void 0 ? void 0 : latestAllocation.lastModifiedBy);
                    var isHovered = hoveredId === p.id;
                    return (React.createElement(motion.tr, { key: p.id, initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.03, duration: 0.28, ease: [0.22, 1, 0.36, 1] }, style: {
                            borderBottom: '1px solid var(--row-divider)',
                            background: isHovered ? 'var(--row-hover)' : 'transparent',
                            transition: 'background 0.1s ease',
                        }, onMouseEnter: function () { return setHoveredId(p.id); }, onMouseLeave: function () { return setHoveredId(null); } },
                        React.createElement("td", { className: "py-2.5 font-mono text-xs", style: { color: 'var(--text-muted)' } }, p.code),
                        React.createElement("td", { className: "py-2.5 font-medium", style: { color: 'var(--text)' } },
                            p.name,
                            (p.client || pm) && (React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: 'var(--text-muted)' } }, [p.client, pm && "PM: ".concat(pm.displayName)].filter(Boolean).join(' · '))),
                            lastSaved && (React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: 'var(--text-faint)' } },
                                "Allocation saved by ",
                                lastSavedBy,
                                " \u00B7 ",
                                new Date(lastSaved).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))),
                            p.lastModifiedAt && (React.createElement("div", { className: "text-[11px] mt-0.5", style: { color: 'var(--text-faint)' } },
                                "Project edited by ",
                                formatAuditUser(p.lastModifiedBy),
                                " \u00B7 ",
                                new Date(p.lastModifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })))),
                        React.createElement("td", { className: "py-2.5 text-right" },
                            React.createElement("div", { className: "inline-flex items-center gap-1.5" },
                                React.createElement(Badge, { variant: projectType === 'opportunity' ? 'amber' : 'emerald' }, projectType === 'opportunity' ? 'Opportunity' : 'Live'),
                                projectType === 'opportunity' && (React.createElement("button", { type: "button", onClick: function () { return toggleProjectCalculations(p); }, className: "rounded-full px-2 py-0.5 text-[11px] font-semibold transition-all", style: {
                                        color: isIncluded ? '#059669' : 'var(--text-muted)',
                                        background: isIncluded ? 'rgba(5,150,105,0.12)' : 'var(--surface-2)',
                                        border: "1px solid ".concat(isIncluded ? 'rgba(5,150,105,0.3)' : 'var(--border-s)'),
                                    }, title: isIncluded ? 'Included in manpower calculations' : 'Excluded from manpower calculations' }, isIncluded ? 'Included' : 'Excluded')))),
                        React.createElement("td", { className: "py-2.5 text-right" },
                            React.createElement(Badge, { variant: p.frontendBrand === 'DCT' ? 'violet' : 'blue' }, p.frontendBrand)),
                        React.createElement("td", { className: "py-2.5 text-right" },
                            React.createElement(Badge, { variant: (_a = statusVariant[p.status]) !== null && _a !== void 0 ? _a : 'default' }, p.status)),
                        React.createElement("td", { className: "py-2.5 text-right text-xs whitespace-nowrap tabular", style: { color: 'var(--text-muted)' } },
                            formatMonth(p.startMonth),
                            " \u2013 ",
                            formatMonth(p.endMonth)),
                        React.createElement("td", { className: "py-2.5 text-right font-semibold tabular", style: { color: projectType === 'opportunity' && !isIncluded ? 'var(--text-faint)' : 'var(--text)' } }, totalHours > 0 ? formatHours(totalHours) : React.createElement("span", { style: { color: 'var(--text-faint)' } }, "\u2014")),
                        React.createElement("td", { className: "py-2.5 text-right", style: { minWidth: 160 } },
                            React.createElement("div", { className: "flex gap-1.5 justify-end transition-opacity duration-150", style: { opacity: isHovered ? 1 : 0 } },
                                React.createElement(Button, { size: "sm", variant: "primary", onClick: function () { return navigate("/projects/".concat(p.id, "/allocations")); } }, "Allocate \u2192"),
                                React.createElement(Button, { size: "sm", variant: "ghost", onClick: function () { setEditingProject(p); setShowForm(true); } }, "Edit"),
                                React.createElement(Button, { size: "sm", variant: "danger", onClick: function () { if (confirm('Delete project?'))
                                        deleteProject(p.id); } }, "Del")))));
                })))))));
}
//# sourceMappingURL=ProjectsPage.js.map