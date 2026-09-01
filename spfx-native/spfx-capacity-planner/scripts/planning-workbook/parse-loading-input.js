const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Reads the filled-in Capacity-Planner-Loading-Input.xlsx (see generate.js for the
// layout it expects) and emits a normalized JSON list of allocations for
// ../import-loading-input.ps1 to push into the ERP_Allocations SharePoint list.

const PROJECTS = [
  { title: 'Cancun CISEC', code: 'P250002' },
  { title: 'TAQA', code: 'P260001' },
  { title: 'ADOC', code: 'P250001' },
  { title: 'OXY Oman', code: 'P230195' },
  { title: 'Almansoori', code: 'P230073' },
  { title: 'Spare Parts Zeeland', code: 'P260002' },
  { title: 'SARAT', code: 'QDG2600002' },
  { title: 'Sales and Quotations Effort', code: 'SALES' },
];
const projectCodeByTitle = new Map(PROJECTS.map((p) => [p.title, p.code]));

const OTHER_ROW_TITLE = 'Other / New Opportunity (specify in Notes)';

// Manual reconciliation of "Other / New Opportunity" rows to a real ERP_Projects
// code, based on what each person wrote in the Notes column. Update this map when
// a new workbook revision introduces a new person/note that needs mapping.
// Deliberately NOT mapped: rows whose notes describe leave/holiday. Those should be
// tracked as dated ERP_Leave entries (with real start/end dates) instead of a rough
// % allocation against a "Leave" project bucket, since a rough self-reported estimate
// and an actual dated leave record double-count the same time off if both exist.
// e.g. 'Fatemeh Rashidashmagh': 'Holiday' note -> intentionally left unmapped.
const OTHER_ROW_MAPPING = {
  'Rutger Reij': 'RND', // "R&D, future projects, mechanical library"
  'Ajitha Karuppiah': 'SALES', // "For Quotation"
  'William Garcia': 'PROC', // documentation/SOPs/HAZID/workshops
};

const MONTH_COUNT = 6;
const START_YEAR = 2026;
const START_MONTH_INDEX = 7; // August (0-based), must match generate.js

function monthKey(offset) {
  const d = new Date(START_YEAR, START_MONTH_INDEX + offset, 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
}

function cellNumber(cell) {
  let v = cell.value;
  if (v && typeof v === 'object' && 'result' in v) v = v.result;
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function cellText(cell) {
  let v = cell.value;
  if (v && typeof v === 'object' && 'result' in v) v = v.result;
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

async function parse(inputPath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(inputPath);

  const allocations = [];
  const unmapped = [];

  for (const ws of wb.worksheets) {
    if (ws.name === 'Instructions') continue;
    const personName = ws.name;

    const headerRowIdx = 4;
    const firstDataRow = headerRowIdx + 1;
    let rowIdx = firstDataRow;

    while (true) {
      const row = ws.getRow(rowIdx);
      const projectTitle = cellText(row.getCell(1));
      if (!projectTitle || projectTitle === 'Total') break;

      const notes = cellText(row.getCell(3 + MONTH_COUNT));
      const isOtherRow = projectTitle === OTHER_ROW_TITLE;
      const projectCode = isOtherRow ? OTHER_ROW_MAPPING[personName] : projectCodeByTitle.get(projectTitle);

      for (let i = 0; i < MONTH_COUNT; i++) {
        const pct = cellNumber(row.getCell(3 + i));
        if (pct === null || pct === 0) continue;

        if (!projectCode) {
          unmapped.push({ personName, projectTitle, month: monthKey(i), percent: pct, notes });
          continue;
        }

        allocations.push({
          personName,
          projectCode,
          projectTitle: isOtherRow ? `${projectTitle} -> ${projectCode}` : projectTitle,
          month: monthKey(i),
          percent: pct,
          notes,
        });
      }

      rowIdx += 1;
    }
  }

  return { allocations, unmapped };
}

async function main() {
  const inputPath = process.argv[2] || path.join(__dirname, '..', 'output', 'Capacity-Planner-Loading-Input.xlsx');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'output', 'loading-input-parsed.json');

  if (!fs.existsSync(inputPath)) {
    console.error(`Workbook not found at ${inputPath}`);
    process.exit(1);
  }

  const { allocations, unmapped } = await parse(inputPath);

  fs.writeFileSync(outputPath, JSON.stringify(allocations, null, 2));
  console.log(`Wrote ${allocations.length} allocation entries to ${outputPath}`);

  if (unmapped.length) {
    console.log('');
    console.log(`${unmapped.length} entries could not be mapped to a known project (e.g. "Other / New Opportunity" rows) and were skipped. Review manually:`);
    for (const u of unmapped) {
      console.log(`  - ${u.personName} | ${u.projectTitle} | ${u.month} | ${u.percent}% | ${u.notes}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
