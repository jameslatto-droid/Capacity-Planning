---
type: technical-readme
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: build
tags: [sharepoint, spfx, resource-planning]
---

# Capacity Planner SPFx

Native SharePoint Framework rebuild of the Engineering Resource Planner.

## Target stack

- SharePoint Framework 1.23.2
- Node.js 22 LTS
- React 17.0.1
- TypeScript 5.3 through the SPFx rush stack compiler
- SharePoint Lists as the system of record
- PnPjs v4 for SharePoint data access

## Build

```bash
nvm use 22
npm install
npm run build
npm run bundle:ship
npm run package:ship
```

The packaged `.sppkg` will be produced under:

```text
sharepoint/solution/
```

## Runtime behaviour

The web part tries to connect to site-scoped SharePoint Lists. If the required lists do not exist, the UI falls back to mock seed data and shows a setup warning. This allows development and page layout review before list provisioning is complete.

## Required SharePoint Lists

- ERP_People
- ERP_Projects
- ERP_Allocations
- ERP_Leave
- ERP_Disciplines
- ERP_Settings
- ERP_AuditLog

Schema details are in `../docs/sharepoint-data-model.md` and provisioning notes are in `scripts/provision-lists.ps1`.
