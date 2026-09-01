import { __read } from "tslib";
import { calculateMonthlyProductiveCapacity } from './capacityCalculations';
/** Format a Date as YYYY-MM-DD in LOCAL time (avoids UTC shift via toISOString). */
function localDateStr(d) {
    return "".concat(d.getFullYear(), "-").concat(String(d.getMonth() + 1).padStart(2, '0'), "-").concat(String(d.getDate()).padStart(2, '0'));
}
/** Count Mon–Fri days between two ISO date strings (inclusive). */
export function countWorkingDays(startDate, endDate) {
    // Parse as local midnight — append T00:00:00 so JS uses local timezone, not UTC
    var start = new Date(startDate + 'T00:00:00');
    var end = new Date(endDate + 'T00:00:00');
    var count = 0;
    var cur = new Date(start);
    while (cur <= end) {
        var d = cur.getDay();
        if (d !== 0 && d !== 6)
            count++;
        cur.setDate(cur.getDate() + 1);
    }
    return count;
}
/**
 * Total leave hours for a resource in a given month (YYYY-MM).
 * Entries that span multiple months are clamped to the target month.
 * Part-time workers are pro-rated by workingDaysPerWeek / 5.
 */
export function getLeaveHoursInMonth(resource, month, leaveEntries) {
    var _a = __read(month.split('-').map(Number), 2), y = _a[0], m = _a[1];
    var monthStart = new Date(y, m - 1, 1);
    var monthEnd = new Date(y, m, 0); // last day of month
    var hoursPerDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek;
    var partTimeRatio = resource.workingDaysPerWeek / 5;
    return leaveEntries
        .filter(function (e) { return e.resourceId === resource.id; })
        .reduce(function (total, entry) {
        var ls = new Date(entry.startDate + 'T00:00:00');
        var le = new Date(entry.endDate + 'T00:00:00');
        // Clamp to this month
        var from = ls < monthStart ? monthStart : ls;
        var to = le > monthEnd ? monthEnd : le;
        if (from > to)
            return total;
        var rawDays = countWorkingDays(localDateStr(from), localDateStr(to));
        var actualDays = rawDays * partTimeRatio;
        return total + actualDays * hoursPerDay;
    }, 0);
}
/**
 * Total leave working-days for a resource in a given month (display use).
 */
export function getLeaveDaysInMonth(resource, month, leaveEntries) {
    var hours = getLeaveHoursInMonth(resource, month, leaveEntries);
    var hoursPerDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek;
    return hoursPerDay > 0 ? Math.round((hours / hoursPerDay) * 10) / 10 : 0;
}
/**
 * Working days for one entry (for display in the form).
 * Pro-rated for part-time workers.
 */
export function getEntryWorkingDays(entry, resource) {
    var raw = countWorkingDays(entry.startDate, entry.endDate);
    return Math.round(raw * (resource.workingDaysPerWeek / 5) * 10) / 10;
}
/**
 * Monthly productive capacity using actual leave entries.
 *
 * When leave entries exist for this resource in this month, actual leave
 * hours replace the assumption-based average leave deduction.
 * When no entries exist, falls back to the assumption-based formula.
 */
export function calculateMonthlyCapacityWithLeave(resource, month, leaveEntries, assumptions) {
    var resourceEntries = leaveEntries.filter(function (e) { return e.resourceId === resource.id; });
    if (resourceEntries.length === 0) {
        // No leave tracked for this person — use assumption-based average
        return calculateMonthlyProductiveCapacity(resource, assumptions);
    }
    // Use actual leave hours for this month
    var _a = __read(month.split('-').map(Number), 2), y = _a[0], m = _a[1];
    // Does this person have any entry that overlaps this month?
    var monthStart = new Date(y, m - 1, 1);
    var monthEnd = new Date(y, m, 0);
    var hasEntryThisMonth = resourceEntries.some(function (e) {
        var ls = new Date(e.startDate + 'T00:00:00');
        var le = new Date(e.endDate + 'T00:00:00');
        return ls <= monthEnd && le >= monthStart;
    });
    if (!hasEntryThisMonth) {
        // Entries exist but not in this month — keep assumption-based for this month
        return calculateMonthlyProductiveCapacity(resource, assumptions);
    }
    // Base = contracted hours per month (no leave deducted yet)
    var baseContracted = (resource.contractHoursPerWeek * 52) / 12;
    var actualLeaveHours = getLeaveHoursInMonth(resource, month, resourceEntries);
    var netAttendance = Math.max(0, baseContracted - actualLeaveHours);
    return netAttendance * (1 - assumptions.adminManagementAllowancePercent / 100);
}
//# sourceMappingURL=leaveCalculations.js.map