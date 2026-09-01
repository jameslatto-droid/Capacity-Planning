---
type: deployment-note
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: build
tags: [sharepoint, spfx, allocations, personal-view]
---

# My Allocations SharePoint Page

The Capacity Planner web part supports a separate personal allocation experience without changing the existing planner page.

## Page configuration

1. Create a new modern SharePoint page named `My Allocations`.
2. Add the existing **Capacity Planner** web part.
3. Set **Web part title** to `My Allocations`.
4. Set **Page experience** to `My allocations`.
5. Set the required planning horizon.
6. Publish the page and share the same page link with the team.

The web part uses the current SharePoint user's email address, matches it to `ERP_People.Email`, and displays only allocations whose `PersonKey` matches that person.

The existing Capacity Planning page remains unchanged because **Full planner** is the default experience for existing and new web-part instances.
