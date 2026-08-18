import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IPlanningSnapshot, IProject } from '../models/ResourcePlanningModels';

export interface IResourcePlanningRepository {
  loadSnapshot(monthsToShow: number): Promise<IDataLoadResult>;
  savePerson(person: IPerson): Promise<IPerson>;
  saveProject(project: IProject): Promise<IProject>;
  saveAllocation(allocation: IAllocation): Promise<IAllocation>;
  saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry>;
  deleteAllocation(id: number | string): Promise<void>;
}

export function emptySnapshot(): IPlanningSnapshot {
  return { people: [], projects: [], allocations: [], leave: [] };
}
