const ExcelJS = require('exceljs');
const path = require('path');

// Mirrors IPerson / IProject in spfx-native/spfx-capacity-planner/src/webparts/capacityPlanner/models/ResourcePlanningModels.ts
// Source data taken from MockResourcePlanningRepository.ts (current live/mock dataset)
const PEOPLE = [
  { title: 'Onur Kavakli', discipline: 'Process Engineering', role: 'Principal Engineer' },
  { title: 'Maria Alonzo', discipline: 'Project Management', role: 'Project Manager' },
  { title: 'Jacobo Ramirez', discipline: 'Project Management', role: 'Project Manager (In-Country)' },
  { title: 'Boris Welzen', discipline: 'Procurement', role: 'Procurement Manager' },
  { title: 'Rutger Reij', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer' },
  { title: 'Anwar Hassan', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer' },
  { title: 'Ajitha Karuppiah', discipline: 'Drafting', role: 'Draughtsperson' },
  { title: 'Neville Cory', discipline: 'Process Engineering', role: 'Process Engineer' },
  { title: 'Fatemeh Rashidashmagh', discipline: 'Process Engineering', role: 'Process Engineer' },
  { title: 'William Garcia', discipline: 'Process Engineering', role: 'Process Engineer' },
  { title: 'Lukasz Kawalec', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer (Freelancer)' },
  { title: 'Michael', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer (Freelancer)' },
  { title: 'Rinke de Klerk', discipline: 'Mechanical Engineering', role: 'Mechanical Engineer (Freelancer)' },
  { title: 'Dion van Doorne', discipline: 'Project Management', role: 'Project Manager' },
  { title: 'Tim Brantjes', discipline: 'Project Management', role: 'Project Manager' },
];

const PROJECTS = [
  { title: 'Cancun CISEC', code: 'P250002', client: 'CISEC', status: 'Active' },
  { title: 'TAQA', code: 'P260001', client: 'TAQA', status: 'Active' },
  { title: 'ADOC', code: 'P250001', client: 'ADOC', status: 'Active' },
  { title: 'OXY Oman', code: 'P230195', client: 'OXY', status: 'Active (wind-down)' },
  { title: 'Almansoori', code: 'P230073', client: 'Almansoori', status: 'Active (near close-out)' },
  { title: 'Spare Parts Zeeland', code: 'P260002', client: 'Zeeland', status: 'On Hold' },
  { title: 'SARAT', code: 'QDG2600002', client: 'SARAT', status: 'Pipeline opportunity' },
  { title: 'Sales and Quotations Effort', code: 'SALES', client: 'Internal', status: 'Ongoing internal' },
];
const OTHER_ROW = { title: 'Other / New Opportunity (specify in Notes)', code: '', client: '', status: '' };

const MONTH_COUNT = 6;
const START_YEAR = 2026;
const START_MONTH_INDEX = 7; // August (0-based)

function monthLabel(offset) {
  const d = new Date(START_YEAR, START_MONTH_INDEX + offset, 1);
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
}

function safeSheetName(name) {
  let n = name.replace(/[\\/?*[\]:]/g, '');
  if (n.length > 31) n = n.slice(0, 31);
  return n;
}

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
const HEADER_FONT = { color: { argb: 'FFFFFFFF' }, bold: true };
const TOTAL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
const INPUT_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9E5' } };
const THIN_BORDER = { style: 'thin', color: { argb: 'FFCCCCCC' } };

async function build() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Capacity Planner';
  wb.created = new Date(2026, 7, 26);

  buildInstructionsSheet(wb);

  for (const person of PEOPLE) {
    buildPersonSheet(wb, person);
  }

  const outPath = path.join(__dirname, 'Capacity-Planner-Loading-Input.xlsx');
  await wb.xlsx.writeFile(outPath);
  console.log('Wrote', outPath);
}

function buildInstructionsSheet(wb) {
  const ws = wb.addWorksheet('Instructions', { properties: { tabColor: { argb: 'FF1F4E78' } } });
  ws.columns = [{ width: 34 }, { width: 90 }];

  ws.mergeCells('A1:B1');
  const title = ws.getCell('A1');
  title.value = 'Capacity Planner – Expected Loading Input';
  title.font = { bold: true, size: 16, color: { argb: 'FF1F4E78' } };

  const lines = [
    '',
    'There is one tab per person below (see sheet tabs at the bottom).',
    'On your tab, enter your expected % allocation to each project for each of the next ' + MONTH_COUNT + ' months.',
    'Use whole percentages, e.g. 50 for 50%. Leave a cell blank if you expect 0% on that project that month.',
    'The "Total" row at the bottom of your tab adds up your entries — it will turn red if a month exceeds 100%.',
    'If you are expecting to work on a project not listed, use the "Other / New Opportunity" row and add detail in the Notes column.',
    'Please fill in your own tab only. Do not edit other tabs or the project/month headers.',
    '',
    'Projects covered:',
  ];
  let r = 3;
  lines.forEach((line) => {
    ws.getCell(`A${r}`).value = line;
    ws.mergeCells(`A${r}:B${r}`);
    ws.getCell(`A${r}`).alignment = { wrapText: true };
    if (line.startsWith('Projects')) ws.getCell(`A${r}`).font = { bold: true };
    r += 1;
  });

  r += 1;
  ws.getCell(`A${r}`).value = 'Project';
  ws.getCell(`B${r}`).value = 'Client / Status';
  ws.getRow(r).font = HEADER_FONT;
  ws.getRow(r).eachCell((c) => { c.fill = HEADER_FILL; });
  r += 1;
  for (const p of PROJECTS) {
    ws.getCell(`A${r}`).value = `${p.title} (${p.code})`;
    ws.getCell(`B${r}`).value = `${p.client} — ${p.status}`;
    r += 1;
  }
}

function buildPersonSheet(wb, person) {
  const ws = wb.addWorksheet(safeSheetName(person.title), {
    properties: { tabColor: { argb: 'FF2E7D32' } },
  });

  ws.getColumn(1).width = 32;
  ws.getColumn(2).width = 16;
  for (let i = 0; i < MONTH_COUNT; i++) ws.getColumn(3 + i).width = 12;
  ws.getColumn(3 + MONTH_COUNT).width = 40;

  ws.mergeCells(1, 1, 1, 3 + MONTH_COUNT);
  const title = ws.getCell(1, 1);
  title.value = `Expected Loading — ${person.title} (${person.discipline} / ${person.role})`;
  title.font = { bold: true, size: 13, color: { argb: 'FF1F4E78' } };

  ws.mergeCells(2, 1, 2, 3 + MONTH_COUNT);
  const subtitle = ws.getCell(2, 1);
  subtitle.value = 'Enter expected % allocation per project per month. Totals per month should not exceed 100%.';
  subtitle.font = { italic: true, color: { argb: 'FF666666' } };

  const headerRowIdx = 4;
  const headerRow = ws.getRow(headerRowIdx);
  headerRow.getCell(1).value = 'Project';
  headerRow.getCell(2).value = 'Client';
  for (let i = 0; i < MONTH_COUNT; i++) {
    headerRow.getCell(3 + i).value = monthLabel(i);
  }
  headerRow.getCell(3 + MONTH_COUNT).value = 'Notes';
  headerRow.eachCell((cell, colNumber) => {
    if (colNumber <= 3 + MONTH_COUNT) {
      cell.fill = HEADER_FILL;
      cell.font = HEADER_FONT;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
    }
  });
  headerRow.height = 24;

  const allRows = [...PROJECTS, OTHER_ROW];
  let rowIdx = headerRowIdx + 1;
  const firstDataRow = rowIdx;
  for (const p of allRows) {
    const row = ws.getRow(rowIdx);
    row.getCell(1).value = p.title;
    row.getCell(2).value = p.client;
    row.getCell(1).font = { bold: p === OTHER_ROW };
    row.getCell(1).alignment = { wrapText: true };
    for (let i = 0; i < MONTH_COUNT; i++) {
      const cell = row.getCell(3 + i);
      cell.numFmt = '0"%"';
      cell.fill = INPUT_FILL;
      cell.alignment = { horizontal: 'center' };
      cell.border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
      cell.dataValidation = {
        type: 'decimal',
        operator: 'between',
        formulae: [0, 100],
        showErrorMessage: true,
        errorTitle: 'Invalid %',
        error: 'Enter a number between 0 and 100.',
      };
    }
    const notesCell = row.getCell(3 + MONTH_COUNT);
    notesCell.border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
    row.getCell(1).border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
    row.getCell(2).border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
    rowIdx += 1;
  }
  const lastDataRow = rowIdx - 1;

  const totalRow = ws.getRow(rowIdx);
  totalRow.getCell(1).value = 'Total';
  totalRow.getCell(1).font = { bold: true };
  for (let i = 0; i < MONTH_COUNT; i++) {
    const col = 3 + i;
    const colLetter = ws.getColumn(col).letter;
    const cell = totalRow.getCell(col);
    cell.value = { formula: `SUM(${colLetter}${firstDataRow}:${colLetter}${lastDataRow})` };
    cell.numFmt = '0"%"';
    cell.font = { bold: true };
    cell.fill = TOTAL_FILL;
    cell.alignment = { horizontal: 'center' };
    cell.border = { top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER };
  }
  totalRow.getCell(2).fill = TOTAL_FILL;
  totalRow.getCell(3 + MONTH_COUNT).fill = TOTAL_FILL;

  for (let i = 0; i < MONTH_COUNT; i++) {
    const col = 3 + i;
    const colLetter = ws.getColumn(col).letter;
    ws.addConditionalFormatting({
      ref: `${colLetter}${rowIdx}`,
      rules: [
        {
          type: 'cellIs',
          operator: 'greaterThan',
          formulae: [100],
          style: { fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFF8CBAD' } }, font: { color: { argb: 'FFC00000' }, bold: true } },
          priority: 1,
        },
      ],
    });
  }

  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: headerRowIdx }];

  // Protect structure; leave the % input cells and notes column unlocked
  ws.getColumn(1).eachCell((c) => { c.protection = { locked: true }; });
  ws.getColumn(2).eachCell((c) => { c.protection = { locked: true }; });
  for (let r = firstDataRow; r <= lastDataRow; r++) {
    for (let i = 0; i < MONTH_COUNT; i++) {
      ws.getRow(r).getCell(3 + i).protection = { locked: false };
    }
    ws.getRow(r).getCell(3 + MONTH_COUNT).protection = { locked: false };
  }
  ws.protect('', { selectLockedCells: true, selectUnlockedCells: true });
}

build().catch((err) => { console.error(err); process.exit(1); });
