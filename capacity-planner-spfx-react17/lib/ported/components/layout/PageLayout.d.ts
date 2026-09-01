import { type ReactNode } from 'react';
interface PageLayoutProps {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}
export declare function PageLayout({ title, subtitle, actions, children }: PageLayoutProps): JSX.Element;
export {};
//# sourceMappingURL=PageLayout.d.ts.map