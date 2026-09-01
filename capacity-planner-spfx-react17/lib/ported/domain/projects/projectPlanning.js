export function getProjectType(project) {
    var _a;
    return (_a = project.projectType) !== null && _a !== void 0 ? _a : (project.status === 'opportunity' ? 'opportunity' : 'live');
}
export function isProjectIncludedInResourceCalculations(project) {
    var _a;
    if (!project)
        return true;
    if (getProjectType(project) === 'live')
        return true;
    return (_a = project.includeInResourceCalculations) !== null && _a !== void 0 ? _a : true;
}
export function filterResourceCalculationAllocations(allocations, projects) {
    var projectById = new Map(projects.map(function (project) { return [project.id, project]; }));
    return allocations.filter(function (allocation) {
        return isProjectIncludedInResourceCalculations(projectById.get(allocation.projectId));
    });
}
//# sourceMappingURL=projectPlanning.js.map