export type ResourceRole =
  | 'project-management'
  | 'process-engineering'
  | 'mechanical-engineering'
  | 'drafting'
  | 'procurement'
  | 'quality'
  | 'technical-review'
  | 'management'
  | 'other'

export type FrontendBrand = 'DCT' | 'PLK'

export type EmploymentType = 'employee' | 'contractor' | 'freelancer' | 'placeholder'

export type ProjectStatus = 'opportunity' | 'planned' | 'active' | 'on-hold' | 'complete' | 'cancelled'

export type ProjectPriority = 'critical' | 'high' | 'medium' | 'low'

export type ProjectFlexibility = 'fixed' | 'limited' | 'flexible'

export type LeaveModel = 'fixed-days' | 'pro-rated'

export type UtilisationStatus = 'underused' | 'healthy' | 'high' | 'overloaded' | 'critical'

export interface Resource {
  id: string
  displayName: string
  role: ResourceRole
  secondaryRoles?: ResourceRole[]
  employmentType: EmploymentType
  contractHoursPerWeek: number
  workingDaysPerWeek: number
  fullTimeHoursPerWeek: number
  active: boolean
  notes?: string
}

export interface Project {
  id: string
  code: string
  name: string
  frontendBrand: FrontendBrand
  client?: string
  projectManager?: string
  status: ProjectStatus
  priority: ProjectPriority
  flexibility: ProjectFlexibility
  startMonth: string
  endMonth: string
  notes?: string
}

export interface Allocation {
  id: string
  scenarioId: string
  projectId: string
  resourceId?: string
  role: ResourceRole
  month: string
  hours: number
  locked: boolean
  notes?: string
  lastModifiedAt?: string
}

export type LeaveType = 'annual' | 'sick' | 'public-holiday' | 'unpaid' | 'other'

export interface LeaveEntry {
  id: string
  resourceId: string
  type: LeaveType
  startDate: string   // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
  notes?: string
  createdAt: string
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  'annual': 'Annual Leave',
  'sick': 'Sick Leave',
  'public-holiday': 'Public Holiday',
  'unpaid': 'Unpaid Leave',
  'other': 'Other',
}

export interface CapacityAssumptions {
  fullTimeHoursPerWeek: number
  defaultLeaveDaysPerYear: number
  leaveModel: LeaveModel
  publicHolidayDaysPerYear: number
  adminManagementAllowancePercent: number
  defaultMaxUtilisationPercent: number
}

export interface Scenario {
  id: string
  name: string
  description?: string
  createdAt: string
  basedOnScenarioId?: string
  assumptions: CapacityAssumptions
}

export interface PersonUtilisationResult {
  resourceId: string
  month: string
  allocatedHours: number
  capacityHours: number
  utilisation: number
  overloadHours: number
  status: UtilisationStatus
}

export interface RoleUtilisationResult {
  role: ResourceRole
  month: string
  allocatedHours: number
  capacityHours: number
  utilisation: number
  overloadHours: number
  status: UtilisationStatus
}

export interface TeamUtilisationResult {
  month: string
  allocatedHours: number
  capacityHours: number
  utilisation: number
  overloadHours: number
  status: UtilisationStatus
}

export interface OverloadRecord {
  type: 'person' | 'role'
  id: string
  month: string
  overloadHours: number
  utilisation: number
  status: UtilisationStatus
}

export interface OptimisationRecommendation {
  type: 'same-role-reallocation' | 'secondary-role-reallocation' | 'month-smoothing' | 'contractor'
  overloadedResourceId?: string
  overloadedRole?: ResourceRole
  month: string
  hoursToMove: number
  targetResourceId?: string
  targetMonth?: string
  description: string
}

export interface ContractorRequirement {
  month: string
  residualOverloadHours: number
  contractorFte: number
}

export const ROLE_LABELS: Record<ResourceRole, string> = {
  'project-management': 'Project Management',
  'process-engineering': 'Process Engineering',
  'mechanical-engineering': 'Mechanical Engineering',
  'drafting': 'Drafting',
  'procurement': 'Procurement',
  'quality': 'Quality',
  'technical-review': 'Technical Review',
  'management': 'Management',
  'other': 'Other',
}

export const ALL_ROLES: ResourceRole[] = [
  'project-management',
  'process-engineering',
  'mechanical-engineering',
  'drafting',
  'procurement',
  'quality',
  'technical-review',
  'management',
  'other',
]

export const DEFAULT_ASSUMPTIONS: CapacityAssumptions = {
  fullTimeHoursPerWeek: 40,
  defaultLeaveDaysPerYear: 25,
  leaveModel: 'pro-rated',
  publicHolidayDaysPerYear: 7,
  adminManagementAllowancePercent: 15,
  defaultMaxUtilisationPercent: 100,
}
