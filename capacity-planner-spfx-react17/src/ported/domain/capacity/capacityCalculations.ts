import type { Resource, CapacityAssumptions } from '../../types'

export function calculateAnnualProductiveCapacity(
  resource: Resource,
  assumptions: CapacityAssumptions
): number {
  const annualContractedHours = resource.contractHoursPerWeek * 52
  const hoursPerWorkingDay = resource.contractHoursPerWeek / resource.workingDaysPerWeek
  const fte = resource.contractHoursPerWeek / assumptions.fullTimeHoursPerWeek

  const leaveDays =
    assumptions.leaveModel === 'pro-rated'
      ? assumptions.defaultLeaveDaysPerYear * fte
      : assumptions.defaultLeaveDaysPerYear

  const publicHolidayDays =
    assumptions.leaveModel === 'pro-rated'
      ? assumptions.publicHolidayDaysPerYear * fte
      : assumptions.publicHolidayDaysPerYear

  const leaveHours = leaveDays * hoursPerWorkingDay
  const publicHolidayHours = publicHolidayDays * hoursPerWorkingDay
  const netAttendanceHours = annualContractedHours - leaveHours - publicHolidayHours

  return netAttendanceHours * (1 - assumptions.adminManagementAllowancePercent / 100)
}

export function calculateMonthlyProductiveCapacity(
  resource: Resource,
  assumptions: CapacityAssumptions
): number {
  return calculateAnnualProductiveCapacity(resource, assumptions) / 12
}

export function calculateFte(resource: Resource, assumptions: CapacityAssumptions): number {
  return resource.contractHoursPerWeek / assumptions.fullTimeHoursPerWeek
}
