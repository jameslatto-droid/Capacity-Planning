# Loading Input Workbook Generator

Generates `Capacity-Planner-Loading-Input.xlsx` — one tab per person, listing all
projects as rows and the next 6 months as columns, for people to fill in their
expected % allocation.

## Regenerate

```
cd scripts/planning-workbook
npm install
npm run generate
```

Output is written to `scripts/output/Capacity-Planner-Loading-Input.xlsx`.

## Data source

People and projects are hardcoded in `generate.js`, copied from
`MockResourcePlanningRepository.ts` (the current people/project list). If the
real roster or project list changes, update `PEOPLE` / `PROJECTS` in
`generate.js` before regenerating, and adjust `START_YEAR` / `START_MONTH_INDEX`
to the current month.

## Publish

Upload the generated file to SharePoint and get a shareable link with
`../upload-planning-workbook.ps1` (requires PnP.PowerShell, same auth as
`provision-lists.ps1`).
