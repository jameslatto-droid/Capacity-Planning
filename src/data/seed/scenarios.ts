import type { Scenario } from '../../types'
import { DEFAULT_ASSUMPTIONS } from '../../types'

export const seedScenarios: Scenario[] = [
  {
    id: 's-baseline',
    name: 'Baseline',
    description: 'Current plan with default capacity assumptions',
    createdAt: '2025-01-01T00:00:00.000Z',
    assumptions: { ...DEFAULT_ASSUMPTIONS },
  },
  {
    id: 's-optimistic',
    name: 'Optimistic',
    description: 'Reduced admin allowance — team running lean',
    createdAt: '2025-01-01T00:00:00.000Z',
    basedOnScenarioId: 's-baseline',
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      adminManagementAllowancePercent: 10,
    },
  },
  {
    id: 's-conservative',
    name: 'Conservative',
    description: 'Higher admin allowance and extra leave buffer',
    createdAt: '2025-01-01T00:00:00.000Z',
    basedOnScenarioId: 's-baseline',
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      adminManagementAllowancePercent: 20,
      defaultLeaveDaysPerYear: 28,
    },
  },
]
