---
type: connection-check
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, connection, deployment]
---

# SharePoint Connection Check

## Result

The Microsoft SharePoint connector can access the tenant and can resolve the likely project validation site.

## Confirmed site

| Field | Value |
|---|---|
| Hostname | narwal.sharepoint.com |
| Site path | /sites/ProjectsandEngineeringNotes |
| Display name | Projects and Engineering Notes |
| Web URL | https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes |

## Relevant document libraries discovered

| Library | Relevance |
|---|---|
| Apps for SharePoint | Site app catalogue context for SPFx package validation |
| Client Side Assets | SPFx client-side asset hosting context |
| Working Notes (Obsidian Vault) | Existing working documentation area |
| Working documents | General project working documents |

## Implication

This site is a credible first validation target for the SPFx rebuild. The next deployment step is not to upload anything yet, but to generate and build the clean SPFx package, then validate whether the package should go to the site app catalogue or tenant app catalogue.

## Open point

The current connector tools can inspect document libraries and files. They do not expose a direct SharePoint List schema/provisioning action in this session. List creation should therefore be implemented in the SPFx app, a provisioning script, PnP PowerShell, CLI for Microsoft 365, or manual SharePoint list setup.
