<#
.SYNOPSIS
Provision site-scoped SharePoint Lists for the Capacity Planner SPFx app.

.REQUIREMENTS
- PowerShell 7+
- PnP.PowerShell
- Permission to create lists and fields in the target SharePoint site

.EXAMPLE
Install-Module PnP.PowerShell -Scope CurrentUser
./provision-lists.ps1 -SiteUrl "https://narwal.sharepoint.com/sites/ProjectsandEngineeringNotes"
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$SiteUrl
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Connect-PnPOnline -Url $SiteUrl -Interactive

function Ensure-List {
  param([Parameter(Mandatory=$true)] [string]$Title,[string]$Description = "")
  $existing = Get-PnPList -Identity $Title -ErrorAction SilentlyContinue
  if ($null -eq $existing) {
    New-PnPList -Title $Title -Template GenericList -OnQuickLaunch:$false | Out-Null
    if ($Description -ne "") { Set-PnPList -Identity $Title -Description $Description | Out-Null }
    Write-Host "Created list: $Title"
  } else { Write-Host "List exists: $Title" }
}

function Ensure-FieldXml {
  param([string]$ListTitle,[string]$InternalName,[string]$Xml)
  $field = Get-PnPField -List $ListTitle -Identity $InternalName -ErrorAction SilentlyContinue
  if ($null -eq $field) {
    Add-PnPFieldFromXml -List $ListTitle -FieldXml $Xml | Out-Null
    Write-Host "  Added field: $ListTitle.$InternalName"
  } else { Write-Host "  Field exists: $ListTitle.$InternalName" }
}

function Ensure-TextField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='Text' Name='$Name' StaticName='$Name' DisplayName='$DisplayName' />" }
function Ensure-NoteField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='Note' Name='$Name' StaticName='$Name' DisplayName='$DisplayName' NumLines='6' RichText='FALSE' />" }
function Ensure-NumberField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='Number' Name='$Name' StaticName='$Name' DisplayName='$DisplayName' />" }
function Ensure-DateField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='DateTime' Name='$Name' StaticName='$Name' DisplayName='$DisplayName' Format='DateOnly' />" }
function Ensure-DateTimeField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='DateTime' Name='$Name' StaticName='$Name' DisplayName='$DisplayName' Format='DateTime' />" }
function Ensure-BooleanField { param([string]$ListTitle,[string]$Name,[string]$DisplayName) Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='Boolean' Name='$Name' StaticName='$Name' DisplayName='$DisplayName'><Default>1</Default></Field>" }
function Ensure-ChoiceField { param([string]$ListTitle,[string]$Name,[string]$DisplayName,[string[]]$Choices)
  $choiceXml = ($Choices | ForEach-Object { "<CHOICE>$_</CHOICE>" }) -join ""
  Ensure-FieldXml -ListTitle $ListTitle -InternalName $Name -Xml "<Field Type='Choice' Name='$Name' StaticName='$Name' DisplayName='$DisplayName'><CHOICES>$choiceXml</CHOICES></Field>"
}

$roles = @("Project Management", "Process Engineering", "Mechanical Engineering", "Drafting", "Procurement", "Quality", "Technical Review", "Management", "Other")

Ensure-List -Title "ERP_People" -Description "Capacity planner people and resource attributes."
Ensure-TextField "ERP_People" "Email" "Email"
Ensure-ChoiceField "ERP_People" "Discipline" "Discipline" $roles
Ensure-ChoiceField "ERP_People" "Role" "Role" $roles
Ensure-TextField "ERP_People" "SecondaryRoles" "Secondary Roles"
Ensure-ChoiceField "ERP_People" "EmploymentType" "Employment Type" @("Employee", "Freelancer")
Ensure-NumberField "ERP_People" "FTE" "FTE"
Ensure-NumberField "ERP_People" "WeeklyHours" "Weekly Hours"
Ensure-NumberField "ERP_People" "WorkingDaysPerWeek" "Working Days Per Week"
Ensure-BooleanField "ERP_People" "IsActive" "Is Active"
Ensure-TextField "ERP_People" "Manager" "Manager"
Ensure-NoteField "ERP_People" "Notes" "Notes"

Ensure-List -Title "ERP_Projects" -Description "Capacity planner projects and opportunities."
Ensure-TextField "ERP_Projects" "ProjectCode" "Project Code"
Ensure-ChoiceField "ERP_Projects" "ProjectType" "Project Type" @("Live", "Opportunity")
Ensure-ChoiceField "ERP_Projects" "Status" "Status" @("Pipeline", "Planned", "Active", "On Hold", "Complete", "Cancelled")
Ensure-ChoiceField "ERP_Projects" "Brand" "Brand" @("DCT", "PLK", "Internal", "Other")
Ensure-ChoiceField "ERP_Projects" "Priority" "Priority" @("Low", "Normal", "High", "Critical")
Ensure-TextField "ERP_Projects" "Client" "Client"
Ensure-DateField "ERP_Projects" "StartDate" "Start Date"
Ensure-DateField "ERP_Projects" "EndDate" "End Date"
Ensure-BooleanField "ERP_Projects" "IncludeInCapacity" "Include In Capacity"
Ensure-NumberField "ERP_Projects" "Probability" "Probability"
Ensure-DateTimeField "ERP_Projects" "LastAllocationSavedAt" "Last Allocation Saved At"
Ensure-NoteField "ERP_Projects" "Notes" "Notes"

Ensure-List -Title "ERP_Allocations" -Description "Monthly person to project allocations."
Ensure-TextField "ERP_Allocations" "PersonKey" "Person Key"
Ensure-TextField "ERP_Allocations" "ProjectKey" "Project Key"
Ensure-TextField "ERP_Allocations" "ScenarioKey" "Scenario Key"
Ensure-DateField "ERP_Allocations" "AllocationMonth" "Allocation Month"
Ensure-NumberField "ERP_Allocations" "AllocationFTE" "Allocation FTE"
Ensure-NumberField "ERP_Allocations" "AllocationHours" "Allocation Hours"
Ensure-ChoiceField "ERP_Allocations" "Discipline" "Discipline" $roles
Ensure-ChoiceField "ERP_Allocations" "Role" "Role" $roles
Ensure-BooleanField "ERP_Allocations" "IncludeInCapacity" "Include In Capacity"
Ensure-BooleanField "ERP_Allocations" "Locked" "Locked"
Ensure-DateTimeField "ERP_Allocations" "LastModifiedAt" "Last Modified At"
Ensure-NoteField "ERP_Allocations" "Notes" "Notes"

Ensure-List -Title "ERP_Leave" -Description "Leave and non-working time."
Ensure-TextField "ERP_Leave" "PersonKey" "Person Key"
Ensure-DateField "ERP_Leave" "LeaveDate" "Leave Date"
Ensure-DateField "ERP_Leave" "EndDate" "End Date"
Ensure-NumberField "ERP_Leave" "LeaveHours" "Leave Hours"
Ensure-NumberField "ERP_Leave" "LeaveDays" "Leave Days"
Ensure-ChoiceField "ERP_Leave" "LeaveType" "Leave Type" @("Holiday", "Sick", "Training", "Public Holiday", "Unpaid", "Other")
Ensure-NoteField "ERP_Leave" "Notes" "Notes"

Ensure-List -Title "ERP_Disciplines" -Description "Controlled discipline values."
Ensure-NumberField "ERP_Disciplines" "SortOrder" "Sort Order"
Ensure-TextField "ERP_Disciplines" "Colour" "Colour"
Ensure-BooleanField "ERP_Disciplines" "IsActive" "Is Active"

Ensure-List -Title "ERP_Settings" -Description "Application settings and scenario configuration."
Ensure-NoteField "ERP_Settings" "Value" "Value"
Ensure-ChoiceField "ERP_Settings" "Scope" "Scope" @("Global", "User", "Scenario")

Ensure-List -Title "ERP_AuditLog" -Description "Capacity planner audit log."
Ensure-ChoiceField "ERP_AuditLog" "EntityType" "Entity Type" @("Project", "Person", "Allocation", "Leave", "Setting", "Scenario")
Ensure-TextField "ERP_AuditLog" "EntityId" "Entity Id"
Ensure-ChoiceField "ERP_AuditLog" "Action" "Action" @("Create", "Update", "Delete")
Ensure-DateTimeField "ERP_AuditLog" "ChangedAt" "Changed At"
Ensure-NoteField "ERP_AuditLog" "Payload" "Payload"

Write-Host "Provisioning complete for $SiteUrl"
