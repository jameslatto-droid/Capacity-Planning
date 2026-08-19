import * as React from 'react';
import { IProject } from '../../models/ResourcePlanningModels';
import styles from '../CapacityPlannerApp.module.scss';

export interface IProjectsViewProps { projects: IProject[]; }

export const ProjectsView: React.FC<IProjectsViewProps> = ({ projects }) => <div>
  <table className={styles.table}>
    <thead><tr><th>Code</th><th>Project</th><th>Type</th><th>Status</th><th>Client</th><th>Included</th><th>Probability</th><th>Notes</th></tr></thead>
    <tbody>{projects.map((project) => <tr key={String(project.id)}>
      <td>{project.projectCode}</td><td>{project.title}</td><td><span className={styles.badge}>{project.projectType}</span></td><td>{project.status}</td><td>{project.client}</td><td>{project.includeInCapacity ? 'Yes' : 'No'}</td><td>{project.probability || 0}%</td><td>{project.notes}</td>
    </tr>)}</tbody>
  </table>
</div>;
