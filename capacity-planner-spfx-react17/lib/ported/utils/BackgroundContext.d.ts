import { type ReactNode } from 'react';
interface BackgroundCtx {
    bgImage: string;
    setBgImage: (name: string) => void;
}
export declare function BackgroundProvider({ children }: {
    children: ReactNode;
}): JSX.Element;
export declare const useBackground: () => BackgroundCtx;
export {};
//# sourceMappingURL=BackgroundContext.d.ts.map