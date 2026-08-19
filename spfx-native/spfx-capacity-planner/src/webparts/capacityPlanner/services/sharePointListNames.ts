export const SharePointListNames = {
  people: 'ERP_People',
  projects: 'ERP_Projects',
  allocations: 'ERP_Allocations',
  leave: 'ERP_Leave',
  disciplines: 'ERP_Disciplines',
  settings: 'ERP_Settings',
  auditLog: 'ERP_AuditLog'
} as const;

export const RequiredSharePointLists: string[] = [
  SharePointListNames.people,
  SharePointListNames.projects,
  SharePointListNames.allocations,
  SharePointListNames.leave,
  SharePointListNames.disciplines,
  SharePointListNames.settings,
  SharePointListNames.auditLog
];
