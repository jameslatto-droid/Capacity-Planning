# Engineering Resource Planner — V1 Functional Description

> **Status:** V1 — Active  
> **Repository:** https://github.com/jameslatto-droid/Capacity-Planning  
> **Branch model:** `main` (dev) · `server` (deployed)  
> **Last updated:** June 2026

---

## 1. Background and Purpose

### 1.1 Origin

The Engineering Resource Planner was developed to replace a manually maintained Excel workbook (*Engineering_Resource_Planner v1.xlsx*) that had grown too fragile for reliable weekly planning.

The spreadsheet contained:
- A **Resource** tab listing the 10 team members, their roles, and contract hours
- A **Sheet3** tab with a project × person allocation matrix showing % loading and resulting hours per month, covering June–December 2026
- A **PM Request** tab (header only at time of migration)
- Hard-coded capacity assumptions buried in formula cells
- Manual summary rows prone to error when people or projects were added

Key limitations that drove the replacement:
- Formulas broke silently when rows were inserted or reordered
- No scenario comparison — changing an assumption required duplicating the sheet
- No visibility of overloads except by manual inspection of red-flagged cells
- Not shareable for simultaneous editing without version conflicts

### 1.2 Purpose

The Engineering Resource Planner is a small-team internal web application for:

- Maintaining a master list of **resources** (people) and their contract terms
- Maintaining a master list of **projects** with brand, status, priority and schedule
- Recording **planned allocations** of people to projects by month, expressed as % loading or hours
- **Calculating capacity** for each person using their contracted hours and leave allowances
- **Detecting overloads** where planned demand exceeds available capacity
- **Tracking actual leave** (annual leave, sick leave, public holidays) so capacity calculations reflect reality
- Supporting **scenario planning** by allowing assumptions to be adjusted without touching the underlying data
- Providing **recommendations** for resolving overloads through reallocation or contractor support
- Generating **reports and charts** for weekly planning reviews and management oversight

### 1.3 Scope Boundaries — V1

The following are intentionally **out of scope** for V1:

| Excluded | Reason |
|---|---|
| User authentication / login | Small trusted team; not required |
| Approval workflows | Out of scope for MVP |
| HR / payroll integration | Not required |
| Timesheet integration | Not required |
| ERP integration | Not required |
| Excel import | Deferred to V2 |
| Automatic optimisation | Recommendations only; human approves any change |
| Multi-level permissions | Not required |
| Real-time collaborative editing | Server handles last-write-wins; team works sequentially |

---

## 2. The Team and Projects

### 2.1 Resources (as seeded)

| Name | Role | Contract | Notes |
|---|---|---|---|
| Onur Kavakli | Process Engineering | 40h / 5-day | Principal Engineer; secondary role: Technical Review |
| Maria Alonzo | Project Management | 40h / 5-day | LATAM PM |
| Jacobo Ramirez | Project Management | 40h / 5-day | LATAM PM (In-Country) |
| Boris Welzen | Procurement | 40h / 5-day | Procurement Manager |
| Rutger Reij | Mechanical Engineering | 32h / 4-day | Part-time — 4-day week |
| Anwar Hassan | Mechanical Engineering | 40h / 5-day | |
| Neville Cory | Process Engineering | 40h / 5-day | |
| Fatemeh Rashidashmagh | Process Engineering | 40h / 5-day | |
| William Garcia | Process Engineering | 40h / 5-day | |
| Ajitha Karuppiah | Drafting | 40h / 5-day | Draughtsperson |

### 2.2 Projects (as seeded)

| Code | Name | Brand | Status | Period |
|---|---|---|---|---|
| P250001 | ADOC | PLK | Active | Jan 2025 – Dec 2026 |
| P230195 | OXY Oman | PLK | Active | Jan 2023 – Sep 2026 (wind-down) |
| P230073 | Almansoori | PLK | Active | Jan 2023 – Jul 2026 (near close-out) |
| P260002 | Spare Parts Zeeland | PLK | On Hold | Jan 2026 – Dec 2026 |
| P260001 | TAQA | PLK | Active | Jan 2026 – Jun 2027 (critical) |
| P250002 | Cancun CISEC | DCT | Active | Jan 2025 – Jun 2027 (LATAM) |
| QDG2600002 | SARAT | DCT | Active | Apr 2026 – Sep 2026 |

### 2.3 Frontend Brands

The business operates under two client-facing brands:

| Brand | Description |
|---|---|
| **DCT** | Main delivery brand. Projects: Cancun CISEC, SARAT |
| **PLK** | Secondary brand. Projects: ADOC, OXY Oman, Almansoori, Spare Parts Zeeland, TAQA |

Brand is assigned at project level. All dashboard filters, reports and charts can be sliced by brand.

### 2.4 Roles

Nine roles are used for resource classification, allocation tracking and utilisation analysis:

| Role | Typical activities |
|---|---|
| Project Management | Delivery coordination, client management, scheduling |
| Process Engineering | Process design, calculations, technical basis |
| Mechanical Engineering | Equipment, layouts, mechanical packages |
| Drafting | CAD, drawing production and updates |
| Procurement | RFQs, vendor coordination, purchase follow-up |
| **Quality** | QA/QC, ITP review, document control, inspection planning, NCR follow-up |
| Technical Review | Senior sign-off, technical governance |
| Management | Internal leadership, resourcing, escalation |
| Other | Temporary uncategorised work |

> **Quality is treated as a first-class role.** It is tracked separately in all utilisation views and reports, not merged into engineering or PM overhead.

Resources may carry **secondary roles** (e.g. Onur carries Technical Review as a secondary role, meaning he can be assigned to either role in the allocation engine).

---

## 3. Capacity Calculations

All capacity calculations are implemented as **pure TypeScript functions** with no dependency on React, Zustand, localStorage or any backend. They live in `src/domain/capacity/`.

### 3.1 Planning Basis

The default planning basis used in the Baseline scenario matches the original spreadsheet:

| Step | Calculation |
|---|---|
| Annual contracted hours | `contractHoursPerWeek × 52` |
| Less leave | `25 days × 8h = 200h/year` (fixed, not pro-rated by FTE) |
| Less public holidays | `0 days` (not deducted in Baseline) |
| Net attendance | Contracted − Leave − Public holidays |
| Less admin/management | `net × 15%` |
| **Productive capacity** | **net × 0.85** |

Results for the two contract types in the team:

| Contract | Annual productive | Monthly productive |
|---|---|---|
| 40h / 5-day | **1,598 h/year** | **133 h/month** |
| 32h / 4-day (Rutger) | **1,244 h/year** | **104 h/month** |

The Conservative scenario adds 7 pro-rated public holidays, giving ~1,550 h/year and ~129 h/month for full-time — this is the theoretical Dutch employment standard.

### 3.2 Annual Productive Capacity Formula

```
annualProductiveCapacity(resource, assumptions):
  annualContracted  = contractHoursPerWeek × 52
  hoursPerDay       = contractHoursPerWeek / workingDaysPerWeek
  fte               = contractHoursPerWeek / fullTimeHoursPerWeek

  if leaveModel == 'pro-rated':
    leaveDays       = defaultLeaveDaysPerYear × fte
    publicHolDays   = publicHolidayDaysPerYear × fte
  else (fixed-days):
    leaveDays       = defaultLeaveDaysPerYear
    publicHolDays   = publicHolidayDaysPerYear

  leaveHours        = leaveDays × hoursPerDay
  pubHolHours       = publicHolDays × hoursPerDay
  netAttendance     = annualContracted − leaveHours − pubHolHours

  return netAttendance × (1 − adminManagementAllowancePercent / 100)
```

### 3.3 Monthly Productive Capacity

```
monthlyProductiveCapacity = annualProductiveCapacity / 12
```

### 3.4 Leave-Adjusted Capacity

When actual leave entries exist for a person in a specific month, capacity is recalculated using actual leave rather than the assumption-based annual average:

```
calculateMonthlyCapacityWithLeave(resource, month, leaveEntries, assumptions):

  if no leave entries exist for this person:
    return monthlyProductiveCapacity(resource, assumptions)   ← assumption-based fallback

  if no entry overlaps this calendar month:
    return monthlyProductiveCapacity(resource, assumptions)   ← assumption-based fallback

  baseContracted    = contractHoursPerWeek × 52 / 12
  actualLeaveHours  = sum of clamped working hours from leave entries in this month
  netAttendance     = max(0, baseContracted − actualLeaveHours)

  return netAttendance × (1 − adminManagementAllowancePercent / 100)
```

**Part-time pro-rating for leave:** Leave days are pro-rated by `workingDaysPerWeek / 5`. A 4-day worker taking a standard Monday–Friday week off registers 4 working days, not 5.

**Timezone safety:** The working-day counter uses local-time date formatting to avoid UTC shift errors for teams in UTC+1/+2 (e.g. Netherlands).

### 3.5 Leave Day Counting

```
countWorkingDays(startDate, endDate):
  iterate calendar days from start to end (inclusive)
  count only Monday–Friday (skip Saturday and Sunday)
  return count
```

---

## 4. Utilisation Calculations

Implemented in `src/domain/utilisation/utilisationCalculations.ts`.

### 4.1 Person Utilisation

For a given resource and month:

```
personUtilisation = allocatedHours / capacityHours
```

Where `capacityHours` is the leave-adjusted capacity (Section 3.4) if leave data is available, otherwise the assumption-based monthly capacity (Section 3.3).

`overloadHours = max(0, allocatedHours − capacityHours)`

### 4.2 Role Utilisation

For a given role and month, aggregated across all resources who carry that role (primary or secondary):

```
roleCapacity     = Σ capacityHours for all active resources with this role
roleAllocated    = Σ allocatedHours for all allocations tagged with this role
roleUtilisation  = roleAllocated / roleCapacity
```

### 4.3 Team Utilisation

Across all active resources for a given month:

```
teamCapacity    = Σ capacityHours for all active resources
teamAllocated   = Σ allocatedHours for all allocations in this month
teamUtilisation = teamAllocated / teamCapacity
```

### 4.4 Utilisation Status Thresholds

| Status | Range | Meaning |
|---|---|---|
| Underused | < 60% | Significant spare capacity |
| Healthy | 60%–85% | Normal planning zone |
| High | 85%–100% | Limited contingency |
| Overloaded | 100%–115% | Action required |
| Critical | > 115% | Delivery risk |

These thresholds drive colour coding throughout the app:
- Blue: Underused
- Green: Healthy
- Amber: High
- Orange: Overloaded
- Red (with glow): Critical

---

## 5. Scenarios

A **Scenario** holds a set of capacity assumptions that can be applied to the planning data without changing the underlying allocations. Multiple scenarios can coexist; one is active at a time.

### 5.1 Scenario Structure

| Field | Description |
|---|---|
| `name` | Display name |
| `description` | Optional narrative |
| `assumptions` | Full `CapacityAssumptions` object |
| `basedOnScenarioId` | Optional parent scenario (for audit trail) |
| `createdAt` | ISO timestamp |

### 5.2 Capacity Assumptions

| Assumption | Description | Baseline | Conservative | Lean |
|---|---|---|---|---|
| `fullTimeHoursPerWeek` | Standard FT reference | 40 | 40 | 40 |
| `defaultLeaveDaysPerYear` | Annual leave days | 25 | 25 | 25 |
| `leaveModel` | Fixed or pro-rated for part-timers | fixed-days | pro-rated | fixed-days |
| `publicHolidayDaysPerYear` | Public holidays deducted | 0 | 7 | 0 |
| `adminManagementAllowancePercent` | Overhead % deducted from net attendance | 15% | 15% | 10% |
| `defaultMaxUtilisationPercent` | Planning ceiling | 100% | 100% | 100% |

Changing a scenario assumption immediately recalculates all capacity, utilisation and overload figures across the app — no allocations are changed.

---

## 6. Allocations

An **Allocation** records the planned hours for a specific person on a specific project in a specific month, within a specific scenario.

### 6.1 Allocation Fields

| Field | Description |
|---|---|
| `scenarioId` | Which scenario this allocation belongs to |
| `projectId` | Which project |
| `resourceId` | Which person (optional — role-only allocations are valid) |
| `role` | The discipline role being performed |
| `month` | YYYY-MM format |
| `hours` | Planned hours for this month |
| `locked` | If true, excluded from optimisation suggestions |
| `lastModifiedAt` | ISO timestamp set by the Project Allocation Editor on save |

### 6.2 Entering Allocations

**Project Allocation Editor** (primary method):
- Navigate to Projects → hover a row → click **Allocate →**
- Opens a dedicated editor for that project
- Month columns default to the previous month through the next 11 months, clamped to the project's date range
- Each cell accepts a **percentage (0–200%)** which is converted to hours: `round(percent / 100 × monthlyCapacity)`
- The resulting hours are shown in small text below each % input
- Save stamps `lastModifiedAt` on every written allocation
- Add/remove team members per project with the + Add person button

**Planning matrix** (management view):
- Navigate to Planning → switch between By Person, By Project or By Role views
- Shows raw hours; the By Person view includes a Leave row for anyone with recorded leave

---

## 7. Application Pages

### 7.1 Dashboard

The dashboard provides an at-a-glance summary of the planning period.

**KPI strip** — four headline numbers:
- Utilisation % (with trend arrow ↑/↓ if the period has a clear directional trend)
- Headroom or overrun in hours
- Number of person-month overloads
- Number of projects in scope

**Discipline charts** — capacity vs demand broken down by engineering discipline

**Portfolio Gantt** — horizontal bar chart showing all projects on a time axis, coloured by brand (violet = DCT, blue = PLK), with bar style indicating status (solid = active, dashed = planned/opportunity)

**Filters:** date range, brand (DCT / PLK / both)

### 7.2 Team

Displays all resources with their contract terms and calculated monthly capacity.

- Name, role, secondary roles, employment type
- Contract hours/week, working days/week
- Calculated monthly productive capacity (using the active scenario's assumptions)
- Active/inactive indicator (glowing green dot)
- Add, edit and delete resources via a modal form

### 7.3 Leave Tracker

Records actual leave (annual, sick, public holiday, unpaid, other) per person per date range.

**"Who's out this month"** — chip row showing anyone with leave in the current month, coloured by leave type.

**Monthly grid** — people as rows, months as columns. Each cell shows days off that month, coloured:
- Blue: Annual leave
- Amber: Sick leave
- Violet: Public holiday
- Grey: Unpaid / other

Click any filled cell to edit the entry; click an empty cell to add leave for that person.

**Entry list** — sortable list of all recorded leave entries with edit and delete.

**Capacity impact:** Recorded leave automatically reduces that person's capacity for the affected months in all utilisation calculations, overload detection and reports. Months without recorded leave continue to use the assumption-based average.

### 7.4 Projects

Displays all projects with their status, brand, priority, period and total planned hours.

- Code, name, brand badge, status badge, date range, total allocated hours
- Last saved timestamp (shown when any allocation has been saved via the Project Allocation Editor)
- Hover row → **Allocate →** button opens the Project Allocation Editor
- Edit project metadata or delete project via modal form

### 7.5 Project Allocation Editor

A dedicated full-page editor per project for project leaders to enter their team's monthly loading.

- Accessed via Projects → Allocate →
- Shows all months within the project date range, defaulting to current month −1 through current month +11
- From/To pickers to navigate to any period within the project bounds
- Each team member is a row; each month is a column
- Enter % loading (0–200%); hours are calculated and shown below each input
- Cell colour indicates loading level (blue=low → amber → red=over 100%)
- Monthly totals footer shows aggregate hours per month
- Add or remove team members with immediate effect
- Save button stamps all allocations with the current timestamp

### 7.6 Planning (Allocation Matrix)

A matrix view of all allocations in the active scenario, aimed at the planning manager rather than individual project leaders.

**Three views:**
- **By Person** — rows = people, sub-rows = projects. Header row shows allocated vs capacity hours with colour coding. A ◷ Leave sub-row appears for anyone with leave recorded in the view period.
- **By Project** — rows = projects, sub-rows = people. Header row shows project total hours.
- **By Role** — rows = disciplines. Each cell shows total allocated hours for that role that month, colour-coded by utilisation.

### 7.7 Optimisation

Provides decision-support recommendations for resolving overloads. **No changes are made automatically** — all recommendations require manual review and action.

**Four panels:**

1. **Person-Month Overloads** — table of all overloaded person-months, showing overload hours and utilisation %
2. **Reallocation Recommendations** — suggests moving work to team members with compatible roles and spare capacity in the same month
3. **Available Capacity** — shows people with spare hours in each month
4. **Contractor Requirement** — calculates residual overload hours after recommendations and expresses as FTE equivalent

**Recommendation logic (in sequence):**
1. Find person-month overloads
2. Find same-role spare capacity in the same month
3. Find secondary-role compatible capacity in the same month
4. Calculate residual contractor requirement

### 7.8 Reports

Tabbed reporting page with charts, heatmaps and data exports.

| Tab | Content |
|---|---|
| **Person** | Utilisation heatmap — people as rows, months as columns, solid colour bands (blue→green→amber→orange→red). Toggle between % and hours display. |
| **Role** | Role utilisation heatmap + stacked bar chart of role hours. Quality highlighted distinctly. |
| **Brand** | Donut chart showing DCT vs PLK share + dual area chart of brand demand over time |
| **Projects** | Stacked bar chart of demand by project code over time |
| **Overloads** | Filtered heatmap showing only overloaded people + full overload table |

**Exports:**
- Person CSV — person × month utilisation table
- JSON export — complete planning dataset (resources, projects, allocations, scenarios, leave)

---

## 8. Data Model

### 8.1 Entity Relationship Summary

```
Scenario ──── CapacityAssumptions
    │
    └──► Allocation ──► Project ──► FrontendBrand (DCT | PLK)
              │
              └──► Resource ──► ResourceRole
                                    │
                                    └──► (secondary roles)

LeaveEntry ──► Resource
```

### 8.2 Key Constraints

| Rule | Type |
|---|---|
| Contract hours must be > 0 | Error |
| Working days must be 1–7 | Error |
| Leave days cannot be negative | Error |
| Admin allowance must be 0–50% | Error |
| Allocation hours cannot be negative | Error |
| Project start must be ≤ project end | Error |
| Project must have brand DCT or PLK | Error |
| Allocation must have a role | Error |
| Allocation month outside project range | Warning |
| Allocation exceeds capacity | Warning (shown as overload) |
| Leave end before leave start | Error |

---

## 9. Technical Architecture

### 9.1 Tech Stack

| Area | Technology |
|---|---|
| UI framework | React 18 + Vite 5 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 3 + CSS custom properties for theming |
| State management | Zustand 5 |
| Charts | Recharts 2 |
| Animation | motion/react (Framer Motion v12) |
| Validation | Zod 3 |
| Testing | Vitest 2 |
| Tables | TanStack Table 8 |

### 9.2 Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│  UI Layer (React pages and components)                  │
│  src/features/  src/components/                         │
├─────────────────────────────────────────────────────────┤
│  Store Layer (Zustand)                                  │
│  src/store/plannerStore.ts                              │
├─────────────────────────────────────────────────────────┤
│  Repository Layer (data access abstraction)             │
│  src/repositories/PlannerRepository.ts (interface)      │
│  src/repositories/LocalStoragePlannerRepository.ts      │
│  src/repositories/ApiPlannerRepository.ts               │
├─────────────────────────────────────────────────────────┤
│  Domain Layer (pure calculation functions)              │
│  src/domain/capacity/                                   │
│  src/domain/utilisation/                                │
│  src/domain/optimisation/                               │
└─────────────────────────────────────────────────────────┘
```

**Key architectural principles:**
- Domain calculations have **zero dependency** on React, Zustand or any storage mechanism. They are pure functions that take data and return results.
- **No React component calls localStorage directly.** All data access goes through the store, which calls the repository.
- The `PlannerRepository` interface means the storage backend can be swapped (localStorage → API) by changing one factory function without touching any UI code.

### 9.3 Repository Pattern

```typescript
interface PlannerRepository {
  loadResources():              Promise<Resource[]>
  saveResources(r):             Promise<void>
  loadProjects():               Promise<Project[]>
  saveProjects(p):              Promise<void>
  loadAllocations():            Promise<Allocation[]>
  saveAllocations(a):           Promise<void>
  loadScenarios():              Promise<Scenario[]>
  saveScenarios(s):             Promise<void>
  loadLeaveEntries():           Promise<LeaveEntry[]>
  saveLeaveEntries(e):          Promise<void>
}
```

`LocalStoragePlannerRepository` — current implementation. Reads from browser localStorage with seed data fallback. A seed version number (`erp:seed-version`) triggers automatic data reset when the seed data changes.

`ApiPlannerRepository` — stub implementation targeting a REST API. Used by the server branch.

### 9.4 Theme System

Two themes are supported: **dark** (default) and **light**, toggled via a button in the page header. The preference is stored in localStorage.

Implemented via CSS custom properties:

| Variable | Purpose |
|---|---|
| `--bg` | Page background |
| `--surface` | Card/modal background |
| `--surface-2` | Secondary surface (inputs, empty cells) |
| `--text` | Primary text |
| `--text-muted` | Secondary text |
| `--text-faint` | Tertiary text and labels |
| `--border` | Subtle borders |
| `--accent` | Violet accent (#7c3aed) |
| `--accent-light` | Accent background tint |
| `--accent-text` | Accent text (darker in light mode) |
| `--row-divider` | Table row separator |
| `--row-hover` | Table row hover background |

### 9.5 Environment Variables

| Variable | Purpose | Dev default |
|---|---|---|
| `VITE_STORAGE_MODE` | `local` or `api` | `local` |
| `VITE_API_BASE_URL` | Backend URL (empty = relative) | `` |
| `VITE_APP_NAME` | Display name | `Engineering Resource Planner` |
| `VITE_DEFAULT_BRAND_FILTER` | Initial brand filter | `both` |

### 9.6 Folder Structure

```
src/
├── app/
│   ├── App.tsx                    Entry point, theme provider, data loader
│   └── routes.tsx                 React Router route definitions
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            Navigation + theme toggle
│   │   └── PageLayout.tsx         Page header wrapper
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── StatCard.tsx           KPI number display
├── data/
│   └── seed/
│       ├── resources.ts
│       ├── projects.ts
│       ├── allocations.ts
│       └── scenarios.ts
├── domain/
│   ├── capacity/
│   │   ├── capacityCalculations.ts
│   │   ├── capacityCalculations.test.ts
│   │   ├── leaveCalculations.ts
│   │   └── leaveCalculations.test.ts
│   ├── utilisation/
│   │   ├── utilisationCalculations.ts
│   │   └── utilisationCalculations.test.ts
│   └── optimisation/
│       ├── optimisationRules.ts
│       └── optimisationRules.test.ts
├── features/
│   ├── dashboard/
│   │   ├── DashboardPage.tsx
│   │   ├── CapacityDemandChart.tsx
│   │   ├── DisciplineCharts.tsx
│   │   └── PlanGantt.tsx
│   ├── resources/
│   │   ├── ResourcesPage.tsx
│   │   └── ResourceForm.tsx
│   ├── leave/
│   │   └── LeavePage.tsx
│   ├── projects/
│   │   ├── ProjectsPage.tsx
│   │   ├── ProjectForm.tsx
│   │   └── ProjectAllocationEditor.tsx
│   ├── allocations/
│   │   ├── AllocationsPage.tsx
│   │   └── AllocationMatrixByPerson.tsx
│   ├── optimisation/
│   │   └── OptimisationPage.tsx
│   └── reports/
│       ├── ReportsPage.tsx
│       └── UtilisationHeatmap.tsx
├── repositories/
│   ├── PlannerRepository.ts       Interface
│   ├── LocalStoragePlannerRepository.ts
│   └── ApiPlannerRepository.ts    Stub
├── store/
│   └── plannerStore.ts            Zustand store
├── types/
│   └── index.ts                   All TypeScript interfaces and enums
└── utils/
    ├── ThemeContext.tsx
    ├── export.ts                  CSV and JSON export helpers
    ├── format.ts                  Number formatting and colour helpers
    └── months.ts                  Month range generation and formatting
```

---

## 10. Testing

Unit tests cover the domain calculation engine. 32 tests pass as of V1.

| Test file | Coverage |
|---|---|
| `capacityCalculations.test.ts` | Annual/monthly capacity for FT and 4-day workers; pro-rated and fixed-day leave models |
| `leaveCalculations.test.ts` | Working-day counting; monthly leave hour calculation; part-time pro-rating; clamping of multi-month entries; leave-adjusted capacity |
| `utilisationCalculations.test.ts` | Person, role and team utilisation; overload detection; contractor requirement |
| `optimisationRules.test.ts` | Overload identification; available capacity; residual calculation; contractor FTE |

Run: `npm test`

---

## 11. Deployment

### 11.1 Local Development

```bash
cd "C:\Dev\Capacity Planner"
npm install
npm run dev         # http://localhost:5173
npm run build       # production build in dist/
npm test            # run unit tests
```

Data is stored in browser `localStorage`. Seed data loads automatically on first visit.

### 11.2 Portable Team Server

A separate `server` branch packages the app for shared team use without a cloud deployment.

**Location:** `C:\Users\jimla\Dutch Clean Tech(1)\Projects and Engineering Notes - Resource and Capacity Planning`

**Operation:**
1. Host runs `start.bat` (Windows) or `start.sh` (Mac/Linux)
2. Server starts on port 3001, opens browser automatically
3. Console prints: `Local: http://localhost:3001` and `Network: http://192.168.x.x:3001`
4. Team members open the Network URL in any browser on the same network
5. All saves write to `data/plan.json` in the shared folder in real time

**Data file:** `data/plan.json` — the single source of truth for the deployed app. Backed up by `data/plan.seed.json` (reset backup).

**Reset:** Run `reset-data.bat` to wipe the live data and restore seed data.

**Concurrent editing:** Last-write-wins. For the weekly planning-around-the-table workflow, one person drives; others observe. Not intended for simultaneous multi-user editing.

### 11.3 Migration Path to Hosted Server

The `ApiPlannerRepository` stub is already in place. To move to a proper hosted server:

1. Build a Node.js/Express (or similar) backend with the same REST endpoints
2. Set `VITE_STORAGE_MODE=api` and `VITE_API_BASE_URL=<server URL>` in `.env`
3. Rebuild the frontend
4. The entire UI and domain layer requires no changes

---

## 12. Known Limitations — V1

| Limitation | Impact |
|---|---|
| No authentication | Appropriate for a trusted internal team; not suitable for external access |
| Last-write-wins on server | Two simultaneous saves may overwrite each other; mitigated by sequential planning sessions |
| No Excel import | Allocations must be entered manually or via the Project Allocation Editor |
| Optimisation is advisory only | No automatic reallocation; all changes must be made manually |
| Leave entries are date-range based | No individual day-by-day granularity; partial weeks are rounded |
| Allocation history | Only the latest plan state is stored; no audit trail of changes over time |
| No notification system | No alerts when overloads appear or plans change |

---

## 13. Glossary

| Term | Definition |
|---|---|
| **Resource** | A person (or placeholder) in the planning system |
| **FTE** | Full-Time Equivalent — ratio of contract hours to 40h standard |
| **Allocation** | A planned assignment of a person to a project for a specific month |
| **Scenario** | A set of capacity assumptions that can be switched without changing allocations |
| **Capacity** | The productive hours available from a resource in a month after leave and admin deductions |
| **Utilisation** | Allocated hours ÷ capacity hours, expressed as a percentage |
| **Overload** | Condition where allocated hours exceed capacity hours (utilisation > 100%) |
| **Leave entry** | A recorded period of absence (annual, sick, public holiday, unpaid, other) |
| **Admin allowance** | A percentage deducted from net attendance hours to account for meetings, internal work and management overhead not billed to projects |
| **Headroom** | Spare productive capacity: capacity − demand |
| **DCT** | Main client-facing brand |
| **PLK** | Secondary client-facing brand |
| **Locked allocation** | An allocation marked as fixed; excluded from optimisation suggestions |
| **Contractor FTE** | The number of full-time-equivalent contractor months required to cover residual overload |
