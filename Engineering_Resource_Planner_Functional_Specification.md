---
type: functional-specification
project: Engineering Resource Planner
project-code:
status: active
stage: concept
tags: [resource-planning, engineering, project-controls, react, vite, codex, server-ready]
---

# Engineering Resource Planner Functional Specification

## 1. Purpose

The Engineering Resource Planner is a small-team internal web application for planning engineering, project management, procurement, quality and drafting capacity against project demand.

The application shall replace the current spreadsheet-based resource planner with a structured, editable and scenario-based planning tool. It shall be developed first on a local development machine using React, Vite and TypeScript, with a clean architecture that allows later hosting on a server.

The app shall support iterative development with Codex or a VS Code coding agent.

## 2. Core principles

The app shall be:

- Simple enough for a small engineering and project team.
- Transparent in its calculations.
- Easy to edit.
- Scenario-driven.
- Suitable for monthly planning reviews.
- Built in clear modules so Codex can implement and test each part separately.
- Local-first for fast development.
- Server-ready for later deployment.

The MVP shall not include complex permissions, enterprise authentication, approval workflows or multi-level access control.

## 3. Objectives

| Objective | Description |
|---|---|
| Capacity visibility | Show available productive capacity by person, role and month. |
| Demand visibility | Show project demand by person, role, brand and month. |
| Utilisation analysis | Identify overallocated and underutilised people, roles and months. |
| Scenario planning | Allow assumptions to be adjusted without changing core data. |
| Optimisation support | Recommend practical actions to reduce overloads. |
| Spreadsheet replacement | Remove hard-coded formulas, hidden assumptions and manual summary errors. |
| Server-readiness | Allow later migration from local storage to hosted shared data. |

## 4. Scope

### 4.1 In scope

The application shall include:

- Resource master data.
- Project master data.
- Frontend brand tagging: DCT and PLK.
- Monthly planning horizon.
- Capacity calculation.
- Leave, public holiday and admin/management yield correction.
- Demand allocation by person, project, role and month.
- Quality as a first-class planning role.
- Utilisation dashboard.
- Overload reporting.
- Basic optimisation recommendations.
- Scenario management.
- Local persistence.
- JSON export/import.
- CSV report export.
- Later server hosting path.

### 4.2 Out of scope for MVP

The following are excluded from the MVP:

- User permissions.
- Complex authentication.
- Multi-level approval workflows.
- HR integration.
- Timesheet integration.
- ERP integration.
- Payroll calculations.
- Detailed leave booking management.
- Full project lifecycle management.
- Automatic optimisation that changes the plan without user approval.
- Backend database in the first build pass.
- Excel import in the first build pass.

## 5. User model

The app is intended for a trusted small internal team.

All users can:

- View resources.
- View projects.
- Edit planning data.
- Create scenarios.
- Import and export data.
- Run optimisation checks.

A lightweight `lastEditedAt` or `lastEditedBy` field may be added later, but this is not required for MVP.

## 6. Frontend brand model

The business works with two frontend brands:

| Brand | Description |
|---|---|
| DCT | Main company / delivery brand. |
| PLK | Secondary frontend brand. |

Each project shall be assigned to one frontend brand.

The planner shall allow filtering and reporting by:

- DCT projects.
- PLK projects.
- Both brands combined.

### 6.1 Project brand field

| Field | Type | Required | Values |
|---|---|---:|---|
| Frontend brand | Enum | Yes | DCT, PLK |

## 7. Roles and disciplines

The planner shall use roles for resource grouping, allocation and bottleneck analysis.

| Role | Description |
|---|---|
| Project Management | PM, planning, delivery coordination and client coordination. |
| Process Engineering | Process design, treatment logic, calculations and technical basis. |
| Mechanical Engineering | Mechanical design, equipment, layouts and packages. |
| Drafting | CAD, drawings, layouts and drawing updates. |
| Procurement | RFQs, vendor coordination and purchase follow-up. |
| Quality | QA/QC, inspection, document control and quality checks. |
| Technical Review | Senior review, sign-off and technical governance. |
| Management | Internal management, resourcing, escalation and leadership overhead. |
| Other | Temporary category for uncategorised work. |

Quality shall be treated as a first-class role, not hidden under project management or engineering.

Quality demand may include:

- ITP review.
- Vendor document review.
- QA/QC coordination.
- Inspection planning.
- NCR follow-up.
- Manufacturing documentation review.
- Handover dossier checks.
- Internal quality gate checks.

## 8. Core entities

### 8.1 Resource

A resource is a person or placeholder capacity unit.

```typescript
export type Resource = {
  id: string;
  displayName: string;
  role: ResourceRole;
  secondaryRoles?: ResourceRole[];
  employmentType: "employee" | "contractor" | "freelancer" | "placeholder";
  contractHoursPerWeek: number;
  workingDaysPerWeek: number;
  fullTimeHoursPerWeek: number;
  active: boolean;
  notes?: string;
};
```

### 8.2 Resource role

```typescript
export type ResourceRole =
  | "project-management"
  | "process-engineering"
  | "mechanical-engineering"
  | "drafting"
  | "procurement"
  | "quality"
  | "technical-review"
  | "management"
  | "other";
```

### 8.3 Project

```typescript
export type Project = {
  id: string;
  code: string;
  name: string;
  frontendBrand: "DCT" | "PLK";
  client?: string;
  projectManager?: string;
  status: "opportunity" | "planned" | "active" | "on-hold" | "complete" | "cancelled";
  priority: "critical" | "high" | "medium" | "low";
  flexibility: "fixed" | "limited" | "flexible";
  startMonth: string;
  endMonth: string;
  notes?: string;
};
```

### 8.4 Allocation

An allocation is planned work against a project, person, role and month.

```typescript
export type Allocation = {
  id: string;
  scenarioId: string;
  projectId: string;
  resourceId?: string;
  role: ResourceRole;
  month: string;
  hours: number;
  locked: boolean;
  notes?: string;
};
```

### 8.5 Scenario

```typescript
export type Scenario = {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  basedOnScenarioId?: string;
  assumptions: CapacityAssumptions;
};
```

### 8.6 Capacity assumptions

```typescript
export type CapacityAssumptions = {
  fullTimeHoursPerWeek: number;
  defaultLeaveDaysPerYear: number;
  leaveModel: "fixed-days" | "pro-rated";
  publicHolidayDaysPerYear: number;
  adminManagementAllowancePercent: number;
  defaultMaxUtilisationPercent: number;
};
```

## 9. Capacity calculation

### 9.1 Default planning basis

For a 40-hour Dutch employment contract:

| Calculation step | Year | Month |
|---|---:|---:|
| Contracted hours: 40 h/week x 52 weeks | 2,080 h | 173.3 h |
| Less leave: 25 days x 8 h | -200 h | -16.7 h |
| Less public holidays: 6 to 8 days x 8 h | -48 to -64 h | -4.0 to -5.3 h |
| Net attendance capacity | 1,816 to 1,832 h | 151.3 to 152.7 h |
| Less admin/management allowance: 15% | -272 to -275 h | -22.7 to -22.9 h |
| Productive/project capacity | 1,544 to 1,557 h | 128.7 to 129.8 h |

Recommended default:

| Basis | Year | Month |
|---|---:|---:|
| Full-time productive planning capacity | 1,550 h | 129 h |

### 9.2 Capacity function

```typescript
export function calculateAnnualProductiveCapacity(
  resource: Resource,
  assumptions: CapacityAssumptions
): number {
  const annualContractedHours = resource.contractHoursPerWeek * 52;

  const hoursPerWorkingDay =
    resource.contractHoursPerWeek / resource.workingDaysPerWeek;

  const fte =
    resource.contractHoursPerWeek / assumptions.fullTimeHoursPerWeek;

  const leaveDays =
    assumptions.leaveModel === "pro-rated"
      ? assumptions.defaultLeaveDaysPerYear * fte
      : assumptions.defaultLeaveDaysPerYear;

  const publicHolidayDays =
    assumptions.leaveModel === "pro-rated"
      ? assumptions.publicHolidayDaysPerYear * fte
      : assumptions.publicHolidayDaysPerYear;

  const leaveHours = leaveDays * hoursPerWorkingDay;
  const publicHolidayHours = publicHolidayDays * hoursPerWorkingDay;

  const netAttendanceHours =
    annualContractedHours - leaveHours - publicHolidayHours;

  return (
    netAttendanceHours *
    (1 - assumptions.adminManagementAllowancePercent / 100)
  );
}
```

### 9.3 Monthly capacity

```typescript
export function calculateMonthlyProductiveCapacity(
  resource: Resource,
  assumptions: CapacityAssumptions
): number {
  return calculateAnnualProductiveCapacity(resource, assumptions) / 12;
}
```

### 9.4 Capacity assumptions

| Assumption | Default |
|---|---:|
| Full-time hours/week | 40 |
| Leave days/year | 25 |
| Leave model | Pro-rated |
| Public holidays/year | 7 |
| Admin/management allowance | 15% |
| Max utilisation threshold | 100% |

## 10. Utilisation calculation

### 10.1 Person utilisation

For each person and month:

```text
personUtilisation = allocatedHours / productiveCapacityHours
```

### 10.2 Role utilisation

For each role and month:

```text
roleUtilisation = totalAllocatedHoursForRole / totalCapacityForRole
```

### 10.3 Team utilisation

For each month:

```text
teamUtilisation = totalAllocatedHours / totalProductiveCapacityHours
```

### 10.4 Utilisation thresholds

| Status | Utilisation | Meaning |
|---|---:|---|
| Underused | < 60% | Available capacity. |
| Healthy | 60% to 85% | Normal planning zone. |
| High | 85% to 100% | Limited contingency. |
| Overloaded | 100% to 115% | Action required. |
| Critical | > 115% | Delivery risk. |

## 11. Required app pages

### 11.1 Dashboard

The dashboard shall show:

| Metric | Description |
|---|---|
| Total capacity | Productive capacity across selected resources. |
| Total demand | Planned project allocation hours. |
| Net position | Capacity minus demand. |
| Utilisation | Demand divided by capacity. |
| Overload hours | Hours above productive capacity. |
| Highest-risk month | Month with worst total overload. |
| Most overloaded person | Highest person-month utilisation. |
| Most overloaded role | Highest role-month utilisation. |

Filters:

- Scenario.
- Month range.
- Brand: DCT / PLK / both.
- Role.
- Project status.
- Resource.

### 11.2 Resources

The Resources page shall allow editing of:

- Name.
- Role.
- Secondary roles.
- Employment type.
- Contract hours per week.
- Working days per week.
- Active / inactive.
- Notes.

The resource table shall show calculated monthly capacity.

### 11.3 Projects

The Projects page shall allow editing of:

- Project code.
- Project name.
- Frontend brand: DCT or PLK.
- Client.
- Project manager.
- Status.
- Priority.
- Flexibility.
- Start month.
- End month.
- Notes.

The project table shall show total planned hours.

### 11.4 Allocations

The Allocations page shall allow monthly allocation of hours.

Required views:

1. Allocation matrix by person and month.
2. Allocation matrix by project and month.
3. Allocation matrix by role and month.

Each allocation shall include:

- Scenario.
- Project.
- Brand, derived from project.
- Resource.
- Role.
- Month.
- Hours.
- Locked flag.
- Notes.

### 11.5 Scenarios

The Scenarios page shall allow users to:

- Create a scenario.
- Duplicate an existing scenario.
- Rename a scenario.
- Edit scenario assumptions.
- Compare scenarios.

### 11.6 Optimisation

The Optimisation page shall not automatically change the plan. It shall provide recommendations.

It shall show:

| Output | Description |
|---|---|
| Person overloads | Person-month overloads. |
| Role overloads | Role-month bottlenecks. |
| Available capacity | People with spare capacity. |
| Same-role reallocation options | Move work to same role where possible. |
| Secondary-role options | Move work to compatible secondary-role people. |
| Month-smoothing options | Move flexible work into lower-load months. |
| Contractor requirement | Residual hours and FTE equivalent. |

### 11.7 Reports

The Reports page shall provide:

| Report | Purpose |
|---|---|
| Executive resource summary | Management view of capacity, demand and overloads. |
| Person utilisation | Person-by-month utilisation. |
| Role utilisation | Role-by-month utilisation, including Quality. |
| Brand utilisation | DCT versus PLK demand. |
| Project demand | Project-by-month planned hours. |
| Overload report | All overloads and suggested actions. |
| Contractor requirement | Residual capacity gap after optimisation suggestions. |
| Scenario comparison | Compare baseline versus alternatives. |

Reports shall be exportable as CSV. Excel export may be added after the MVP.

## 12. Optimisation rules

### 12.1 Optimisation shall respect

| Rule | Description |
|---|---|
| Locked allocations | Must not be moved. |
| Role compatibility | Work should move only to matching or secondary roles. |
| Project flexibility | Fixed projects should not be moved in time. |
| Project priority | Low-priority work moves before high-priority work. |
| Capacity limit | Do not create a new overload. |
| Brand filter | Recommendations can be filtered by DCT, PLK or both. |

### 12.2 Recommended optimisation sequence

The app shall evaluate actions in this order:

1. Identify person-month overloads.
2. Identify role-month overloads.
3. Find same-role spare capacity in the same month.
4. Find secondary-role spare capacity in the same month.
5. Suggest moving flexible demand to a later month.
6. Calculate remaining contractor requirement.

### 12.3 Contractor requirement

Where overload cannot be solved internally, the application shall calculate required external capacity.

```text
contractorHoursRequired = residualOverloadHours
```

Contractor FTE equivalent:

```text
contractorFte = residualOverloadHours / monthlyProductiveHoursPerFte
```

## 13. Import, export and seed data

### 13.1 MVP data approach

For early development, the app should start with seed data in TypeScript files.

```text
src/data/seed/resources.ts
src/data/seed/projects.ts
src/data/seed/allocations.ts
src/data/seed/scenarios.ts
```

This is easier for Codex to work with than starting with Excel parsing.

### 13.2 Later Excel import

Excel import may be added later using SheetJS.

The import function shall map:

| Spreadsheet concept | App concept |
|---|---|
| Resource row | Resource. |
| Project row | Project. |
| Monthly project/person cells | Allocations. |
| Discipline totals | Calculated output, not imported master data. |

### 13.3 Export

The app shall support:

- CSV export for core reports.
- JSON export of the complete planning dataset.
- JSON import to restore or transfer a planning dataset.
- Excel export later if required.

## 14. Hosting and deployment

### 14.1 Deployment direction

The application shall be developed initially on a local development machine using React, Vite and TypeScript.

The application shall be designed so it can later be hosted on a server without major restructuring.

The first build shall not require a backend database, authentication or server APIs. However, the application architecture shall avoid locking business logic into browser-only storage.

### 14.2 Architecture principle

The app shall separate:

| Layer | Responsibility |
|---|---|
| UI layer | React pages and components. |
| Domain layer | Capacity, utilisation and optimisation calculations. |
| Store layer | Application state and user edits. |
| Repository layer | Loading and saving data. |
| Persistence layer | Local storage first, server database later. |

The calculation engine shall remain independent of the persistence method.

### 14.3 Repository abstraction

All data loading and saving shall go through repository functions.

```typescript
export interface PlannerRepository {
  loadResources(): Promise<Resource[]>;
  saveResources(resources: Resource[]): Promise<void>;

  loadProjects(): Promise<Project[]>;
  saveProjects(projects: Project[]): Promise<void>;

  loadAllocations(): Promise<Allocation[]>;
  saveAllocations(allocations: Allocation[]): Promise<void>;

  loadScenarios(): Promise<Scenario[]>;
  saveScenarios(scenarios: Scenario[]): Promise<void>;
}
```

For the first version, this interface may be implemented using local storage.

```typescript
export class LocalStoragePlannerRepository implements PlannerRepository {
  // Local browser storage implementation.
}
```

For the hosted version, the same interface can later be implemented using an API.

```typescript
export class ApiPlannerRepository implements PlannerRepository {
  // Server-backed implementation.
}
```

### 14.4 Recommended future hosting model

| Component | Technology |
|---|---|
| Frontend | React/Vite static build. |
| Backend API | Node.js with Fastify or Express. |
| Database | PostgreSQL. |
| Hosting | Internal VPS, company server, or managed cloud. |
| Reverse proxy | Nginx or Caddy. |
| Containerisation | Docker, optional but recommended. |
| Authentication | Not required for MVP; add later only if needed. |

### 14.5 Local development commands

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Production preview:

```bash
npm run preview
```

### 14.6 Environment configuration

The app shall use Vite environment variables for deployment-specific configuration.

| Variable | Purpose |
|---|---|
| VITE_STORAGE_MODE | local or api. |
| VITE_API_BASE_URL | Backend API URL. |
| VITE_APP_NAME | Display name. |
| VITE_DEFAULT_BRAND_FILTER | DCT, PLK or both. |

Example:

```text
VITE_STORAGE_MODE=local
VITE_API_BASE_URL=
VITE_APP_NAME=Engineering Resource Planner
VITE_DEFAULT_BRAND_FILTER=both
```

### 14.7 Persistence migration path

| Step | Description |
|---|---|
| 1 | Seed data in TypeScript files. |
| 2 | Browser local storage. |
| 3 | JSON import/export. |
| 4 | API repository. |
| 5 | PostgreSQL database. |
| 6 | Optional authentication and audit logging. |

## 15. Recommended technical stack

| Area | Recommendation |
|---|---|
| App framework | React + Vite. |
| Language | TypeScript. |
| Styling | Tailwind CSS. |
| UI components | shadcn/ui. |
| Tables | TanStack Table. |
| Charts | Recharts. |
| State management | Zustand. |
| Validation | Zod. |
| Local persistence | LocalStorage first, IndexedDB later if needed. |
| Tests | Vitest. |
| Agent-assisted development | Codex / VS Code coding agent. |

## 16. Recommended folder structure

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    charts/
    forms/
    layout/
    tables/
    ui/
  data/
    seed/
      resources.ts
      projects.ts
      allocations.ts
      scenarios.ts
  domain/
    capacity/
      capacityCalculations.ts
      capacityCalculations.test.ts
    utilisation/
      utilisationCalculations.ts
      utilisationCalculations.test.ts
    optimisation/
      optimisationRules.ts
      optimisationRules.test.ts
  features/
    dashboard/
    resources/
    projects/
    allocations/
    scenarios/
    optimisation/
    reports/
  repositories/
    PlannerRepository.ts
    LocalStoragePlannerRepository.ts
    ApiPlannerRepository.ts
  store/
    plannerStore.ts
  types/
    index.ts
  utils/
```

## 17. Calculation engine requirements

The calculation engine shall be implemented as pure TypeScript functions.

Required functions:

```typescript
calculateAnnualProductiveCapacity(resource, assumptions)
calculateMonthlyProductiveCapacity(resource, assumptions)
calculatePersonUtilisation(resource, allocations, assumptions)
calculateRoleUtilisation(resources, allocations, assumptions)
calculateTeamUtilisation(resources, allocations, assumptions)
identifyOverloads(utilisationResults, thresholds)
calculateContractorRequirement(overloads, monthlyFteCapacity)
```

Optimisation functions:

```typescript
findOverloadedPersonMonths(utilisationResults)
findAvailableCapacity(resources, utilisationResults)
findCompatibleResources(overloadedResource, candidateResources)
suggestSameRoleReallocations(overloads, availableCapacity, constraints)
suggestMonthSmoothing(allocations, capacity, projectConstraints)
calculateResidualOverload(overloads, recommendations)
calculateContractorFteRequirement(residualOverload, monthlyFteCapacity)
```

## 18. Validation and business rules

| Rule | Type |
|---|---|
| Contract hours must be greater than 0. | Error |
| Working days must be between 1 and 7. | Error |
| Leave days cannot be negative. | Error |
| Admin allowance must be between 0 and 50%. | Error |
| Allocation hours cannot be negative. | Error |
| Project start must be before or equal to project end. | Error |
| Allocation month outside project range. | Warning |
| Resource inactive during allocation month. | Warning |
| Allocation exceeds capacity. | Warning |
| Allocation exceeds hard cap. | Warning |
| Duplicate project code. | Error |
| Project must have frontend brand DCT or PLK. | Error |
| Allocation must have a role. | Error |

## 19. Acceptance criteria

### 19.1 Capacity calculation

Given a 40-hour resource with:

- 25 leave days.
- 7 public holidays.
- 15% admin allowance.

When capacity is calculated, then the annual productive capacity shall be approximately:

```text
1,550 hours/year
```

And monthly productive capacity shall be approximately:

```text
129 hours/month
```

### 19.2 4-day calculation

Given a 32-hour resource with:

- Pro-rated leave.
- 7 public holidays pro-rated by FTE.
- 15% admin allowance.

Then monthly productive capacity shall be approximately:

```text
103 hours/month
```

### 19.3 Utilisation

Given a person with:

- 129 hours capacity in June.
- 160 allocated hours in June.

Then the application shall show:

| Metric | Value |
|---|---:|
| Utilisation | 124% |
| Overload | 31 h |
| Status | Critical |

### 19.4 Brand reporting

Given projects with brands DCT and PLK, the dashboard shall allow reporting for:

- DCT only.
- PLK only.
- Both combined.

### 19.5 Quality reporting

Given allocations to Quality, the role utilisation view shall show Quality capacity, demand and overloads separately from project management and engineering roles.

### 19.6 Repository abstraction

No React component shall call localStorage directly. Components shall use store actions, and store actions shall use a repository implementation.

## 20. MVP definition

The MVP is complete when the app can:

- Show resources.
- Show projects.
- Show allocations.
- Calculate capacity using Dutch working assumptions.
- Include DCT and PLK project brands.
- Include Quality as a role.
- Show person utilisation.
- Show role utilisation.
- Show team utilisation.
- Show overloads.
- Show available capacity.
- Suggest simple same-role reallocations.
- Calculate residual contractor requirement.
- Save data locally through a repository layer.
- Reset to seed data.
- Export core tables as CSV.
- Export and import full planning data as JSON.
- Build as a static Vite production app.

## 21. Development phases

### Phase 1: Local prototype

Goal: Build the app skeleton and prove the calculation model.

Deliverables:

- React/Vite/TypeScript app.
- Navigation layout.
- Seed data.
- Type definitions.
- Capacity calculations.
- Utilisation calculations.
- Basic dashboard.
- Unit tests.

### Phase 2: Editable planner

Goal: Make the app usable for real planning.

Deliverables:

- Editable resources.
- Editable projects.
- Editable allocations.
- Scenario assumptions.
- Local storage repository.
- Reset to seed data.

### Phase 3: Optimisation support

Goal: Support management decisions.

Deliverables:

- Overload detection.
- Same-role reallocation suggestions.
- Month smoothing suggestions.
- Contractor requirement calculation.
- Scenario comparison.

### Phase 4: Server-ready release

Goal: Prepare for hosted team use.

Deliverables:

- Repository interface fully separated from UI.
- Environment configuration.
- Static production build.
- API repository stub.
- Deployment notes.

### Phase 5: Hosted version

Goal: Shared server-hosted planning tool.

Deliverables:

- Backend API.
- PostgreSQL database.
- Server deployment.
- Backups.
- Optional authentication if the app is externally accessible.

## 22. Codex / VS Code development approach

The app should be built in small vertical slices.

Recommended sequence:

1. Create skeleton app.
2. Add seed data.
3. Add calculation engine.
4. Add dashboard.
5. Add editable data.
6. Add local persistence via repository layer.
7. Add optimisation recommendations.
8. Add reports and exports.
9. Add server-ready API repository stub.

Do not start with automatic optimisation, database design or Excel import. First make the model reliable, transparent and editable.

## 23. Definition of done for first build

The first build is done when:

- The app runs with `npm run dev`.
- The dashboard renders seed data.
- The full-time capacity calculation returns approximately 1,550 hours/year and 129 hours/month.
- The 4-day pro-rated calculation returns approximately 103 hours/month.
- DCT and PLK brand filters work.
- Quality appears as a separate role.
- Person and role overloads are visible.
- Unit tests pass.
- No React component directly uses localStorage.

## 24. First Codex prompt

Use the first prompt in the project root after creating or opening the VS Code workspace. It should instruct Codex to build the app skeleton, core types, seed data, calculation engine, repository abstraction, local storage implementation and initial dashboard.
