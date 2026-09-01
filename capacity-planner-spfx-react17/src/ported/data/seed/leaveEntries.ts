import type { LeaveEntry } from '../../types'

const CREATED_AT = '2026-06-01T00:00:00.000Z'

function annualLeave(id: string, resourceId: string, startDate: string, endDate: string): LeaveEntry {
  return {
    id,
    resourceId,
    type: 'annual',
    startDate,
    endDate,
    createdAt: CREATED_AT,
  }
}

export const seedLeaveEntries: LeaveEntry[] = [
  annualLeave('seed-leave-neville-2026-06-05', 'r-neville', '2026-06-05', '2026-06-05'),
  annualLeave('seed-leave-maria-2026-06-05', 'r-maria', '2026-06-05', '2026-06-12'),
  annualLeave('seed-leave-william-2026-06-22', 'r-william', '2026-06-22', '2026-06-26'),
  annualLeave('seed-leave-fatemeh-2026-07-06', 'r-fatemeh', '2026-07-06', '2026-07-07'),
  annualLeave('seed-leave-william-2026-07-15', 'r-william', '2026-07-15', '2026-07-24'),
  annualLeave('seed-leave-rutger-2026-07-20', 'r-rutger', '2026-07-20', '2026-08-12'),
  annualLeave('seed-leave-neville-2026-08-10', 'r-neville', '2026-08-10', '2026-08-21'),
  annualLeave('seed-leave-fatemeh-2026-09-07', 'r-fatemeh', '2026-09-07', '2026-09-18'),
  annualLeave('seed-leave-onur-2026-11-02', 'r-onur', '2026-11-02', '2026-11-13'),
  annualLeave('seed-leave-rutger-2026-12-21', 'r-rutger', '2026-12-21', '2026-12-31'),
  annualLeave('seed-leave-neville-2026-12-21', 'r-neville', '2026-12-21', '2026-12-31'),
]
