<#
.SYNOPSIS
Seed the Projects and Engineering Notes Capacity Planner lists with the current engineering/project team and starter project portfolio.

.REQUIREMENTS
- Run provision-lists.ps1 first
- PowerShell 7+
- PnP.PowerShell
- A PnP-compatible Entra ID app registration client ID

.EXAMPLE
./seed-planning-data.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000"

.EXAMPLE
$env:ENTRAID_CLIENT_ID = "00000000-0000-0000-0000-000000000000"
./seed-planning-data.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [Parameter(Mandatory=$false)]
  [string]$ClientId = "",

  [Parameter(Mandatory=$false)]
  [string]$Tenant = ""
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

$resolvedClientId = Resolve-PnPClientId -ExplicitClientId $ClientId
$connectParams = @{
  Url = $SiteUrl
  Interactive = $true
  ClientId = $resolvedClientId
}
if (-not [string]::IsNullOrWhiteSpace($Tenant)) { $connectParams.Tenant = $Tenant }

Connect-PnPOnline @connectParams

function Get-ExistingTitles {
  param([Parameter(Mandatory=$true)] [string]$ListTitle)
  $items = Get-PnPListItem -List $ListTitle -PageSize 500
  $titles = @{}
  foreach ($item in $items) {
    $title = [string]$item.FieldValues.Title
    if ($title -ne "") { $titles[$title] = $true }
  }
  return $titles
}

function Add-PersonIfMissing {
  param(
    [hashtable]$Existing,
    [string]$Title,
    [string]$Email,
    [string]$Discipline,
    [string]$Role,
    [string]$EmploymentType,
    [double]$FTE,
    [int]$WeeklyHours,
    [string]$Manager
  )
  if ($Existing.ContainsKey($Title)) { Write-Host "Person exists: $Title"; return }
  Add-PnPListItem -List "ERP_People" -Values @{
    Title = $Title
    Email = $Email
    Discipline = $Discipline
    Role = $Role
    EmploymentType = $EmploymentType
    FTE = $FTE
    WeeklyHours = $WeeklyHours
    WorkingDaysPerWeek = $(if ($WeeklyHours -eq 32) { 4 } else { 5 })
    IsActive = $true
    Manager = $Manager
  } | Out-Null
  Write-Host "Added person: $Title"
}

function Add-ProjectIfMissing {
  param(
    [hashtable]$Existing,
    [string]$Title,
    [string]$ProjectCode,
    [string]$ProjectType,
    [string]$Status,
    [string]$Brand,
    [string]$Client,
    [string]$StartDate,
    [string]$EndDate,
    [bool]$IncludeInCapacity,
    [int]$Probability,
    [string]$Notes
  )
  if ($Existing.ContainsKey($Title)) { Write-Host "Project exists: $Title"; return }
  Add-PnPListItem -List "ERP_Projects" -Values @{
    Title = $Title
    ProjectCode = $ProjectCode
    ProjectType = $ProjectType
    Status = $Status
    Brand = $Brand
    Client = $Client
    StartDate = $StartDate
    EndDate = $EndDate
    IncludeInCapacity = $IncludeInCapacity
    Probability = $Probability
    Notes = $Notes
  } | Out-Null
  Write-Host "Added project: $ProjectCode $Title"
}

$people = Get-ExistingTitles -ListTitle "ERP_People"
Add-PersonIfMissing $people "Onur Kavakli" "onur@example.com" "Process Engineering" "Principal Engineer" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Maria Alonzo" "maria@example.com" "Project Management" "Project Manager" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Jacobo Ramirez" "jacobo@example.com" "Project Management" "Project Manager (In-Country)" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Boris Welzen" "boris@example.com" "Procurement" "Procurement Manager" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Rutger Reij" "rutger@example.com" "Mechanical Engineering" "Mechanical Engineer" "Employee" 0.8 32 "Jim Latto"
Add-PersonIfMissing $people "Anwar Hassan" "anwar@example.com" "Mechanical Engineering" "Mechanical Engineer" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Ajitha Karuppiah" "ajitha@example.com" "Drafting" "Draughtsperson" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Neville Cory" "neville@example.com" "Process Engineering" "Process Engineer" "Employee" 1.0 40 "Onur Kavakli"
Add-PersonIfMissing $people "Fatemeh Rashidashmagh" "fatemeh@example.com" "Process Engineering" "Process Engineer" "Employee" 1.0 40 "Onur Kavakli"
Add-PersonIfMissing $people "William Garcia" "william@example.com" "Process Engineering" "Process Engineer" "Employee" 1.0 40 "Onur Kavakli"
Add-PersonIfMissing $people "Lukasz Kawalec" "lukasz@example.com" "Mechanical Engineering" "Mechanical Engineer" "Freelancer" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Michael" "michael@example.com" "Mechanical Engineering" "Mechanical Engineer" "Freelancer" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Rinke de Klerk" "rinke@example.com" "Mechanical Engineering" "Mechanical Engineer" "Freelancer" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Dion van Doorne" "dion@example.com" "Project Management" "Project Manager" "Employee" 1.0 40 "Jim Latto"
Add-PersonIfMissing $people "Tim Brantjes" "tim@example.com" "Project Management" "Project Manager" "Employee" 1.0 40 "Jim Latto"

$projects = Get-ExistingTitles -ListTitle "ERP_Projects"
Add-ProjectIfMissing $projects "Cancun CISEC" "P250002" "Live" "Active" "DCT" "CISEC" "2026-01-01" "2027-06-30" $true 100 "Live LATAM delivery project."
Add-ProjectIfMissing $projects "TAQA" "P260001" "Live" "Active" "PLK" "TAQA" "2026-01-01" "2027-06-30" $true 100 "Critical PLK delivery project."
Add-ProjectIfMissing $projects "ADOC" "P250001" "Live" "Active" "PLK" "ADOC" "2025-01-01" "2026-12-31" $true 100 "Active PLK project."
Add-ProjectIfMissing $projects "OXY Oman" "P230195" "Live" "Active" "PLK" "OXY" "2023-01-01" "2026-09-30" $true 100 "Wind-down project."
Add-ProjectIfMissing $projects "Almansoori" "P230073" "Live" "Active" "PLK" "Almansoori" "2023-01-01" "2026-07-31" $true 100 "Near close-out."
Add-ProjectIfMissing $projects "Spare Parts Zeeland" "P260002" "Live" "On Hold" "PLK" "Zeeland" "2026-01-01" "2026-12-31" $true 100 "On hold, but re-included in capacity since the team is actively reporting real time against it."
Add-ProjectIfMissing $projects "SARAT" "QDG2600002" "Opportunity" "Pipeline" "DCT" "SARAT" "2026-04-01" "2026-09-30" $true 60 "Pipeline opportunity included in manpower planning."
Add-ProjectIfMissing $projects "Sales and Quotations Effort" "SALES" "Opportunity" "Pipeline" "Internal" "Internal" "2026-08-01" "2027-08-31" $true 100 "Separate time consumer for sales and quotations effort."

Write-Host "Seed data complete for $SiteUrl"
