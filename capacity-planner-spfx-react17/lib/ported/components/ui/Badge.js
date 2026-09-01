import * as React from 'react';
var styles = {
    default: { color: 'var(--text-muted)', bg: 'var(--surface-2)', border: 'var(--border-s)' },
    violet: { color: 'var(--accent-text)', bg: 'var(--accent-light)', border: 'rgba(124,58,237,0.3)' },
    emerald: { color: '#059669', bg: 'rgba(5,150,105,0.12)', border: 'rgba(5,150,105,0.3)' },
    amber: { color: '#d97706', bg: 'rgba(217,119,6,0.12)', border: 'rgba(217,119,6,0.3)' },
    red: { color: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)' },
    blue: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
};
export function Badge(_a) {
    var children = _a.children, _b = _a.variant, variant = _b === void 0 ? 'default' : _b;
    var s = styles[variant];
    return (React.createElement("span", { className: "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold", style: { color: s.color, background: s.bg, border: "1px solid ".concat(s.border) } }, children));
}
//# sourceMappingURL=Badge.js.map