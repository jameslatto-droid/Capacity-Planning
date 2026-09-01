import type { Allocation } from '../../types'

const S = 's-baseline'

let _seq = 0
function a(
  projectId: string,
  resourceId: string,
  role: Allocation['role'],
  month: string,
  hours: number
): Allocation {
  _seq++
  return {
    id: `a-${String(_seq).padStart(4, '0')}`,
    scenarioId: S,
    projectId,
    resourceId,
    role,
    month,
    hours: Math.round(hours),
    locked: false,
  }
}

// Hours per FTE step at 133.17h/month (full-time) and 103.73h/month (Rutger 4-day)
// Derived from spreadsheet (Jun–Dec 2026).
// Full-time steps: 0.05→6.7, 0.1→13.3, 0.2→26.6, 0.25→33.3, 0.3→40.0, 0.4→53.3, 0.5→66.6, 0.6→79.9, 0.7→93.2, 0.8→106.5, 1.0→133.2
// Rutger steps:    0.2→20.7, 0.4→41.5, 0.8→83.0

export const seedAllocations: Allocation[] = [

  // ────────────────────────────────────────────────
  // P250001 ADOC (DCT)
  // ────────────────────────────────────────────────
  // Boris Welzen — Jun 0.3
  a('p-adoc', 'r-boris',   'procurement',           '2026-06', 40),

  // Rutger Reij — Jun 0.8, Jul 0.2, Aug 0.4, Sep 0.2, Oct 0.2, Nov 0.2
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-06', 83),
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-07', 21),
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-08', 41),
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-09', 21),
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-10', 21),
  a('p-adoc', 'r-rutger',  'mechanical-engineering', '2026-11', 21),

  // Fatemeh — Jun 0.1
  a('p-adoc', 'r-fatemeh', 'process-engineering',   '2026-06', 13),

  // Ajitha — Jun 0.1, Jul 0.1, Aug 0.05
  a('p-adoc', 'r-ajitha',  'drafting',              '2026-06', 13),
  a('p-adoc', 'r-ajitha',  'drafting',              '2026-07', 13),
  a('p-adoc', 'r-ajitha',  'drafting',              '2026-08',  7),

  // Anwar — Jun 0.3, Jul 0.1, Aug 0.3, Sep 0.15, Oct 0.2, Nov 0.2
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-06', 40),
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-07', 13),
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-08', 40),
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-09', 20),
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-10', 27),
  a('p-adoc', 'r-anwar',   'mechanical-engineering', '2026-11', 27),

  // Neville — Jun 0.3, Jul 0.2, Aug 0.2, Sep 0.1, Oct 0.2, Nov 0.2
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-06', 40),
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-07', 27),
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-08', 27),
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-09', 13),
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-10', 27),
  a('p-adoc', 'r-neville', 'process-engineering',   '2026-11', 27),

  // Onur — Jun 0.1, Jul 0.1, Aug 0.2, Sep 0.1, Oct 0.2, Nov 0.2
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-06', 13),
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-07', 13),
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-08', 27),
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-09', 13),
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-10', 27),
  a('p-adoc', 'r-onur',    'process-engineering',   '2026-11', 27),

  // ────────────────────────────────────────────────
  // P230195 OXY OMAN (DCT)
  // ────────────────────────────────────────────────
  // Boris — Jun 0.05, Jul 0.05
  a('p-oxy', 'r-boris',   'procurement',           '2026-06',  7),
  a('p-oxy', 'r-boris',   'procurement',           '2026-07',  7),

  // Rutger — Jun 0.2, Jul 0.1, Aug 0.2, Sep 0.05
  a('p-oxy', 'r-rutger',  'mechanical-engineering', '2026-06', 21),
  a('p-oxy', 'r-rutger',  'mechanical-engineering', '2026-07', 10),
  a('p-oxy', 'r-rutger',  'mechanical-engineering', '2026-08', 21),
  a('p-oxy', 'r-rutger',  'mechanical-engineering', '2026-09',  5),

  // Ajitha — Jun 0.1
  a('p-oxy', 'r-ajitha',  'drafting',              '2026-06', 13),

  // Neville — Jun 0.1, Jul 0.3, Aug 0.3, Sep 0.05
  a('p-oxy', 'r-neville', 'process-engineering',   '2026-06', 13),
  a('p-oxy', 'r-neville', 'process-engineering',   '2026-07', 40),
  a('p-oxy', 'r-neville', 'process-engineering',   '2026-08', 40),
  a('p-oxy', 'r-neville', 'process-engineering',   '2026-09',  7),

  // Onur — Jun 0.2, Jul 0.2, Aug 0.3, Sep 0.05
  a('p-oxy', 'r-onur',    'process-engineering',   '2026-06', 27),
  a('p-oxy', 'r-onur',    'process-engineering',   '2026-07', 27),
  a('p-oxy', 'r-onur',    'process-engineering',   '2026-08', 40),
  a('p-oxy', 'r-onur',    'process-engineering',   '2026-09',  7),

  // ────────────────────────────────────────────────
  // P230073 ALMANSOORI (DCT)
  // ────────────────────────────────────────────────
  // Boris — Jun 0.05, Jul 0.05
  a('p-almansoori', 'r-boris',   'procurement',         '2026-06',  7),
  a('p-almansoori', 'r-boris',   'procurement',         '2026-07',  7),

  // Neville — Jun 0.25, Jul 0.05
  a('p-almansoori', 'r-neville', 'process-engineering', '2026-06', 33),
  a('p-almansoori', 'r-neville', 'process-engineering', '2026-07',  7),

  // Onur — Jun 0.5, Jul 0.25
  a('p-almansoori', 'r-onur',    'process-engineering', '2026-06', 67),
  a('p-almansoori', 'r-onur',    'process-engineering', '2026-07', 33),

  // ────────────────────────────────────────────────
  // P260002 SPARE PARTS ZEELAND (DCT) — no allocations yet
  // ────────────────────────────────────────────────

  // ────────────────────────────────────────────────
  // P260001 TAQA (DCT)
  // ────────────────────────────────────────────────
  // Boris — Jun 0.4, Jul 0.5, Aug 0.5, Sep 0.3, Oct 0.3, Nov 0.3, Dec 0.3
  a('p-taqa', 'r-boris',   'procurement',           '2026-06', 53),
  a('p-taqa', 'r-boris',   'procurement',           '2026-07', 67),
  a('p-taqa', 'r-boris',   'procurement',           '2026-08', 67),
  a('p-taqa', 'r-boris',   'procurement',           '2026-09', 40),
  a('p-taqa', 'r-boris',   'procurement',           '2026-10', 40),
  a('p-taqa', 'r-boris',   'procurement',           '2026-11', 40),
  a('p-taqa', 'r-boris',   'procurement',           '2026-12', 40),

  // Fatemeh — Jun 0.5, Jul 0.5, Aug 0.5, Sep 0.2, Oct 0.1, Nov 0.05, Dec 0.15
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-06', 67),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-07', 67),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-08', 67),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-09', 27),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-10', 13),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-11',  7),
  a('p-taqa', 'r-fatemeh', 'process-engineering',   '2026-12', 20),

  // William — Jun 0.5, Jul 0.5, Aug 0.5, Sep 0.2, Oct 0.1, Nov 0.05, Dec 0.15
  a('p-taqa', 'r-william', 'process-engineering',   '2026-06', 67),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-07', 67),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-08', 67),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-09', 27),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-10', 13),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-11',  7),
  a('p-taqa', 'r-william', 'process-engineering',   '2026-12', 20),

  // Ajitha — Jun 0.7, Jul 0.7, Aug 0.3, Sep 0.1
  a('p-taqa', 'r-ajitha',  'drafting',              '2026-06', 93),
  a('p-taqa', 'r-ajitha',  'drafting',              '2026-07', 93),
  a('p-taqa', 'r-ajitha',  'drafting',              '2026-08', 40),
  a('p-taqa', 'r-ajitha',  'drafting',              '2026-09', 13),

  // Anwar — Jun 0.7, Jul 0.7, Aug 0.5, Sep 0.2, Oct 0.15, Nov 0.15, Dec 0.15
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-06', 93),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-07', 93),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-08', 67),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-09', 27),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-10', 20),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-11', 20),
  a('p-taqa', 'r-anwar',   'mechanical-engineering', '2026-12', 20),

  // Onur — Jun 0.4, Jul 0.4, Aug 0.4, Sep 0.2, Oct 0.2, Nov 0.2, Dec 0.2
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-06', 53),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-07', 53),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-08', 53),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-09', 27),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-10', 27),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-11', 27),
  a('p-taqa', 'r-onur',    'process-engineering',   '2026-12', 27),

  // ────────────────────────────────────────────────
  // P250002 CANCUN CISEC (PLK)
  // ────────────────────────────────────────────────
  // Maria — Jun–Dec 0.6
  a('p-cancun', 'r-maria',   'project-management',   '2026-06', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-07', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-08', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-09', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-10', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-11', 80),
  a('p-cancun', 'r-maria',   'project-management',   '2026-12', 80),

  // Jacobo — Jun–Dec 1.0
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-06', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-07', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-08', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-09', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-10', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-11', 133),
  a('p-cancun', 'r-jacobo',  'project-management',   '2026-12', 133),

  // Boris — Jun 0.1, Jul 0.2, Aug 0.3, Sep–Dec 0.4
  a('p-cancun', 'r-boris',   'procurement',           '2026-06', 13),
  a('p-cancun', 'r-boris',   'procurement',           '2026-07', 27),
  a('p-cancun', 'r-boris',   'procurement',           '2026-08', 40),
  a('p-cancun', 'r-boris',   'procurement',           '2026-09', 53),
  a('p-cancun', 'r-boris',   'procurement',           '2026-10', 53),
  a('p-cancun', 'r-boris',   'procurement',           '2026-11', 53),
  a('p-cancun', 'r-boris',   'procurement',           '2026-12', 53),

  // Fatemeh — Jun–Dec 0.3
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-06', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-07', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-08', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-09', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-10', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-11', 40),
  a('p-cancun', 'r-fatemeh', 'process-engineering',   '2026-12', 40),

  // William — Jun–Dec 0.3
  a('p-cancun', 'r-william', 'process-engineering',   '2026-06', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-07', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-08', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-09', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-10', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-11', 40),
  a('p-cancun', 'r-william', 'process-engineering',   '2026-12', 40),

  // Ajitha — Jun–Dec 0.1
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-06', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-07', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-08', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-09', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-10', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-11', 13),
  a('p-cancun', 'r-ajitha',  'drafting',              '2026-12', 13),

  // Onur — Jun–Dec 0.2
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-06', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-07', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-08', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-09', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-10', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-11', 27),
  a('p-cancun', 'r-onur',    'process-engineering',   '2026-12', 27),

  // ────────────────────────────────────────────────
  // QDG2600002 SARAT (DCT)
  // ────────────────────────────────────────────────
  // Boris — Jun–Sep 0.2
  a('p-sarat', 'r-boris',   'procurement',           '2026-06', 27),
  a('p-sarat', 'r-boris',   'procurement',           '2026-07', 27),
  a('p-sarat', 'r-boris',   'procurement',           '2026-08', 27),
  a('p-sarat', 'r-boris',   'procurement',           '2026-09', 27),

  // Fatemeh — Jun 0.3, Jul 0.4, Aug 0.4, Sep 0.4
  a('p-sarat', 'r-fatemeh', 'process-engineering',   '2026-06', 40),
  a('p-sarat', 'r-fatemeh', 'process-engineering',   '2026-07', 53),
  a('p-sarat', 'r-fatemeh', 'process-engineering',   '2026-08', 53),
  a('p-sarat', 'r-fatemeh', 'process-engineering',   '2026-09', 53),

  // William — Jun 0.3, Jul 0.4, Aug 0.4, Sep 0.4
  a('p-sarat', 'r-william', 'process-engineering',   '2026-06', 40),
  a('p-sarat', 'r-william', 'process-engineering',   '2026-07', 53),
  a('p-sarat', 'r-william', 'process-engineering',   '2026-08', 53),
  a('p-sarat', 'r-william', 'process-engineering',   '2026-09', 53),

  // Neville — Jun 0.2, Jul 0.2, Aug 0.1, Sep 0.2
  a('p-sarat', 'r-neville', 'process-engineering',   '2026-06', 27),
  a('p-sarat', 'r-neville', 'process-engineering',   '2026-07', 27),
  a('p-sarat', 'r-neville', 'process-engineering',   '2026-08', 13),
  a('p-sarat', 'r-neville', 'process-engineering',   '2026-09', 27),

  // Onur — Jun 0.2, Jul 0.2, Aug 0.1, Sep 0.2
  a('p-sarat', 'r-onur',    'process-engineering',   '2026-06', 27),
  a('p-sarat', 'r-onur',    'process-engineering',   '2026-07', 27),
  a('p-sarat', 'r-onur',    'process-engineering',   '2026-08', 13),
  a('p-sarat', 'r-onur',    'process-engineering',   '2026-09', 27),
]
