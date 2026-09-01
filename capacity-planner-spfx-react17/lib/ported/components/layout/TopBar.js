import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../utils/ThemeContext';
import { useAuth } from '../../utils/AuthContext';
var navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/resources', label: 'Team' },
    { to: '/leave', label: 'Leave' },
    { to: '/projects', label: 'Projects' },
    { to: '/allocations', label: 'Planning' },
    { to: '/optimisation', label: 'Optimisation' },
    { to: '/reports', label: 'Reports' },
];
export function TopBar(_a) {
    var spfxContext = _a.spfxContext;
    var _b = useTheme(), toggle = _b.toggle, isDark = _b.isDark;
    var _c = useAuth(), currentUser = _c.currentUser, logout = _c.logout;
    var appName = 'Resource Planner';
    return (React.createElement("header", { style: {
            height: 52,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'stretch',
            paddingLeft: 20,
            paddingRight: 16,
            background: 'var(--sidebar-bg)',
            borderBottom: '1px solid var(--border-s)',
            boxShadow: '0 1px 0 var(--border), 0 2px 6px rgba(0,0,0,0.06)',
        } },
        React.createElement("div", { className: "gradient-text text-sm font-semibold tracking-tight", style: { display: 'flex', alignItems: 'center', marginRight: 28, whiteSpace: 'nowrap' } }, appName),
        React.createElement("nav", { style: { display: 'flex', alignItems: 'stretch', flex: 1 } }, navItems.map(function (item) { return (React.createElement(NavLink, { key: item.to, to: item.to, end: item.to === '/', style: function (_a) {
                var isActive = _a.isActive;
                return ({
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 13px',
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                    borderBottom: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'color 0.12s, border-color 0.12s',
                });
            } }, item.label)); })),
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 8 } },
            currentUser && (React.createElement("div", { className: "hidden sm:flex items-center gap-2 rounded-lg px-2.5 py-1.5", style: { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' } },
                React.createElement("span", { className: "inline-flex items-center justify-center rounded-full text-[10px] font-bold", style: { width: 22, height: 22, background: 'var(--accent-light)', color: 'var(--accent-text)' } }, currentUser.initials),
                React.createElement("span", { className: "text-xs font-medium" }, currentUser.displayName))),
            React.createElement(motion.button, { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 }, onClick: toggle, title: isDark ? 'Switch to light mode' : 'Switch to dark mode', style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: 'var(--surface-2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                } },
                React.createElement("span", null, isDark ? '☀' : '◑'),
                React.createElement("span", null, isDark ? 'Light' : 'Dark')),
            React.createElement(motion.button, { whileHover: { scale: 1.04 }, whileTap: { scale: 0.96 }, onClick: logout, title: "Sign out", style: {
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: 'pointer',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                } }, "Sign out"))));
}
//# sourceMappingURL=TopBar.js.map