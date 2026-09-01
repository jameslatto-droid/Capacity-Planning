import { __read } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRESET_USERS } from '../../utils/auth';
import { useAuth } from '../../utils/AuthContext';
export function LoginPage() {
    var _a, _b;
    var login = useAuth().login;
    var _c = __read(useState((_b = (_a = PRESET_USERS[0]) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : ''), 2), userId = _c[0], setUserId = _c[1];
    var _d = __read(useState(''), 2), password = _d[0], setPassword = _d[1];
    var _e = __read(useState(''), 2), error = _e[0], setError = _e[1];
    function handleSubmit(event) {
        event.preventDefault();
        if (login(userId, password)) {
            setError('');
            setPassword('');
            return;
        }
        setError('Invalid user or password');
    }
    var pageStyle = {
        '--login-bg-url': 'none',
    };
    return (React.createElement("div", { className: "login-page", style: pageStyle },
        React.createElement(motion.form, { onSubmit: handleSubmit, initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] }, className: "login-card" },
            React.createElement("div", { className: "login-header" },
                React.createElement("h1", { className: "login-title" }, "Resource Planner"),
                React.createElement("p", { className: "login-subtitle" }, "Sign in to manage capacity, allocation and project demand.")),
            React.createElement("div", { className: "login-fields" },
                React.createElement("label", { className: "login-field" },
                    React.createElement("span", { className: "login-label" }, "User"),
                    React.createElement("select", { className: "login-input", value: userId, onChange: function (event) { return setUserId(event.target.value); } }, PRESET_USERS.map(function (user) { return (React.createElement("option", { key: user.id, value: user.id }, user.displayName)); }))),
                React.createElement("label", { className: "login-field" },
                    React.createElement("span", { className: "login-label" }, "Password"),
                    React.createElement("input", { className: "login-input", type: "password", value: password, onChange: function (event) { return setPassword(event.target.value); }, autoFocus: true })),
                error && React.createElement("div", { className: "login-error" }, error),
                React.createElement("button", { type: "submit", className: "login-button" }, "Sign in")))));
}
//# sourceMappingURL=LoginPage.js.map