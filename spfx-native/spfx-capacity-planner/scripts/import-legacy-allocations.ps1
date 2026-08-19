<#
.SYNOPSIS
Import the original Vite seed allocation data into the SharePoint-native ERP_Allocations list.

.DESCRIPTION
The SPFx app now reads live SharePoint lists. The old Vite allocation data still exists in
src/data/seed/allocations.ts, but it is not automatically present in ERP_Allocations.
This script parses that file and imports the legacy allocations into the site-bound list.

The script is idempotent. It skips any existing allocation with the same project, person and month.
Use -ReplaceLegacyAllocations to remove previous imports created by this script before importing again.

.REQUIREMENTS
- Run provision-lists.ps1 first
- Run seed-planning-data.ps1 first
- PowerShell 7+
- PnP.PowerShell
- A PnP-compatible Entra ID app registration client ID

.EXAMPLE
./import-legacy-allocations.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000"

.EXAMPLE
./import-legacy-allocations.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000" -DryRun
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [Parameter(Mandatory=$false)]
  [string]$ClientId = "",

  [Parameter(Mandatory=$false)]
  [string]$Tenant = "",

  [Parameter(Mandatory=$false)]
  [string]$LegacyAllocationFile = "",

  [Parameter(Mandatory=$false)]
  [switch]$ReplaceLegacyAllocations,

  [Parameter(Mandatory=$false)]
  [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Resolve-PnPClientId {
  param([string]$ExplicitClientId)

  if (-not [string]::IsNullOrWhiteSpace($ExplicitClientId)) { return $ExplicitClientId }
  if (-not [string]::IsNullOrWhiteSpace($env:ENTRAID_APP_ID)) { return $env:ENTRAID_APP_ID }
  if (-not [string]::IsNullOrWhiteSpace($env:ENTRAID_CLIENT_ID)) { return $env:ENTRAID_CLIENT_ID }
  if (-not [string]::IsNullOrWhiteSpace($env:AZURE_CLIENT_ID)) { return $env:AZURE_CLIENT_ID }

  throw "PnP.PowerShell now requires a ClientId for interactive login. Pass -ClientId or set ENTRAID_CLIENT_ID to your Entra ID app registration client ID."
}

function Resolve-LegacyAllocationFile {
  param([string]$ExplicitPath)

  if (-not [string]::IsNullOrWhiteSpace($ExplicitPath)) {
    if (-not (Test-Path -LiteralPath $ExplicitPath)) { throw "Legacy allocation file not found: $ExplicitPath" }
    return (Resolve-Path -LiteralPath $ExplicitPath).Path
  }

  $defaultPath = Join-Path $PSScriptRoot "..\..\..\src\data\seed\allocations.ts"
  if (Test-Path -LiteralPath $defaultPath) { return (Resolve-Path -LiteralPath $defaultPath).Path }

  throw "Could not find src/data/seed/allocations.ts from this script location. Pass -LegacyAllocationFile explicitly."
}

function Normalize-Month {
  param([string]$Month)
  if ($Month -match '^\d{4}-\d{2}$') { return "$Month-01" }
  return $Month
}

function Convert-RoleSlug {
  param([string]$Slug)
  $roleMap = @{
    "project-management" = "Project Management"
    "process-engineering" = "Process Engineering"
    "mechanical-engineering" = "Mechanical Engineering"
    "drafting" = "Drafting"
    "procurement" = "Procurement"
    "quality" = "Quality"
    "technical-review" = "Technical Review"
    "management" = "Management"
    "other" = "Other"
  }
  if ($roleMap.ContainsKey($Slug)) { return $roleMap[$Slug] }
  return ($Slug -replace '-', ' ')
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

$legacyFile = Resolve-LegacyAllocationFile -ExplicitPath $LegacyAllocationFile
Write-Host "Reading legacy allocations from $legacyFile"

$resolvedClientId = Resolve-PnPClientId -ExplicitClientId $ClientId
$connectParams = @{
  Url = $SiteUrl
  Interactive = $true
  ClientId = $resolvedClientId
}
if (-not [string]::IsNullOrWhiteSpace($Tenant)) { $connectParams.Tenant = $Tenant }

Connect-PnPOnline @connectParams

$projectIdToCode = @{
  "p-cisec" = "P250002"
  "p-cancun" = "P250002"
  "p-taqa" = "P260001"
  "p-adoc" = "P250001"
  "p-oxy" = "P230195"
  "p-almansoori" = "P230073"
  "p-zeeland" = "P260002"
  "p-spare-parts-zeeland" = "P260002"
  "p-sarat" = "QDG2600002"
  "p-sales" = "SALES"
}

$resourceIdToName = @{
  "r-onur" = "Onur Kavakli"
  "r-maria" = "Maria Alonzo"
  "r-jacobo" = "Jacobo Ramirez"
  "r-boris" = "Boris Welzen"
  "r-rutger" = "Rutger Reij"
  "r-anwar" = "Anwar Hassan"
  "r-ajitha" = "Ajitha Karuppiah"
  "r-neville" = "Neville Cory"
  "r-fatemeh" = "Fatemeh Rashidashmagh"
  "r-william" = "William Garcia"
  "r-lukasz" = "Lukasz Kawalec"
  "r-michael" = "Michael"
  "r-rinke" = "Rinke de Klerk"
  "r-dion" = "Dion van Doorne"
  "r-tim" = "Tim Brantjes"
}

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

if ($ReplaceLegacyAllocations -and -not $DryRun) {
  $existingToDelete = Get-PnPListItem -List "ERP_Allocations" -PageSize 500 | Where-Object {
    ([string]$_.FieldValues.Title).StartsWith("Legacy allocation |") -or ([string]$_.FieldValues.Notes).Contains("Imported from Vite seed allocation")
  }
  foreach ($item in $existingToDelete) {
    Remove-PnPListItem -List "ERP_Allocations" -Identity $item.Id -Force
  }
  Write-Host "Removed $($existingToDelete.Count) previous legacy allocation imports."
}

$existingAllocations = Get-PnPListItem -List "ERP_Allocations" -PageSize 500
$existingKeys = @{}
foreach ($allocation in $existingAllocations) {
  $key = "{0}|{1}|{2}" -f $allocation.FieldValues.ProjectKey, $allocation.FieldValues.PersonKey, (Normalize-Month ([string]$allocation.FieldValues.AllocationMonth).Substring(0, [Math]::Min(10, ([string]$allocation.FieldValues.AllocationMonth).Length)))
  if (-not $existingKeys.ContainsKey($key)) { $existingKeys[$key] = $true }
}

$content = Get-Content -LiteralPath $legacyFile -Raw
$regex = "a\('(?<project>[^']+)'\s*,\s*'(?<resource>[^']+)'\s*,\s*'(?<role>[^']+)'\s*,\s*'(?<month>\d{4}-\d{2})'\s*,\s*(?<hours>\d+(?:\.\d+)?)\)"
$matches = [regex]::Matches($content, $regex)

$imported = 0
$skippedExisting = 0
$skippedMissing = 0

foreach ($match in $matches) {
  $legacyProjectId = $match.Groups['project'].Value
  $legacyResourceId = $match.Groups['resource'].Value
  $roleSlug = $match.Groups['role'].Value
  $month = Normalize-Month $match.Groups['month'].Value
  $hours = [int][Math]::Round([double]$match.Groups['hours'].Value)

  if (-not $projectIdToCode.ContainsKey($legacyProjectId)) {
    Write-Warning "Skipping allocation with unmapped project id '$legacyProjectId'."
    $skippedMissing++
    continue
  }
  if (-not $resourceIdToName.ContainsKey($legacyResourceId)) {
    Write-Warning "Skipping allocation with unmapped resource id '$legacyResourceId'."
    $skippedMissing++
    continue
  }

  $projectCode = $projectIdToCode[$legacyProjectId]
  $personName = $resourceIdToName[$legacyResourceId]

  if (-not $projectsByCode.ContainsKey($projectCode)) {
    Write-Warning "Skipping $projectCode $personName $month because project is missing from ERP_Projects."
    $skippedMissing++
    continue
  }
  if (-not $peopleByTitle.ContainsKey($personName)) {
    Write-Warning "Skipping $projectCode $personName $month because person is missing from ERP_People."
    $skippedMissing++
    continue
  }

  $project = $projectsByCode[$projectCode]
  $person = $peopleByTitle[$personName]
  $key = "{0}|{1}|{2}" -f $project.Id, $person.Id, $month
  if ($existingKeys.ContainsKey($key)) {
    $skippedExisting++
    continue
  }

  $role = Convert-RoleSlug -Slug $roleSlug
  $monthlyCapacity = Get-MonthlyCapacityHours -PersonItem $person
  $fte = if ($monthlyCapacity -gt 0) { [Math]::Round($hours / $monthlyCapacity, 4) } else { 0 }
  $includeInCapacity = $project.FieldValues.IncludeInCapacity -ne $false
  $title = "Legacy allocation | $projectCode | $personName | $month"

  if ($DryRun) {
    Write-Host "Would import: $title - $hours h, FTE $fte"
  } else {
    Add-PnPListItem -List "ERP_Allocations" -Values @{
      Title = $title
      PersonKey = [string]$person.Id
      ProjectKey = [string]$project.Id
      ScenarioKey = "baseline"
      AllocationMonth = $month
      AllocationFTE = $fte
      AllocationHours = $hours
      Discipline = $role
      Role = $role
      IncludeInCapacity = $includeInCapacity
      Locked = $false
      LastModifiedAt = (Get-Date).ToString("s")
      Notes = "Imported from Vite seed allocation file. Source ids: $legacyProjectId / $legacyResourceId."
    } | Out-Null
  }

  $existingKeys[$key] = $true
  $imported++
}

if ($DryRun) {
  Write-Host "Dry run complete. Would import $imported allocations. Existing skipped: $skippedExisting. Missing mapping/list items skipped: $skippedMissing. Parsed source rows: $($matches.Count)."
} else {
  Write-Host "Import complete. Imported $imported allocations. Existing skipped: $skippedExisting. Missing mapping/list items skipped: $skippedMissing. Parsed source rows: $($matches.Count)."
}
