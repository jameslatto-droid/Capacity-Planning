import { __read } from "tslib";
export function generateMonthRange(startMonth, endMonth) {
    var months = [];
    if (!/^\d{4}-\d{2}$/.test(startMonth) || !/^\d{4}-\d{2}$/.test(endMonth))
        return months;
    var _a = __read(startMonth.split('-').map(Number), 2), sy = _a[0], sm = _a[1];
    var _b = __read(endMonth.split('-').map(Number), 2), ey = _b[0], em = _b[1];
    if (!sy || !ey || !sm || !em || sm < 1 || sm > 12 || em < 1 || em > 12)
        return months;
    var year = sy;
    var month = sm;
    while (year < ey || (year === ey && month <= em)) {
        months.push("".concat(year, "-").concat(String(month).padStart(2, '0')));
        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }
    return months;
}
export function formatMonth(month) {
    var _a = __read(month.split('-'), 2), year = _a[0], m = _a[1];
    var date = new Date(Number(year), Number(m) - 1, 1);
    return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}
export function currentMonth() {
    var now = new Date();
    return "".concat(now.getFullYear(), "-").concat(String(now.getMonth() + 1).padStart(2, '0'));
}
export function addMonths(month, n) {
    var _a = __read(month.split('-').map(Number), 2), y = _a[0], m = _a[1];
    var date = new Date(y, m - 1 + n, 1);
    return "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0'));
}
export function defaultForecastRange(monthsAhead, startMonth) {
    if (monthsAhead === void 0) { monthsAhead = 6; }
    if (startMonth === void 0) { startMonth = currentMonth(); }
    return {
        startMonth: startMonth,
        endMonth: addMonths(startMonth, monthsAhead),
    };
}
//# sourceMappingURL=months.js.map