import { __read, __spreadArray } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { ALL_ROLES, ROLE_LABELS } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
var roleOptions = ALL_ROLES.map(function (r) { return ({ value: r, label: ROLE_LABELS[r] }); });
var employmentOptions = [
    { value: 'employee', label: 'Employee' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'placeholder', label: 'Placeholder' },
];
var CONTRACT_TYPES = new Set(['contractor', 'freelancer']);
export function ResourceForm(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var initial = _a.initial, onSave = _a.onSave, onCancel = _a.onCancel;
    var _m = __read(useState((_b = initial === null || initial === void 0 ? void 0 : initial.displayName) !== null && _b !== void 0 ? _b : ''), 2), displayName = _m[0], setDisplayName = _m[1];
    var _o = __read(useState((_c = initial === null || initial === void 0 ? void 0 : initial.role) !== null && _c !== void 0 ? _c : 'other'), 2), role = _o[0], setRole = _o[1];
    var _p = __read(useState((_d = initial === null || initial === void 0 ? void 0 : initial.secondaryRoles) !== null && _d !== void 0 ? _d : []), 2), secondaryRoles = _p[0], setSecondaryRoles = _p[1];
    var _q = __read(useState((_e = initial === null || initial === void 0 ? void 0 : initial.employmentType) !== null && _e !== void 0 ? _e : 'employee'), 2), employmentType = _q[0], setEmploymentType = _q[1];
    var _r = __read(useState(String((_f = initial === null || initial === void 0 ? void 0 : initial.contractHoursPerWeek) !== null && _f !== void 0 ? _f : 40)), 2), contractHours = _r[0], setContractHours = _r[1];
    var _s = __read(useState(String((_g = initial === null || initial === void 0 ? void 0 : initial.workingDaysPerWeek) !== null && _g !== void 0 ? _g : 5)), 2), workingDays = _s[0], setWorkingDays = _s[1];
    var _t = __read(useState((_h = initial === null || initial === void 0 ? void 0 : initial.contractStart) !== null && _h !== void 0 ? _h : ''), 2), contractStart = _t[0], setContractStart = _t[1];
    var _u = __read(useState((_j = initial === null || initial === void 0 ? void 0 : initial.contractEnd) !== null && _j !== void 0 ? _j : ''), 2), contractEnd = _u[0], setContractEnd = _u[1];
    var _v = __read(useState((_k = initial === null || initial === void 0 ? void 0 : initial.active) !== null && _k !== void 0 ? _k : true), 2), active = _v[0], setActive = _v[1];
    var _w = __read(useState((_l = initial === null || initial === void 0 ? void 0 : initial.notes) !== null && _l !== void 0 ? _l : ''), 2), notes = _w[0], setNotes = _w[1];
    var _x = __read(useState(''), 2), error = _x[0], setError = _x[1];
    function toggleSecondaryRole(r) {
        setSecondaryRoles(function (prev) { return prev.includes(r) ? prev.filter(function (x) { return x !== r; }) : __spreadArray(__spreadArray([], __read(prev), false), [r], false); });
    }
    function handleSubmit() {
        var hours = Number(contractHours);
        var days = Number(workingDays);
        if (!displayName.trim()) {
            setError('Name required');
            return;
        }
        if (hours <= 0) {
            setError('Contract hours must be > 0');
            return;
        }
        if (days < 1 || days > 7) {
            setError('Working days must be 1–7');
            return;
        }
        if (contractStart && contractEnd && contractStart > contractEnd) {
            setError('Contract start must be before end date');
            return;
        }
        setError('');
        onSave({
            displayName: displayName.trim(),
            role: role,
            secondaryRoles: secondaryRoles.length ? secondaryRoles : undefined,
            employmentType: employmentType,
            contractHoursPerWeek: hours,
            workingDaysPerWeek: days,
            fullTimeHoursPerWeek: 40,
            active: active,
            notes: notes.trim() || undefined,
            contractStart: CONTRACT_TYPES.has(employmentType) && contractStart ? contractStart : undefined,
            contractEnd: CONTRACT_TYPES.has(employmentType) && contractEnd ? contractEnd : undefined,
        });
    }
    var showContractDates = CONTRACT_TYPES.has(employmentType);
    return (React.createElement("div", { className: "flex flex-col gap-4" },
        React.createElement(Input, { label: "Name", value: displayName, onChange: function (e) { return setDisplayName(e.target.value); } }),
        React.createElement(Select, { label: "Role", value: role, onChange: function (e) { return setRole(e.target.value); }, options: roleOptions }),
        React.createElement("div", null,
            React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-wider mb-2", style: { color: 'var(--text-faint)' } }, "Secondary Roles"),
            React.createElement("div", { className: "flex flex-wrap gap-3" }, ALL_ROLES.filter(function (r) { return r !== role; }).map(function (r) { return (React.createElement("label", { key: r, className: "flex items-center gap-1.5 text-xs cursor-pointer transition-colors", style: { color: 'var(--text-muted)' } },
                React.createElement("input", { type: "checkbox", checked: secondaryRoles.includes(r), onChange: function () { return toggleSecondaryRole(r); }, className: "accent-violet-500" }),
                ROLE_LABELS[r])); }))),
        React.createElement(Select, { label: "Employment Type", value: employmentType, onChange: function (e) { return setEmploymentType(e.target.value); }, options: employmentOptions }),
        React.createElement("div", { className: "flex gap-3" },
            React.createElement(Input, { label: "Contract h/week", type: "number", value: contractHours, onChange: function (e) { return setContractHours(e.target.value); } }),
            React.createElement(Input, { label: "Working days/week", type: "number", value: workingDays, onChange: function (e) { return setWorkingDays(e.target.value); } })),
        showContractDates && (React.createElement("div", null,
            React.createElement("div", { className: "text-[10px] font-semibold uppercase tracking-wider mb-2", style: { color: 'var(--text-faint)' } },
                "Contract period ",
                React.createElement("span", { style: { color: 'var(--text-faint)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 } }, "(optional \u2014 allocations outside this window will show a warning)")),
            React.createElement("div", { className: "flex gap-3" },
                React.createElement(Input, { label: "Start date", type: "date", value: contractStart, onChange: function (e) { return setContractStart(e.target.value); } }),
                React.createElement(Input, { label: "End date", type: "date", value: contractEnd, onChange: function (e) { return setContractEnd(e.target.value); } })))),
        React.createElement("label", { className: "flex items-center gap-2 text-sm cursor-pointer", style: { color: 'var(--text-muted)' } },
            React.createElement("input", { type: "checkbox", checked: active, onChange: function (e) { return setActive(e.target.checked); }, className: "accent-violet-500" }),
            "Active"),
        React.createElement(Input, { label: "Notes (optional)", value: notes, onChange: function (e) { return setNotes(e.target.value); } }),
        error && React.createElement("p", { className: "text-xs text-red-400" }, error),
        React.createElement("div", { className: "flex justify-end gap-2 pt-3", style: { borderTop: '1px solid var(--border)' } },
            React.createElement(Button, { variant: "ghost", onClick: onCancel }, "Cancel"),
            React.createElement(Button, { variant: "primary", onClick: handleSubmit }, "Save"))));
}
//# sourceMappingURL=ResourceForm.js.map