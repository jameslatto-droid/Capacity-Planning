import { __read, __values } from "tslib";
export function findOverloadedPersonMonths(results) {
    return results.filter(function (r) { return r.status === 'overloaded' || r.status === 'critical'; });
}
export function findAvailableCapacity(resources, results, month) {
    return resources
        .filter(function (r) { return r.active; })
        .map(function (r) {
        var _a, _b;
        var result = results.find(function (ur) { return ur.resourceId === r.id && ur.month === month; });
        var allocated = (_a = result === null || result === void 0 ? void 0 : result.allocatedHours) !== null && _a !== void 0 ? _a : 0;
        var capacity = (_b = result === null || result === void 0 ? void 0 : result.capacityHours) !== null && _b !== void 0 ? _b : 0;
        var availableHours = Math.max(0, capacity - allocated);
        return { resource: r, availableHours: availableHours };
    })
        .filter(function (entry) { return entry.availableHours > 0; });
}
export function findCompatibleResources(overloadedResource, candidates, requiredRole) {
    return candidates.filter(function (r) {
        var _a;
        return r.id !== overloadedResource.id &&
            r.active &&
            (r.role === requiredRole || ((_a = r.secondaryRoles) === null || _a === void 0 ? void 0 : _a.includes(requiredRole)));
    });
}
export function suggestSameRoleReallocations(overloads, allResources, allResults, _allocations) {
    var e_1, _a;
    var _b;
    var recommendations = [];
    var _loop_1 = function (overload) {
        var e_2, _c;
        if (overload.overloadHours <= 0)
            return "continue";
        var overloadedResource = allResources.find(function (r) { return r.id === overload.resourceId; });
        if (!overloadedResource)
            return "continue";
        var available = findAvailableCapacity(allResources, allResults, overload.month);
        try {
            for (var available_1 = (e_2 = void 0, __values(available)), available_1_1 = available_1.next(); !available_1_1.done; available_1_1 = available_1.next()) {
                var _d = available_1_1.value, candidate = _d.resource, availableHours = _d.availableHours;
                var isCompatible = candidate.role === overloadedResource.role ||
                    ((_b = candidate.secondaryRoles) === null || _b === void 0 ? void 0 : _b.includes(overloadedResource.role));
                if (!isCompatible)
                    continue;
                var hoursToMove = Math.min(overload.overloadHours, availableHours);
                var type = candidate.role === overloadedResource.role
                    ? 'same-role-reallocation'
                    : 'secondary-role-reallocation';
                recommendations.push({
                    type: type,
                    overloadedResourceId: overload.resourceId,
                    month: overload.month,
                    hoursToMove: hoursToMove,
                    targetResourceId: candidate.id,
                    description: "Move ".concat(hoursToMove.toFixed(0), "h from ").concat(overloadedResource.displayName, " to ").concat(candidate.displayName, " in ").concat(overload.month),
                });
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (available_1_1 && !available_1_1.done && (_c = available_1.return)) _c.call(available_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    try {
        for (var overloads_1 = __values(overloads), overloads_1_1 = overloads_1.next(); !overloads_1_1.done; overloads_1_1 = overloads_1.next()) {
            var overload = overloads_1_1.value;
            _loop_1(overload);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (overloads_1_1 && !overloads_1_1.done && (_a = overloads_1.return)) _a.call(overloads_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return recommendations;
}
export function suggestMonthSmoothing(overloads, allResults, allocations, _assumptions) {
    var e_3, _a;
    var recommendations = [];
    var _loop_2 = function (overload) {
        var e_4, _b;
        if (overload.overloadHours <= 0)
            return "continue";
        var flexibleAllocations = allocations.filter(function (a) {
            return a.resourceId === overload.resourceId &&
                a.month === overload.month &&
                !a.locked;
        });
        var _loop_3 = function (alloc) {
            var nextMonth = getNextMonth(overload.month);
            var nextMonthResult = allResults.find(function (r) { return r.resourceId === overload.resourceId && r.month === nextMonth; });
            var nextAvailable = nextMonthResult
                ? Math.max(0, nextMonthResult.capacityHours - nextMonthResult.allocatedHours)
                : 0;
            if (nextAvailable > 0) {
                var hoursToMove = Math.min(alloc.hours, overload.overloadHours);
                recommendations.push({
                    type: 'month-smoothing',
                    overloadedResourceId: overload.resourceId,
                    month: overload.month,
                    hoursToMove: hoursToMove,
                    targetMonth: nextMonth,
                    description: "Move ".concat(hoursToMove.toFixed(0), "h of flexible work from ").concat(overload.month, " to ").concat(nextMonth),
                });
            }
        };
        try {
            for (var flexibleAllocations_1 = (e_4 = void 0, __values(flexibleAllocations)), flexibleAllocations_1_1 = flexibleAllocations_1.next(); !flexibleAllocations_1_1.done; flexibleAllocations_1_1 = flexibleAllocations_1.next()) {
                var alloc = flexibleAllocations_1_1.value;
                _loop_3(alloc);
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (flexibleAllocations_1_1 && !flexibleAllocations_1_1.done && (_b = flexibleAllocations_1.return)) _b.call(flexibleAllocations_1);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    try {
        for (var overloads_2 = __values(overloads), overloads_2_1 = overloads_2.next(); !overloads_2_1.done; overloads_2_1 = overloads_2.next()) {
            var overload = overloads_2_1.value;
            _loop_2(overload);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (overloads_2_1 && !overloads_2_1.done && (_a = overloads_2.return)) _a.call(overloads_2);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return recommendations;
}
export function calculateResidualOverload(overloads, recommendations) {
    var totalOverload = overloads.reduce(function (sum, o) { return sum + o.overloadHours; }, 0);
    var totalRecommended = recommendations.reduce(function (sum, r) { return sum + r.hoursToMove; }, 0);
    return Math.max(0, totalOverload - totalRecommended);
}
export function calculateContractorFteRequirement(residualOverload, monthlyFteCapacity) {
    if (residualOverload <= 0)
        return [];
    return [
        {
            month: 'aggregate',
            residualOverloadHours: residualOverload,
            contractorFte: monthlyFteCapacity > 0 ? residualOverload / monthlyFteCapacity : 0,
        },
    ];
}
function getNextMonth(month) {
    var _a = __read(month.split('-').map(Number), 2), year = _a[0], m = _a[1];
    var date = new Date(year, (m - 1) + 1, 1);
    return "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
}
//# sourceMappingURL=optimisationRules.js.map