import {
  IAllocation,
  ICapacityAssumptions,
  IMonthSummary,
  IOverloadSummary,
  IPerson,
  IPersonMonthSummary,
  IPlanningSnapshot,
  IProject,
  IProjectDemandSummary,
  IReallocationRecommendation,
  IRoleMonthSummary,
  defaultCapacityAssumptions
} from '../models/ResourcePlanningModels';
import { buildMonthRange, firstDayOfMonthIso } from './dateUtils';

function getPeople(snapshot: IPlanningSnapshot): IPerson[] { return snapshot.people || []; }
function getProjects(snapshot: IPlanningSnapshot): IProject[] { return snapshot.projects || []; }
function getAllocations(snapshot: IPlanningSnapshot): IAllocation[] { return snapshot.allocations || []; }

export function getPersonById(people: IPerson[], personId: string | number): IPerson | undefined {
  for (let index = 0; index < people.length; index++) {
    if (String(people[index].id) === String(personId)) { return people[index]; }
  }
  return undefined;
}

export function getProjectById(projects: IProject[], projectId: string | number): IProject | undefined {
  for (let index = 0; index < projects.length; index++) {
    if (String(projects[index].id) === String(projectId)) { return projects[index]; }
  }
  return undefined;
}

export function getActiveAssumptions(snapshot?: IPlanningSnapshot): ICapacityAssumptions {
  if (!snapshot || !snapshot.scenarios || snapshot.scenarios.length === 0) { return defaultCapacityAssumptions(); }
  for (let index = 0; index < snapshot.scenarios.length; index++) {
    if (snapshot.scenarios[index].isActive || String(snapshot.scenarios[index].id) === String(snapshot.activeScenarioId)) {
      return snapshot.scenarios[index].assumptions;
    }
  }
  return snapshot.scenarios[0].assumptions || defaultCapacityAssumptions();
}

export function annualProductiveCapacity(person: IPerson, assumptions?: ICapacityAssumptions): number {
  const basis = assumptions || defaultCapacityAssumptions();
  const weeklyHours = Number(person.weeklyHours || 40);
  const workingDays = Number(person.workingDaysPerWeek || (weeklyHours >= 40 ? 5 : 4));
  const hoursPerDay = workingDays <= 0 ? 8 : weeklyHours / workingDays;
  const fte = basis.fullTimeHoursPerWeek <= 0 ? Number(person.fte || 1) : weeklyHours / basis.fullTimeHoursPerWeek;
  const annualContracted = weeklyHours * 52;
  const leaveDays = basis.leaveModel === 'pro-rated' ? basis.defaultLeaveDaysPerYear * fte : basis.defaultLeaveDaysPerYear;
  const publicHolidayDays = basis.leaveModel === 'pro-rated' ? basis.publicHolidayDaysPerYear * fte : basis.publicHolidayDaysPerYear;
  const leaveHours = leaveDays * hoursPerDay;
  const publicHolidayHours = publicHolidayDays * hoursPerDay;
  const netAttendance = Math.max(annualContracted - leaveHours - publicHolidayHours, 0);
  const productive = netAttendance * (1 - (basis.adminManagementAllowancePercent || 0) / 100);
  return Math.round(productive);
}

export function monthlyCapacityHours(person: IPerson, assumptions?: ICapacityAssumptions): number {
  return Math.round(annualProductiveCapacity(person, assumptions) / 12);
}

function countWeekdays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) { count++; }
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function leaveHoursForPersonMonth(snapshot: IPlanningSnapshot, personId: string | number, month: string): number {
  const monthStart = new Date(month);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  return (snapshot.leave || [])
    .filter((entry) => String(entry.personId) === String(personId))
    .reduce((sum, entry) => {
      const entryStart = new Date(entry.leaveDate);
      const entryEnd = new Date(entry.endDate || entry.leaveDate);
      const overlapStart = entryStart > monthStart ? entryStart : monthStart;
      const overlapEnd = entryEnd < monthEnd ? entryEnd : monthEnd;
      if (overlapStart > overlapEnd) { return sum; }
      const totalWeekdays = countWeekdays(entryStart, entryEnd);
      const overlapWeekdays = countWeekdays(overlapStart, overlapEnd);
      if (totalWeekdays <= 0 || overlapWeekdays <= 0) { return sum; }
      return sum + Number(entry.leaveHours || 0) * (overlapWeekdays / totalWeekdays);
    }, 0);
}

export function monthlyCapacityWithLeave(snapshot: IPlanningSnapshot, person: IPerson, month: string): number {
  const assumptions = getActiveAssumptions(snapshot);
  const leaveHours = leaveHoursForPersonMonth(snapshot, person.id, month);
  if (leaveHours <= 0) { return monthlyCapacityHours(person, assumptions); }
  const weeklyHours = Number(person.weeklyHours || 40);
  const baseContracted = weeklyHours * 52 / 12;
  const netAttendance = Math.max(baseContracted - leaveHours, 0);
  return Math.round(netAttendance * (1 - assumptions.adminManagementAllowancePercent / 100));
}

export function allocationHours(allocation: IAllocation, person?: IPerson, snapshot?: IPlanningSnapshot): number {
  if (allocation.allocationHours && allocation.allocationHours > 0) { return Math.round(Number(allocation.allocationHours)); }
  const capacity = person ? monthlyCapacityHours(person, snapshot ? getActiveAssumptions(snapshot) : undefined) : Math.round(40 * 52 / 12 * 0.85);
  return Math.round(capacity * Number(allocation.allocationFte || 0));
}

export function allocationHoursForPersonMonth(snapshot: IPlanningSnapshot, person: IPerson, month: string): number {
  return getAllocations(snapshot)
    .filter((allocation) => String(allocation.personId) === String(person.id) && firstDayOfMonthIso(allocation.allocationMonth) === month && allocation.includeInCapacity)
    .reduce((sum, allocation) => sum + allocationHours(allocation, person, snapshot), 0);
}

export function buildMonthSummaries(snapshot: IPlanningSnapshot, monthsToShow: number): IMonthSummary[] {
  const months = buildMonthRange(monthsToShow);
  return months.map((month) => {
    const activePeople = getPeople(snapshot).filter((person) => person.isActive);
    const capacityHours = activePeople.reduce((sum, person) => sum + monthlyCapacityWithLeave(snapshot, person, month), 0);
    const leaveHours = (snapshot.leave || []).filter((entry) => firstDayOfMonthIso(entry.leaveDate) === month).reduce((sum, entry) => sum + Number(entry.leaveHours || 0), 0);
    const allocatedHours = getAllocations(snapshot)
      .filter((allocation) => firstDayOfMonthIso(allocation.allocationMonth) === month && allocation.includeInCapacity)
      .reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(getPeople(snapshot), allocation.personId), snapshot), 0);
    return {
      month,
      capacityHours,
      allocatedHours,
      leaveHours,
      availableHours: capacityHours,
      utilisation: capacityHours === 0 ? 0 : Math.round((allocatedHours / capacityHours) * 100)
    };
  });
}

export function buildPersonMonthSummaries(snapshot: IPlanningSnapshot, monthsToShow: number): IPersonMonthSummary[] {
  const months = buildMonthRange(monthsToShow);
  const rows: IPersonMonthSummary[] = [];
  getPeople(snapshot).filter((person) => person.isActive).forEach((person) => {
    months.forEach((month) => {
      const capacityHours = monthlyCapacityWithLeave(snapshot, person, month);
      const leaveHours = leaveHoursForPersonMonth(snapshot, person.id, month);
      const allocatedHours = allocationHoursForPersonMonth(snapshot, person, month);
      const utilisation = capacityHours === 0 ? 0 : Math.round((allocatedHours / capacityHours) * 100);
      rows.push({
        personId: person.id,
        personName: person.title,
        discipline: person.discipline,
        role: person.primaryRole || person.role,
        month,
        capacityHours,
        allocatedHours,
        leaveHours,
        availableHours: capacityHours,
        utilisation,
        overloadHours: Math.max(allocatedHours - capacityHours, 0)
      });
    });
  });
  return rows;
}

export function buildRoleMonthSummaries(snapshot: IPlanningSnapshot, monthsToShow: number): IRoleMonthSummary[] {
  const months = buildMonthRange(monthsToShow);
  const roles: string[] = [];
  getPeople(snapshot).forEach((person) => {
    const role = person.discipline || person.primaryRole || person.role || 'Other';
    if (roles.indexOf(role) < 0) { roles.push(role); }
  });
  const rows: IRoleMonthSummary[] = [];
  roles.forEach((role) => {
    months.forEach((month) => {
      const peopleInRole = getPeople(snapshot).filter((person) => (person.discipline || person.primaryRole || person.role || 'Other') === role && person.isActive);
      const capacityHours = peopleInRole.reduce((sum, person) => sum + monthlyCapacityWithLeave(snapshot, person, month), 0);
      const allocatedHours = getAllocations(snapshot)
        .filter((allocation) => firstDayOfMonthIso(allocation.allocationMonth) === month && allocation.includeInCapacity && (allocation.role || allocation.discipline || 'Other') === role)
        .reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(getPeople(snapshot), allocation.personId), snapshot), 0);
      const leaveHours = peopleInRole.reduce((sum, person) => sum + leaveHoursForPersonMonth(snapshot, person.id, month), 0);
      rows.push({ month, role, capacityHours, allocatedHours, leaveHours, availableHours: capacityHours, utilisation: capacityHours === 0 ? 0 : Math.round((allocatedHours / capacityHours) * 100) });
    });
  });
  return rows;
}

export function buildProjectDemandSummaries(snapshot: IPlanningSnapshot): IProjectDemandSummary[] {
  return getProjects(snapshot).map((project) => {
    const allocations = getAllocations(snapshot).filter((allocation) => String(allocation.projectId) === String(project.id));
    const totalHours = allocations.reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(getPeople(snapshot), allocation.personId), snapshot), 0);
    const includedHours = allocations
      .filter((allocation) => allocation.includeInCapacity && project.includeInCapacity)
      .reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(getPeople(snapshot), allocation.personId), snapshot), 0);
    return {
      projectId: project.id,
      projectTitle: project.title,
      projectCode: project.projectCode,
      projectType: project.projectType,
      brand: project.brand,
      totalHours,
      includedHours
    };
  });
}

export function buildOverloads(snapshot: IPlanningSnapshot, monthsToShow: number): IOverloadSummary[] {
  return buildPersonMonthSummaries(snapshot, monthsToShow)
    .filter((row) => row.utilisation > 100)
    .map((row) => ({
      personId: row.personId,
      personName: row.personName,
      role: row.role || row.discipline,
      month: row.month,
      allocatedHours: row.allocatedHours,
      availableHours: row.availableHours,
      utilisation: row.utilisation,
      overloadHours: row.overloadHours || 0
    }));
}

export function buildReallocationRecommendations(snapshot: IPlanningSnapshot, monthsToShow: number): IReallocationRecommendation[] {
  const overloads = buildOverloads(snapshot, monthsToShow);
  const personMonths = buildPersonMonthSummaries(snapshot, monthsToShow);
  const recommendations: IReallocationRecommendation[] = [];
  overloads.forEach((overload) => {
    let remaining = overload.overloadHours;
    for (let index = 0; index < personMonths.length && remaining > 0; index++) {
      const candidate = personMonths[index];
      const spare = candidate.availableHours - candidate.allocatedHours;
      if (candidate.month === overload.month && String(candidate.personId) !== String(overload.personId) && spare > 0 && (candidate.role === overload.role || candidate.discipline === overload.role)) {
        const suggested = Math.min(spare, remaining);
        recommendations.push({
          month: overload.month,
          role: overload.role,
          fromPersonId: overload.personId,
          fromPersonName: overload.personName,
          toPersonId: candidate.personId,
          toPersonName: candidate.personName,
          suggestedHours: Math.round(suggested),
          reason: 'Same-role spare capacity in the same month.'
        });
        remaining -= suggested;
      }
    }
  });
  return recommendations;
}

export function utilisationBand(utilisation: number): string {
  if (utilisation < 60) { return 'underused'; }
  if (utilisation <= 85) { return 'healthy'; }
  if (utilisation <= 100) { return 'high'; }
  if (utilisation <= 115) { return 'overloaded'; }
  return 'critical';
}

export function exportPersonCsv(snapshot: IPlanningSnapshot, monthsToShow: number): string {
  const rows = buildPersonMonthSummaries(snapshot, monthsToShow);
  const lines = ['Person,Role,Month,Allocated hours,Available hours,Utilisation %,Overload hours'];
  rows.forEach((row) => {
    lines.push([row.personName, row.role || row.discipline, row.month, String(row.allocatedHours), String(row.availableHours), String(row.utilisation), String(row.overloadHours || 0)].join(','));
  });
  return lines.join('\n');
}
