import { LocalStoragePlannerRepository } from '../repositories/LocalStoragePlannerRepository';
var _instance = null;
export function getDataProvider(config) {
    var _a;
    if (_instance)
        return _instance;
    var mode = (_a = config === null || config === void 0 ? void 0 : config.mode) !== null && _a !== void 0 ? _a : 'mock';
    if (mode === 'sharepoint') {
        // SPFX_PORT_TODO: import and return SharePointPlannerRepository when ready
        // const { SharePointPlannerRepository } = require('./sharePointDataProvider')
        // _instance = new SharePointPlannerRepository(config.siteUrl)
        console.warn('[CapacityPlanner] SharePoint data provider not yet wired — falling back to mock');
    }
    _instance = new LocalStoragePlannerRepository();
    return _instance;
}
export function resetDataProvider() {
    _instance = null;
}
//# sourceMappingURL=dataProvider.js.map