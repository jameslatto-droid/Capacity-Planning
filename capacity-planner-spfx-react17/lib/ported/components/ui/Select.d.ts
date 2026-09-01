import { type SelectHTMLAttributes } from 'react';
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: {
        value: string;
        label: string;
    }[];
}
export declare function Select({ label, options, className, style: extStyle, ...props }: SelectProps): JSX.Element;
export {};
//# sourceMappingURL=Select.d.ts.map