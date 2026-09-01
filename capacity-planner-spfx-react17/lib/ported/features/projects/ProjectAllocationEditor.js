import { __assign, __awaiter, __generator, __read, __spreadArray, __values } from "tslib";
import * as React from 'react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { usePlannerStore } from '../../store/plannerStore';
import { usePageBackground } from '../../utils/usePageBackground';
import { calculateMonthlyProductiveCapacity } from '../../domain/capacity/capacityCalculations';
import { generateMonthRange, formatMonth, currentMonth, addMonths } from '../../utils/months';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../utils/AuthContext';
import { formatAuditUser } from '../../utils/auth';
import { ROLE_LABELS } from '../../types';
function hoursFromPercent(percent, capacity) {
    return Math.round((percent / 100) * capacity);
}
function percentFromHours(hours, capacity) {
    if (capacity === 0)
        return 0;
    return Math.round((hours / capacity) * 100);
}
function cellBg(pct) {
    if (pct === 0)
        return 'transparent';
    if (pct < 40)
        return 'rgba(29,78,216,0.18)';
    if (pct < 70)
        return 'rgba(5,150,105,0.18)';
    if (pct < 90)
        return 'rgba(217,119,6,0.22)';
    if (pct <= 100)
        return 'rgba(234,88,12,0.22)';
    return 'rgba(220,38,38,0.28)';
}
function cellTextColor(pct) {
    if (pct === 0)
        return 'var(--text-faint)';
    if (pct > 100)
        return '#f87171';
    if (pct > 90)
        return '#fb923c';
    return 'var(--text)';
}
// Default: start one month before now, show 12 months forward, clamped to project bounds
function defaultRange(startMonth, endMonth) {
    var now = currentMonth();
    var oneBack = addMonths(now, -1);
    var rangeStart = oneBack >= startMonth ? oneBack : startMonth;
    var rangeEnd = addMonths(now, 11);
    var clamped = rangeEnd > endMonth ? endMonth : rangeEnd;
    return { rangeStart: rangeStart, rangeEnd: clamped };
}
// All months within project bounds, for the dropdowns
function projectMonthOptions(startMonth, endMonth) {
    return generateMonthRange(startMonth, endMonth).map(function (m) { return ({ value: m, label: formatMonth(m) }); });
}
export function ProjectAllocationEditor() {
    usePageBackground('5.png');
    var projectId = useParams().projectId;
    var navigate = useNavigate();
    var _a = useTheme(), toggle = _a.toggle, isDark = _a.isDark;
    var currentUser = useAuth().currentUser;
    var _b = usePlannerStore(), projects = _b.projects, resources = _b.resources, allocations = _b.allocations, scenarios = _b.scenarios, activeScenarioId = _b.activeScenarioId, setAllocations = _b.setAllocations, updateProject = _b.updateProject;
    var project = projects.find(function (p) { return p.id === projectId; });
    var scenario = scenarios.find(function (s) { return s.id === activeScenarioId; });
    var assumptions = scenario === null || scenario === void 0 ? void 0 : scenario.assumptions;
    var _c = project
        ? defaultRange(project.startMonth, project.endMonth)
        : { rangeStart: currentMonth(), rangeEnd: addMonths(currentMonth(), 11) }, defStart = _c.rangeStart, defEnd = _c.rangeEnd;
    var _d = __read(useState(defStart), 2), viewStart = _d[0], setViewStart = _d[1];
    var _e = __read(useState(defEnd), 2), viewEnd = _e[0], setViewEnd = _e[1];
    var months = useMemo(function () { return generateMonthRange(viewStart, viewEnd); }, [viewStart, viewEnd]);
    var existingAllocations = useMemo(function () { return allocations.filter(function (a) { return a.projectId === projectId && a.scenarioId === activeScenarioId; }); }, [allocations, projectId, activeScenarioId]);
    // Assigned resource IDs — derived from existing allocations
    var _f = __read(useState([]), 2), assignedResourceIds = _f[0], setAssignedResourceIds = _f[1];
    var _g = __read(useState({}), 2), matrix = _g[0], setMatrix = _g[1];
    var _h = __read(useState(false), 2), initialized = _h[0], setInitialized = _h[1];
    // Initialize once assumptions + allocations are available
    useEffect(function () {
        var e_1, _a;
        if (initialized || !assumptions)
            return;
        var ids = __spreadArray([], __read(new Set(existingAllocations.map(function (a) { return a.resourceId; }).filter(Boolean))), false);
        var m = {};
        var _loop_1 = function (alloc) {
            if (!alloc.resourceId)
                return "continue";
            var res = resources.find(function (r) { return r.id === alloc.resourceId; });
            if (!res)
                return "continue";
            var cap = calculateMonthlyProductiveCapacity(res, assumptions);
            if (!m[alloc.resourceId])
                m[alloc.resourceId] = {};
            m[alloc.resourceId][alloc.month] = percentFromHours(alloc.hours, cap);
        };
        try {
            for (var existingAllocations_1 = __values(existingAllocations), existingAllocations_1_1 = existingAllocations_1.next(); !existingAllocations_1_1.done; existingAllocations_1_1 = existingAllocations_1.next()) {
                var alloc = existingAllocations_1_1.value;
                _loop_1(alloc);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (existingAllocations_1_1 && !existingAllocations_1_1.done && (_a = existingAllocations_1.return)) _a.call(existingAllocations_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        setAssignedResourceIds(ids);
        setMatrix(m);
        setInitialized(true);
    }, [assumptions, existingAllocations, initialized, resources]);
    var _j = __read(useState(function () {
        var _a, _b;
        var latest = __spreadArray([], __read(existingAllocations), false).filter(function (a) { return a.lastModifiedAt; })
            .sort(function (a, b) { var _a, _b; return ((_a = b.lastModifiedAt) !== null && _a !== void 0 ? _a : '').localeCompare((_b = a.lastModifiedAt) !== null && _b !== void 0 ? _b : ''); });
        return (_b = (_a = latest[0]) === null || _a === void 0 ? void 0 : _a.lastModifiedAt) !== null && _b !== void 0 ? _b : null;
    }), 2), lastSavedAt = _j[0], setLastSavedAt = _j[1];
    var _k = __read(useState(function () {
        var _a, _b;
        var latest = __spreadArray([], __read(existingAllocations), false).filter(function (a) { return a.lastModifiedAt; })
            .sort(function (a, b) { var _a, _b; return ((_a = b.lastModifiedAt) !== null && _a !== void 0 ? _a : '').localeCompare((_b = a.lastModifiedAt) !== null && _b !== void 0 ? _b : ''); });
        return (_b = (_a = latest[0]) === null || _a === void 0 ? void 0 : _a.lastModifiedBy) !== null && _b !== void 0 ? _b : null;
    }), 2), lastSavedBy = _k[0], setLastSavedBy = _k[1];
    var _l = __read(useState(false), 2), isDirty = _l[0], setIsDirty = _l[1];
    var _m = __read(useState(false), 2), addingPerson = _m[0], setAddingPerson = _m[1];
    var _o = __read(useState(function () { var _a; return (_a = project === null || project === void 0 ? void 0 : project.notes) !== null && _a !== void 0 ? _a : ''; }), 2), notes = _o[0], setNotes = _o[1];
    var assignedResources = useMemo(function () { return assignedResourceIds.map(function (id) { return resources.find(function (r) { return r.id === id; }); }).filter(Boolean); }, [assignedResourceIds, resources]);
    var availableToAdd = useMemo(function () { return resources.filter(function (r) { return r.active && !assignedResourceIds.includes(r.id); }); }, [resources, assignedResourceIds]);
    var updateCell = useCallback(function (resourceId, month, value) {
        var num = Math.min(200, Math.max(0, Number(value) || 0));
        setMatrix(function (prev) {
            var _a, _b;
            var _c;
            return (__assign(__assign({}, prev), (_a = {}, _a[resourceId] = __assign(__assign({}, ((_c = prev[resourceId]) !== null && _c !== void 0 ? _c : {})), (_b = {}, _b[month] = num, _b)), _a)));
        });
        setIsDirty(true);
    }, []);
    function addPerson(resourceId) {
        if (!assignedResourceIds.includes(resourceId)) {
            setAssignedResourceIds(function (prev) { return __spreadArray(__spreadArray([], __read(prev), false), [resourceId], false); });
            setIsDirty(true);
        }
        setAddingPerson(false);
    }
    function removePerson(resourceId) {
        if (!confirm('Remove this person from the project? Their allocations will be deleted on save.'))
            return;
        setAssignedResourceIds(function (prev) { return prev.filter(function (id) { return id !== resourceId; }); });
        setMatrix(function (prev) { var n = __assign({}, prev); delete n[resourceId]; return n; });
        setIsDirty(true);
    }
    function handleSave() {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var now, others, next;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!assumptions)
                            return [2 /*return*/];
                        now = new Date().toISOString();
                        others = allocations.filter(function (a) { return !(a.projectId === projectId && a.scenarioId === activeScenarioId); });
                        next = assignedResourceIds.flatMap(function (resourceId) {
                            var res = resources.find(function (r) { return r.id === resourceId; });
                            if (!res)
                                return [];
                            var cap = calculateMonthlyProductiveCapacity(res, assumptions);
                            // Persist ALL months (not just the view window) to avoid deleting out-of-view data
                            var allProjectMonths = project ? generateMonthRange(project.startMonth, project.endMonth) : months;
                            return allProjectMonths.flatMap(function (month) {
                                var _a, _b, _c, _d;
                                var percent = (_b = (_a = matrix[resourceId]) === null || _a === void 0 ? void 0 : _a[month]) !== null && _b !== void 0 ? _b : 0;
                                if (percent === 0)
                                    return [];
                                var hours = hoursFromPercent(percent, cap);
                                var existing = existingAllocations.find(function (a) { return a.resourceId === resourceId && a.month === month; });
                                return [{
                                        id: (_c = existing === null || existing === void 0 ? void 0 : existing.id) !== null && _c !== void 0 ? _c : uuidv4(),
                                        scenarioId: activeScenarioId,
                                        projectId: projectId,
                                        resourceId: resourceId,
                                        role: res.role,
                                        month: month,
                                        hours: hours,
                                        locked: (_d = existing === null || existing === void 0 ? void 0 : existing.locked) !== null && _d !== void 0 ? _d : false,
                                        notes: existing === null || existing === void 0 ? void 0 : existing.notes,
                                    }];
                            });
                        });
                        setAllocations(__spreadArray(__spreadArray([], __read(others), false), __read(next), false));
                        return [4 /*yield*/, updateProject(__assign(__assign({}, project), { notes: notes }))];
                    case 1:
                        _b.sent();
                        setLastSavedAt(now);
                        setLastSavedBy((_a = currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) !== null && _a !== void 0 ? _a : null);
                        setIsDirty(false);
                        return [2 /*return*/];
                }
            });
        });
    }
    if (!project)
        return React.createElement("div", { className: "p-8", style: { color: 'var(--text-muted)' } }, "Project not found.");
    var projectMonths = projectMonthOptions(project.startMonth, project.endMonth);
    var fmtSaved = function (iso) {
        return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };
    return (React.createElement("div", { className: "flex flex-col min-h-screen", style: { background: 'var(--bg)' } },
        React.createElement("div", { className: "px-6 pt-6 pb-4 flex items-center justify-between gap-4 flex-wrap", style: { borderBottom: '1px solid var(--border)' } },
            React.createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                React.createElement("button", { onClick: function () { return navigate('/projects'); }, className: "text-xs font-medium transition-colors", style: { color: 'var(--text-muted)' }, onMouseEnter: function (e) { e.currentTarget.style.color = 'var(--accent)'; }, onMouseLeave: function (e) { e.currentTarget.style.color = 'var(--text-muted)'; } }, "\u2190 Projects"),
                React.createElement("div", null,
                    React.createElement("span", { className: "text-[10px] uppercase tracking-wider font-semibold mr-2", style: { color: 'var(--text-faint)' } },
                        project.code,
                        " \u00B7 ",
                        project.frontendBrand),
                    React.createElement("span", { className: "text-base font-bold tracking-tight", style: { color: 'var(--text)' } }, project.name)),
                React.createElement("div", { className: "flex items-end gap-2" },
                    React.createElement(Select, { label: "From", value: viewStart, onChange: function (e) { return setViewStart(e.target.value); }, options: projectMonths }),
                    React.createElement(Select, { label: "To", value: viewEnd, onChange: function (e) { return setViewEnd(e.target.value); }, options: projectMonths }))),
            React.createElement("div", { className: "flex items-center gap-3" },
                lastSavedAt && !isDirty && (React.createElement("span", { className: "text-xs", style: { color: 'var(--text-muted)' } },
                    "Saved by ",
                    formatAuditUser(lastSavedBy !== null && lastSavedBy !== void 0 ? lastSavedBy : undefined),
                    " \u00B7 ",
                    fmtSaved(lastSavedAt))),
                isDirty && React.createElement("span", { className: "text-xs text-amber-500" }, "Unsaved changes"),
                React.createElement(Button, { variant: "primary", onClick: handleSave, disabled: !isDirty }, "Save"),
                React.createElement(motion.button, { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: toggle, className: "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors", style: { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' } }, isDark ? '☀ Light' : '◑ Dark'))),
        React.createElement("div", { className: "flex-1 overflow-x-auto px-6 py-6" },
            React.createElement("table", { className: "text-xs w-full", style: { borderCollapse: 'separate', borderSpacing: 0 } },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", { className: "text-left pb-2 pr-4 font-semibold text-[10px] uppercase tracking-wider sticky left-0 z-10 whitespace-nowrap", style: { color: 'var(--text-faint)', background: 'var(--bg)', borderBottom: '1px solid var(--border)', minWidth: 150 } }, "Team Member"),
                        months.map(function (m) { return (React.createElement("th", { key: m, className: "text-center pb-2 px-0.5 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap", style: { color: 'var(--text-faint)', borderBottom: '1px solid var(--border)', minWidth: 56 } }, new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }))); }),
                        React.createElement("th", { style: { borderBottom: '1px solid var(--border)', width: 24 } }))),
                React.createElement("tbody", null,
                    React.createElement(AnimatePresence, { initial: false }, assignedResources.map(function (r) {
                        var _a;
                        var cap = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : 133;
                        var rowMatrix = (_a = matrix[r.id]) !== null && _a !== void 0 ? _a : {};
                        return (React.createElement(motion.tr, { key: r.id, initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.18 }, className: "group" },
                            React.createElement("td", { className: "py-1.5 pr-4 sticky left-0 z-10 whitespace-nowrap", style: { background: 'var(--bg)', borderBottom: '1px solid var(--row-divider)' } },
                                React.createElement("div", { className: "font-semibold", style: { color: 'var(--text)' } }, r.displayName),
                                React.createElement("div", { className: "text-[10px]", style: { color: 'var(--text-muted)' } },
                                    ROLE_LABELS[r.role],
                                    " \u00B7 ",
                                    Math.round(cap),
                                    "h/mo")),
                            months.map(function (m) {
                                var _a;
                                var pct = (_a = rowMatrix[m]) !== null && _a !== void 0 ? _a : 0;
                                var hrs = hoursFromPercent(pct, cap);
                                return (React.createElement("td", { key: m, className: "px-0.5 py-1.5 text-center", style: { borderBottom: '1px solid var(--row-divider)' } },
                                    React.createElement("div", { className: "relative mx-auto", style: { width: 52 } },
                                        React.createElement("input", { type: "number", min: 0, max: 200, value: pct === 0 ? '' : pct, placeholder: "\u2014", onChange: function (e) { return updateCell(r.id, m, e.target.value); }, className: "w-full text-center rounded-md py-1 text-xs font-bold tabular transition-all", style: {
                                                background: cellBg(pct),
                                                color: cellTextColor(pct),
                                                border: "1px solid ".concat(pct > 0 ? 'transparent' : 'var(--border)'),
                                                outline: 'none',
                                            }, onFocus: function (e) { e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.4)'; }, onBlur: function (e) { e.target.style.boxShadow = 'none'; } }),
                                        pct > 0 && (React.createElement("div", { className: "text-[9px] text-center leading-none mt-0.5 tabular", style: { color: 'var(--text-muted)' } },
                                            hrs,
                                            "h")))));
                            }),
                            React.createElement("td", { className: "py-1.5 text-center", style: { borderBottom: '1px solid var(--row-divider)' } },
                                React.createElement("button", { onClick: function () { return removePerson(r.id); }, className: "opacity-0 group-hover:opacity-100 transition-opacity text-[11px] rounded px-1 py-0.5", style: { color: 'var(--text-muted)' }, onMouseEnter: function (e) { e.currentTarget.style.color = '#f87171'; }, onMouseLeave: function (e) { e.currentTarget.style.color = 'var(--text-muted)'; }, title: "Remove" }, "\u2715"))));
                    }))),
                assignedResources.length > 0 && (React.createElement("tfoot", null,
                    React.createElement("tr", null,
                        React.createElement("td", { className: "pt-3 pb-1 pr-4 text-[10px] uppercase tracking-wider font-semibold sticky left-0", style: { color: 'var(--text-faint)', background: 'var(--bg)' } }, "Total"),
                        months.map(function (m) {
                            var total = assignedResources.reduce(function (sum, r) {
                                var _a, _b;
                                var cap = assumptions ? calculateMonthlyProductiveCapacity(r, assumptions) : 133;
                                return sum + hoursFromPercent((_b = (_a = matrix[r.id]) === null || _a === void 0 ? void 0 : _a[m]) !== null && _b !== void 0 ? _b : 0, cap);
                            }, 0);
                            return (React.createElement("td", { key: m, className: "pt-3 pb-1 px-0.5 text-center" },
                                React.createElement("span", { className: "text-xs font-bold tabular", style: { color: total > 0 ? 'var(--text)' : 'var(--text-faint)' } }, total > 0 ? "".concat(total, "h") : '—')));
                        }),
                        React.createElement("td", null))))),
            React.createElement("div", { className: "mt-5" }, addingPerson ? (React.createElement(motion.div, { initial: { opacity: 0, y: -4 }, animate: { opacity: 1, y: 0 }, className: "flex items-center gap-3" },
                React.createElement(Select, { label: "", options: __spreadArray([
                        { value: '', label: 'Select person…' }
                    ], __read(availableToAdd.map(function (r) { return ({ value: r.id, label: "".concat(r.displayName, " \u2014 ").concat(ROLE_LABELS[r.role]) }); })), false), onChange: function (e) { if (e.target.value)
                        addPerson(e.target.value); }, style: { minWidth: 260 } }),
                React.createElement(Button, { variant: "ghost", size: "sm", onClick: function () { return setAddingPerson(false); } }, "Cancel"))) : (React.createElement(Button, { variant: "secondary", size: "sm", onClick: function () { return setAddingPerson(true); }, disabled: availableToAdd.length === 0 }, "+ Add person"))),
            assignedResources.length === 0 && initialized && (React.createElement("div", { className: "mt-12 text-center", style: { color: 'var(--text-muted)' } },
                React.createElement("div", { className: "text-3xl mb-3 opacity-30" }, "\u25CE"),
                React.createElement("div", { className: "text-sm" }, "No team members yet."),
                React.createElement("div", { className: "text-xs mt-1 opacity-60" }, "Click \"+ Add person\" to build the team."))),
            React.createElement("div", { className: "mt-10 pt-6", style: { borderTop: '1px solid var(--border)' } },
                React.createElement("div", { className: "text-[10px] uppercase tracking-wider font-semibold mb-3", style: { color: 'var(--text-faint)' } }, "Notes"),
                React.createElement("textarea", { value: notes, onChange: function (e) { setNotes(e.target.value); setIsDirty(true); }, placeholder: "Add project notes, assumptions, decisions\u2026", rows: 6, className: "w-full rounded-lg px-4 py-3 text-sm resize-y transition-all", style: {
                        background: 'var(--surface)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        outline: 'none',
                        maxWidth: 780,
                        lineHeight: 1.6,
                    }, onFocus: function (e) {
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
                    }, onBlur: function (e) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.boxShadow = 'none';
                    } })))));
}
//# sourceMappingURL=ProjectAllocationEditor.js.map