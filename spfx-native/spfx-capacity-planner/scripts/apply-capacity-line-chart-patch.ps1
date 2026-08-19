<#
.SYNOPSIS
Patch the SPFx Capacity Planner dashboard to show Capacity vs Demand as a line chart.

.DESCRIPTION
This is a local source patch script. It replaces the current Capacity vs demand table on the dashboard with a native SVG line chart, appends the required SCSS classes, and bumps the package versions so SharePoint recognises the next upload as a new package.

Run from any location after pulling the spfx-native-rebuild branch.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$appPath = Join-Path $root "src\webparts\capacityPlanner\components\CapacityPlannerApp.tsx"
$scssPath = Join-Path $root "src\webparts\capacityPlanner\components\CapacityPlannerApp.module.scss"
$packageJsonPath = Join-Path $root "package.json"
$packageSolutionPath = Join-Path $root "config\package-solution.json"
$manifestPath = Join-Path $root "src\webparts\capacityPlanner\CapacityPlannerWebPart.manifest.json"

function Replace-Exact {
  param(
    [Parameter(Mandatory=$true)] [string]$Path,
    [Parameter(Mandatory=$true)] [string]$Old,
    [Parameter(Mandatory=$true)] [string]$New,
    [Parameter(Mandatory=$true)] [string]$Description
  )

  $text = Get-Content -LiteralPath $Path -Raw
  if ($text.Contains($New)) {
    Write-Host "Already applied: $Description"
    return
  }
  if (-not $text.Contains($Old)) {
    throw "Could not find expected block for: $Description in $Path"
  }
  $text = $text.Replace($Old, $New)
  Set-Content -LiteralPath $Path -Value $text -Encoding UTF8
  Write-Host "Applied: $Description"
}

$oldDashboardCall = '<section className={styles.panel}><h3>Capacity vs demand</h3>{renderMonthSummaryTable()}</section>'
$newDashboardCall = '<section className={styles.panel}><h3>Capacity vs demand</h3>{renderCapacityDemandChart()}</section>'
Replace-Exact -Path $appPath -Old $oldDashboardCall -New $newDashboardCall -Description "dashboard chart call"

$oldFunction = @'
  function renderMonthSummaryTable(): JSX.Element {
    return <table className={styles.table}><thead><tr><th>Month</th><th>Capacity</th><th>Allocated</th><th>Utilisation</th></tr></thead><tbody>{monthSummaries.map((row) => <tr key={row.month}><td>{monthLabel(row.month)}</td><td>{row.availableHours} h</td><td>{row.allocatedHours} h</td><td><span className={styles[utilisationBand(row.utilisation)]}>{row.utilisation}%</span></td></tr>)}</tbody></table>;
  }
'@

$newFunction = @'
  function renderCapacityDemandChart(): JSX.Element {
    const chartWidth = Math.max(monthSummaries.length * 74, 760);
    const chartHeight = 260;
    const left = 52;
    const right = 24;
    const top = 18;
    const bottom = 42;
    const plotWidth = chartWidth - left - right;
    const plotHeight = chartHeight - top - bottom;
    const maxHours = monthSummaries.reduce((max, row) => Math.max(max, row.availableHours, row.allocatedHours), 1);
    const xFor = (index: number): number => left + (monthSummaries.length <= 1 ? 0 : (plotWidth * index / (monthSummaries.length - 1)));
    const yFor = (value: number): number => top + plotHeight - (plotHeight * value / maxHours);
    const capacityPoints = monthSummaries.map((row, index) => `${xFor(index)},${yFor(row.availableHours)}`).join(' ');
    const demandPoints = monthSummaries.map((row, index) => `${xFor(index)},${yFor(row.allocatedHours)}`).join(' ');
    const yTicks = [0, Math.round(maxHours / 2), maxHours];

    return <div className={styles.capacityChart}>
      <div className={styles.chartLegend}>
        <span className={styles.chartLegendItem}><span className={styles.capacityLegendSwatch} /> Capacity</span>
        <span className={styles.chartLegendItem}><span className={styles.demandLegendSwatch} /> Demand / allocated</span>
      </div>
      <svg className={styles.chartSvg} viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="Capacity versus demand line chart">
        {yTicks.map((tick) => <g key={String(tick)}>
          <line className={styles.chartGridLine} x1={left} x2={chartWidth - right} y1={yFor(tick)} y2={yFor(tick)} />
          <text className={styles.chartAxisText} x={left - 8} y={yFor(tick) + 4} textAnchor="end">{formatNumber(tick)} h</text>
        </g>)}
        <line className={styles.chartAxisLine} x1={left} x2={chartWidth - right} y1={top + plotHeight} y2={top + plotHeight} />
        <line className={styles.chartAxisLine} x1={left} x2={left} y1={top} y2={top + plotHeight} />
        <polyline className={styles.capacityLine} points={capacityPoints} />
        <polyline className={styles.demandLine} points={demandPoints} />
        {monthSummaries.map((row, index) => <g key={row.month}>
          <circle className={styles.capacityPoint} cx={xFor(index)} cy={yFor(row.availableHours)} r="3" />
          <circle className={styles.demandPoint} cx={xFor(index)} cy={yFor(row.allocatedHours)} r="3" />
          <text className={styles.chartMonthLabel} x={xFor(index)} y={chartHeight - 12} textAnchor="middle">{monthLabel(row.month)}</text>
        </g>)}
      </svg>
    </div>;
  }
'@

Replace-Exact -Path $appPath -Old $oldFunction -New $newFunction -Description "capacity demand line chart function"

$scss = Get-Content -LiteralPath $scssPath -Raw
if ($scss.Contains('.capacityChart')) {
  Write-Host "Already applied: chart SCSS"
} else {
  $chartScss = @'

.capacityChart {
  width: 100%;
  overflow-x: auto;
  padding: 4px 0 0;
}

.chartLegend {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  align-items: center;
  margin: 0 0 8px;
  color: var(--erp-muted);
  font-size: 12px;
}

.chartLegendItem {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  white-space: nowrap;
}

.capacityLegendSwatch,
.demandLegendSwatch {
  width: 18px;
  height: 0;
  border-top: 3px solid var(--erp-accent);
}

.demandLegendSwatch {
  border-top-color: var(--erp-danger);
}

.chartSvg {
  display: block;
  width: 100%;
  min-width: 760px;
  height: auto;
}

.chartGridLine {
  stroke: var(--erp-border);
  stroke-width: 1;
}

.chartAxisLine {
  stroke: var(--erp-border-strong);
  stroke-width: 1;
}

.chartAxisText,
.chartMonthLabel {
  fill: var(--erp-muted);
  font-size: 11px;
}

.capacityLine,
.demandLine {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.capacityLine {
  stroke: var(--erp-accent);
}

.demandLine {
  stroke: var(--erp-danger);
}

.capacityPoint,
.demandPoint {
  fill: #ffffff;
  stroke-width: 2;
}

.capacityPoint {
  stroke: var(--erp-accent);
}

.demandPoint {
  stroke: var(--erp-danger);
}
'@
  Add-Content -LiteralPath $scssPath -Value $chartScss -Encoding UTF8
  Write-Host "Applied: chart SCSS"
}

$pkg = Get-Content -LiteralPath $packageJsonPath -Raw
$pkg = $pkg -replace '"version"\s*:\s*"0\.3\.2"', '"version":"0.3.3"'
$pkg = $pkg -replace '"version"\s*:\s*"0\.3\.1"', '"version":"0.3.3"'
Set-Content -LiteralPath $packageJsonPath -Value $pkg -Encoding UTF8

$solution = Get-Content -LiteralPath $packageSolutionPath -Raw
$solution = $solution -replace '"version"\s*:\s*"0\.3\.2\.0"', '"version": "0.3.3.0"'
$solution = $solution -replace '"version"\s*:\s*"0\.3\.1\.0"', '"version": "0.3.3.0"'
Set-Content -LiteralPath $packageSolutionPath -Value $solution -Encoding UTF8

$manifest = Get-Content -LiteralPath $manifestPath -Raw
$manifest = $manifest -replace '"version"\s*:\s*"0\.3\.2"', '"version": "0.3.3"'
$manifest = $manifest -replace '"version"\s*:\s*"0\.3\.1"', '"version": "0.3.3"'
Set-Content -LiteralPath $manifestPath -Value $manifest -Encoding UTF8

Write-Host "Capacity vs demand line chart patch complete. Package version set to 0.3.3 / 0.3.3.0."
