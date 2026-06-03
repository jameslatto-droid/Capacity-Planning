import type { Allocation } from '../../types'

const SCENARIO = 's-baseline'

function alloc(
  id: string,
  projectId: string,
  resourceId: string,
  role: Allocation['role'],
  month: string,
  hours: number,
  locked = false
): Allocation {
  return { id, scenarioId: SCENARIO, projectId, resourceId, role, month, hours, locked, notes: undefined }
}

export const seedAllocations: Allocation[] = [
  // p-001 Water Treatment Upgrade (DCT) - active high priority
  alloc('a-001', 'p-001', 'r-001', 'project-management', '2025-05', 40),
  alloc('a-002', 'p-001', 'r-001', 'project-management', '2025-06', 40),
  alloc('a-003', 'p-001', 'r-001', 'project-management', '2025-07', 30),
  alloc('a-004', 'p-001', 'r-002', 'process-engineering', '2025-05', 80),
  alloc('a-005', 'p-001', 'r-002', 'process-engineering', '2025-06', 90),
  alloc('a-006', 'p-001', 'r-002', 'process-engineering', '2025-07', 60),
  alloc('a-007', 'p-001', 'r-003', 'mechanical-engineering', '2025-05', 60),
  alloc('a-008', 'p-001', 'r-003', 'mechanical-engineering', '2025-06', 70),
  alloc('a-009', 'p-001', 'r-004', 'drafting', '2025-05', 60),
  alloc('a-010', 'p-001', 'r-004', 'drafting', '2025-06', 70),
  alloc('a-011', 'p-001', 'r-006', 'quality', '2025-06', 20),
  alloc('a-012', 'p-001', 'r-006', 'quality', '2025-07', 25),

  // p-002 Industrial Cooling System (DCT) - active critical
  alloc('a-013', 'p-002', 'r-001', 'project-management', '2025-05', 30, true),
  alloc('a-014', 'p-002', 'r-001', 'project-management', '2025-06', 50, true),
  alloc('a-015', 'p-002', 'r-007', 'process-engineering', '2025-05', 70),
  alloc('a-016', 'p-002', 'r-007', 'process-engineering', '2025-06', 80),
  alloc('a-017', 'p-002', 'r-010', 'mechanical-engineering', '2025-05', 100),
  alloc('a-018', 'p-002', 'r-010', 'mechanical-engineering', '2025-06', 120),
  alloc('a-019', 'p-002', 'r-003', 'mechanical-engineering', '2025-06', 50),
  alloc('a-020', 'p-002', 'r-005', 'procurement', '2025-05', 60),
  alloc('a-021', 'p-002', 'r-005', 'procurement', '2025-06', 80),
  alloc('a-022', 'p-002', 'r-006', 'quality', '2025-05', 30),
  alloc('a-023', 'p-002', 'r-006', 'quality', '2025-06', 40),
  alloc('a-024', 'p-002', 'r-008', 'technical-review', '2025-06', 30, true),

  // p-003 Pump Station (PLK) - active medium
  alloc('a-025', 'p-003', 'r-001', 'project-management', '2025-05', 20),
  alloc('a-026', 'p-003', 'r-001', 'project-management', '2025-06', 20),
  alloc('a-027', 'p-003', 'r-002', 'process-engineering', '2025-05', 30),
  alloc('a-028', 'p-003', 'r-002', 'process-engineering', '2025-06', 30),
  alloc('a-029', 'p-003', 'r-004', 'drafting', '2025-06', 40),

  // p-004 WWTP Expansion Study (PLK) - planned
  alloc('a-030', 'p-004', 'r-007', 'process-engineering', '2025-06', 30),
  alloc('a-031', 'p-004', 'r-007', 'process-engineering', '2025-07', 50),
  alloc('a-032', 'p-004', 'r-002', 'process-engineering', '2025-07', 40),

  // p-006 Filter Replacement (DCT) - active high
  alloc('a-033', 'p-006', 'r-003', 'mechanical-engineering', '2025-05', 40),
  alloc('a-034', 'p-006', 'r-003', 'mechanical-engineering', '2025-06', 20),
  alloc('a-035', 'p-006', 'r-005', 'procurement', '2025-05', 40),
  alloc('a-036', 'p-006', 'r-005', 'procurement', '2025-06', 30),
  alloc('a-037', 'p-006', 'r-006', 'quality', '2025-05', 20),
  alloc('a-038', 'p-006', 'r-008', 'technical-review', '2025-05', 20),
]
