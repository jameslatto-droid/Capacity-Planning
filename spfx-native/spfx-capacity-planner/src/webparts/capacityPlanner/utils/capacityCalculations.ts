import { IAllocation, IMonthSummary, IPerson, IPersonMonthSummary, IPlanningSnapshot, IProjectDemandSummary } from '../models/ResourcePlanningModels';
import { buildMonthRange, firstDayOfMonthIso } from './dateUtils';

const AVERAGE_WEEKS_PER_MONTH = 4.333;

function getPersonById(people: IPerson[], personId: string | number): IPerson | undefined {
  for (let index = 0; index < people.length; index++) {
    if (String(people[index].id) === String(personId)) {
      return people[index];
    }
  }
  return undefined;
}

export function monthlyCapacityHours(person: IPerson): number {
  return Math.round((person.weeklyHours || 40) * (person.fte || 1) * AVERAGE_WEEKS_PER_MONTH);
}

export function allocationHours(allocation: IAllocation, person?: IPerson): number {
  if (allocation.allocationHours && allocation.allocationHours > 0) {
    return allocation.allocationHours;
  }
  const capacity = person ? monthlyCapacityHours(person) : Math.round(40 * AVERAGE_WEEKS_PER_MONTH);
  return Math.round(capacity * allocation.allocationFte);
}

export function buildMonthSummaries(snapshot: IPlanningSnapshot, monthsToShow: number): IMonthSummary[] {
  const months = buildMonthRange(monthsToShow);
  return months.map((month) => {
    const activePeople = snapshot.people.filter((person) => person.isActive);
    const capacityHours = activePeople.reduce((sum, person) => sum + monthlyCapacityHours(person), 0);
    const leaveHours = snapshot.leave
      .filter((entry) => firstDayOfMonthIso(entry.leaveDate) === month)
      .reduce((sum, entry) => sum + entry.leaveHours, 0);
    const allocatedHours = snapshot.allocations
      .filter((allocation) => firstDayOfMonthIso(allocation.allocationMonth) === month && allocation.includeInCapacity)
      .reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(snapshot.people, allocation.personId)), 0);
    const availableHours = Math.max(capacityHours - leaveHours, 0);
    return {
      month,
      capacityHours,
      allocatedHours,
      leaveHours,
      availableHours,
      utilisation: availableHours === 0 ? 0 : Math.round((allocatedHours / availableHours) * 100)
    };
  });
}

export function buildPersonMonthSummaries(snapshot: IPlanningSnapshot, monthsToShow: number): IPersonMonthSummary[] {
  const months = buildMonthRange(monthsToShow);
  const rows: IPersonMonthSummary[] = [];
  snapshot.people.filter((person) => person.isActive).forEach((person) => {
    months.forEach((month) => {
      const capacityHours = monthlyCapacityHours(person);
      const leaveHours = snapshot.leave
        .filter((entry) => String(entry.personId) === String(person.id) && firstDayOfMonthIso(entry.leaveDate) === month)
        .reduce((sum, entry) => sum + entry.leaveHours, 0);
      const allocatedHours = snapshot.allocations
        .filter((allocation) => String(allocation.personId) === String(person.id) && firstDayOfMonthIso(allocation.allocationMonth) === month && allocation.includeInCapacity)
        .reduce((sum, allocation) => sum + allocationHours(allocation, person), 0);
      const availableHours = Math.max(capacityHours - leaveHours, 0);
      rows.push({
        personId: person.id,
        personName: person.title,
        discipline: person.discipline,
        month,
        capacityHours,
        allocatedHours,
        leaveHours,
        availableHours,
        utilisation: availableHours === 0 ? 0 : Math.round((allocatedHours / availableHours) * 100)
      });
    });
  });
  return rows;
}

export function buildProjectDemandSummaries(snapshot: IPlanningSnapshot): IProjectDemandSummary[] {
  return snapshot.projects.map((project) => {
    const allocations = snapshot.allocations.filter((allocation) => String(allocation.projectId) === String(project.id));
    const totalHours = allocations.reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(snapshot.people, allocation.personId)), 0);
    const includedHours = allocations
      .filter((allocation) => allocation.includeInCapacity && project.includeInCapacity)
      .reduce((sum, allocation) => sum + allocationHours(allocation, getPersonById(snapshot.people, allocation.personId)), 0);
    return {
      projectId: project.id,
      projectTitle: project.title,
      projectCode: project.projectCode,
      projectType: project.projectType,
      totalHours,
      includedHours
    };
  });
}
