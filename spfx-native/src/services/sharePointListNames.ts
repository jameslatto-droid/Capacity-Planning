export const SharePointListNames = {
  people: 'ERP_People',
  disciplines: 'ERP_Disciplines',
  projects: 'ERP_Projects',
  allocations: 'ERP_Allocations',
  leave: 'ERP_Leave',
  settings: 'ERP_Settings',
  auditLog: 'ERP_AuditLog'
} as const;

export type SharePointListKey = keyof typeof SharePointListNames;

export const RequiredSharePointLists = Object.values(SharePointListNames);
