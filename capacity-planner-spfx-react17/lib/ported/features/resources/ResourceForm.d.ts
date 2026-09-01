/// <reference types="react" />
import type { Resource } from '../../types';
interface Props {
    initial?: Resource;
    onSave: (data: Omit<Resource, 'id'>) => void;
    onCancel: () => void;
}
export declare function ResourceForm({ initial, onSave, onCancel }: Props): JSX.Element;
export {};
//# sourceMappingURL=ResourceForm.d.ts.map