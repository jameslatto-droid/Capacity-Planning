---
type: implementation-plan
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: build
tags: [sharepoint, spfx, ui, fluent, ergonomics]
---

# SharePoint Native UI Redesign Plan

## Objective

Make the Capacity Planner feel like a modern SharePoint and Fluent application rather than a themed standalone dashboard. The working model is a dense operational planning tool with simple visible screens and advanced settings behind commands, panels or admin areas.

## Design principles

1. Use the SharePoint page as the host, not as a frame around a separate microsite.
2. Use Fluent visual language: white surfaces, neutral borders, Segoe UI, blue theme accent, compact controls.
3. Keep Planning and Allocate as the main workflows.
4. Keep forms and admin details out of the main work surface where possible.
5. Use tables and matrices with internal scrolling to avoid long SharePoint page scrolling.
6. Prefer command bars, compact tabs and panels over permanent side forms.

## File-by-file implementation changes

### `src/webparts/capacityPlanner/components/CapacityPlannerApp.module.scss`

Implemented in this pass:

- Removed the dark amber theme variables.
- Removed decorative gradients, background grid and glow effects.
- Added SharePoint-style neutral palette:
  - white surfaces
  - `#edebe9` borders
  - `#201f1e` primary text
  - `#605e5c` secondary text
  - `#0078d4` SharePoint/Fluent accent
- Converted cards and panels to simple Fluent-style surfaces.
- Converted navigation from pill buttons to compact tab-like buttons.
- Converted primary actions to Fluent blue buttons.
- Converted secondary and row actions to neutral outlined buttons.
- Reduced header, navigation, KPI, table and form padding.
- Added matrix max-height and internal scrolling.
- Kept sticky first matrix column and sticky matrix headers.
- Reduced visual noise on utilisation bands.
- Updated message bars and forms to sit naturally on the SharePoint page.

Next pass for this file:

- Add dedicated classes for compact command bars.
- Add dedicated classes for panel bodies once edit forms are moved into Panels.
- Add selected row and row hover states consistent with SharePoint Lists.
- Add density modes: comfortable and compact.

### `src/webparts/capacityPlanner/components/CapacityPlannerApp.tsx`

Recommended next implementation:

- Change the default active tab from `dashboard` to `planning`.
- Replace the current nav with a reduced top-level structure:
  - Planning
  - Allocate
  - Projects
  - People
  - Overview
  - Reports
  - More
- Move Leave, Optimisation, Data and Scenario Settings behind `More` or `Admin`.
- Replace permanent right-side forms with state-driven panel forms:
  - `activePanel: 'person' | 'project' | 'leave' | 'scenario' | undefined`
  - `panelMode: 'new' | 'edit'`
- Convert Team, Projects and Leave pages to list-first layouts:
  - compact command row at top
  - table/list fills the page
  - New/Edit opens a panel
- Remove Scenario assumptions from the default dashboard and move them to Admin or Settings.
- Make Allocate the main project action from Projects.
- Add a compact empty state for pages with no allocations or no overloads.
- Add search/filter state for people and projects.

### `src/webparts/capacityPlanner/CapacityPlannerWebPart.ts`

Recommended next implementation:

- Add a property pane option for default landing view.
- Add a property pane option for planning horizon density if needed.
- Keep the root host class `capacityPlannerWebPartHost` so the app can safely control its own width without breaking SharePoint canvas layout.

### `src/webparts/capacityPlanner/CapacityPlannerWebPart.manifest.json`

Implemented in this pass:

- Bumped version to `0.3.0`.

Recommended next implementation:

- Keep `SharePointFullPage` support.
- Keep `supportsFullBleed` support.
- Add default property for `defaultView` if implemented in the web part props.

### `config/package-solution.json`

Implemented in this pass:

- Bumped SPFx solution version to `0.3.0.0` so SharePoint will clearly recognise the new app package update.

### `package.json`

Implemented in this pass:

- Bumped package version to `0.3.0`.

### Future new component files

Recommended split once the shell is stable:

- `components/layout/AppShell.tsx`
- `components/layout/AppCommandBar.tsx`
- `components/layout/AppPanel.tsx`
- `components/views/PlanningPage.tsx`
- `components/views/AllocatePage.tsx`
- `components/views/ProjectsPage.tsx`
- `components/views/PeoplePage.tsx`
- `components/views/ReportsPage.tsx`
- `components/views/AdminPage.tsx`

The current `CapacityPlannerApp.tsx` is doing too much. Splitting by page will make the app easier to refine without breaking unrelated workflows.

## Acceptance criteria for the redesign

- At 100 percent browser zoom, the app should not feel like a custom web page embedded in SharePoint.
- The visible page should prioritise the active planning task.
- Tables and matrices should scroll internally where needed.
- Forms should not permanently consume horizontal space once converted to panels.
- Admin and setup functions should not compete with normal planning workflows.
- The app should look credible next to Microsoft Lists, Planner and modern SharePoint pages.
