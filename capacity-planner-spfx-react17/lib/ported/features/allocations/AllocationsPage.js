import { __read } from "tslib";
import * as React from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlannerStore } from '../../store/plannerStore';
import { PageLayout } from '../../components/layout/PageLayout';
import { Input } from '../../components/ui/Input';
import { useDateRange } from '../../utils/useDateRange';
import { usePageBackground } from '../../utils/usePageBackground';
import { AllocationMatrixByPerson } from './AllocationMatrixByPerson';
export function AllocationsPage() {
    usePageBackground('6.png');
    var activeScenarioId = usePlannerStore().activeScenarioId;
    var _a = useDateRange(), startMonth = _a.startMonth, endMonth = _a.endMonth, setStartMonth = _a.setStartMonth, setEndMonth = _a.setEndMonth, minMonth = _a.minMonth, maxMonth = _a.maxMonth;
    var _b = __read(useState('person'), 2), viewMode = _b[0], setViewMode = _b[1];
    var _c = __read(useState('hours'), 2), valueMode = _c[0], setValueMode = _c[1];
    return (React.createElement(PageLayout, { title: "Allocations" },
        React.createElement("div", { className: "flex flex-wrap items-end gap-4 mb-8" },
            React.createElement(Input, { label: "From", type: "month", value: startMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setStartMonth(e.target.value); }, className: "w-36" }),
            React.createElement(Input, { label: "To", type: "month", value: endMonth, min: minMonth, max: maxMonth, onChange: function (e) { return setEndMonth(e.target.value); }, className: "w-36" }),
            React.createElement("div", { className: "flex gap-1 self-end" }, ['person', 'project', 'role'].map(function (m) { return (React.createElement(motion.button, { key: m, whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, onClick: function () { return setViewMode(m); }, className: "px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all duration-150", style: {
                    background: viewMode === m ? 'var(--accent-light)' : 'var(--surface-2)',
                    border: viewMode === m ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                    color: viewMode === m ? 'var(--accent-text)' : 'var(--text-muted)',
                    boxShadow: viewMode === m ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
                } },
                "By ",
                m)); })),
            React.createElement("div", { className: "flex gap-0.5 self-end", style: { marginLeft: 4 } }, ['hours', 'percent'].map(function (v) { return (React.createElement(motion.button, { key: v, whileHover: { scale: 1.02 }, whileTap: { scale: 0.97 }, onClick: function () { return setValueMode(v); }, className: "px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150", style: {
                    background: valueMode === v ? 'var(--accent-light)' : 'var(--surface-2)',
                    border: valueMode === v ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(139,92,246,0.15)',
                    color: valueMode === v ? 'var(--accent-text)' : 'var(--text-muted)',
                    boxShadow: valueMode === v ? '0 0 12px rgba(139,92,246,0.2)' : 'none',
                } }, v === 'hours' ? 'h' : '%')); }))),
        React.createElement(AllocationMatrixByPerson, { scenarioId: activeScenarioId, startMonth: startMonth, endMonth: endMonth, viewMode: viewMode, valueMode: valueMode })));
}
//# sourceMappingURL=AllocationsPage.js.map