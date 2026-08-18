import type {
  Allocation,
  CapacitySummary,
  Discipline,
  LeaveEntry,
  Person,
  Project
} from '../models/domain';

export interface PlanningDateRange {
  startMonth: string;
  endMonth: string;
}

export interface IResourcePlanningRepository {
  ensureLists(): Promise<void>;

  getPeople(): Promise<Person[]>;
  savePerson(person: Person): Promise<Person>;

  getDisciplines(): Promise<Discipline[]>;
  saveDiscipline(discipline: Discipline): Promise<Discipline>;

  getProjects(): Promise<Project[]>;
  saveProject(project: Project): Promise<Project>;

  getAllocations(range: PlanningDateRange): Promise<Allocation[]>;
  saveAllocation(allocation: Allocation): Promise<Allocation>;
  deleteAllocation(id: number): Promise<void>;

  getLeave(range: PlanningDateRange): Promise<LeaveEntry[]>;
  saveLeave(entry: LeaveEntry): Promise<LeaveEntry>;
  deleteLeave(id: number): Promise<void>;

  getCapacitySummary(range: PlanningDateRange): Promise<CapacitySummary[]>;
}
