import * as React from 'react';
import { IPlanningSnapshot } from '../../models/ResourcePlanningModels';
import { buildMonthSummaries } from '../../utils/capacityCalculations';
import { monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface IDashboardViewProps { snapshot: IPlanningSnapshot; monthsToShow: number; }

export const DashboardView: React.FC<IDashboardViewProps> = ({ snapshot, monthsToShow }) => {
  const summaries = buildMonthSummaries(snapshot, monthsToShow);
  const overloaded = summaries.filter((summary) => summary.utilisation > 100).length;
  const totalAvailable = summaries.reduce((sum, summary) => sum + summary.availableHours, 0);
  const totalAllocated = summaries.reduce((sum, summary) => sum + summary.allocatedHours, 0);
  const utilisation = totalAvailable === 0 ? 0 : Math.round((totalAllocated / totalAvailable) * 100);

  return <div>
    <div className={styles.grid}>
      <div className={styles.card}><h3>Active people</h3><div className={styles.metric}>{snapshot.people.filter((person) => person.isActive).length}</div></div>
      <div className={styles.card}><h3>Projects</h3><div className={styles.metric}>{snapshot.projects.length}</div></div>
      <div className={styles.card}><h3>Planning utilisation</h3><div className={styles.metric}>{utilisation}%</div></div>
      <div className={styles.card}><h3>Overloaded months</h3><div className={styles.metric}>{overloaded}</div></div>
    </div>
    <table className={styles.table}>
      <thead><tr><th>Month</th><th>Capacity</th><th>Leave</th><th>Available</th><th>Allocated</th><th>Utilisation</th></tr></thead>
      <tbody>{summaries.map((summary) => <tr key={summary.month}>
        <td>{monthLabel(summary.month)}</td>
        <td>{summary.capacityHours} h</td>
        <td>{summary.leaveHours} h</td>
        <td>{summary.availableHours} h</td>
        <td>{summary.allocatedHours} h</td>
        <td className={summary.utilisation > 100 ? styles.overload : styles.ok}>{summary.utilisation}%</td>
      </tr>)}</tbody>
    </table>
  </div>;
};
