<#
.SYNOPSIS
Summarise ERP_Allocations from the SharePoint-native Capacity Planner lists.

.DESCRIPTION
Prints allocation counts and hours by project and month so we can confirm whether imported legacy rows are present in SharePoint.

.EXAMPLE
./check-allocation-summary.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000"

.EXAMPLE
./check-allocation-summary.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000" -ProjectCode P250002
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [Parameter(Mandatory=$false)]
  [string]$ClientId = "",

  [Parameter(Mandatory=$false)]
  [string]$Tenant = "",

  [Parameter(Mandatory=$false)]
  [string]$ProjectCode = ""
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

function Normalize-Month {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  $text = $Value
  if ($text.Length -ge 7) { $text = $text.Substring(0, 7) }
  return $text
}

$resolvedClientId = Resolve-PnPClientId -ExplicitClientId $ClientId
$connectParams = @{
  Url = $SiteUrl
  Interactive = $true
  ClientId = $resolvedClientId
}
if (-not [string]::IsNullOrWhiteSpace($Tenant)) { $connectParams.Tenant = $Tenant }
Connect-PnPOnline @connectParams

$projectItems = Get-PnPListItem -List "ERP_Projects" -PageSize 500
$projectCodeById = @{}
$projectTitleById = @{}
foreach ($project in $projectItems) {
  $id = [string]$project.Id
  $projectCodeById[$id] = [string]$project.FieldValues.ProjectCode
  $projectTitleById[$id] = [string]$project.FieldValues.Title
}

$allocationItems = Get-PnPListItem -List "ERP_Allocations" -PageSize 2000
Write-Host "Total ERP_Allocations rows: $($allocationItems.Count)"

$summary = @{}
foreach ($allocation in $allocationItems) {
  $projectId = [string]$allocation.FieldValues.ProjectKey
  if (-not $projectCodeById.ContainsKey($projectId)) { continue }

  $code = $projectCodeById[$projectId]
  if (-not [string]::IsNullOrWhiteSpace($ProjectCode) -and $code -ne $ProjectCode) { continue }

  $month = Normalize-Month ([string]$allocation.FieldValues.AllocationMonth)
  $hours = [double]($allocation.FieldValues.AllocationHours)
  $key = "$code|$month"

  if (-not $summary.ContainsKey($key)) {
    $summary[$key] = [pscustomobject]@{
      ProjectCode = $code
      Project = $projectTitleById[$projectId]
      Month = $month
      Rows = 0
      Hours = 0
    }
  }

  $summary[$key].Rows++
  $summary[$key].Hours += $hours
}

if ($summary.Count -eq 0) {
  Write-Host "No allocation rows matched."
  return
}

$summary.Values | Sort-Object ProjectCode, Month | Format-Table ProjectCode, Project, Month, Rows, Hours -AutoSize
