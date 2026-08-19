import * as React from 'react';
import { IPerson } from '../../models/ResourcePlanningModels';
import { monthlyCapacityHours } from '../../utils/capacityCalculations';
import styles from '../CapacityPlannerApp.module.scss';

export interface IPeopleViewProps { people: IPerson[]; }

export const PeopleView: React.FC<IPeopleViewProps> = ({ people }) => <div>
  <table className={styles.table}>
    <thead><tr><th>Name</th><th>Discipline</th><th>Role</th><th>Employment</th><th>FTE</th><th>Weekly hours</th><th>Monthly capacity</th><th>Active</th></tr></thead>
    <tbody>{people.map((person) => <tr key={String(person.id)}>
      <td>{person.title}</td><td>{person.discipline}</td><td>{person.role}</td><td>{person.employmentType}</td><td>{person.fte}</td><td>{person.weeklyHours}</td><td>{monthlyCapacityHours(person)} h</td><td>{person.isActive ? 'Yes' : 'No'}</td>
    </tr>)}</tbody>
  </table>
</div>;
