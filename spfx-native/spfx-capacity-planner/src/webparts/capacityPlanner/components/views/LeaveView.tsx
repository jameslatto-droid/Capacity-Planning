import * as React from 'react';
import { ILeaveEntry, IPerson } from '../../models/ResourcePlanningModels';
import { monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface ILeaveViewProps { people: IPerson[]; leave: ILeaveEntry[]; }

export const LeaveView: React.FC<ILeaveViewProps> = ({ people, leave }) => <div>
  <table className={styles.table}>
    <thead><tr><th>Month</th><th>Person</th><th>Type</th><th>Hours</th><th>Notes</th></tr></thead>
    <tbody>{leave.map((entry) => {
      const person = people.find((candidate) => String(candidate.id) === String(entry.personId));
      return <tr key={String(entry.id)}><td>{monthLabel(entry.leaveDate)}</td><td>{person?.title || entry.personId}</td><td>{entry.leaveType}</td><td>{entry.leaveHours} h</td><td>{entry.notes}</td></tr>;
    })}</tbody>
  </table>
</div>;
};
