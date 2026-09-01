import * as React from 'react';
import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { TopBar } from '../components/layout/TopBar';
import { AppRoutes } from './routes';
import { usePlannerStore } from '../store/plannerStore';
import { ThemeProvider, useTheme } from '../utils/ThemeContext';
import { AuthProvider, useAuth } from '../utils/AuthContext';
import { BackgroundProvider, useBackground } from '../utils/BackgroundContext';
import { LoginPage } from '../features/auth/LoginPage';
function AppBg() {
    var bgImage = useBackground().bgImage;
    var isDark = useTheme().isDark;
    if (!isDark)
        return null;
    return (React.createElement("div", { "aria-hidden": "true", style: {
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            background: [
                'radial-gradient(circle at 28% 28%, rgba(255,175,77,0.14), transparent 36%)',
                'radial-gradient(circle at 74% 62%, rgba(255,128,36,0.09), transparent 34%)',
                'linear-gradient(120deg, rgba(4,5,8,0.94) 0%, rgba(10,10,12,0.83) 48%, rgba(30,16,4,0.76) 100%)',
                '#07080b',
            ].join(', '),
        } }));
}
function Inner(_a) {
    var spfxContext = _a.spfxContext;
    var currentUser = useAuth().currentUser;
    var _b = usePlannerStore(), loadAll = _b.loadAll, isLoading = _b.isLoading, error = _b.error;
    useEffect(function () {
        if (currentUser)
            loadAll();
    }, [currentUser, loadAll]);
    if (!currentUser)
        return React.createElement(LoginPage, null);
    if (isLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { style: { color: 'var(--text-muted)' }, className: "text-sm" }, "Loading\u2026")));
    }
    if (error) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement("div", { className: "text-red-500 text-sm" },
                "Error: ",
                error)));
    }
    return (React.createElement(HashRouter, null,
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', minHeight: '100vh' } },
            React.createElement(TopBar, { spfxContext: spfxContext }),
            React.createElement("div", { style: { flex: 1, overflow: 'auto', minHeight: 0 } },
                React.createElement(AppRoutes, null)))));
}
export function App(_a) {
    var spfxContext = _a.spfxContext;
    return (React.createElement(ThemeProvider, null,
        React.createElement(BackgroundProvider, null,
            React.createElement(AuthProvider, null,
                React.createElement(AppBg, null),
                React.createElement(Inner, { spfxContext: spfxContext })))));
}
//# sourceMappingURL=App.js.map