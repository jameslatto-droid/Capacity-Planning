export type ResourceRole = 'project-management' | 'process-engineering' | 'mechanical-engineering' | 'drafting' | 'procurement' | 'quality' | 'technical-review' | 'management' | 'other';
export type FrontendBrand = 'DCT' | 'PLK';
export type EmploymentType = 'employee' | 'contractor' | 'freelancer' | 'placeholder';
export type ProjectStatus = 'opportunity' | 'planned' | 'active' | 'on-hold' | 'complete' | 'cancelled';
export type ProjectType = 'live' | 'opportunity';
export type ProjectPriority = 'critical' | 'high' | 'medium' | 'low';
export type ProjectFlexibility = 'fixed' | 'limited' | 'flexible';
export type LeaveModel = 'fixed-days' | 'pro-rated';
export type UtilisationStatus = 'underused' | 'healthy' | 'high' | 'overloaded' | 'critical';
export interface Resource {
    id: string;
    displayName: string;
    role: ResourceRole;
    secondaryRoles?: ResourceRole[];
    employmentType: EmploymentType;
    contractHoursPerWeek: number;
    workingDaysPerWeek: number;
    fullTimeHoursPerWeek: number;
    active: boolean;
    notes?: string;
    contractStart?: string;
    contractEnd?: string;
    createdAt?: string;
    createdBy?: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}
export interface Project {
    id: string;
    code: string;
    name: string;
    frontendBrand: FrontendBrand;
    client?: string;
    projectManager?: string;
    projectType?: ProjectType;
    includeInResourceCalculations?: boolean;
    status: ProjectStatus;
    priority: ProjectPriority;
    flexibility: ProjectFlexibility;
    startMonth: string;
    endMonth: string;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}
export interface Allocation {
    id: string;
    scenarioId: string;
    projectId: string;
    resourceId?: string;
    role: ResourceRole;
    month: string;
    hours: number;
    locked: boolean;
    notes?: string;
    createdAt?: string;
    createdBy?: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}
export type LeaveType = 'annual' | 'sick' | 'public-holiday' | 'unpaid' | 'other';
export interface LeaveEntry {
    id: string;
    resourceId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    notes?: string;
    createdAt: string;
    createdBy?: string;
    lastModifiedAt?: string;
    lastModifiedBy?: string;
}
export declare const LEAVE_TYPE_LABELS: Record<LeaveType, string>;
export interface CapacityAssumptions {
    fullTimeHoursPerWeek: number;
    defaultLeaveDaysPerYear: number;
    leaveModel: LeaveModel;
    publicHolidayDaysPerYear: number;
    adminManagementAllowancePercent: number;
    defaultMaxUtilisationPercent: number;
}
export interface Scenario {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    basedOnScenarioId?: string;
    assumptions: CapacityAssumptions;
}
export interface PersonUtilisationResult {
    resourceId: string;
    month: string;
    allocatedHours: number;
    capacityHours: number;
    utilisation: number;
    overloadHours: number;
    status: UtilisationStatus;
}
export interface RoleUtilisationResult {
    role: ResourceRole;
    month: string;
    allocatedHours: number;
    capacityHours: number;
    utilisation: number;
    overloadHours: number;
    status: UtilisationStatus;
}
export interface TeamUtilisationResult {
    month: string;
    allocatedHours: number;
    capacityHours: number;
    utilisation: number;
    overloadHours: number;
    status: UtilisationStatus;
}
export interface OverloadRecord {
    type: 'person' | 'role';
    id: string;
    month: string;
    overloadHours: number;
    utilisation: number;
    status: UtilisationStatus;
}
export interface OptimisationRecommendation {
    type: 'same-role-reallocation' | 'secondary-role-reallocation' | 'month-smoothing' | 'contractor';
    overloadedResourceId?: string;
    overloadedRole?: ResourceRole;
    month: string;
    hoursToMove: number;
    targetResourceId?: string;
    targetMonth?: string;
    description: string;
}
export interface ContractorRequirement {
    month: string;
    residualOverloadHours: number;
    contractorFte: number;
}
export declare const ROLE_LABELS: Record<ResourceRole, string>;
export declare const ALL_ROLES: ResourceRole[];
export declare const DEFAULT_ASSUMPTIONS: CapacityAssumptions;
//# sourceMappingURL=index.d.ts.map