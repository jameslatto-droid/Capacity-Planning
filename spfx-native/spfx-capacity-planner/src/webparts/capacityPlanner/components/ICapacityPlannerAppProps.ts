import { IResourcePlanningRepository } from '../services/IResourcePlanningRepository';

export interface ICapacityPlannerAppProps {
  title: string;
  monthsToShow: number;
  repository: IResourcePlanningRepository;
  fallbackRepository: IResourcePlanningRepository;
  useMockDataWhenListsMissing: boolean;
  siteUrl: string;
  currentUserDisplayName: string;
  currentUserEmail: string;
}
