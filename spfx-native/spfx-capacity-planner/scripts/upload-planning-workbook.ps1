<#
.SYNOPSIS
Uploads the loading-input workbook (scripts/output/Capacity-Planner-Loading-Input.xlsx) to a
SharePoint document library and prints a shareable link.

.REQUIREMENTS
- PowerShell 7+
- PnP.PowerShell
- Permission to upload files to the target document library
- A PnP-compatible Entra ID app registration client ID (same one used by provision-lists.ps1)

.EXAMPLE
./upload-planning-workbook.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes" -ClientId "00000000-0000-0000-0000-000000000000"

.EXAMPLE
$env:ENTRAID_CLIENT_ID = "00000000-0000-0000-0000-000000000000"
./upload-planning-workbook.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl,

  [Parameter(Mandatory=$false)]
  [string]$ClientId = "",

  [Parameter(Mandatory=$false)]
  [string]$Tenant = "",

  [Parameter(Mandatory=$false)]
  [string]$LibraryName = "Shared Documents",

  [Parameter(Mandatory=$false)]
  [string]$FolderName = "Capacity Planning",

  [Parameter(Mandatory=$false)]
  [string]$LocalFilePath = "$PSScriptRoot/output/Capacity-Planner-Loading-Input.xlsx"
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

if (-not (Test-Path $LocalFilePath)) {
  throw "Workbook not found at $LocalFilePath. Generate it first (see scripts/README or re-run the generator)."
}

$resolvedClientId = Resolve-PnPClientId -ExplicitClientId $ClientId
$connectParams = @{
  Url = $SiteUrl
  Interactive = $true
  ClientId = $resolvedClientId
}
if (-not [string]::IsNullOrWhiteSpace($Tenant)) { $connectParams.Tenant = $Tenant }

Connect-PnPOnline @connectParams

$folderExists = Get-PnPFolder -Url "$LibraryName/$FolderName" -ErrorAction SilentlyContinue
if ($null -eq $folderExists) {
  Resolve-PnPFolder -SiteRelativePath "$LibraryName/$FolderName" | Out-Null
}

$uploaded = Add-PnPFile -Path $LocalFilePath -Folder "$LibraryName/$FolderName" -Values @{} -ErrorAction Stop

$web = Get-PnPWeb
$fileServerRelativeUrl = $uploaded.ServerRelativeUrl
$fullUrl = "$($web.Url.TrimEnd('/'))" + $fileServerRelativeUrl.Substring($web.ServerRelativeUrl.TrimEnd('/').Length)

Write-Host ""
Write-Host "Uploaded workbook to: $fullUrl"

try {
  $sharingLink = Get-PnPFileSharingLink -Identity $fileServerRelativeUrl -Type OrganizationView
  if ($sharingLink) {
    Write-Host "Shareable link (view, org-wide): $($sharingLink.Link.WebUrl)"
  }
} catch {
  Write-Host "Could not create an org-wide sharing link automatically ($($_.Exception.Message))."
  Write-Host "Open the file's location in SharePoint and use Share > Copy Link instead."
}

Write-Host ""
Write-Host "Note: recipients need Edit access to the library/folder to fill in their tab — grant that in SharePoint if the sharing link is view-only."
