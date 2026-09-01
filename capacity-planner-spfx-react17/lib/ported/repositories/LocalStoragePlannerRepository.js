import { __read, __spreadArray, __values } from "tslib";
import { seedResources } from '../data/seed/resources';
import { seedProjects } from '../data/seed/projects';
import { seedAllocations } from '../data/seed/allocations';
import { seedScenarios } from '../data/seed/scenarios';
// Bump this when seed data changes to force a reload of fresh data in the browser.
var SEED_VERSION = '4';
var KEYS = {
    version: 'erp:seed-version',
    resources: 'erp:resources',
    projects: 'erp:projects',
    allocations: 'erp:allocations',
    scenarios: 'erp:scenarios',
    leave: 'erp:leave',
};
var SEED_DATA_KEYS = [KEYS.resources, KEYS.projects, KEYS.allocations, KEYS.scenarios];
var ALL_DATA_KEYS = __spreadArray(__spreadArray([], __read(SEED_DATA_KEYS), false), [KEYS.leave], false);
function backupExistingData(storedVersion) {
    var e_1, _a;
    var backup = {};
    try {
        for (var ALL_DATA_KEYS_1 = __values(ALL_DATA_KEYS), ALL_DATA_KEYS_1_1 = ALL_DATA_KEYS_1.next(); !ALL_DATA_KEYS_1_1.done; ALL_DATA_KEYS_1_1 = ALL_DATA_KEYS_1.next()) {
            var key = ALL_DATA_KEYS_1_1.value;
            var value = localStorage.getItem(key);
            if (value !== null)
                backup[key] = value;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (ALL_DATA_KEYS_1_1 && !ALL_DATA_KEYS_1_1.done && (_a = ALL_DATA_KEYS_1.return)) _a.call(ALL_DATA_KEYS_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (Object.keys(backup).length === 0)
        return;
    var fromVersion = storedVersion !== null && storedVersion !== void 0 ? storedVersion : 'none';
    localStorage.setItem("erp:migration-backup:".concat(fromVersion, ":to:").concat(SEED_VERSION, ":").concat(new Date().toISOString()), JSON.stringify(backup));
}
function clearSeedData() {
    var e_2, _a;
    try {
        for (var SEED_DATA_KEYS_1 = __values(SEED_DATA_KEYS), SEED_DATA_KEYS_1_1 = SEED_DATA_KEYS_1.next(); !SEED_DATA_KEYS_1_1.done; SEED_DATA_KEYS_1_1 = SEED_DATA_KEYS_1.next()) {
            var key = SEED_DATA_KEYS_1_1.value;
            localStorage.removeItem(key);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (SEED_DATA_KEYS_1_1 && !SEED_DATA_KEYS_1_1.done && (_a = SEED_DATA_KEYS_1.return)) _a.call(SEED_DATA_KEYS_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
}
function clearAll() {
    var e_3, _a;
    try {
        for (var ALL_DATA_KEYS_2 = __values(ALL_DATA_KEYS), ALL_DATA_KEYS_2_1 = ALL_DATA_KEYS_2.next(); !ALL_DATA_KEYS_2_1.done; ALL_DATA_KEYS_2_1 = ALL_DATA_KEYS_2.next()) {
            var key = ALL_DATA_KEYS_2_1.value;
            localStorage.removeItem(key);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (ALL_DATA_KEYS_2_1 && !ALL_DATA_KEYS_2_1.done && (_a = ALL_DATA_KEYS_2.return)) _a.call(ALL_DATA_KEYS_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
}
function migrateIfNeeded() {
    var stored = localStorage.getItem(KEYS.version);
    if (stored !== SEED_VERSION) {
        backupExistingData(stored);
        clearSeedData();
        localStorage.setItem(KEYS.version, SEED_VERSION);
    }
}
function readKey(key, fallback) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    }
    catch (_a) {
        return fallback;
    }
}
function writeKey(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
var LocalStoragePlannerRepository = /** @class */ (function () {
    function LocalStoragePlannerRepository() {
        migrateIfNeeded();
    }
    LocalStoragePlannerRepository.prototype.loadResources = function () {
        return Promise.resolve(readKey(KEYS.resources, seedResources));
    };
    LocalStoragePlannerRepository.prototype.saveResources = function (resources) {
        writeKey(KEYS.resources, resources);
        return Promise.resolve();
    };
    LocalStoragePlannerRepository.prototype.loadProjects = function () {
        return Promise.resolve(readKey(KEYS.projects, seedProjects));
    };
    LocalStoragePlannerRepository.prototype.saveProjects = function (projects) {
        writeKey(KEYS.projects, projects);
        return Promise.resolve();
    };
    LocalStoragePlannerRepository.prototype.loadAllocations = function () {
        return Promise.resolve(readKey(KEYS.allocations, seedAllocations));
    };
    LocalStoragePlannerRepository.prototype.saveAllocations = function (allocations) {
        writeKey(KEYS.allocations, allocations);
        return Promise.resolve();
    };
    LocalStoragePlannerRepository.prototype.loadScenarios = function () {
        return Promise.resolve(readKey(KEYS.scenarios, seedScenarios));
    };
    LocalStoragePlannerRepository.prototype.saveScenarios = function (scenarios) {
        writeKey(KEYS.scenarios, scenarios);
        return Promise.resolve();
    };
    LocalStoragePlannerRepository.prototype.loadLeaveEntries = function () {
        return Promise.resolve(readKey(KEYS.leave, []));
    };
    LocalStoragePlannerRepository.prototype.saveLeaveEntries = function (entries) {
        writeKey(KEYS.leave, entries);
        return Promise.resolve();
    };
    LocalStoragePlannerRepository.prototype.resetToSeedData = function () {
        clearAll();
        localStorage.setItem(KEYS.version, SEED_VERSION);
        return Promise.resolve();
    };
    return LocalStoragePlannerRepository;
}());
export { LocalStoragePlannerRepository };
//# sourceMappingURL=LocalStoragePlannerRepository.js.map