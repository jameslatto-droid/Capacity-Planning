import * as React from 'react';
import { IPlanningSnapshot } from '../../models/ResourcePlanningModels';
import { buildPersonMonthSummaries, buildProjectDemandSummaries } from '../../utils/capacityCalculations';
import { monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface IReportsViewProps { snapshot: IPlanningSnapshot; monthsToShow: number; }

export const ReportsView: React.FC<IReportsViewProps> = ({ snapshot, monthsToShow }) => {
  const personMonths = buildPersonMonthSummaries(snapshot, monthsToShow);
  const projectDemand = buildProjectDemandSummaries(snapshot);
  return <div>
    <h3>Person heatmap</h3>
    <table className={styles.table}>
      <thead><tr><th>Person</th><th>Discipline</th><th>Month</th><th>Allocated</th><th>Available</th><th>Utilisation</th></tr></thead>
      <tbody>{personMonths.map((row) => <tr key={`${row.personId}-${row.month}`}>
        <td>{row.personName}</td><td>{row.discipline}</td><td>{monthLabel(row.month)}</td><td>{row.allocatedHours} h</td><td>{row.availableHours} h</td><td className={row.utilisation > 100 ? styles.overload : styles.ok}>{row.utilisation}%</td>
      </tr>)}</tbody>
    </table>
    <h3>Project demand</h3>
    <table className={styles.table}>
      <thead><tr><th>Code</th><th>Project</th><th>Type</th><th>Total hours</th><th>Included hours</th></tr></thead>
      <tbody>{projectDemand.map((row) => <tr key={String(row.projectId)}><td>{row.projectCode}</td><td>{row.projectTitle}</td><td>{row.projectType}</td><td>{row.totalHours} h</td><td>{row.includedHours} h</td></tr>)}</tbody>
    </table>
  </div>;
};
