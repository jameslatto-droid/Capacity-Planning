import { IResourcePlanningRepository } from '../services/IResourcePlanningRepository';

export interface ICapacityPlannerAppProps {
  title: string;
  monthsToShow: number;
  defaultView: 'planner' | 'myAllocations';
  repository: IResourcePlanningRepository;
  fallbackRepository: IResourcePlanningRepository;
  useMockDataWhenListsMissing: boolean;
  siteUrl: string;
  currentUserDisplayName: string;
  currentUserEmail: string;
}
