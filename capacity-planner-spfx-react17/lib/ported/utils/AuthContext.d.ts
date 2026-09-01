import { type ReactNode } from 'react';
import { type PlannerUser } from './auth';
interface AuthContextValue {
    currentUser: PlannerUser | null;
    login(userId: string, password: string): boolean;
    logout(): void;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): JSX.Element;
export declare function useAuth(): AuthContextValue;
export {};
//# sourceMappingURL=AuthContext.d.ts.map