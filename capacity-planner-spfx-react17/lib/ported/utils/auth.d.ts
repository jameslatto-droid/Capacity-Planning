export type PlannerUserId = 'onur' | 'tim' | 'dion' | 'jim';
export interface PlannerUser {
    id: PlannerUserId;
    displayName: string;
    initials: string;
}
interface PresetUser extends PlannerUser {
    password: string;
}
export declare const PRESET_USERS: PresetUser[];
export declare function authenticateUser(userId: string, password: string): PlannerUser | null;
export declare function getStoredUser(): PlannerUser | null;
export declare function storeUser(user: PlannerUser): void;
export declare function clearStoredUser(): void;
export declare function formatAuditUser(userId?: string): string;
export {};
//# sourceMappingURL=auth.d.ts.map