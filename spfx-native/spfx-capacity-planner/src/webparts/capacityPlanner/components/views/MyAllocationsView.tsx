import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';

import { IAllocation, IPerson, IPlanningSnapshot, IProject } from '../../models/ResourcePlanningModels';
import {
  allocationHours,
  buildPersonMonthSummaries,
  getProjectById,
  utilisationBand
} from '../../utils/capacityCalculations';
import { buildMonthRange, firstDayOfMonthIso, monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface IMyAllocationsViewProps {
  snapshot: IPlanningSnapshot;
  monthsToShow: number;
  currentUserEmail: string;
}

function normaliseEmail(value: string | undefined): string {
  return String(value || '').trim().toLowerCase();
}

function peopleMatchingEmail(people: IPerson[], email: string): IPerson[] {
  const normalisedEmail = normaliseEmail(email);
  if (!normalisedEmail) { return []; }
  return people.filter((person) => normaliseEmail(person.email) === normalisedEmail);
}

function allocationsForPerson(allocations: IAllocation[], personId: number | string): IAllocation[] {
  return allocations.filter((allocation) => String(allocation.personId) === String(personId));
}

function uniqueProjectIds(allocations: IAllocation[]): Array<number | string> {
  const ids: Array<number | string> = [];
  allocations.forEach((allocation) => {
    if (!ids.some((id) => String(id) === String(allocation.projectId))) { ids.push(allocation.projectId); }
  });
  return ids;
}

function projectLabel(project: IProject | undefined, projectId: number | string): JSX.Element {
  if (!project) { return <>{`Project ${projectId}`}</>; }
  return <>{project.projectCode || project.title}<small>{project.title}{project.includeInCapacity ? '' : ' · excluded from capacity'}</small></>;
}

export const MyAllocationsView: React.FC<IMyAllocationsViewProps> = (props) => {
  const matches = peopleMatchingEmail(props.snapshot.people, props.currentUserEmail);

  if (!normaliseEmail(props.currentUserEmail)) {
    return <MessageBar messageBarType={MessageBarType.warning}>SharePoint did not provide an email address for the current user. The personal allocation view cannot be resolved.</MessageBar>;
  }

  if (matches.length === 0) {
    return <MessageBar messageBarType={MessageBarType.warning}>No active planning profile is linked to {props.currentUserEmail}. Ask the planner to check the Email field in ERP_People.</MessageBar>;
  }

  if (matches.length > 1) {
    return <MessageBar messageBarType={MessageBarType.error}>More than one ERP_People record uses {props.currentUserEmail}. The duplicate must be corrected before personal allocations can be shown.</MessageBar>;
  }

  const person = matches[0];
  if (!person.isActive) {
    return <MessageBar messageBarType={MessageBarType.info}>{person.title} is currently inactive in ERP_People. No active allocation summary is available.</MessageBar>;
  }

  const months = buildMonthRange(props.monthsToShow);
  const monthLookup = months.reduce<{ [key: string]: boolean }>((lookup, month) => {
    lookup[month] = true;
    return lookup;
  }, {});
  const allPersonAllocations = allocationsForPerson(props.snapshot.allocations, person.id);
  const personAllocations = allPersonAllocations.filter((allocation) => monthLookup[firstDayOfMonthIso(allocation.allocationMonth)] === true);
  const personalSnapshot: IPlanningSnapshot = {
    ...props.snapshot,
    people: [person],
    allocations: allPersonAllocations,
    leave: props.snapshot.leave.filter((entry) => String(entry.personId) === String(person.id))
  };
  const monthRows = buildPersonMonthSummaries(personalSnapshot, props.monthsToShow);
  const currentMonth = monthRows[0];
  const projectIds = uniqueProjectIds(personAllocations);
  const overloadedMonths = monthRows.filter((row) => row.utilisation > 100).length;
  const currentHeadroom = currentMonth ? currentMonth.availableHours - currentMonth.allocatedHours : 0;

  return <div className={styles.stack}>
    <section className={styles.panel}>
      <h3>My allocations</h3>
      <p className={styles.subtle}>{person.title} · {person.primaryRole || person.role || person.discipline} · {person.email}</p>
    </section>

    <div className={styles.kpiGrid}>
      <div className={styles.card}><span className={styles.cardLabel}>Current allocation</span><strong className={styles.metric}>{currentMonth ? `${currentMonth.utilisation}%` : '0%'}</strong><small>{currentMonth ? monthLabel(currentMonth.month) : ''}</small></div>
      <div className={styles.card}><span className={styles.cardLabel}>{currentHeadroom >= 0 ? 'Available capacity' : 'Overload'}</span><strong className={styles.metric}>{Math.abs(currentHeadroom)} h</strong><small>Current month</small></div>
      <div className={styles.card}><span className={styles.cardLabel}>Allocated projects</span><strong className={styles.metric}>{projectIds.length}</strong><small>Planning period</small></div>
      <div className={styles.card}><span className={styles.cardLabel}>Overloaded months</span><strong className={styles.metric}>{overloadedMonths}</strong><small>Above 100%</small></div>
    </div>

    <section className={styles.panel}>
      <h3>Monthly summary</h3>
      <table className={styles.matrix}>
        <thead><tr><th>Capacity</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead>
        <tbody><tr><th>Allocated / available<small>% utilisation</small></th>{monthRows.map((row) => <td key={row.month} className={styles[utilisationBand(row.utilisation)]}><strong>{row.utilisation}%</strong><small>{row.allocatedHours} / {row.availableHours} h</small></td>)}</tr></tbody>
      </table>
    </section>

    <section className={styles.panel}>
      <h3>Allocation detail</h3>
      {projectIds.length === 0
        ? <p className={styles.subtle}>No allocations are recorded for this planning period.</p>
        : <table className={styles.matrix}>
          <thead><tr><th>Project</th>{months.map((month) => <th key={month}>{monthLabel(month)}</th>)}</tr></thead>
          <tbody>{projectIds.map((projectId) => {
            const project = getProjectById(props.snapshot.projects, projectId);
            return <tr key={String(projectId)}>
              <th>{projectLabel(project, projectId)}</th>
              {months.map((month) => {
                const cellAllocations = personAllocations.filter((allocation) => String(allocation.projectId) === String(projectId) && firstDayOfMonthIso(allocation.allocationMonth) === month);
                const fte = cellAllocations.reduce((sum, allocation) => sum + Number(allocation.allocationFte || 0), 0);
                const hours = cellAllocations.reduce((sum, allocation) => sum + allocationHours(allocation, person, personalSnapshot), 0);
                const isLocked = cellAllocations.some((allocation) => allocation.locked === true);
                return <td key={month}>{fte > 0 ? <><strong>{Math.round(fte * 100)}%</strong><small>{Math.round(hours)} h{isLocked ? ' · locked' : ''}</small></> : ''}</td>;
              })}
            </tr>;
          })}</tbody>
        </table>}
    </section>
  </div>;
};
