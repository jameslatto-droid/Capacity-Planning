import { __assign, __rest } from "tslib";
import * as React from 'react';
import { motion } from 'framer-motion';
export function Button(_a) {
    var _b = _a.variant, variant = _b === void 0 ? 'secondary' : _b, _c = _a.size, size = _c === void 0 ? 'md' : _c, _d = _a.className, className = _d === void 0 ? '' : _d, children = _a.children, extStyle = _a.style, props = __rest(_a, ["variant", "size", "className", "children", "style"]);
    var base = 'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40';
    var sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';
    var varStyle = variant === 'primary'
        ? { background: 'var(--accent)', color: '#fff', boxShadow: '0 0 16px rgba(124,58,237,0.25)' }
        : variant === 'danger'
            ? { background: 'rgba(220,38,38,0.08)', color: '#f87171', border: '1px solid rgba(220,38,38,0.2)' }
            : variant === 'ghost'
                ? { color: 'var(--text-muted)' }
                : { background: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' };
    return (React.createElement(motion.button, __assign({ whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 } }, props, { className: "".concat(base, " ").concat(sz, " ").concat(className), style: __assign(__assign({}, varStyle), extStyle) }), children));
}
//# sourceMappingURL=Button.js.map