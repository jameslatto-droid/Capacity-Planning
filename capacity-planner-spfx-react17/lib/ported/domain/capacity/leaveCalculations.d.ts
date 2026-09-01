import type { Resource, LeaveEntry, CapacityAssumptions } from '../../types';
/** Count Mon–Fri days between two ISO date strings (inclusive). */
export declare function countWorkingDays(startDate: string, endDate: string): number;
/**
 * Total leave hours for a resource in a given month (YYYY-MM).
 * Entries that span multiple months are clamped to the target month.
 * Part-time workers are pro-rated by workingDaysPerWeek / 5.
 */
export declare function getLeaveHoursInMonth(resource: Resource, month: string, leaveEntries: LeaveEntry[]): number;
/**
 * Total leave working-days for a resource in a given month (display use).
 */
export declare function getLeaveDaysInMonth(resource: Resource, month: string, leaveEntries: LeaveEntry[]): number;
/**
 * Working days for one entry (for display in the form).
 * Pro-rated for part-time workers.
 */
export declare function getEntryWorkingDays(entry: LeaveEntry, resource: Resource): number;
/**
 * Monthly productive capacity using actual leave entries.
 *
 * When leave entries exist for this resource in this month, actual leave
 * hours replace the assumption-based average leave deduction.
 * When no entries exist, falls back to the assumption-based formula.
 */
export declare function calculateMonthlyCapacityWithLeave(resource: Resource, month: string, leaveEntries: LeaveEntry[], assumptions: CapacityAssumptions): number;
//# sourceMappingURL=leaveCalculations.d.ts.map