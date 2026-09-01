import * as React from 'react';
import { motion } from 'framer-motion';
export function PageLayout(_a) {
    var title = _a.title, subtitle = _a.subtitle, actions = _a.actions, children = _a.children;
    return (React.createElement(motion.div, { className: "flex-1 flex flex-col min-h-full", style: { background: 'var(--bg)' }, initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 } },
        React.createElement("div", { className: "px-8 pt-5 pb-4 flex items-start justify-between gap-4", style: { borderBottom: '1px solid var(--border)' } },
            React.createElement(motion.div, { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } },
                React.createElement("h1", { className: "text-xl font-bold tracking-tight", style: { color: 'var(--text)' } }, title),
                subtitle && (React.createElement("p", { className: "mt-0.5", style: { fontSize: 11, color: 'var(--text-faint)' } }, subtitle))),
            actions && (React.createElement("div", { className: "flex items-center gap-3 mt-0.5 shrink-0" }, actions))),
        React.createElement("div", { className: "flex-1 px-8 py-6" }, children)));
}
//# sourceMappingURL=PageLayout.js.map