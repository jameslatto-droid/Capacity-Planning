import { type InputHTMLAttributes } from 'react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}
export declare function Input({ label, error, className, style: extStyle, ...props }: InputProps): JSX.Element;
export {};
//# sourceMappingURL=Input.d.ts.map