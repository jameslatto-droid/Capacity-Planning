---
type: technical-note
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, spfx, environment]
---

# SPFx Rebuild Environment

## Recommended baseline

Use the latest Microsoft-supported SharePoint Framework line for SharePoint Online.

| Component | Version / guidance |
|---|---:|
| Node.js | 22 LTS |
| npm | Bundled with Node 22 |
| SharePoint Framework | 1.23.2 |
| React | 17.0.1 |
| TypeScript | SPFx-supported range up to 5.8 |
| Toolchain | Heft-based SPFx toolchain |

## Install

```bash
nvm install 22
nvm use 22
npm install @microsoft/generator-sharepoint@latest --global
```

## Generate the clean SPFx solution

```bash
mkdir spfx-capacity-planner
cd spfx-capacity-planner
yo @microsoft/sharepoint
```

Recommended generator choices:

| Prompt | Answer |
|---|---|
| Solution name | capacity-planner-spfx |
| Target environment | SharePoint Online only |
| Component type | WebPart |
| Web part name | CapacityPlanner |
| Framework | React |
| Tenant-wide deployment | No for first validation, decide later |

## Validation commands

Use the generated SPFx commands from the scaffold. For the Heft-based toolchain, prefer the generated scripts rather than carrying over older Gulp assumptions.

Expected validation sequence:

```bash
npm install
npm run build
npm run serve
npm run bundle -- --ship
npm run package-solution -- --ship
```

If the generator emits different script names, follow the generated package scripts and do not manually downgrade the toolchain.
