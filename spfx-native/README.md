---
type: technical-architecture
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, spfx, resource-planning]
---

# Capacity Planning SPFx Native Rebuild

This folder is the SharePoint-native rebuild of the Engineering Resource Planner.

The previous Vite, React 18 and Supabase implementation remains a prototype and functional reference. The target product is now a native SharePoint Framework solution that stores all operational data in SharePoint Lists within the target site.

## Target stack

| Component | Target |
|---|---:|
| SharePoint Framework | 1.23.2 |
| Node.js | 22 LTS |
| React | 17.0.1 |
| TypeScript | SPFx-supported range up to 5.8 |
| Build toolchain | Heft-based SPFx toolchain |
| Data store | SharePoint Lists scoped to the deployment site |
| Data access | SharePoint REST through SPFx context, with a dedicated service layer |
| Deployment | SharePoint App Catalog package |

## Product direction

The application should be delivered as an SPFx web part, deployed to SharePoint Online, and bound to lists created in the same site as the app. It should not require Supabase, a separately hosted API, or a Vite production host.

## Functional modules

1. Dashboard
2. People and disciplines
3. Projects and opportunities
4. Monthly allocations
5. Leave and capacity adjustments
6. Reports and heatmaps
7. Settings and list health checks

## Data principles

- SharePoint Lists are the system of record.
- Allocation rows are stored monthly, not as wide month columns.
- Reporting fields that are expensive to join repeatedly are denormalised onto allocation rows.
- Lists must be indexed on date, person, project and inclusion fields.
- The app should use site permissions and list permissions rather than a separate authentication layer.

## Migration stance

Keep the existing root app as a reference until feature parity is reached. Do not try to convert the Vite app in place. The SPFx rebuild should be clean, with selectively ported domain logic and UI patterns only where they remain useful.
