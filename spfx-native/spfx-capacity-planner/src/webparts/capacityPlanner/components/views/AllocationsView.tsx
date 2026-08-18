import * as React from 'react';
import { IPlanningSnapshot } from '../../models/ResourcePlanningModels';
import { allocationHours } from '../../utils/capacityCalculations';
import { monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface IAllocationsViewProps { snapshot: IPlanningSnapshot; monthsToShow: number; }

export const AllocationsView: React.FC<IAllocationsViewProps> = ({ snapshot }) => <div>
  <table className={styles.table}>
    <thead><tr><th>Month</th><th>Person</th><th>Project</th><th>FTE</th><th>Hours</th><th>Discipline</th><th>Included</th><th>Notes</th></tr></thead>
    <tbody>{snapshot.allocations.map((allocation) => {
      const person = snapshot.people.find((candidate) => String(candidate.id) === String(allocation.personId));
      const project = snapshot.projects.find((candidate) => String(candidate.id) === String(allocation.projectId));
      return <tr key={String(allocation.id)}>
        <td>{monthLabel(allocation.allocationMonth)}</td><td>{person?.title || allocation.personId}</td><td>{project?.title || allocation.projectId}</td><td>{allocation.allocationFte}</td><td>{allocationHours(allocation, person)} h</td><td>{allocation.discipline}</td><td>{allocation.includeInCapacity ? 'Yes' : 'No'}</td><td>{allocation.notes}</td>
      </tr>;
    })}</tbody>
  </table>
</div>;
