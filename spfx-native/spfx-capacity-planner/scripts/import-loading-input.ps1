<#
.SYNOPSIS
Import the filled-in expected-loading workbook (scripts/output/Capacity-Planner-Loading-Input.xlsx)
into the SharePoint-native ERP_Allocations list, under scenario "baseline".

.DESCRIPTION
The workbook is parsed to JSON first (scripts/planning-workbook/parse-loading-input.js), then this
script upserts one ERP_Allocations item per (person, project, month) entry found in that JSON.
Existing items previously imported by this script (tagged in Notes) are matched by
ProjectKey|PersonKey|AllocationMonth and updated in place; new entries are added.

Pass -RemoveStaleEntries to also delete any previously-imported entry whose key is no longer
present in the current workbook export (e.g. a cell that was cleared out).

Rows that could not be mapped to a known project (e.g. "Other / New Opportunity" rows) are not
included in the JSON and must be handled manually — the parse step prints them for review.

.REQUIREMENTS
- Run provision-lists.ps1 and seed-planning-data.ps1 first
- PowerShell 7+
- PnP.PowerShell
- A PnP-compatible Entra ID app registration client ID
- Node.js (to run the parse step) unless -SkipParse is passed and the JSON already exists

.EXAMPLE
./import-loading-input.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000"

.EXAMPLE
./import-loading-input.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000" -DryRun -RemoveStaleEntries
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [Parameter(Mandatory=$false)]
  [string]$ClientId = "",

  [Parameter(Mandatory=$false)]
  [string]$Tenant = "",

  [Parameter(Mandatory=$false)]
  [string]$WorkbookPath = "",

  [Parameter(Mandatory=$false)]
  [string]$ParsedJsonPath = "",

  [Parameter(Mandatory=$false)]
  [switch]$SkipParse,

  [Parameter(Mandatory=$false)]
  [switch]$RemoveStaleEntries,

  [Parameter(Mandatory=$false)]
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$ImportTag = "Imported from expected loading workbook"

function Resolve-PnPClientId {
  param([string]$ExplicitClientId)

  if (-not [string]::IsNullOrWhiteSpace($ExplicitClientId)) { return $ExplicitClientId }
  if (-not [string]::IsNullOrWhiteSpace($env:ENTRAID_APP_ID)) { return $env:ENTRAID_APP_ID }
  if (-not [string]::IsNullOrWhiteSpace($env:ENTRAID_CLIENT_ID)) { return $env:ENTRAID_CLIENT_ID }
  if (-not [string]::IsNullOrWhiteSpace($env:AZURE_CLIENT_ID)) { return $env:AZURE_CLIENT_ID }

  throw "PnP.PowerShell now requires a ClientId for interactive login. Pass -ClientId or set ENTRAID_CLIENT_ID to your Entra ID app registration client ID."
}

function Get-MonthlyCapacityHours {
  param([object]$PersonItem)

  $weeklyHours = [double]($PersonItem.FieldValues.WeeklyHours)
  if ($weeklyHours -le 0) { $weeklyHours = 40 }

  $workingDays = [double]($PersonItem.FieldValues.WorkingDaysPerWeek)
  if ($workingDays -le 0) { $workingDays = $(if ($weeklyHours -ge 40) { 5 } else { 4 }) }

  $hoursPerDay = $weeklyHours / $workingDays
  $annualContracted = $weeklyHours * 52
  $leaveHours = 25 * $hoursPerDay
  $netAttendance = [Math]::Max($annualContracted - $leaveHours, 0)
  $productive = $netAttendance * 0.85
  return [Math]::Round($productive / 12)
}

$planningWorkbookDir = Join-Path $PSScriptRoot "planning-workbook"
$defaultWorkbookPath = Join-Path $PSScriptRoot "output/Capacity-Planner-Loading-Input.xlsx"
$defaultJsonPath = Join-Path $PSScriptRoot "output/loading-input-parsed.json"

if ([string]::IsNullOrWhiteSpace($WorkbookPath)) { $WorkbookPath = $defaultWorkbookPath }
if ([string]::IsNullOrWhiteSpace($ParsedJsonPath)) { $ParsedJsonPath = $defaultJsonPath }

if (-not $SkipParse) {
  if (-not (Test-Path $WorkbookPath)) {
    throw "Workbook not found at $WorkbookPath. Generate/update it first."
  }
  Write-Host "Parsing $WorkbookPath ..."
  Push-Location $planningWorkbookDir
  try {
    node parse-loading-input.js $WorkbookPath $ParsedJsonPath
    if ($LASTEXITCODE -ne 0) { throw "parse-loading-input.js failed with exit code $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path $ParsedJsonPath)) {
  throw "Parsed JSON not found at $ParsedJsonPath. Run without -SkipParse, or pass -ParsedJsonPath."
}

$entries = Get-Content -LiteralPath $ParsedJsonPath -Raw | ConvertFrom-Json
Write-Host "Loaded $($entries.Count) allocation entries from $ParsedJsonPath"

$resolvedClientId = Resolve-PnPClientId -ExplicitClientId $ClientId
$connectParams = @{
  Url = $SiteUrl
  Interactive = $true
  ClientId = $resolvedClientId
}
if (-not [string]::IsNullOrWhiteSpace($Tenant)) { $connectParams.Tenant = $Tenant }

Connect-PnPOnline @connectParams

$peopleItems = Get-PnPListItem -List "ERP_People" -PageSize 500
$peopleByTitle = @{}
foreach ($person in $peopleItems) {
  $title = [string]$person.FieldValues.Title
  if (-not [string]::IsNullOrWhiteSpace($title)) { $peopleByTitle[$title] = $person }
}

$projectItems = Get-PnPListItem -List "ERP_Projects" -PageSize 500
$projectsByCode = @{}
foreach ($project in $projectItems) {
  $code = [string]$project.FieldValues.ProjectCode
  if (-not [string]::IsNullOrWhiteSpace($code)) { $projectsByCode[$code] = $project }
}

$existingAllocations = Get-PnPListItem -List "ERP_Allocations" -PageSize 500
$existingByKey = @{}
foreach ($allocation in $existingAllocations) {
  $notes = [string]$allocation.FieldValues.Notes
  if (-not $notes.StartsWith($ImportTag)) { continue }
  $month = ([datetime]$allocation.FieldValues.AllocationMonth).ToString("yyyy-MM-dd")
  $key = "{0}|{1}|{2}" -f $allocation.FieldValues.ProjectKey, $allocation.FieldValues.PersonKey, $month
  $existingByKey[$key] = $allocation
}

$seenKeys = @{}
$added = 0
$updated = 0
$skippedMissing = 0

foreach ($entry in $entries) {
  $personName = [string]$entry.personName
  $projectCode = [string]$entry.projectCode
  $month = [string]$entry.month
  $percent = [double]$entry.percent
  $rowNotes = [string]$entry.notes

  if (-not $peopleByTitle.ContainsKey($personName)) {
    Write-Warning "Skipping $personName | $projectCode | $month because person is missing from ERP_People."
    $skippedMissing++
    continue
  }
  if (-not $projectsByCode.ContainsKey($projectCode)) {
    Write-Warning "Skipping $personName | $projectCode | $month because project is missing from ERP_Projects."
    $skippedMissing++
    continue
  }

  $person = $peopleByTitle[$personName]
  $project = $projectsByCode[$projectCode]

  $key = "{0}|{1}|{2}" -f $project.Id, $person.Id, $month
  $seenKeys[$key] = $true

  $fte = [Math]::Round($percent / 100.0, 4)
  $monthlyCapacity = Get-MonthlyCapacityHours -PersonItem $person
  $hours = [Math]::Round($fte * $monthlyCapacity)
  $includeInCapacity = $project.FieldValues.IncludeInCapacity -ne $false
  $discipline = [string]$person.FieldValues.Discipline
  $title = "Expected loading | $projectCode | $personName | $month"
  $notes = if ([string]::IsNullOrWhiteSpace($rowNotes)) { $ImportTag } else { "$ImportTag. $rowNotes" }

  $values = @{
    Title = $title
    PersonKey = [string]$person.Id
    ProjectKey = [string]$project.Id
    ScenarioKey = "baseline"
    AllocationMonth = $month
    AllocationFTE = $fte
    AllocationHours = $hours
    Discipline = $discipline
    Role = $discipline
    IncludeInCapacity = $includeInCapacity
    Locked = $false
    LastModifiedAt = (Get-Date).ToString("s")
    Notes = $notes
  }

  if ($existingByKey.ContainsKey($key)) {
    $existingItem = $existingByKey[$key]
    if ($DryRun) {
      Write-Host "Would update: $title - $percent% ($hours h)"
    } else {
      Set-PnPListItem -List "ERP_Allocations" -Identity $existingItem.Id -Values $values | Out-Null
    }
    $updated++
  } else {
    if ($DryRun) {
      Write-Host "Would add: $title - $percent% ($hours h)"
    } else {
      Add-PnPListItem -List "ERP_Allocations" -Values $values | Out-Null
    }
    $added++
  }
}

$removed = 0
if ($RemoveStaleEntries) {
  foreach ($key in $existingByKey.Keys) {
    if ($seenKeys.ContainsKey($key)) { continue }
    $staleItem = $existingByKey[$key]
    if ($DryRun) {
      Write-Host "Would remove stale entry: $($staleItem.FieldValues.Title)"
    } else {
      Remove-PnPListItem -List "ERP_Allocations" -Identity $staleItem.Id -Force
    }
    $removed++
  }
}

if ($DryRun) {
  Write-Host ""
  Write-Host "Dry run complete. Would add $added, update $updated, remove $removed (stale). Missing mapping skipped: $skippedMissing."
} else {
  Write-Host ""
  Write-Host "Import complete. Added $added, updated $updated, removed $removed (stale). Missing mapping skipped: $skippedMissing."
}
