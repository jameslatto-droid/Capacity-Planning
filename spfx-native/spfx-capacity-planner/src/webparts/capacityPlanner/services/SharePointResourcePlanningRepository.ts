import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';

import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IProject, IScenario, defaultScenario } from '../models/ResourcePlanningModels';
import { IResourcePlanningRepository } from './IResourcePlanningRepository';
import { RequiredSharePointLists, SharePointListNames } from './sharePointListNames';

export class SharePointResourcePlanningRepository implements IResourcePlanningRepository {
  public constructor(private readonly sp: SPFI, private readonly siteUrl: string) {}

  public async loadSnapshot(_monthsToShow: number): Promise<IDataLoadResult> {
    const missing = await this.getMissingLists();
    if (missing.length > 0) {
      throw new Error(`Missing required SharePoint Lists in ${this.siteUrl}: ${missing.join(', ')}`);
    }

    const [peopleItems, projectItems, allocationItems, leaveItems] = await Promise.all([
      this.sp.web.lists.getByTitle(SharePointListNames.people).items.select('*')(),
      this.sp.web.lists.getByTitle(SharePointListNames.projects).items.select('*')(),
      this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.select('*')(),
      this.sp.web.lists.getByTitle(SharePointListNames.leave).items.select('*')()
    ]);

    return {
      source: 'sharepoint',
      warnings: [],
      snapshot: {
        people: peopleItems.map(this.mapPerson),
        projects: projectItems.map(this.mapProject),
        allocations: allocationItems.map(this.mapAllocation),
        leave: leaveItems.map(this.mapLeave),
        scenarios: [defaultScenario()],
        activeScenarioId: 'baseline'
      }
    };
  }

  public async savePerson(person: IPerson): Promise<IPerson> {
    const payload = {
      Title: person.title,
      Email: person.email || '',
      Discipline: person.discipline || person.primaryRole || '',
      Role: person.role || person.primaryRole || '',
      EmploymentType: person.employmentType || 'Employee',
      FTE: Number(person.fte || 1),
      WeeklyHours: Number(person.weeklyHours || 40),
      WorkingDaysPerWeek: Number(person.workingDaysPerWeek || 5),
      IsActive: person.isActive !== false,
      Manager: person.manager || '',
      Notes: person.notes || ''
    };
    if (typeof person.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.people).items.getById(person.id).update(payload);
      return person;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.people).items.add(payload);
    return { ...person, id: added.Id };
  }

  public async deletePerson(id: number | string): Promise<void> {
    if (typeof id !== 'number') { return; }
    await this.sp.web.lists.getByTitle(SharePointListNames.people).items.getById(id).delete();
  }

  public async saveProject(project: IProject): Promise<IProject> {
    const payload = {
      Title: project.title,
      ProjectCode: project.projectCode,
      ProjectType: project.projectType,
      Status: project.status,
      Brand: project.brand || '',
      Priority: project.priority || 'Normal',
      Client: project.client || '',
      StartDate: project.startDate || null,
      EndDate: project.endDate || null,
      IncludeInCapacity: project.includeInCapacity,
      Probability: project.probability || 0,
      LastAllocationSavedAt: project.lastAllocationSavedAt || null,
      Notes: project.notes || ''
    };
    if (typeof project.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.projects).items.getById(project.id).update(payload);
      return project;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.projects).items.add(payload);
    return { ...project, id: added.Id };
  }

  public async deleteProject(id: number | string): Promise<void> {
    if (typeof id !== 'number') { return; }
    await this.sp.web.lists.getByTitle(SharePointListNames.projects).items.getById(id).delete();
  }

  public async saveAllocation(allocation: IAllocation): Promise<IAllocation> {
    const payload = {
      Title: allocation.title,
      PersonKey: String(allocation.personId),
      ProjectKey: String(allocation.projectId),
      ScenarioKey: String(allocation.scenarioId || 'baseline'),
      AllocationMonth: allocation.allocationMonth,
      AllocationFTE: Number(allocation.allocationFte || 0),
      AllocationHours: allocation.allocationHours || null,
      Discipline: allocation.discipline || allocation.role || '',
      Role: allocation.role || allocation.discipline || '',
      IncludeInCapacity: allocation.includeInCapacity,
      Locked: allocation.locked === true,
      LastModifiedAt: allocation.lastModifiedAt || new Date().toISOString(),
      Notes: allocation.notes || ''
    };
    if (typeof allocation.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.getById(allocation.id).update(payload);
      return allocation;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.add(payload);
    return { ...allocation, id: added.Id };
  }

  public async saveAllocations(allocations: IAllocation[]): Promise<IAllocation[]> {
    const saved: IAllocation[] = [];
    for (let index = 0; index < allocations.length; index++) {
      saved.push(await this.saveAllocation(allocations[index]));
    }
    return saved;
  }

  public async deleteAllocation(id: number | string): Promise<void> {
    if (typeof id !== 'number') { return; }
    await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.getById(id).delete();
  }

  public async saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry> {
    const payload = {
      Title: leaveEntry.title,
      PersonKey: String(leaveEntry.personId),
      LeaveDate: leaveEntry.leaveDate,
      EndDate: leaveEntry.endDate || leaveEntry.leaveDate,
      LeaveHours: Number(leaveEntry.leaveHours || 0),
      LeaveDays: leaveEntry.leaveDays || null,
      LeaveType: leaveEntry.leaveType,
      Notes: leaveEntry.notes || ''
    };
    if (typeof leaveEntry.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.leave).items.getById(leaveEntry.id).update(payload);
      return leaveEntry;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.leave).items.add(payload);
    return { ...leaveEntry, id: added.Id };
  }

  public async deleteLeaveEntry(id: number | string): Promise<void> {
    if (typeof id !== 'number') { return; }
    await this.sp.web.lists.getByTitle(SharePointListNames.leave).items.getById(id).delete();
  }

  public async saveScenario(scenario: IScenario): Promise<IScenario> {
    return scenario;
  }

  private async getMissingLists(): Promise<string[]> {
    const existing = await this.sp.web.lists.select('Title')();
    const existingTitles = existing.map((list: { Title: string }) => list.Title);
    return RequiredSharePointLists.filter((title) => existingTitles.indexOf(title) < 0);
  }

  private mapPerson(item: any): IPerson {
    return {
      id: item.Id,
      title: item.Title,
      email: item.Email || '',
      discipline: item.Discipline || '',
      role: item.Role || item.Discipline || '',
      primaryRole: item.Role || item.Discipline || '',
      secondaryRoles: item.SecondaryRoles ? String(item.SecondaryRoles).split(',').map((role) => role.trim()) : [],
      employmentType: item.EmploymentType || 'Employee',
      fte: Number(item.FTE || 1),
      weeklyHours: Number(item.WeeklyHours || 40),
      workingDaysPerWeek: Number(item.WorkingDaysPerWeek || 5),
      isActive: item.IsActive !== false,
      manager: item.Manager || '',
      notes: item.Notes || ''
    };
  }

  private mapProject(item: any): IProject {
    return {
      id: item.Id,
      title: item.Title,
      projectCode: item.ProjectCode || '',
      projectType: item.ProjectType || 'Live',
      status: item.Status || 'Active',
      brand: item.Brand || 'Other',
      priority: item.Priority || 'Normal',
      client: item.Client || '',
      startDate: item.StartDate || '',
      endDate: item.EndDate || '',
      includeInCapacity: item.IncludeInCapacity !== false,
      probability: Number(item.Probability || 0),
      lastAllocationSavedAt: item.LastAllocationSavedAt || '',
      notes: item.Notes || ''
    };
  }

  private mapAllocation(item: any): IAllocation {
    return {
      id: item.Id,
      title: item.Title,
      personId: item.PersonKey,
      projectId: item.ProjectKey,
      scenarioId: item.ScenarioKey || 'baseline',
      allocationMonth: item.AllocationMonth,
      allocationFte: Number(item.AllocationFTE || 0),
      allocationHours: Number(item.AllocationHours || 0),
      discipline: item.Discipline || item.Role || '',
      role: item.Role || item.Discipline || '',
      includeInCapacity: item.IncludeInCapacity !== false,
      locked: item.Locked === true,
      lastModifiedAt: item.LastModifiedAt || '',
      notes: item.Notes || ''
    };
  }

  private mapLeave(item: any): ILeaveEntry {
    return {
      id: item.Id,
      title: item.Title,
      personId: item.PersonKey,
      leaveDate: item.LeaveDate,
      endDate: item.EndDate || item.LeaveDate,
      leaveHours: Number(item.LeaveHours || 0),
      leaveDays: Number(item.LeaveDays || 0),
      leaveType: item.LeaveType || 'Other',
      notes: item.Notes || ''
    };
  }
}
