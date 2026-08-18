export type ProjectType = 'Live' | 'Opportunity';
export type ProjectStatus = 'Pipeline' | 'Active' | 'On Hold' | 'Complete' | 'Cancelled';
export type EmploymentType = 'Employee' | 'Freelancer';
export type LeaveType = 'Holiday' | 'Sick' | 'Training' | 'Other';

export interface IPerson {
  id: number | string;
  title: string;
  email: string;
  discipline: string;
  role: string;
  employmentType: EmploymentType;
  fte: number;
  weeklyHours: number;
  isActive: boolean;
  manager?: string;
}

export interface IProject {
  id: number | string;
  title: string;
  projectCode: string;
  projectType: ProjectType;
  status: ProjectStatus;
  client?: string;
  startDate?: string;
  endDate?: string;
  includeInCapacity: boolean;
  probability?: number;
  notes?: string;
}

export interface IAllocation {
  id: number | string;
  title: string;
  personId: number | string;
  projectId: number | string;
  allocationMonth: string;
  allocationFte: number;
  allocationHours?: number;
  discipline?: string;
  includeInCapacity: boolean;
  notes?: string;
}

export interface ILeaveEntry {
  id: number | string;
  title: string;
  personId: number | string;
  leaveDate: string;
  leaveHours: number;
  leaveType: LeaveType;
  notes?: string;
}

export interface IPlanningSnapshot {
  people: IPerson[];
  projects: IProject[];
  allocations: IAllocation[];
  leave: ILeaveEntry[];
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
}

export interface IProjectDemandSummary {
  projectId: number | string;
  projectTitle: string;
  projectCode: string;
  projectType: ProjectType;
  totalHours: number;
  includedHours: number;
}

export interface IDataLoadResult {
  snapshot: IPlanningSnapshot;
  source: 'sharepoint' | 'mock';
  warnings: string[];
}
