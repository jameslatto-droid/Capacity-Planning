import { __assign, __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { getLeaveDaysInMonth, getEntryWorkingDays, countWorkingDays, } from '../../domain/capacity/leaveCalculations';
import { generateMonthRange, formatMonth, currentMonth } from '../../utils/months';
import { useDateRange } from '../../utils/useDateRange';
import { usePageBackground } from '../../utils/usePageBackground';
import { LEAVE_TYPE_LABELS } from '../../types';
var LEAVE_TYPES = Object.entries(LEAVE_TYPE_LABELS);
var typeColor = {
    'annual': 'rgba(37,99,235,0.7)',
    'sick': 'rgba(217,119,6,0.7)',
    'public-holiday': 'rgba(124,58,237,0.7)',
    'unpaid': 'rgba(107,114,128,0.7)',
    'other': 'rgba(75,85,99,0.6)',
};
var typeTextColor = {
    'annual': '#93c5fd',
    'sick': '#fde68a',
    'public-holiday': '#c4b5fd',
    'unpaid': '#d1d5db',
    'other': '#9ca3af',
};
function emptyForm(defaultResourceId) {
    if (defaultResourceId === void 0) { defaultResourceId = ''; }
    var now = new Date();
    var today = now.toISOString().slice(0, 10);
    return { resourceId: defaultResourceId, type: 'annual', startDate: today, endDate: today, notes: '' };
}
export function LeavePage() {
    usePageBackground('3.png');
    var _a = usePlannerStore(), resources = _a.resources, leaveEntries = _a.leaveEntries, addLeaveEntry = _a.addLeaveEntry, updateLeaveEntry = _a.updateLeaveEntry, deleteLeaveEntry = _a.deleteLeaveEntry;
    var _b = useDateRange(), viewStart = _b.startMonth, viewEnd = _b.endMonth, setViewStart = _b.setStartMonth, setViewEnd = _b.setEndMonth, minMonth = _b.minMonth, maxMonth = _b.maxMonth;
    var _c = __read(useState(false), 2), showForm = _c[0], setShowForm = _c[1];
    var _d = __read(useState(null), 2), editingId = _d[0], setEditingId = _d[1];
    var _e = __read(useState(emptyForm), 2), form = _e[0], setForm = _e[1];
    var _f = __read(useState(''), 2), formError = _f[0], setFormError = _f[1];
    var _g = __read(useState('all'), 2), filterResource = _g[0], setFilterResource = _g[1];
    var viewMonths = useMemo(function () { return generateMonthRange(viewStart, viewEnd); }, [viewStart, viewEnd]);
    var activeResources = resources.filter(function (r) { return r.active; });
    // Who's off this month (current month)
    var now = currentMonth();
    var outThisMonth = useMemo(function () {
        return activeResources
            .map(function (r) {
            var days = getLeaveDaysInMonth(r, now, leaveEntries);
            var entries = leaveEntries.filter(function (e) {
                if (e.resourceId !== r.id)
                    return false;
                var s = new Date(e.startDate + 'T00:00:00');
                var end2 = new Date(e.endDate + 'T00:00:00');
                var _a = __read(now.split('-').map(Number), 2), y = _a[0], m = _a[1];
                var ms = new Date(y, m - 1, 1);
                var me = new Date(y, m, 0);
                return s <= me && end2 >= ms;
            });
            return { resource: r, days: days, entries: entries };
        })
            .filter(function (x) { return x.days > 0; });
    }, [activeResources, leaveEntries, now]);
    function openAdd() {
        setEditingId(null);
        setForm(emptyForm(filterResource !== 'all' ? filterResource : ''));
        setFormError('');
        setShowForm(true);
    }
    function openEdit(entry) {
        var _a;
        setEditingId(entry.id);
        setForm({
            resourceId: entry.resourceId,
            type: entry.type,
            startDate: entry.startDate,
            endDate: entry.endDate,
            notes: (_a = entry.notes) !== null && _a !== void 0 ? _a : '',
        });
        setFormError('');
        setShowForm(true);
    }
    function handleSave() {
        if (!form.resourceId) {
            setFormError('Select a person');
            return;
        }
        if (!form.startDate || !form.endDate) {
            setFormError('Enter both dates');
            return;
        }
        if (form.startDate > form.endDate) {
            setFormError('Start must be before end');
            return;
        }
        setFormError('');
        var payload = {
            id: editingId !== null && editingId !== void 0 ? editingId : uuidv4(),
            resourceId: form.resourceId,
            type: form.type,
            startDate: form.startDate,
            endDate: form.endDate,
            notes: form.notes.trim() || undefined,
            createdAt: new Date().toISOString(),
        };
        if (editingId)
            updateLeaveEntry(payload);
        else
            addLeaveEntry(payload);
        setShowForm(false);
    }
    var computedDays = form.startDate && form.endDate && form.startDate <= form.endDate
        ? countWorkingDays(form.startDate, form.endDate)
        : 0;
    var resourceOptions = __spreadArray([
        { value: 'all', label: 'All people' }
    ], __read(activeResources.map(function (r) { return ({ value: r.id, label: r.displayName }); })), false);
    var filteredEntries = useMemo(function () {
        return leaveEntries
            .filter(function (e) { return filterResource === 'all' || e.resourceId === filterResource; })
            .sort(function (a, b) { return a.startDate.localeCompare(b.startDate); });
    }, [leaveEntries, filterResource]);
    var ROW = { borderBottom: '1px solid var(--row-divider)' };
    return (React.createElement(PageLayout, { title: "Leave Tracker", subtitle: "Recorded leave is reflected in capacity calculations across the app", actions: React.createElement(Button, { variant: "primary", onClick: openAdd }, "+ Add leave") },
        React.createElement(AnimatePresence, null, showForm && (React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center", style: { background: 'rgba(0,0,0,0.55)' } },
            React.createElement(motion.div, { initial: { opacity: 0, scale: 0.96, y: 8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.96 }, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] }, className: "w-full max-w-md rounded-2xl p-6", style: { background: 'var(--surface)', border: '1px solid var(--border-s)' } },
                React.createElement("h2", { className: "text-base font-semibold mb-5", style: { color: 'var(--text)' } }, editingId ? 'Edit Leave' : 'Add Leave'),
                React.createElement("div", { className: "flex flex-col gap-3" },
                    React.createElement(Select, { label: "Person", value: form.resourceId, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { resourceId: e.target.value })); }); }, options: __spreadArray([{ value: '', label: 'Select person…' }], __read(activeResources.map(function (r) { return ({ value: r.id, label: r.displayName }); })), false) }),
                    React.createElement(Select, { label: "Type", value: form.type, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { type: e.target.value })); }); }, options: LEAVE_TYPES.map(function (_a) {
                            var _b = __read(_a, 2), v = _b[0], l = _b[1];
                            return ({ value: v, label: l });
                        }) }),
                    React.createElement("div", { className: "flex gap-3" },
                        React.createElement(Input, { label: "From", type: "date", value: form.startDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { startDate: e.target.value })); }); } }),
                        React.createElement(Input, { label: "To", type: "date", value: form.endDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { endDate: e.target.value })); }); } })),
                    computedDays > 0 && (React.createElement("div", { className: "text-xs px-3 py-2 rounded-lg", style: { background: 'var(--accent-light)', color: 'var(--accent-text)' } },
                        computedDays,
                        " working ",
                        computedDays === 1 ? 'day' : 'days',
                        form.resourceId && (function () {
                            var r = resources.find(function (x) { return x.id === form.resourceId; });
                            if (r && r.workingDaysPerWeek < 5) {
                                var actual = Math.round(computedDays * (r.workingDaysPerWeek / 5) * 10) / 10;
                                return " \u2192 ".concat(actual, " days for ").concat(r.displayName, " (").concat(r.workingDaysPerWeek, "-day week)");
                            }
                            return null;
                        })())),
                    React.createElement(Input, { label: "Notes (optional)", value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); } }),
                    formError && React.createElement("p", { className: "text-xs text-red-500" }, formError)),
                React.createElement("div", { className: "flex justify-end gap-2 pt-4 mt-2", style: { borderTop: '1px solid var(--border)' } },
                    React.createElement(Button, { variant: "ghost", onClick: function () { return setShowForm(false); } }, "Cancel"),
                    React.createElement(Button, { variant: "primary", onClick: handleSave }, "Save")))))),
        outThisMonth.length > 0 && (React.createElement(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, className: "mb-8" },
            React.createElement("div", { className: "text-[10px] uppercase tracking-wider font-semibold mb-3", style: { color: 'var(--text-faint)' } },
                "Out this month \u2014 ",
                formatMonth(now)),
            React.createElement("div", { className: "flex flex-wrap gap-2" }, outThisMonth.map(function (_a) {
                var resource = _a.resource, days = _a.days, entries = _a.entries;
                return (React.createElement("div", { key: resource.id, className: "flex items-center gap-2 rounded-lg px-3 py-2 text-xs", style: { background: 'var(--surface)', border: '1px solid var(--border)' } },
                    React.createElement("span", { className: "font-semibold", style: { color: 'var(--text)' } }, resource.displayName),
                    React.createElement("span", { style: { color: 'var(--text-muted)' } },
                        days,
                        "d"),
                    entries.map(function (e) { return (React.createElement("span", { key: e.id, className: "rounded px-1.5 py-0.5 text-[10px] font-medium", style: { background: typeColor[e.type], color: typeTextColor[e.type] } }, LEAVE_TYPE_LABELS[e.type])); })));
            })))),
        React.createElement("div", { className: "mb-10" },
            React.createElement("div", { className: "flex flex-wrap items-end gap-3 mb-4" },
                React.createElement(Input, { label: "From", type: "month", value: viewStart, min: minMonth, max: maxMonth, onChange: function (e) { return setViewStart(e.target.value); }, className: "w-36" }),
                React.createElement(Input, { label: "To", type: "month", value: viewEnd, min: minMonth, max: maxMonth, onChange: function (e) { return setViewEnd(e.target.value); }, className: "w-36" }),
                React.createElement(Select, { label: "Person", value: filterResource, onChange: function (e) { return setFilterResource(e.target.value); }, options: resourceOptions })),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "text-xs w-full" },
                    React.createElement("thead", null,
                        React.createElement("tr", { style: { borderBottom: '1px solid var(--border)' } },
                            React.createElement("th", { className: "text-left pb-3 pr-4 font-semibold text-[10px] uppercase tracking-wider", style: { color: 'var(--text-faint)', minWidth: 150 } }, "Person"),
                            viewMonths.map(function (m) { return (React.createElement("th", { key: m, className: "text-center pb-3 px-2 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap", style: { color: 'var(--text-faint)', minWidth: 56 } }, new Date(m + '-01').toLocaleDateString('en-GB', { month: 'short' }))); }))),
                    React.createElement("tbody", null, activeResources
                        .filter(function (r) { return filterResource === 'all' || r.id === filterResource; })
                        .map(function (r) {
                        var hasAny = viewMonths.some(function (m) { return getLeaveDaysInMonth(r, m, leaveEntries) > 0; });
                        return (React.createElement("tr", { key: r.id, style: ROW },
                            React.createElement("td", { className: "py-1.5 pr-4 font-medium", style: { color: hasAny ? 'var(--text)' : 'var(--text-muted)' } }, r.displayName),
                            viewMonths.map(function (m) {
                                var _a;
                                var days = getLeaveDaysInMonth(r, m, leaveEntries);
                                var monthEntries = leaveEntries.filter(function (e) {
                                    if (e.resourceId !== r.id)
                                        return false;
                                    var _a = __read(m.split('-').map(Number), 2), y = _a[0], mo = _a[1];
                                    var ms2 = new Date(y, mo - 1, 1);
                                    var me2 = new Date(y, mo, 0);
                                    return new Date(e.startDate + 'T00:00:00') <= me2 && new Date(e.endDate + 'T00:00:00') >= ms2;
                                });
                                var mainType = (_a = monthEntries[0]) === null || _a === void 0 ? void 0 : _a.type;
                                return (React.createElement("td", { key: m, className: "px-2 py-1 text-center" }, days > 0 ? (React.createElement("button", { onClick: function () { return monthEntries[0] && openEdit(monthEntries[0]); }, className: "rounded-md text-[10px] font-bold w-full py-1 transition-all heatmap-cell", style: {
                                        background: mainType ? typeColor[mainType] : 'rgba(37,99,235,0.5)',
                                        color: mainType ? typeTextColor[mainType] : '#93c5fd',
                                    }, title: monthEntries.map(function (e) { return "".concat(LEAVE_TYPE_LABELS[e.type], ": ").concat(e.startDate, " \u2013 ").concat(e.endDate); }).join('\n') },
                                    days,
                                    "d")) : (React.createElement("button", { onClick: function () { setForm(__assign(__assign({}, emptyForm(r.id)), { resourceId: r.id })); setEditingId(null); setFormError(''); setShowForm(true); }, className: "rounded-md w-full py-1 text-[10px] opacity-0 hover:opacity-100 transition-opacity", style: { background: 'var(--surface-2)', color: 'var(--text-faint)' }, title: "Add leave" }, "+"))));
                            })));
                    }))))),
        React.createElement("div", null,
            React.createElement("div", { className: "text-[10px] uppercase tracking-wider font-semibold mb-4", style: { color: 'var(--text-faint)' } },
                "All Leave Entries ",
                filteredEntries.length > 0 && "\u00B7 ".concat(filteredEntries.length)),
            filteredEntries.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-12 gap-3" },
                React.createElement("div", { style: { fontSize: 32, opacity: 0.2 } }, "\u25F7"),
                React.createElement("div", { style: { fontSize: 13, color: 'var(--text-faint)' } }, filterResource === 'all' ? 'No leave entries yet — add the first one above' : 'No leave entries for this person'))) : (React.createElement("table", { className: "w-full text-sm" },
                React.createElement("thead", null,
                    React.createElement("tr", { style: { borderBottom: '1px solid var(--border)' } }, ['Person', 'Type', 'From', 'To', 'Days', 'Notes', ''].map(function (h, i) { return (React.createElement("th", { key: h + i, className: "pb-3 text-[10px] uppercase tracking-wider font-semibold ".concat(i === 0 || i === 5 ? 'text-left' : 'text-center', " ").concat(i >= 6 ? '' : 'pr-3'), style: { color: 'var(--text-faint)' } }, h)); }))),
                React.createElement("tbody", null, filteredEntries.map(function (entry) {
                    var _a, _b;
                    var r = resources.find(function (x) { return x.id === entry.resourceId; });
                    var days = r ? getEntryWorkingDays(entry, r) : countWorkingDays(entry.startDate, entry.endDate);
                    return (React.createElement(motion.tr, { key: entry.id, initial: { opacity: 0 }, animate: { opacity: 1 }, style: ROW, className: "group" },
                        React.createElement("td", { className: "py-2.5 pr-3 font-medium", style: { color: 'var(--text)' } }, (_a = r === null || r === void 0 ? void 0 : r.displayName) !== null && _a !== void 0 ? _a : '—'),
                        React.createElement("td", { className: "py-2.5 pr-3 text-center" },
                            React.createElement("span", { className: "rounded px-2 py-0.5 text-[10px] font-semibold", style: { background: typeColor[entry.type], color: typeTextColor[entry.type] } }, LEAVE_TYPE_LABELS[entry.type])),
                        React.createElement("td", { className: "py-2.5 pr-3 text-center tabular text-xs", style: { color: 'var(--text-muted)' } }, entry.startDate),
                        React.createElement("td", { className: "py-2.5 pr-3 text-center tabular text-xs", style: { color: 'var(--text-muted)' } }, entry.endDate),
                        React.createElement("td", { className: "py-2.5 pr-3 text-center font-semibold tabular", style: { color: 'var(--text)' } }, days),
                        React.createElement("td", { className: "py-2.5 pr-3 text-xs", style: { color: 'var(--text-muted)' } }, (_b = entry.notes) !== null && _b !== void 0 ? _b : ''),
                        React.createElement("td", { className: "py-2.5 text-right opacity-0 group-hover:opacity-100 transition-opacity" },
                            React.createElement("div", { className: "flex gap-1 justify-end" },
                                React.createElement(Button, { size: "sm", variant: "ghost", onClick: function () { return openEdit(entry); } }, "Edit"),
                                React.createElement(Button, { size: "sm", variant: "danger", onClick: function () { if (confirm('Delete this leave entry?'))
                                        deleteLeaveEntry(entry.id); } }, "Del")))));
                })))))));
}
//# sourceMappingURL=LeavePage.js.map