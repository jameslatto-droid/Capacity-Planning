// SPFX_PORT_TODO: Full SharePoint data provider implementation.
// Wire this when switching from dataMode: 'mock' to dataMode: 'sharepoint'.
//
// Target lists are defined in sharePointMappings.ts:
//   PlannerResources, PlannerProjects, PlannerScenarios, PlannerAllocations,
//   PlannerLeaveEntries, PlannerRolesDisciplines, PlannerAssumptions,
//   PlannerSettings, PlannerAuditLog
import { __awaiter, __generator } from "tslib";
import { SP_LISTS } from './sharePointMappings';
var SharePointPlannerRepository = /** @class */ (function () {
    function SharePointPlannerRepository(siteUrl) {
        this.siteUrl = siteUrl.replace(/\/$/, '');
    }
    SharePointPlannerRepository.prototype.getListItems = function (listName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // SPFX_PORT_TODO: implement via PnPjs or SPHttpClient
                throw new Error("SharePoint read not yet implemented for list: ".concat(listName));
            });
        });
    };
    SharePointPlannerRepository.prototype.upsertListItems = function (listName, items) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // SPFX_PORT_TODO: implement via PnPjs or SPHttpClient
                throw new Error("SharePoint write not yet implemented for list: ".concat(listName));
            });
        });
    };
    SharePointPlannerRepository.prototype.loadResources = function () {
        return this.getListItems(SP_LISTS.resources);
    };
    SharePointPlannerRepository.prototype.saveResources = function (resources) {
        return this.upsertListItems(SP_LISTS.resources, resources);
    };
    SharePointPlannerRepository.prototype.loadProjects = function () {
        return this.getListItems(SP_LISTS.projects);
    };
    SharePointPlannerRepository.prototype.saveProjects = function (projects) {
        return this.upsertListItems(SP_LISTS.projects, projects);
    };
    SharePointPlannerRepository.prototype.loadAllocations = function () {
        return this.getListItems(SP_LISTS.allocations);
    };
    SharePointPlannerRepository.prototype.saveAllocations = function (allocations) {
        return this.upsertListItems(SP_LISTS.allocations, allocations);
    };
    SharePointPlannerRepository.prototype.loadScenarios = function () {
        return this.getListItems(SP_LISTS.scenarios);
    };
    SharePointPlannerRepository.prototype.saveScenarios = function (scenarios) {
        return this.upsertListItems(SP_LISTS.scenarios, scenarios);
    };
    SharePointPlannerRepository.prototype.loadLeaveEntries = function () {
        return this.getListItems(SP_LISTS.leaveEntries);
    };
    SharePointPlannerRepository.prototype.saveLeaveEntries = function (entries) {
        return this.upsertListItems(SP_LISTS.leaveEntries, entries);
    };
    return SharePointPlannerRepository;
}());
export { SharePointPlannerRepository };
//# sourceMappingURL=sharePointDataProvider.js.map