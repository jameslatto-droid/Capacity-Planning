---
type: backlog
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, spfx, backlog]
---

# SPFx Native Rebuild Backlog

## Milestone 1: Foundation

- [ ] Generate clean SPFx 1.23.2 web part scaffold.
- [ ] Commit generated scaffold under `spfx-native/spfx-capacity-planner` or replace this folder with the generated solution root.
- [ ] Confirm local build with Node 22.
- [ ] Confirm local workbench render.
- [ ] Remove Supabase dependency from the deployable path.
- [ ] Add SharePoint repository implementation behind `IResourcePlanningRepository`.

## Milestone 2: SharePoint data setup

- [ ] Create or provision `ERP_People`.
- [ ] Create or provision `ERP_Disciplines`.
- [ ] Create or provision `ERP_Projects`.
- [ ] Create or provision `ERP_Allocations`.
- [ ] Create or provision `ERP_Leave`.
- [ ] Create or provision `ERP_Settings`.
- [ ] Add required indexes.
- [ ] Add list health check screen.

## Milestone 3: Core app screens

- [ ] People screen.
- [ ] Projects screen with Opportunity/Live selector.
- [ ] Include/exclude capacity toggle for opportunities.
- [ ] Monthly allocation editor.
- [ ] Leave input.
- [ ] Dashboard.
- [ ] Reports heatmap showing percentage and hours.

## Milestone 4: Deployment

- [ ] Package `.sppkg`.
- [ ] Upload to site app catalog or tenant app catalog.
- [ ] Add app to `Projects and Engineering Notes` validation site.
- [ ] Validate list reads and writes under normal user permissions.
- [ ] Document release procedure.

## Technical risks

| Risk | Mitigation |
|---|---|
| SharePoint list threshold behaviour | Use indexed fields and date-windowed queries. |
| Excessive lookup joins | Store denormalised reporting fields on allocation rows. |
| SPFx 1.23 CSS/Sass changes | Keep styling simple and avoid fragile legacy Sass patterns. |
| Prototype logic coupled to Vite/Supabase | Port domain logic only, not infrastructure assumptions. |
| Site-specific deployment assumptions | Make list names configurable via web part properties or `ERP_Settings`. |
