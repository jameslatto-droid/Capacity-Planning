export type ProjectType = 'Live' | 'Opportunity';
export type ProjectStatus = 'Pipeline' | 'Planned' | 'Active' | 'On Hold' | 'Complete' | 'Cancelled';
export type EmploymentType = 'Employee' | 'Freelancer';
export type LeaveType = 'Holiday' | 'Sick' | 'Training' | 'Public Holiday' | 'Unpaid' | 'Other';
export type FrontendBrand = 'DCT' | 'PLK' | 'Internal' | 'Other';
export type ResourceRole = 'Project Management' | 'Process Engineering' | 'Mechanical Engineering' | 'Drafting' | 'Procurement' | 'Quality' | 'Technical Review' | 'Management' | 'Other';
export type LeaveModel = 'fixed-days' | 'pro-rated';

export interface ICapacityAssumptions {
  fullTimeHoursPerWeek: number;
  defaultLeaveDaysPerYear: number;
  leaveModel: LeaveModel;
  publicHolidayDaysPerYear: number;
  adminManagementAllowancePercent: number;
  defaultMaxUtilisationPercent: number;
}

export interface IScenario {
  id: number | string;
  title: string;
  description?: string;
  isActive: boolean;
  assumptions: ICapacityAssumptions;
  basedOnScenarioId?: number | string;
  createdAt?: string;
}

export interface IPerson {
  id: number | string;
  title: string;
  email: string;
  discipline: string;
  role: string;
  primaryRole?: ResourceRole | string;
  secondaryRoles?: string[];
  employmentType: EmploymentType;
  fte: number;
  weeklyHours: number;
  workingDaysPerWeek?: number;
  isActive: boolean;
  manager?: string;
  notes?: string;
}

export interface IProject {
  id: number | string;
  title: string;
  projectCode: string;
  projectType: ProjectType;
  status: ProjectStatus;
  brand?: FrontendBrand;
  priority?: 'Low' | 'Normal' | 'High' | 'Critical';
  client?: string;
  startDate?: string;
  endDate?: string;
  includeInCapacity: boolean;
  probability?: number;
  notes?: string;
  lastAllocationSavedAt?: string;
}

export interface IAllocation {
  id: number | string;
  title: string;
  personId: number | string;
  projectId: number | string;
  scenarioId?: number | string;
  allocationMonth: string;
  allocationFte: number;
  allocationHours?: number;
  discipline?: string;
  role?: ResourceRole | string;
  includeInCapacity: boolean;
  locked?: boolean;
  lastModifiedAt?: string;
  notes?: string;
}

export interface ILeaveEntry {
  id: number | string;
  title: string;
  personId: number | string;
  leaveDate: string;
  endDate?: string;
  leaveHours: number;
  leaveDays?: number;
  leaveType: LeaveType;
  notes?: string;
}

export interface IPlanningSnapshot {
  people: IPerson[];
  projects: IProject[];
  allocations: IAllocation[];
  leave: ILeaveEntry[];
  scenarios?: IScenario[];
  activeScenarioId?: number | string;
}

export interface IMonthSummary {
  month: string;
  capacityHours: number;
  allocatedHours: number;
  leaveHours: number;
  availableHours: number;
  utilisation: number;
}

export interface IPersonMonthSummary extends IMonthSummary {
  personId: number | string;
  personName: string;
  discipline: string;
  role?: string;
  overloadHours?: number;
}

export interface IRoleMonthSummary extends IMonthSummary {
  role: string;
}

export interface IProjectDemandSummary {
  projectId: number | string;
  projectTitle: string;
  projectCode: string;
  projectType: ProjectType;
  brand?: FrontendBrand;
  totalHours: number;
  includedHours: number;
}

export interface IOverloadSummary {
  personId: number | string;
  personName: string;
  role: string;
  month: string;
  allocatedHours: number;
  availableHours: number;
  utilisation: number;
  overloadHours: number;
}

export interface IReallocationRecommendation {
  month: string;
  role: string;
  fromPersonId: number | string;
  fromPersonName: string;
  toPersonId: number | string;
  toPersonName: string;
  suggestedHours: number;
  reason: string;
}

export interface IDataLoadResult {
  snapshot: IPlanningSnapshot;
  source: 'sharepoint' | 'mock';
  warnings: string[];
}

export function defaultCapacityAssumptions(): ICapacityAssumptions {
  return {
    fullTimeHoursPerWeek: 40,
    defaultLeaveDaysPerYear: 25,
    leaveModel: 'fixed-days',
    publicHolidayDaysPerYear: 0,
    adminManagementAllowancePercent: 15,
    defaultMaxUtilisationPercent: 100
  };
}

export function defaultScenario(): IScenario {
  return {
    id: 'baseline',
    title: 'Baseline',
    description: 'Original V1 planning basis: 25 leave days, no public holiday deduction and 15% admin allowance.',
    isActive: true,
    assumptions: defaultCapacityAssumptions(),
    createdAt: new Date().toISOString()
  };
}
