import { SPFI } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/fields';

import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IProject } from '../models/ResourcePlanningModels';
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
        leave: leaveItems.map(this.mapLeave)
      }
    };
  }

  public async savePerson(person: IPerson): Promise<IPerson> {
    const payload = {
      Title: person.title,
      Email: person.email,
      Discipline: person.discipline,
      Role: person.role,
      EmploymentType: person.employmentType,
      FTE: person.fte,
      WeeklyHours: person.weeklyHours,
      IsActive: person.isActive,
      Manager: person.manager || ''
    };
    if (typeof person.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.people).items.getById(person.id).update(payload);
      return person;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.people).items.add(payload);
    return { ...person, id: added.Id };
  }

  public async saveProject(project: IProject): Promise<IProject> {
    const payload = {
      Title: project.title,
      ProjectCode: project.projectCode,
      ProjectType: project.projectType,
      Status: project.status,
      Client: project.client || '',
      StartDate: project.startDate || null,
      EndDate: project.endDate || null,
      IncludeInCapacity: project.includeInCapacity,
      Probability: project.probability || 0,
      Notes: project.notes || ''
    };
    if (typeof project.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.projects).items.getById(project.id).update(payload);
      return project;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.projects).items.add(payload);
    return { ...project, id: added.Id };
  }

  public async saveAllocation(allocation: IAllocation): Promise<IAllocation> {
    const payload = {
      Title: allocation.title,
      PersonKey: String(allocation.personId),
      ProjectKey: String(allocation.projectId),
      AllocationMonth: allocation.allocationMonth,
      AllocationFTE: allocation.allocationFte,
      AllocationHours: allocation.allocationHours || null,
      Discipline: allocation.discipline || '',
      IncludeInCapacity: allocation.includeInCapacity,
      Notes: allocation.notes || ''
    };
    if (typeof allocation.id === 'number') {
      await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.getById(allocation.id).update(payload);
      return allocation;
    }
    const added = await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.add(payload);
    return { ...allocation, id: added.Id };
  }

  public async saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry> {
    const payload = {
      Title: leaveEntry.title,
      PersonKey: String(leaveEntry.personId),
      LeaveDate: leaveEntry.leaveDate,
      LeaveHours: leaveEntry.leaveHours,
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

  public async deleteAllocation(id: number | string): Promise<void> {
    if (typeof id !== 'number') { return; }
    await this.sp.web.lists.getByTitle(SharePointListNames.allocations).items.getById(id).delete();
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
      role: item.Role || '',
      employmentType: item.EmploymentType || 'Employee',
      fte: Number(item.FTE || 1),
      weeklyHours: Number(item.WeeklyHours || 40),
      isActive: item.IsActive !== false,
      manager: item.Manager || ''
    };
  }

  private mapProject(item: any): IProject {
    return {
      id: item.Id,
      title: item.Title,
      projectCode: item.ProjectCode || '',
      projectType: item.ProjectType || 'Live',
      status: item.Status || 'Active',
      client: item.Client || '',
      startDate: item.StartDate || '',
      endDate: item.EndDate || '',
      includeInCapacity: item.IncludeInCapacity !== false,
      probability: Number(item.Probability || 0),
      notes: item.Notes || ''
    };
  }

  private mapAllocation(item: any): IAllocation {
    return {
      id: item.Id,
      title: item.Title,
      personId: item.PersonKey,
      projectId: item.ProjectKey,
      allocationMonth: item.AllocationMonth,
      allocationFte: Number(item.AllocationFTE || 0),
      allocationHours: Number(item.AllocationHours || 0),
      discipline: item.Discipline || '',
      includeInCapacity: item.IncludeInCapacity !== false,
      notes: item.Notes || ''
    };
  }

  private mapLeave(item: any): ILeaveEntry {
    return {
      id: item.Id,
      title: item.Title,
      personId: item.PersonKey,
      leaveDate: item.LeaveDate,
      leaveHours: Number(item.LeaveHours || 0),
      leaveType: item.LeaveType || 'Other',
      notes: item.Notes || ''
    };
  }
}
