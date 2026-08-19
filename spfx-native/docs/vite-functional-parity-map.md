---
type: functional-parity-map
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, spfx, functional-parity]
---

# Vite to SPFx Functional Parity Map

This document tracks the functional gap between the original Vite Engineering Resource Planner and the SharePoint Framework native rebuild.

The SPFx rebuild must not be treated as a cosmetic restyle. The original Vite app is the functional reference implementation. The SPFx app must reproduce the useful planning workflows while changing the persistence layer to SharePoint Lists.

## Source reference

The original Vite app described the product as a small-team planning application for:

- maintaining resources and contract terms
- maintaining projects with brand, status, priority and schedule
- recording monthly planned allocations as % loading or hours
- calculating person capacity using contract hours and leave allowances
- detecting overloads
- tracking actual leave
- supporting scenario planning
- providing recommendations for overload resolution
- generating weekly planning reports and management charts

## Current SPFx status

The SPFx version currently has:

- SharePoint Framework package and web part deployment
- SharePoint Lists repository wiring
- mock data fallback
- read-only dashboard
- read-only projects table
- read-only people table
- read-only allocations table
- read-only leave table
- basic person utilisation report
- basic project demand summary
- list provisioning script

This is a technical foundation, not yet full functional parity.

## Functional parity target

| Area | Original Vite functionality | SPFx status | Required SPFx work |
|---|---|---|---|
| App shell | Full app navigation and dedicated pages | Partial tab shell | Replace simple tabs with app-like navigation and page layout |
| Dashboard | KPI strip, headroom/overrun, overload count, projects in scope, discipline charts, portfolio Gantt, date/brand filters | Basic KPI strip only | Add discipline demand/capacity, portfolio Gantt, filters and headroom metrics |
| Team / resources | Add, edit, delete resources with contract hours, working days, roles, secondary roles and active status | Read-only people table | Add resource form and SharePoint save/delete |
| Projects | Add, edit, delete projects with brand, status, priority, date range and total planned hours | Read-only projects table | Add project form, metadata editing and project total hours |
| Project Allocation Editor | Dedicated editor per project; person rows, month columns, % inputs, calculated hours, add/remove people, save timestamp | Missing | Highest priority. Build project allocation editor against ERP_Allocations |
| Planning matrix | By Person, By Project and By Role views; leave sub-rows; capacity headers | Basic allocation list only | Add matrix views and capacity/leave rollups |
| Leave tracker | Who's out this month, monthly grid, add/edit/delete leave, capacity impact | Read-only leave list | Add leave form, monthly leave grid and chip row |
| Capacity calculation | Annual productive capacity, leave allowances, public holidays, admin allowance, monthly productive capacity | Simplified monthly capacity | Port capacity assumptions and productive capacity formulas |
| Leave-adjusted capacity | Actual leave reduces capacity by month | Partially present | Improve date range leave handling, working-day counts and part-time pro-rating |
| Scenarios | Baseline / Conservative / Lean assumptions and recalculation without changing allocations | Missing | Add ERP_Scenarios and ERP_CapacityAssumptions or settings-backed scenario model |
| Utilisation thresholds | Underused, healthy, high, overloaded, critical | Basic >100 overload only | Add threshold bands and colour logic |
| Optimisation | Overload table, reallocation suggestions, available capacity, contractor FTE requirement | Missing | Add recommendations from same-role/secondary-role spare capacity |
| Reports | Person, Role, Brand, Projects, Overloads tabs, charts, CSV and JSON export | Basic person/project tables | Add report tabs, heatmaps, brand/role/project summaries and exports |
| Brand filtering | DCT / PLK / both | Missing | Add brand to SharePoint list schema and UI filters |
| Quality role | First-class role with distinct reporting | Missing/partial | Add Quality to role model and reporting summaries |
| Exports | Person CSV and full JSON export | Missing | Add client-side CSV/JSON export buttons |

## Implementation priority

1. Port the data model fields needed for the original workflows: brand, priority, working days, secondary roles, scenarios, role-tagged allocations, locked allocation flag and lastModifiedAt.
2. Add editable SharePoint-backed forms for resources, projects, allocations and leave.
3. Rebuild the Project Allocation Editor because it is the core PM data-entry workflow.
4. Rebuild the Planning matrix because it is the core management review workflow.
5. Rebuild the Optimisation page using the original decision-support logic.
6. Expand Reports to match the old tabs and exports.
7. Finally refine the visual theme to match the old app.

## Definition of done for SPFx parity

The SPFx app should be considered functionally useful only when a project manager can:

1. add or update a project,
2. open that project,
3. enter monthly % loading by person,
4. save it to SharePoint Lists,
5. see the allocation reflected in team capacity,
6. see overloads and available capacity,
7. record leave,
8. see leave reduce capacity,
9. export a report for the weekly planning meeting.
