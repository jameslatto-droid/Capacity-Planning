import { __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { getProjectType } from '../../domain/projects/projectPlanning';
export function ProjectForm(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    var initial = _a.initial, resources = _a.resources, onSave = _a.onSave, onCancel = _a.onCancel;
    var _p = __read(useState((_b = initial === null || initial === void 0 ? void 0 : initial.code) !== null && _b !== void 0 ? _b : ''), 2), code = _p[0], setCode = _p[1];
    var _q = __read(useState((_c = initial === null || initial === void 0 ? void 0 : initial.name) !== null && _c !== void 0 ? _c : ''), 2), name = _q[0], setName = _q[1];
    var _r = __read(useState((_d = initial === null || initial === void 0 ? void 0 : initial.frontendBrand) !== null && _d !== void 0 ? _d : 'DCT'), 2), brand = _r[0], setBrand = _r[1];
    var _s = __read(useState((_e = initial === null || initial === void 0 ? void 0 : initial.client) !== null && _e !== void 0 ? _e : ''), 2), client = _s[0], setClient = _s[1];
    var _t = __read(useState((_f = initial === null || initial === void 0 ? void 0 : initial.projectManager) !== null && _f !== void 0 ? _f : ''), 2), pm = _t[0], setPm = _t[1];
    var _u = __read(useState(initial ? getProjectType(initial) : 'live'), 2), projectType = _u[0], setProjectType = _u[1];
    var _v = __read(useState((_g = initial === null || initial === void 0 ? void 0 : initial.includeInResourceCalculations) !== null && _g !== void 0 ? _g : true), 2), includeInResourceCalculations = _v[0], setIncludeInResourceCalculations = _v[1];
    var _w = __read(useState((initial === null || initial === void 0 ? void 0 : initial.status) === 'opportunity' ? 'planned' : (_h = initial === null || initial === void 0 ? void 0 : initial.status) !== null && _h !== void 0 ? _h : 'planned'), 2), status = _w[0], setStatus = _w[1];
    var _x = __read(useState((_j = initial === null || initial === void 0 ? void 0 : initial.priority) !== null && _j !== void 0 ? _j : 'medium'), 2), priority = _x[0], setPriority = _x[1];
    var _y = __read(useState((_k = initial === null || initial === void 0 ? void 0 : initial.flexibility) !== null && _k !== void 0 ? _k : 'flexible'), 2), flexibility = _y[0], setFlexibility = _y[1];
    var _z = __read(useState((_l = initial === null || initial === void 0 ? void 0 : initial.startMonth) !== null && _l !== void 0 ? _l : '2026-01'), 2), startMonth = _z[0], setStartMonth = _z[1];
    var _0 = __read(useState((_m = initial === null || initial === void 0 ? void 0 : initial.endMonth) !== null && _m !== void 0 ? _m : '2027-12'), 2), endMonth = _0[0], setEndMonth = _0[1];
    var _1 = __read(useState((_o = initial === null || initial === void 0 ? void 0 : initial.notes) !== null && _o !== void 0 ? _o : ''), 2), notes = _1[0], setNotes = _1[1];
    var _2 = __read(useState(''), 2), error = _2[0], setError = _2[1];
    function handleSubmit() {
        if (!code.trim()) {
            setError('Code required');
            return;
        }
        if (!name.trim()) {
            setError('Name required');
            return;
        }
        if (startMonth > endMonth) {
            setError('Start must be before or equal to End');
            return;
        }
        setError('');
        onSave({
            code: code.trim(),
            name: name.trim(),
            frontendBrand: brand,
            client: client.trim() || undefined,
            projectManager: pm || undefined,
            projectType: projectType,
            includeInResourceCalculations: projectType === 'live' ? true : includeInResourceCalculations,
            status: status,
            priority: priority,
            flexibility: flexibility,
            startMonth: startMonth,
            endMonth: endMonth,
            notes: notes.trim() || undefined,
        });
    }
    var pmOptions = __spreadArray([{ value: '', label: '— None —' }], __read(resources.filter(function (r) { return r.active; }).map(function (r) { return ({ value: r.id, label: r.displayName }); })), false);
    return (React.createElement("div", { className: "flex flex-col gap-3" },
        React.createElement("div", { className: "flex gap-3" },
            React.createElement(Input, { label: "Code", value: code, onChange: function (e) { return setCode(e.target.value); }, className: "w-36" }),
            React.createElement(Input, { label: "Name", value: name, onChange: function (e) { return setName(e.target.value); }, className: "flex-1" })),
        React.createElement("div", { className: "flex gap-3" },
            React.createElement(Select, { label: "Brand", value: brand, onChange: function (e) { return setBrand(e.target.value); }, options: [{ value: 'DCT', label: 'DCT' }, { value: 'PLK', label: 'PLK' }] }),
            React.createElement(Select, { label: "Type", value: projectType, onChange: function (e) {
                    var next = e.target.value;
                    setProjectType(next);
                    if (next === 'live')
                        setIncludeInResourceCalculations(true);
                }, options: [{ value: 'live', label: 'Live' }, { value: 'opportunity', label: 'Opportunity' }] })),
        projectType === 'opportunity' && (React.createElement("div", { className: "flex items-center justify-between rounded-lg px-3 py-2", style: { background: 'var(--surface-2)', border: '1px solid var(--border)' } },
            React.createElement("span", { className: "text-[11px] font-semibold uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, "Manpower"),
            React.createElement("button", { type: "button", onClick: function () { return setIncludeInResourceCalculations(function (value) { return !value; }); }, className: "relative h-7 w-24 rounded-full text-[11px] font-semibold transition-all", style: {
                    background: includeInResourceCalculations ? 'rgba(5,150,105,0.18)' : 'rgba(107,114,128,0.18)',
                    color: includeInResourceCalculations ? '#059669' : 'var(--text-muted)',
                    border: "1px solid ".concat(includeInResourceCalculations ? 'rgba(5,150,105,0.35)' : 'var(--border-s)'),
                } }, includeInResourceCalculations ? 'Included' : 'Excluded'))),
        React.createElement("div", { className: "flex gap-3" },
            React.createElement(Select, { label: "Status", value: status, onChange: function (e) { return setStatus(e.target.value); }, options: [{ value: 'planned', label: 'Planned' }, { value: 'active', label: 'Active' }, { value: 'on-hold', label: 'On Hold' }, { value: 'complete', label: 'Complete' }, { value: 'cancelled', label: 'Cancelled' }] }),
            React.createElement(Select, { label: "Priority", value: priority, onChange: function (e) { return setPriority(e.target.value); }, options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] })),
        React.createElement(Select, { label: "Flexibility", value: flexibility, onChange: function (e) { return setFlexibility(e.target.value); }, options: [{ value: 'fixed', label: 'Fixed' }, { value: 'limited', label: 'Limited' }, { value: 'flexible', label: 'Flexible' }] }),
        React.createElement(Input, { label: "Client", value: client, onChange: function (e) { return setClient(e.target.value); } }),
        React.createElement(Select, { label: "Project Manager", value: pm, onChange: function (e) { return setPm(e.target.value); }, options: pmOptions }),
        React.createElement("div", { className: "flex gap-3" },
            React.createElement(Input, { label: "Start month", type: "month", value: startMonth, onChange: function (e) { return setStartMonth(e.target.value); } }),
            React.createElement(Input, { label: "End month", type: "month", value: endMonth, onChange: function (e) { return setEndMonth(e.target.value); } })),
        React.createElement(Input, { label: "Notes (optional)", value: notes, onChange: function (e) { return setNotes(e.target.value); } }),
        error && React.createElement("p", { className: "text-xs text-red-400" }, error),
        React.createElement("div", { className: "flex justify-end gap-2 pt-3", style: { borderTop: '1px solid var(--border)' } },
            React.createElement(Button, { variant: "ghost", onClick: onCancel }, "Cancel"),
            React.createElement(Button, { variant: "primary", onClick: handleSubmit }, "Save"))));
}
//# sourceMappingURL=ProjectForm.js.map