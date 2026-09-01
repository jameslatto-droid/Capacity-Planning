import { __read } from "tslib";
import { useState } from 'react';
import { usePlannerStore } from '../store/plannerStore';
import { addMonths, currentMonth } from './months';
export function useDateRange() {
    var _a;
    var projects = usePlannerStore().projects;
    var startMonths = projects.map(function (p) { return p.startMonth; }).filter(Boolean).sort();
    var endMonths = projects.map(function (p) { return p.endMonth; }).filter(Boolean).sort();
    var minMonth = (_a = startMonths[0]) !== null && _a !== void 0 ? _a : addMonths(currentMonth(), -12);
    var maxMonth = endMonths.length ? addMonths(endMonths[endMonths.length - 1], 6) : addMonths(currentMonth(), 18);
    var defaultStart = addMonths(currentMonth(), -1);
    var defaultEnd = addMonths(currentMonth(), 6);
    var _b = __read(useState(defaultStart), 2), startMonth = _b[0], setStartMonth = _b[1];
    var _c = __read(useState(defaultEnd), 2), endMonth = _c[0], setEndMonth = _c[1];
    return { startMonth: startMonth, endMonth: endMonth, setStartMonth: setStartMonth, setEndMonth: setEndMonth, minMonth: minMonth, maxMonth: maxMonth };
}
//# sourceMappingURL=useDateRange.js.map