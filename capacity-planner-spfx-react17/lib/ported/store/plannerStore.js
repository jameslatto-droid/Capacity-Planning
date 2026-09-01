import { __assign, __awaiter, __generator, __read, __spreadArray } from "tslib";
import { create } from 'zustand';
import { LocalStoragePlannerRepository } from '../repositories/LocalStoragePlannerRepository';
import { getStoredUser } from '../utils/auth';
// SPFx port: always use LocalStorage repository (mock data mode)
// SPFX_PORT_TODO: wire SharePoint data provider here when ready
function createRepository() {
    return new LocalStoragePlannerRepository();
}
var repository = createRepository();
function currentUserId() {
    var _a;
    return (_a = getStoredUser()) === null || _a === void 0 ? void 0 : _a.id;
}
function stampCreated(record) {
    var _a, _b;
    var now = new Date().toISOString();
    var userId = currentUserId();
    return __assign(__assign({}, record), { createdAt: (_a = record.createdAt) !== null && _a !== void 0 ? _a : now, createdBy: (_b = record.createdBy) !== null && _b !== void 0 ? _b : userId, lastModifiedAt: now, lastModifiedBy: userId !== null && userId !== void 0 ? userId : record.lastModifiedBy });
}
function stampModified(record) {
    var now = new Date().toISOString();
    var userId = currentUserId();
    return __assign(__assign({}, record), { lastModifiedAt: now, lastModifiedBy: userId !== null && userId !== void 0 ? userId : record.lastModifiedBy });
}
function allocationChanged(previous, next) {
    return (previous.scenarioId !== next.scenarioId ||
        previous.projectId !== next.projectId ||
        previous.resourceId !== next.resourceId ||
        previous.role !== next.role ||
        previous.month !== next.month ||
        previous.hours !== next.hours ||
        previous.locked !== next.locked ||
        previous.notes !== next.notes);
}
function stampChangedAllocations(previous, next) {
    var previousById = new Map(previous.map(function (allocation) { return [allocation.id, allocation]; }));
    return next.map(function (allocation) {
        var _a, _b;
        var existing = previousById.get(allocation.id);
        if (!existing)
            return stampCreated(allocation);
        if (!allocationChanged(existing, allocation))
            return existing;
        return stampModified(__assign(__assign({}, allocation), { createdAt: (_a = allocation.createdAt) !== null && _a !== void 0 ? _a : existing.createdAt, createdBy: (_b = allocation.createdBy) !== null && _b !== void 0 ? _b : existing.createdBy }));
    });
}
export var usePlannerStore = create(function (set, get) { return ({
    resources: [],
    projects: [],
    allocations: [],
    scenarios: [],
    leaveEntries: [],
    activeScenarioId: 's-baseline',
    isLoading: false,
    error: null,
    loadAll: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, resources, projects, allocations, scenarios, leaveEntries, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        set({ isLoading: true, error: null });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all([
                                repository.loadResources(),
                                repository.loadProjects(),
                                repository.loadAllocations(),
                                repository.loadScenarios(),
                                repository.loadLeaveEntries(),
                            ])];
                    case 2:
                        _a = __read.apply(void 0, [_b.sent(), 5]), resources = _a[0], projects = _a[1], allocations = _a[2], scenarios = _a[3], leaveEntries = _a[4];
                        set({ resources: resources, projects: projects, allocations: allocations, scenarios: scenarios, leaveEntries: leaveEntries, isLoading: false });
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        set({ error: String(e_1), isLoading: false });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    },
    setResources: function (resources) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repository.saveResources(resources)];
                    case 1:
                        _a.sent();
                        set({ resources: resources });
                        return [2 /*return*/];
                }
            });
        });
    },
    addResource: function (resource) {
        return __awaiter(this, void 0, void 0, function () {
            var resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resources = __spreadArray(__spreadArray([], __read(get().resources), false), [stampCreated(resource)], false);
                        return [4 /*yield*/, repository.saveResources(resources)];
                    case 1:
                        _a.sent();
                        set({ resources: resources });
                        return [2 /*return*/];
                }
            });
        });
    },
    updateResource: function (resource) {
        return __awaiter(this, void 0, void 0, function () {
            var resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resources = get().resources.map(function (r) { return (r.id === resource.id ? stampModified(__assign(__assign({}, r), resource)) : r); });
                        return [4 /*yield*/, repository.saveResources(resources)];
                    case 1:
                        _a.sent();
                        set({ resources: resources });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteResource: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var resources;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        resources = get().resources.filter(function (r) { return r.id !== id; });
                        return [4 /*yield*/, repository.saveResources(resources)];
                    case 1:
                        _a.sent();
                        set({ resources: resources });
                        return [2 /*return*/];
                }
            });
        });
    },
    setProjects: function (projects) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repository.saveProjects(projects)];
                    case 1:
                        _a.sent();
                        set({ projects: projects });
                        return [2 /*return*/];
                }
            });
        });
    },
    addProject: function (project) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projects = __spreadArray(__spreadArray([], __read(get().projects), false), [stampCreated(project)], false);
                        return [4 /*yield*/, repository.saveProjects(projects)];
                    case 1:
                        _a.sent();
                        set({ projects: projects });
                        return [2 /*return*/];
                }
            });
        });
    },
    updateProject: function (project) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projects = get().projects.map(function (p) { return (p.id === project.id ? stampModified(__assign(__assign({}, p), project)) : p); });
                        return [4 /*yield*/, repository.saveProjects(projects)];
                    case 1:
                        _a.sent();
                        set({ projects: projects });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteProject: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var projects;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projects = get().projects.filter(function (p) { return p.id !== id; });
                        return [4 /*yield*/, repository.saveProjects(projects)];
                    case 1:
                        _a.sent();
                        set({ projects: projects });
                        return [2 /*return*/];
                }
            });
        });
    },
    setAllocations: function (allocations) {
        return __awaiter(this, void 0, void 0, function () {
            var stampedAllocations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        stampedAllocations = stampChangedAllocations(get().allocations, allocations);
                        return [4 /*yield*/, repository.saveAllocations(stampedAllocations)];
                    case 1:
                        _a.sent();
                        set({ allocations: stampedAllocations });
                        return [2 /*return*/];
                }
            });
        });
    },
    addAllocation: function (allocation) {
        return __awaiter(this, void 0, void 0, function () {
            var allocations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allocations = __spreadArray(__spreadArray([], __read(get().allocations), false), [stampCreated(allocation)], false);
                        return [4 /*yield*/, repository.saveAllocations(allocations)];
                    case 1:
                        _a.sent();
                        set({ allocations: allocations });
                        return [2 /*return*/];
                }
            });
        });
    },
    updateAllocation: function (allocation) {
        return __awaiter(this, void 0, void 0, function () {
            var allocations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allocations = get().allocations.map(function (a) { return (a.id === allocation.id ? stampModified(__assign(__assign({}, a), allocation)) : a); });
                        return [4 /*yield*/, repository.saveAllocations(allocations)];
                    case 1:
                        _a.sent();
                        set({ allocations: allocations });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteAllocation: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var allocations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allocations = get().allocations.filter(function (a) { return a.id !== id; });
                        return [4 /*yield*/, repository.saveAllocations(allocations)];
                    case 1:
                        _a.sent();
                        set({ allocations: allocations });
                        return [2 /*return*/];
                }
            });
        });
    },
    setScenarios: function (scenarios) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repository.saveScenarios(scenarios)];
                    case 1:
                        _a.sent();
                        set({ scenarios: scenarios });
                        return [2 /*return*/];
                }
            });
        });
    },
    addScenario: function (scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var scenarios;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scenarios = __spreadArray(__spreadArray([], __read(get().scenarios), false), [scenario], false);
                        return [4 /*yield*/, repository.saveScenarios(scenarios)];
                    case 1:
                        _a.sent();
                        set({ scenarios: scenarios });
                        return [2 /*return*/];
                }
            });
        });
    },
    updateScenario: function (scenario) {
        return __awaiter(this, void 0, void 0, function () {
            var scenarios;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scenarios = get().scenarios.map(function (s) { return (s.id === scenario.id ? scenario : s); });
                        return [4 /*yield*/, repository.saveScenarios(scenarios)];
                    case 1:
                        _a.sent();
                        set({ scenarios: scenarios });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteScenario: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var scenarios;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        scenarios = get().scenarios.filter(function (s) { return s.id !== id; });
                        return [4 /*yield*/, repository.saveScenarios(scenarios)];
                    case 1:
                        _a.sent();
                        set({ scenarios: scenarios });
                        return [2 /*return*/];
                }
            });
        });
    },
    setActiveScenario: function (id) {
        set({ activeScenarioId: id });
    },
    setLeaveEntries: function (entries) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, repository.saveLeaveEntries(entries)];
                    case 1:
                        _a.sent();
                        set({ leaveEntries: entries });
                        return [2 /*return*/];
                }
            });
        });
    },
    addLeaveEntry: function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var leaveEntries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaveEntries = __spreadArray(__spreadArray([], __read(get().leaveEntries), false), [stampCreated(entry)], false);
                        return [4 /*yield*/, repository.saveLeaveEntries(leaveEntries)];
                    case 1:
                        _a.sent();
                        set({ leaveEntries: leaveEntries });
                        return [2 /*return*/];
                }
            });
        });
    },
    updateLeaveEntry: function (entry) {
        return __awaiter(this, void 0, void 0, function () {
            var leaveEntries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaveEntries = get().leaveEntries.map(function (e) { return (e.id === entry.id ? stampModified(__assign(__assign({}, e), entry)) : e); });
                        return [4 /*yield*/, repository.saveLeaveEntries(leaveEntries)];
                    case 1:
                        _a.sent();
                        set({ leaveEntries: leaveEntries });
                        return [2 /*return*/];
                }
            });
        });
    },
    deleteLeaveEntry: function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var leaveEntries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaveEntries = get().leaveEntries.filter(function (e) { return e.id !== id; });
                        return [4 /*yield*/, repository.saveLeaveEntries(leaveEntries)];
                    case 1:
                        _a.sent();
                        set({ leaveEntries: leaveEntries });
                        return [2 /*return*/];
                }
            });
        });
    },
    resetToSeedData: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(repository instanceof LocalStoragePlannerRepository)) return [3 /*break*/, 2];
                        return [4 /*yield*/, repository.resetToSeedData()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, get().loadAll()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    },
}); });
//# sourceMappingURL=plannerStore.js.map