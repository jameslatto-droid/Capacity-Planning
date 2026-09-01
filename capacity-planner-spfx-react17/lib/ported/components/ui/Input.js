import { __assign, __rest } from "tslib";
import * as React from 'react';
export function Input(_a) {
    var label = _a.label, error = _a.error, _b = _a.className, className = _b === void 0 ? '' : _b, extStyle = _a.style, props = __rest(_a, ["label", "error", "className", "style"]);
    return (React.createElement("label", { className: "flex flex-col gap-1.5" },
        label && (React.createElement("span", { className: "text-[11px] font-semibold uppercase tracking-wider", style: { color: 'var(--text-faint)' } }, label)),
        React.createElement("input", __assign({}, props, { className: "rounded-lg px-3 py-2 text-sm transition-all ".concat(className), style: __assign({ background: 'var(--input-bg)', border: "1px solid ".concat(error ? 'rgba(220,38,38,0.5)' : 'var(--border)'), color: 'var(--text)' }, extStyle) })),
        error && React.createElement("span", { className: "text-xs text-red-500" }, error)));
}
//# sourceMappingURL=Input.js.map