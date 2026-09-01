export function calculateAnnualProductiveCapacity(resource, assumptions) {
    var annualContractedHours = resource.contractHoursPerWeek * 52;
    var hoursPerWorkingDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek;
    var fte = resource.contractHoursPerWeek / assumptions.fullTimeHoursPerWeek;
    var leaveDays = assumptions.leaveModel === 'pro-rated'
        ? assumptions.defaultLeaveDaysPerYear * fte
        : assumptions.defaultLeaveDaysPerYear;
    var publicHolidayDays = assumptions.leaveModel === 'pro-rated'
        ? assumptions.publicHolidayDaysPerYear * fte
        : assumptions.publicHolidayDaysPerYear;
    var leaveHours = leaveDays * hoursPerWorkingDay;
    var publicHolidayHours = publicHolidayDays * hoursPerWorkingDay;
    var netAttendanceHours = annualContractedHours - leaveHours - publicHolidayHours;
    return netAttendanceHours * (1 - assumptions.adminManagementAllowancePercent / 100);
}
export function calculateMonthlyProductiveCapacity(resource, assumptions) {
    return calculateAnnualProductiveCapacity(resource, assumptions) / 12;
}
export function calculateFte(resource, assumptions) {
    return resource.contractHoursPerWeek / assumptions.fullTimeHoursPerWeek;
}
//# sourceMappingURL=capacityCalculations.js.map