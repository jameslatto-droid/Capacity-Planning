import * as React from 'react';
import { IPerson, IPlanningSnapshot, IProject } from '../../models/ResourcePlanningModels';
import { allocationHours } from '../../utils/capacityCalculations';
import { monthLabel } from '../../utils/dateUtils';
import styles from '../CapacityPlannerApp.module.scss';

export interface IAllocationsViewProps {
  snapshot: IPlanningSnapshot;
  monthsToShow: number;
}

function getPersonById(people: IPerson[], personId: string | number): IPerson | undefined {
  for (let index = 0; index < people.length; index++) {
    if (String(people[index].id) === String(personId)) {
      return people[index];
    }
  }
  return undefined;
}

function getProjectById(projects: IProject[], projectId: string | number): IProject | undefined {
  for (let index = 0; index < projects.length; index++) {
    if (String(projects[index].id) === String(projectId)) {
      return projects[index];
    }
  }
  return undefined;
}

export const AllocationsView: React.FC<IAllocationsViewProps> = ({ snapshot }) => (
  <div>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Month</th>
          <th>Person</th>
          <th>Project</th>
          <th>FTE</th>
          <th>Hours</th>
          <th>Discipline</th>
          <th>Included</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {snapshot.allocations.map((allocation) => {
          const person = getPersonById(snapshot.people, allocation.personId);
          const project = getProjectById(snapshot.projects, allocation.projectId);
          return (
            <tr key={String(allocation.id)}>
              <td>{monthLabel(allocation.allocationMonth)}</td>
              <td>{person ? person.title : allocation.personId}</td>
              <td>{project ? project.title : allocation.projectId}</td>
              <td>{allocation.allocationFte}</td>
              <td>{allocationHours(allocation, person)} h</td>
              <td>{allocation.discipline}</td>
              <td>{allocation.includeInCapacity ? 'Yes' : 'No'}</td>
              <td>{allocation.notes}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
