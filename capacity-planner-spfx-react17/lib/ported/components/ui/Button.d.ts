import { type ButtonHTMLAttributes, type ReactNode } from 'react';
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md';
    children: ReactNode;
}
export declare function Button({ variant, size, className, children, style: extStyle, ...props }: ButtonProps): JSX.Element;
export {};
//# sourceMappingURL=Button.d.ts.map