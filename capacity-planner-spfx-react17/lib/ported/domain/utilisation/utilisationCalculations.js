import { calculateMonthlyProductiveCapacity } from '../capacity/capacityCalculations';
import { calculateMonthlyCapacityWithLeave } from '../capacity/leaveCalculations';
export function getUtilisationStatus(utilisation) {
    if (utilisation < 0.6)
        return 'underused';
    if (utilisation < 0.85)
        return 'healthy';
    if (utilisation < 1.0)
        return 'high';
    if (utilisation <= 1.15)
        return 'overloaded';
    return 'critical';
}
/** Resolve capacity for a resource in a month, using actual leave when available. */
function resolveCapacity(resource, month, assumptions, leaveEntries) {
    if (leaveEntries && leaveEntries.length > 0) {
        return calculateMonthlyCapacityWithLeave(resource, month, leaveEntries, assumptions);
    }
    return calculateMonthlyProductiveCapacity(resource, assumptions);
}
export function calculatePersonUtilisation(resource, allocations, assumptions, month, leaveEntries) {
    var capacityHours = resolveCapacity(resource, month, assumptions, leaveEntries);
    var allocatedHours = allocations
        .filter(function (a) { return a.resourceId === resource.id && a.month === month; })
        .reduce(function (sum, a) { return sum + a.hours; }, 0);
    var utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0;
    var overloadHours = Math.max(0, allocatedHours - capacityHours);
    return {
        resourceId: resource.id,
        month: month,
        allocatedHours: allocatedHours,
        capacityHours: capacityHours,
        utilisation: utilisation,
        overloadHours: overloadHours,
        status: getUtilisationStatus(utilisation),
    };
}
export function calculatePersonUtilisationAllMonths(resource, allocations, assumptions, months, leaveEntries) {
    return months.map(function (month) {
        return calculatePersonUtilisation(resource, allocations, assumptions, month, leaveEntries);
    });
}
export function calculateRoleUtilisation(role, resources, allocations, assumptions, month, leaveEntries) {
    var roleResources = resources.filter(function (r) { var _a; return r.active && (r.role === role || ((_a = r.secondaryRoles) === null || _a === void 0 ? void 0 : _a.includes(role))); });
    var capacityHours = roleResources.reduce(function (sum, r) { return sum + resolveCapacity(r, month, assumptions, leaveEntries); }, 0);
    var allocatedHours = allocations
        .filter(function (a) { return a.role === role && a.month === month; })
        .reduce(function (sum, a) { return sum + a.hours; }, 0);
    var utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0;
    var overloadHours = Math.max(0, allocatedHours - capacityHours);
    return {
        role: role,
        month: month,
        allocatedHours: allocatedHours,
        capacityHours: capacityHours,
        utilisation: utilisation,
        overloadHours: overloadHours,
        status: getUtilisationStatus(utilisation),
    };
}
export function calculateTeamUtilisation(resources, allocations, assumptions, month, leaveEntries) {
    var activeResources = resources.filter(function (r) { return r.active; });
    var capacityHours = activeResources.reduce(function (sum, r) { return sum + resolveCapacity(r, month, assumptions, leaveEntries); }, 0);
    var allocatedHours = allocations
        .filter(function (a) { return a.month === month; })
        .reduce(function (sum, a) { return sum + a.hours; }, 0);
    var utilisation = capacityHours > 0 ? allocatedHours / capacityHours : 0;
    var overloadHours = Math.max(0, allocatedHours - capacityHours);
    return {
        month: month,
        allocatedHours: allocatedHours,
        capacityHours: capacityHours,
        utilisation: utilisation,
        overloadHours: overloadHours,
        status: getUtilisationStatus(utilisation),
    };
}
export function identifyOverloads(personResults) {
    return personResults.filter(function (r) { return r.status === 'overloaded' || r.status === 'critical'; });
}
export function calculateContractorRequirement(overloadHours, monthlyFteCapacity) {
    return {
        contractorHoursRequired: overloadHours,
        contractorFte: monthlyFteCapacity > 0 ? overloadHours / monthlyFteCapacity : 0,
    };
}
//# sourceMappingURL=utilisationCalculations.js.map