import { __read } from "tslib";
import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { authenticateUser, clearStoredUser, getStoredUser, storeUser, } from './auth';
var AuthContext = createContext(null);
export function AuthProvider(_a) {
    var children = _a.children;
    var _b = __read(useState(function () { return getStoredUser(); }), 2), currentUser = _b[0], setCurrentUser = _b[1];
    function login(userId, password) {
        var user = authenticateUser(userId, password);
        if (!user)
            return false;
        storeUser(user);
        setCurrentUser(user);
        return true;
    }
    function logout() {
        clearStoredUser();
        setCurrentUser(null);
    }
    return (React.createElement(AuthContext.Provider, { value: { currentUser: currentUser, login: login, logout: logout } }, children));
}
export function useAuth() {
    var context = useContext(AuthContext);
    if (!context)
        throw new Error('useAuth must be used inside AuthProvider');
    return context;
}
//# sourceMappingURL=AuthContext.js.map