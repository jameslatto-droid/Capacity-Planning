import { __read } from "tslib";
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
var Ctx = createContext({ theme: 'dark', toggle: function () { }, isDark: true });
export function ThemeProvider(_a) {
    var children = _a.children;
    var _b = __read(useState(function () { var _a; return (_a = localStorage.getItem('erp:theme')) !== null && _a !== void 0 ? _a : 'dark'; }), 2), theme = _b[0], setTheme = _b[1];
    useEffect(function () {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('erp:theme', theme);
    }, [theme]);
    var toggle = function () { return setTheme(function (t) { return (t === 'dark' ? 'light' : 'dark'); }); };
    return React.createElement(Ctx.Provider, { value: { theme: theme, toggle: toggle, isDark: theme === 'dark' } }, children);
}
export var useTheme = function () { return useContext(Ctx); };
//# sourceMappingURL=ThemeContext.js.map