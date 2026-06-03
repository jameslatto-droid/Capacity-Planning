import type { Scenario } from '../../types'

// Spreadsheet basis: (contracted − 25 days × 8h) × 0.85
// Full-time:  (2080 − 200) × 0.85 = 1598 h/yr = 133.2 h/mo
// Rutger 4d:  (1664 − 200) × 0.85 = 1244 h/yr = 103.7 h/mo
const SPREADSHEET_BASIS = {
  fullTimeHoursPerWeek: 40,
  defaultLeaveDaysPerYear: 25,
  leaveModel: 'fixed-days' as const,
  publicHolidayDaysPerYear: 0,
  adminManagementAllowancePercent: 15,
  defaultMaxUtilisationPercent: 100,
}

// Spec basis (includes 7 public holidays pro-rated): ~1550 h/yr, ~129 h/mo
const SPEC_BASIS = {
  fullTimeHoursPerWeek: 40,
  defaultLeaveDaysPerYear: 25,
  leaveModel: 'pro-rated' as const,
  publicHolidayDaysPerYear: 7,
  adminManagementAllowancePercent: 15,
  defaultMaxUtilisationPercent: 100,
}

export const seedScenarios: Scenario[] = [
  {
    id: 's-baseline',
    name: 'Baseline (Spreadsheet)',
    description: 'Matches v1 spreadsheet: 1598 h/yr FT, 1244 h/yr 4-day. Fixed leave, no public holidays.',
    createdAt: '2026-01-01T00:00:00.000Z',
    assumptions: SPREADSHEET_BASIS,
  },
  {
    id: 's-conservative',
    name: 'Conservative (incl. Public Holidays)',
    description: 'Adds 7 public holidays pro-rated: ~1550 h/yr, ~129 h/mo. More conservative planning basis.',
    createdAt: '2026-01-01T00:00:00.000Z',
    basedOnScenarioId: 's-baseline',
    assumptions: SPEC_BASIS,
  },
  {
    id: 's-lean',
    name: 'Lean (10% Admin)',
    description: 'Reduces admin/management allowance to 10% — team running lean on overhead.',
    createdAt: '2026-01-01T00:00:00.000Z',
    basedOnScenarioId: 's-baseline',
    assumptions: {
      ...SPREADSHEET_BASIS,
      adminManagementAllowancePercent: 10,
    },
  },
]
