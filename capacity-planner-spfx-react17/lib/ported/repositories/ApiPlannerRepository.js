import { __awaiter, __generator } from "tslib";
var ApiPlannerRepository = /** @class */ (function () {
    function ApiPlannerRepository(baseUrl) {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }
    ApiPlannerRepository.prototype.get = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(path))];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("GET ".concat(path, " failed: ").concat(res.status));
                        return [2 /*return*/, res.json()];
                }
            });
        });
    };
    ApiPlannerRepository.prototype.put = function (path, body) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.baseUrl).concat(path), {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body),
                        })];
                    case 1:
                        res = _a.sent();
                        if (!res.ok)
                            throw new Error("PUT ".concat(path, " failed: ").concat(res.status));
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiPlannerRepository.prototype.loadResources = function () {
        return this.get('/api/resources');
    };
    ApiPlannerRepository.prototype.saveResources = function (resources) {
        return this.put('/api/resources', resources);
    };
    ApiPlannerRepository.prototype.loadProjects = function () {
        return this.get('/api/projects');
    };
    ApiPlannerRepository.prototype.saveProjects = function (projects) {
        return this.put('/api/projects', projects);
    };
    ApiPlannerRepository.prototype.loadAllocations = function () {
        return this.get('/api/allocations');
    };
    ApiPlannerRepository.prototype.saveAllocations = function (allocations) {
        return this.put('/api/allocations', allocations);
    };
    ApiPlannerRepository.prototype.loadScenarios = function () {
        return this.get('/api/scenarios');
    };
    ApiPlannerRepository.prototype.saveScenarios = function (scenarios) {
        return this.put('/api/scenarios', scenarios);
    };
    ApiPlannerRepository.prototype.loadLeaveEntries = function () {
        return this.get('/api/leave');
    };
    ApiPlannerRepository.prototype.saveLeaveEntries = function (entries) {
        return this.put('/api/leave', entries);
    };
    return ApiPlannerRepository;
}());
export { ApiPlannerRepository };
//# sourceMappingURL=ApiPlannerRepository.js.map