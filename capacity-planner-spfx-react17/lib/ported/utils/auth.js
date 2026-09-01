export var PRESET_USERS = [
    { id: 'onur', displayName: 'Onur', initials: 'OK', password: 'onur2026' },
    { id: 'tim', displayName: 'Tim', initials: 'TI', password: 'tim2026' },
    { id: 'dion', displayName: 'Dion', initials: 'DI', password: 'dion2026' },
    { id: 'jim', displayName: 'Jim', initials: 'JI', password: 'jim2026' },
];
var AUTH_KEY = 'erp:current-user';
function publicUser(user) {
    return { id: user.id, displayName: user.displayName, initials: user.initials };
}
function storageAvailable() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
export function authenticateUser(userId, password) {
    var user = PRESET_USERS.find(function (candidate) { return candidate.id === userId; });
    if (!user || user.password !== password)
        return null;
    return publicUser(user);
}
export function getStoredUser() {
    if (!storageAvailable())
        return null;
    try {
        var raw = window.localStorage.getItem(AUTH_KEY);
        if (!raw)
            return null;
        var parsed_1 = JSON.parse(raw);
        var user = PRESET_USERS.find(function (candidate) { return candidate.id === parsed_1.id; });
        return user ? publicUser(user) : null;
    }
    catch (_a) {
        return null;
    }
}
export function storeUser(user) {
    if (!storageAvailable())
        return;
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}
export function clearStoredUser() {
    if (!storageAvailable())
        return;
    window.localStorage.removeItem(AUTH_KEY);
}
export function formatAuditUser(userId) {
    var _a, _b;
    if (!userId)
        return 'Unknown';
    return (_b = (_a = PRESET_USERS.find(function (user) { return user.id === userId; })) === null || _a === void 0 ? void 0 : _a.displayName) !== null && _b !== void 0 ? _b : userId;
}
//# sourceMappingURL=auth.js.map