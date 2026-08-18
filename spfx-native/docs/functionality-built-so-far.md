---
type: functionality-register
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: build
tags: [sharepoint, spfx, functionality]
---

# Functionality Built So Far

## Platform and architecture

- Native SharePoint Framework rebuild branch created: `spfx-native-rebuild`.
- Draft pull request opened against `main`.
- SPFx solution scaffold added under `spfx-native/spfx-capacity-planner`.
- Target stack set to SPFx 1.23.2, Node.js 22 LTS, React 17.0.1, TypeScript 5.3, and PnPjs v4.
- Vite, Supabase and external app database are excluded from the target architecture.
- SharePoint Lists are defined as the system of record.
- App package configuration added for `.sppkg` generation.
- Web part manifest created for `CapacityPlannerWebPart`.
- Property pane added for title, planning horizon and mock fallback behaviour.

## SharePoint integration

- SharePoint connection checked against `narwal.sharepoint.com/sites/ProjectsandEngineeringNotes`.
- Relevant site libraries identified, including `Apps for SharePoint` and `Client Side Assets`.
- Required ERP list names centralised in code.
- Repository interface created to separate UI from storage.
- SharePoint repository implemented with PnPjs.
- Repository checks for required ERP lists before attempting to load live data.
- Live data mapping implemented for people, projects, allocations and leave.
- Save methods implemented for people, projects, allocations and leave entries.
- Allocation delete method implemented.
- PnP PowerShell provisioning script added to create the required lists and fields.

## Data model

- People/resource model added.
- Project model added with live/opportunity project type.
- Project include/exclude capacity toggle added to the model.
- Allocation model added using monthly allocation rows rather than wide month columns.
- Leave model added.
- Month summary, person-month summary and project demand summary models added.
- SharePoint list schema documented.

## Capacity calculations

- Monthly capacity calculation added from FTE and weekly hours.
- Allocation FTE to hours conversion added.
- Leave deduction from available capacity added.
- Month-level capacity versus demand summaries added.
- Person-month utilisation summaries added.
- Project demand summaries added.
- Overload detection added where utilisation exceeds 100%.

## User interface

- SPFx React app shell added.
- Fluent UI Pivot navigation added.
- Header added showing app title, current SharePoint site and current user.
- Warning banner added when the app falls back to mock data.
- Loading state added.
- Dashboard tab added.
- Projects tab added.
- People tab added.
- Allocations tab added.
- Reports tab added.
- Leave tab added.
- Basic responsive card and table styling added.

## Dashboard functionality

- Active people count.
- Project count.
- Overall planning utilisation.
- Overloaded month count.
- Monthly capacity table showing capacity, leave, available hours, allocated hours and utilisation.

## Projects functionality

- Project list display.
- Project code display.
- Live/opportunity project type display.
- Project status display.
- Client display.
- Include in capacity display.
- Probability display.
- Notes display.

## People functionality

- People list display.
- Discipline display.
- Role display.
- Employment type display.
- FTE display.
- Weekly hours display.
- Calculated monthly capacity display.
- Active/inactive display.

## Allocations functionality

- Monthly allocation table display.
- Person and project resolution from allocation rows.
- FTE display.
- Calculated allocation hours display.
- Discipline display.
- Include in capacity display.
- Allocation notes display.

## Reports functionality

- Person heatmap-style table added.
- Person-month allocated hours display.
- Person-month available hours display.
- Person-month utilisation percentage display.
- Overload highlighting added.
- Project demand summary table added.
- Total hours and included hours separated.

## Leave functionality

- Leave table display.
- Leave month display.
- Person resolution from leave entry.
- Leave type display.
- Leave hours display.
- Leave notes display.

## Development fallback

- Mock repository implemented.
- Seed people added.
- Seed projects added, including live and opportunity examples.
- Seed monthly allocations added across the configured planning horizon.
- Seed leave entries added.
- App falls back to mock data when required SharePoint Lists are missing and fallback is enabled.

## Not yet built

- Editable grid interactions.
- Full create/edit/delete UI forms.
- Bulk allocation editing.
- SharePoint lookup-field relationship implementation.
- Audit logging writes.
- Import from the old spreadsheet.
- Authentication or role-based UI controls beyond SharePoint permissions.
- Chart visuals.
- Full visual polish matching the earlier Vite prototype.
- Automated CI build validation.
- Tested `.sppkg` package output.
