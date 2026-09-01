/// <reference types="react" />
import type { Project, Resource } from '../../types';
interface Props {
    initial?: Project;
    resources: Resource[];
    onSave: (data: Omit<Project, 'id'>) => void;
    onCancel: () => void;
}
export declare function ProjectForm({ initial, resources, onSave, onCancel }: Props): JSX.Element;
export {};
//# sourceMappingURL=ProjectForm.d.ts.map