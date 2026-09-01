import type { PlannerRepository } from '../repositories/PlannerRepository'
import { LocalStoragePlannerRepository } from '../repositories/LocalStoragePlannerRepository'

export type DataMode = 'mock' | 'sharepoint'

export interface DataProviderConfig {
  mode: DataMode
  siteUrl?: string
}

let _instance: PlannerRepository | null = null

export function getDataProvider(config?: DataProviderConfig): PlannerRepository {
  if (_instance) return _instance

  const mode = config?.mode ?? 'mock'

  if (mode === 'sharepoint') {
    // SPFX_PORT_TODO: import and return SharePointPlannerRepository when ready
    // const { SharePointPlannerRepository } = require('./sharePointDataProvider')
    // _instance = new SharePointPlannerRepository(config.siteUrl)
    console.warn('[CapacityPlanner] SharePoint data provider not yet wired — falling back to mock')
  }

  _instance = new LocalStoragePlannerRepository()
  return _instance
}

export function resetDataProvider(): void {
  _instance = null
}
