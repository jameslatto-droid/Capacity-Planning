import { describe, expect, it } from 'vitest'
import type { Allocation, Project } from '../../types'
import {
  filterResourceCalculationAllocations,
  getProjectType,
  isProjectIncludedInResourceCalculations,
} from './projectPlanning'

const baseProject: Project = {
  id: 'p-live',
  code: 'P1',
  name: 'Live Project',
  frontendBrand: 'DCT',
  projectType: 'live',
  includeInResourceCalculations: true,
  status: 'active',
  priority: 'medium',
  flexibility: 'flexible',
  startMonth: '2026-01',
  endMonth: '2026-12',
}

function allocation(projectId: string, hours = 10): Allocation {
  return {
    id: `a-${projectId}`,
    scenarioId: 's1',
    projectId,
    resourceId: 'r1',
    role: 'process-engineering',
    month: '2026-06',
    hours,
    locked: false,
  }
}

describe('project planning helpers', () => {
  it('defaults existing projects to live and included', () => {
    const project = { ...baseProject, projectType: undefined, includeInResourceCalculations: undefined }

    expect(getProjectType(project)).toBe('live')
    expect(isProjectIncludedInResourceCalculations(project)).toBe(true)
  })

  it('treats legacy opportunity status as opportunity type', () => {
    const project = { ...baseProject, projectType: undefined, status: 'opportunity' as const }

    expect(getProjectType(project)).toBe('opportunity')
  })

  it('excludes opportunity allocations when their manpower toggle is off', () => {
    const includedOpportunity = {
      ...baseProject,
      id: 'p-included',
      projectType: 'opportunity' as const,
      includeInResourceCalculations: true,
    }
    const excludedOpportunity = {
      ...baseProject,
      id: 'p-excluded',
      projectType: 'opportunity' as const,
      includeInResourceCalculations: false,
    }

    const result = filterResourceCalculationAllocations(
      [allocation('p-live'), allocation('p-included'), allocation('p-excluded')],
      [baseProject, includedOpportunity, excludedOpportunity]
    )

    expect(result.map((a) => a.projectId)).toEqual(['p-live', 'p-included'])
  })
})
