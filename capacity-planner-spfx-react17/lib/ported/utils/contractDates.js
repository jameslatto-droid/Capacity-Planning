import { __read } from "tslib";
var CONTRACT_TYPES = new Set(['contractor', 'freelancer']);
/** Returns true when a contractor/freelancer has allocations outside their contract window */
export function isOutsideContract(resource, month) {
    if (!CONTRACT_TYPES.has(resource.employmentType))
        return false;
    if (!resource.contractStart && !resource.contractEnd)
        return false;
    var _a = __read(month.split('-').map(Number), 2), y = _a[0], mo = _a[1];
    var monthFirst = "".concat(month, "-01");
    var lastDay = new Date(y, mo, 0).getDate();
    var monthLast = "".concat(month, "-").concat(String(lastDay).padStart(2, '0'));
    if (resource.contractStart && resource.contractStart > monthLast)
        return true;
    if (resource.contractEnd && resource.contractEnd < monthFirst)
        return true;
    return false;
}
export function fmtContractDate(d) {
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var _a = __read(d.split('-'), 3), y = _a[0], m = _a[1], day = _a[2];
    return "".concat(parseInt(day), " ").concat(MONTHS[parseInt(m) - 1], " ").concat(y);
}
//# sourceMappingURL=contractDates.js.map