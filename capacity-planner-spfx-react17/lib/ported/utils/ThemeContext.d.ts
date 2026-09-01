import { type ReactNode } from 'react';
export type Theme = 'light' | 'dark';
interface ThemeCtx {
    theme: Theme;
    toggle: () => void;
    isDark: boolean;
}
export declare function ThemeProvider({ children }: {
    children: ReactNode;
}): JSX.Element;
export declare const useTheme: () => ThemeCtx;
export {};
//# sourceMappingURL=ThemeContext.d.ts.map