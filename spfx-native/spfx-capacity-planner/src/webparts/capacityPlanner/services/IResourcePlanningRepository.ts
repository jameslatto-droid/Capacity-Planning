import { IAllocation, IDataLoadResult, ILeaveEntry, IPerson, IPlanningSnapshot, IProject, IScenario } from '../models/ResourcePlanningModels';

export interface IResourcePlanningRepository {
  loadSnapshot(monthsToShow: number): Promise<IDataLoadResult>;
  savePerson(person: IPerson): Promise<IPerson>;
  deletePerson(id: number | string): Promise<void>;
  saveProject(project: IProject): Promise<IProject>;
  deleteProject(id: number | string): Promise<void>;
  saveAllocation(allocation: IAllocation): Promise<IAllocation>;
  saveAllocations(allocations: IAllocation[]): Promise<IAllocation[]>;
  deleteAllocation(id: number | string): Promise<void>;
  saveLeaveEntry(leaveEntry: ILeaveEntry): Promise<ILeaveEntry>;
  deleteLeaveEntry(id: number | string): Promise<void>;
  saveScenario(scenario: IScenario): Promise<IScenario>;
}

export function emptySnapshot(): IPlanningSnapshot {
  return { people: [], projects: [], allocations: [], leave: [], scenarios: [] };
}
