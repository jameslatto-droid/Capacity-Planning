export type EmploymentType = 'Employee' | 'Freelancer' | 'Contractor';
export type ProjectType = 'Opportunity' | 'Live';
export type ProjectStatus = 'Pipeline' | 'Active' | 'On Hold' | 'Complete' | 'Cancelled';
export type LeaveType = 'Holiday' | 'Sick' | 'Training' | 'Other';

export interface Person {
  id: number;
  title: string;
  email: string;
  discipline: string;
  role?: string;
  employmentType: EmploymentType;
  fte: number;
  weeklyHours: number;
  managerEmail?: string;
  isActive: boolean;
}

export interface Discipline {
  id: number;
  title: string;
  sortOrder: number;
  colourToken?: string;
  isActive: boolean;
}

export interface Project {
  id: number;
  title: string;
  projectCode?: string;
  projectType: ProjectType;
  status: ProjectStatus;
  client?: string;
  startDate: string;
  endDate: string;
  includeInCapacity: boolean;
  probability?: number;
  notes?: string;
}

export interface Allocation {
  id: number;
  title: string;
  personId: number;
  personName: string;
  personEmail: string;
  projectId: number;
  projectName: string;
  projectCode?: string;
  projectType: ProjectType;
  discipline: string;
  allocationMonth: string;
  allocationFte: number;
  allocationHours: number;
  includeInCapacity: boolean;
  notes?: string;
}

export interface LeaveEntry {
  id: number;
  title: string;
  personId: number;
  personName: string;
  leaveDate: string;
  leaveHours: number;
  leaveType: LeaveType;
  notes?: string;
}

export interface CapacitySummary {
  personId: number;
  personName: string;
  discipline: string;
  month: string;
  availableHours: number;
  allocatedHours: number;
  utilisationPercent: number;
}
