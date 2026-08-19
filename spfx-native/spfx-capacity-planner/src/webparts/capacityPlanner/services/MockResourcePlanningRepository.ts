import { addMonths, firstDayOfMonthIso } from '../utils/dateUtils';
import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IPlanningSnapshot, IProject, IScenario, defaultScenario } from '../models/ResourcePlanningModels';
import { IResourcePlanningRepository } from './IResourcePlanningRepository';

function nextMockId(prefix: string): string { return `${prefix}-${new Date().getTime()}-${Math.round(Math.random() * 100000)}`; }

export class MockResourcePlanningRepository implements IResourcePlanningRepository {
  private people: IPerson[] = [
    { id: 'p1', title: 'Onur Kavakli', email: 'onur@example.com', discipline: 'Process Engineering', role: 'Principal Engineer', primaryRole: 'Process Engineering', secondaryRoles: ['Technical Review'], employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true },
    { id: 'p2', title: 'Maria Alonzo', email: 'maria@example.com', discipline: 'Project Management', role: 'Project Manager', primaryRole: 'Project Management', employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true },
    { id: 'p3', title: 'Rutger Reij', email: 'rutger@example.com', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer', primaryRole: 'Mechanical Engineering', employmentType: 'Employee', fte: 0.8, weeklyHours: 32, workingDaysPerWeek: 4, isActive: true },
    { id: 'p4', title: 'Boris Welzen', email: 'boris@example.com', discipline: 'Procurement', role: 'Procurement Manager', primaryRole: 'Procurement', employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true },
    { id: 'p5', title: 'Ajitha Karuppiah', email: 'ajitha@example.com', discipline: 'Drafting', role: 'Draughtsperson', primaryRole: 'Drafting', employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true },
    { id: 'p6', title: 'Fatemeh Rashidashmagh', email: 'fatemeh@example.com', discipline: 'Process Engineering', role: 'Process Engineer', primaryRole: 'Process Engineering', employmentType: 'Employee', fte: 1, weeklyHours: 40, workingDaysPerWeek: 5, isActive: true }
  ];

  private projects: IProject[] = [
    { id: 'j1', title: 'Cancun CISEC', projectCode: 'P250002', projectType: 'Live', status: 'Active', brand: 'DCT', priority: 'Critical', client: 'CISEC', startDate: '2026-01-01', endDate: '2027-06-30', includeInCapacity: true, probability: 100, notes: 'Live LATAM delivery project.' },
    { id: 'j2', title: 'TAQA', projectCode: 'P260001', projectType: 'Live', status: 'Active', brand: 'PLK', priority: 'High', client: 'TAQA', startDate: '2026-01-01', endDate: '2027-06-30', includeInCapacity: true, probability: 100, notes: 'Critical PLK delivery project.' },
    { id: 'j3', title: 'SARAT Opportunity', projectCode: 'QDG2600002', projectType: 'Opportunity', status: 'Pipeline', brand: 'DCT', priority: 'Normal', client: 'SARAT', startDate: '2026-04-01', endDate: '2026-09-30', includeInCapacity: true, probability: 60, notes: 'Pipeline opportunity included in manpower planning.' },
    { id: 'j4', title: 'Sales and Quotations Effort', projectCode: 'SALES', projectType: 'Opportunity', status: 'Pipeline', brand: 'Internal', priority: 'Normal', client: 'Internal', startDate: '2026-08-01', endDate: '2027-08-31', includeInCapacity: true, probability: 100, notes: 'Separate time consumer for sales and quotations effort.' }
  ];

  private scenarios: IScenario[] = [defaultScenario(), { id: 'conservative', title: 'Conservative', description: 'Public holidays deducted and leave pro-rated.', isActive: false, assumptions: { fullTimeHoursPerWeek: 40, defaultLeaveDaysPerYear: 25, leaveModel: 'pro-rated', publicHolidayDaysPerYear: 7, adminManagementAllowancePercent: 15, defaultMaxUtilisationPercent: 100 }, createdAt: new Date().toISOString() }];
  private allocations: IAllocation[] = [];
  private leave: ILeaveEntry[] = [];

  public constructor() {
    this.allocations = this.seedAllocations(18);
    this.leave = this.seedLeave();
  }

  public async loadSnapshot(_monthsToShow: number): Promise<IDataLoadResult> {
    const snapshot: IPlanningSnapshot = {
      people: this.people.slice(0),
      projects: this.projects.slice(0),
      allocations: this.allocations.slice(0),
      leave: this.leave.slice(0),
      scenarios: this.scenarios.slice(0),
      activeScenarioId: 'baseline'
    };
    return { snapshot, source: 'mock', warnings: ['Using mock planning data. Provision the ERP_* SharePoint Lists to use live site data.'] };
  }

  public async savePerson(person: IPerson): Promise<IPerson> {
    const saved = { ...person, id: String(person.id || '').indexOf('new-') === 0 || !person.id ? nextMockId('person') : person.id } as IPerson;
    this.people = this.upsert(this.people, saved) as IPerson[];
    return saved;
  }

  public async deletePerson(id: number | string): Promise<void> {
    this.people = this.people.filter((person) => String(person.id) !== String(id));
    this.allocations = this.allocations.filter((allocation) => String(allocation.personId) !== String(id));
  }

  public async saveProject(project: IProject): Promise<IProject> {
    const saved = { ...project, id: String(project.id || '').indexOf('new-') === 0 || !project.id ? nextMockId('project') : project.id } as IProject;
    this.projects = this.upsert(this.projects, saved) as IProject[];
    return saved;
  }

  public async deleteProject(id: number | string): Promise<void> {
    this.projects = this.projects.filter((project) => String(project.id) !== String(id));
    this.allocations = this.allocations.filter((allocation) => String(allocation.projectId) !== String(id));
  }

  public async saveAllocation(allocation: IAllocation): Promise<IAllocation> {
    const saved = { ...allocation, id: String(allocation.id || '').indexOf('new-') === 0 || !allocation.id ? nextMockId('allocation') : allocation.id, lastModifiedAt: new Date().toISOString() } as IAllocation;
    this.allocations = this.upsert(this.allocations, saved) as IAllocation[];
    return saved;
  }

  public async saveAllocations(allocations: IAllocation[]): Promise<IAllocation[]> {
    const saved: IAllocation[] = [];
    for (let index = 0; index < allocations.length; index++) { saved.push(await this.saveAllocation(allocations[index])); }
    return saved;
  }

  public async deleteAllocation(id: number | string): Promise<void> {
    this.allocations = this.allocations.filter((allocation) => String(allocation.id) !== String(id));
  }

  public async saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry> {
    const saved = { ...leaveEntry, id: String(leaveEntry.id || '').indexOf('new-') === 0 || !leaveEntry.id ? nextMockId('leave') : leaveEntry.id } as ILeaveEntry;
    this.leave = this.upsert(this.leave, saved) as ILeaveEntry[];
    return saved;
  }

  public async deleteLeaveEntry(id: number | string): Promise<void> {
    this.leave = this.leave.filter((entry) => String(entry.id) !== String(id));
  }

  public async saveScenario(scenario: IScenario): Promise<IScenario> {
    const saved = { ...scenario, id: scenario.id || nextMockId('scenario') };
    if (saved.isActive) { this.scenarios = this.scenarios.map((item) => ({ ...item, isActive: false })); }
    this.scenarios = this.upsert(this.scenarios, saved) as IScenario[];
    return saved;
  }

  private upsert(items: Array<{ id: number | string }>, item: { id: number | string }): Array<{ id: number | string }> {
    let replaced = false;
    const updated = items.map((existing) => {
      if (String(existing.id) === String(item.id)) { replaced = true; return item; }
      return existing;
    });
    if (!replaced) { updated.push(item); }
    return updated;
  }

  private seedAllocations(monthsToShow: number): IAllocation[] {
    const start = firstDayOfMonthIso(new Date());
    const result: IAllocation[] = [];
    for (let i = 0; i < monthsToShow; i++) {
      const month = firstDayOfMonthIso(addMonths(start, i));
      result.push({ id: `a-onur-cisec-${i}`, title: `Onur - CISEC - ${month}`, personId: 'p1', projectId: 'j1', scenarioId: 'baseline', allocationMonth: month, allocationFte: i < 5 ? 0.75 : 0.35, includeInCapacity: true, discipline: 'Process Engineering', role: 'Process Engineering' });
      result.push({ id: `a-maria-cisec-${i}`, title: `Maria - CISEC - ${month}`, personId: 'p2', projectId: 'j1', scenarioId: 'baseline', allocationMonth: month, allocationFte: i < 4 ? 0.45 : 0.25, includeInCapacity: true, discipline: 'Project Management', role: 'Project Management' });
      result.push({ id: `a-rutger-taqa-${i}`, title: `Rutger - TAQA - ${month}`, personId: 'p3', projectId: 'j2', scenarioId: 'baseline', allocationMonth: month, allocationFte: i > 1 && i < 8 ? 0.85 : 0.3, includeInCapacity: true, discipline: 'Mechanical Engineering', role: 'Mechanical Engineering' });
      result.push({ id: `a-boris-sales-${i}`, title: `Boris - Sales - ${month}`, personId: 'p4', projectId: 'j4', scenarioId: 'baseline', allocationMonth: month, allocationFte: 0.2, includeInCapacity: true, discipline: 'Procurement', role: 'Procurement' });
      result.push({ id: `a-ajitha-cisec-${i}`, title: `Ajitha - CISEC - ${month}`, personId: 'p5', projectId: 'j1', scenarioId: 'baseline', allocationMonth: month, allocationFte: i < 6 ? 0.45 : 0.2, includeInCapacity: true, discipline: 'Drafting', role: 'Drafting' });
      result.push({ id: `a-fatemeh-sarat-${i}`, title: `Fatemeh - SARAT - ${month}`, personId: 'p6', projectId: 'j3', scenarioId: 'baseline', allocationMonth: month, allocationFte: i < 3 ? 0.2 : 0.55, includeInCapacity: true, discipline: 'Process Engineering', role: 'Process Engineering' });
    }
    return result;
  }

  private seedLeave(): ILeaveEntry[] {
    const month = firstDayOfMonthIso(new Date());
    return [
      { id: 'l1', title: 'Maria annual leave', personId: 'p2', leaveDate: month, leaveHours: 16, leaveDays: 2, leaveType: 'Holiday' },
      { id: 'l2', title: 'Rutger training', personId: 'p3', leaveDate: month, leaveHours: 8, leaveDays: 1, leaveType: 'Training' }
    ];
  }
}
