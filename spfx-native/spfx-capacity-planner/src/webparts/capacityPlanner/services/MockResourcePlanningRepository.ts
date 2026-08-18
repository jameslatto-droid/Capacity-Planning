import { addMonths, firstDayOfMonthIso } from '../utils/dateUtils';
import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IPlanningSnapshot, IProject } from '../models/ResourcePlanningModels';
import { IResourcePlanningRepository } from './IResourcePlanningRepository';

const people: IPerson[] = [
  { id: 'p1', title: 'Onur Kavakli', email: 'onur@example.com', discipline: 'Process', role: 'Principal Engineer', employmentType: 'Employee', fte: 1, weeklyHours: 40, isActive: true },
  { id: 'p2', title: 'Maria Alonzo', email: 'maria@example.com', discipline: 'Project Management', role: 'Project Manager', employmentType: 'Employee', fte: 1, weeklyHours: 40, isActive: true },
  { id: 'p3', title: 'Rutger Reij', email: 'rutger@example.com', discipline: 'Mechanical', role: 'Mechanical Engineer', employmentType: 'Employee', fte: 1, weeklyHours: 40, isActive: true },
  { id: 'p4', title: 'Boris Welzen', email: 'boris@example.com', discipline: 'Procurement', role: 'Procurement Manager', employmentType: 'Employee', fte: 0.8, weeklyHours: 32, isActive: true },
  { id: 'p5', title: 'Ajitha Karuppiah', email: 'ajitha@example.com', discipline: 'Drafting', role: 'Draughtsperson', employmentType: 'Employee', fte: 1, weeklyHours: 40, isActive: true }
];

const projects: IProject[] = [
  { id: 'j1', title: 'CISEC Wastewater Package', projectCode: 'P250002', projectType: 'Live', status: 'Active', client: 'CISEC', includeInCapacity: true, probability: 100, notes: 'Live delivery project.' },
  { id: 'j2', title: 'Industrial Reuse Opportunity', projectCode: 'OPP-001', projectType: 'Opportunity', status: 'Pipeline', client: 'Industrial Client', includeInCapacity: true, probability: 60, notes: 'Pipeline project included for manpower planning.' },
  { id: 'j3', title: 'Service Support Allowance', projectCode: 'INT-SUP', projectType: 'Live', status: 'Active', client: 'Internal', includeInCapacity: true, probability: 100, notes: 'Internal support and sales effort placeholder.' }
];

function seedAllocations(monthsToShow: number): IAllocation[] {
  const start = firstDayOfMonthIso(new Date());
  const result: IAllocation[] = [];
  for (let i = 0; i < monthsToShow; i++) {
    const month = firstDayOfMonthIso(addMonths(start, i));
    result.push({ id: `a-onur-${i}`, title: `Onur - CISEC - ${month}`, personId: 'p1', projectId: 'j1', allocationMonth: month, allocationFte: i < 5 ? 0.7 : 0.35, includeInCapacity: true, discipline: 'Process' });
    result.push({ id: `a-maria-${i}`, title: `Maria - CISEC - ${month}`, personId: 'p2', projectId: 'j1', allocationMonth: month, allocationFte: i < 4 ? 0.4 : 0.2, includeInCapacity: true, discipline: 'Project Management' });
    result.push({ id: `a-rutger-${i}`, title: `Rutger - Reuse - ${month}`, personId: 'p3', projectId: 'j2', allocationMonth: month, allocationFte: i > 1 && i < 8 ? 0.5 : 0.15, includeInCapacity: true, discipline: 'Mechanical' });
    result.push({ id: `a-boris-${i}`, title: `Boris - Support - ${month}`, personId: 'p4', projectId: 'j3', allocationMonth: month, allocationFte: 0.15, includeInCapacity: true, discipline: 'Procurement' });
    result.push({ id: `a-ajitha-${i}`, title: `Ajitha - CISEC - ${month}`, personId: 'p5', projectId: 'j1', allocationMonth: month, allocationFte: i < 6 ? 0.45 : 0.2, includeInCapacity: true, discipline: 'Drafting' });
  }
  return result;
}

function seedLeave(): ILeaveEntry[] {
  const month = firstDayOfMonthIso(new Date());
  return [
    { id: 'l1', title: 'Maria leave', personId: 'p2', leaveDate: month, leaveHours: 16, leaveType: 'Holiday' },
    { id: 'l2', title: 'Rutger training', personId: 'p3', leaveDate: month, leaveHours: 8, leaveType: 'Training' }
  ];
}

export class MockResourcePlanningRepository implements IResourcePlanningRepository {
  public async loadSnapshot(monthsToShow: number): Promise<IDataLoadResult> {
    const snapshot: IPlanningSnapshot = {
      people,
      projects,
      allocations: seedAllocations(monthsToShow),
      leave: seedLeave()
    };
    return { snapshot, source: 'mock', warnings: ['Using mock planning data. Provision the ERP_* SharePoint Lists to use live site data.'] };
  }

  public async savePerson(person: IPerson): Promise<IPerson> { return person; }
  public async saveProject(project: IProject): Promise<IProject> { return project; }
  public async saveAllocation(allocation: IAllocation): Promise<IAllocation> { return allocation; }
  public async saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry> { return leaveEntry; }
  public async deleteAllocation(_id: number | string): Promise<void> { return undefined; }
}
