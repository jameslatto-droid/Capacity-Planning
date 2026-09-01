import { __assign, __rest } from "tslib";
import * as React from 'react';
export function Select(_a) {
    var label = _a.label, options = _a.options, _b = _a.className, className = _b === void 0 ? '' : _b, extStyle = _a.style, props = __rest(_a, ["label", "options", "className", "style"]);
    return (React.createElement("label", { className: "flex flex-col gap-1.5" },
        label && (React.createElement("span", { className: "text-[11px] font-semibold uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label)),
        React.createElement("select", __assign({}, props, { className: "rounded-lg px-3 py-2 text-sm transition-all appearance-none ".concat(className), style: __assign({ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }, extStyle) }), options.map(function (o) { return (React.createElement("option", { key: o.value, value: o.value, style: { background: 'var(--surface)' } }, o.label)); }))));
}
//# sourceMappingURL=Select.js.map