---
type: data-model
project: Resource Planning
project-code: ERP-SPFX
status: active
stage: rebuild
tags: [sharepoint, lists, data-model]
---

# SharePoint Data Model

The SPFx rebuild stores all application data in SharePoint Lists within the deployment site.

## List naming convention

Use a stable prefix so the app can discover and validate its lists reliably.

| List | Purpose |
|---|---|
| ERP_People | Resource pool and team members |
| ERP_Disciplines | Controlled discipline list |
| ERP_Projects | Live projects and opportunities |
| ERP_Allocations | Monthly person/project allocations |
| ERP_Leave | Leave and unavailable capacity |
| ERP_Settings | App configuration and feature flags |
| ERP_AuditLog | Optional audit trail |

## ERP_People

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Display name |
| Email | Single line text | Yes | Match to Microsoft 365 user |
| Discipline | Lookup to ERP_Disciplines or choice | Yes | Primary discipline |
| Role | Single line text | No | Job role |
| EmploymentType | Choice | Yes | Employee, Freelancer, Contractor |
| FTE | Number | Yes | Default 1.0 |
| WeeklyHours | Number | Yes | Default 40 unless changed |
| ManagerEmail | Single line text | No | Lightweight manager link |
| IsActive | Yes/No | Yes | Soft-hide inactive people |

## ERP_Disciplines

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Discipline name |
| SortOrder | Number | Yes | Controls display order |
| ColourToken | Single line text | No | Optional UI token |
| IsActive | Yes/No | Yes | Soft-hide inactive disciplines |

## ERP_Projects

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Project name |
| ProjectCode | Single line text | No | Internal code |
| ProjectType | Choice | Yes | Opportunity or Live |
| Status | Choice | Yes | Pipeline, Active, On Hold, Complete, Cancelled |
| Client | Single line text | No | Client name |
| StartDate | Date | Yes | Planning start |
| EndDate | Date | Yes | Planning end |
| IncludeInCapacity | Yes/No | Yes | Primary opportunity toggle |
| Probability | Number | No | Optional weighted pipeline field |
| Notes | Multiple lines text | No | Project notes |

## ERP_Allocations

Each row represents one person, one project and one calendar month.

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Generated label |
| PersonId | Number | Yes | ERP_People item ID |
| PersonName | Single line text | Yes | Denormalised for reporting |
| PersonEmail | Single line text | Yes | Denormalised for matching |
| ProjectId | Number | Yes | ERP_Projects item ID |
| ProjectName | Single line text | Yes | Denormalised for reporting |
| ProjectCode | Single line text | No | Denormalised for reporting |
| ProjectType | Choice | Yes | Opportunity or Live |
| Discipline | Single line text | Yes | Denormalised for filtering |
| AllocationMonth | Date | Yes | First day of month |
| AllocationFTE | Number | Yes | Monthly FTE demand |
| AllocationHours | Number | Yes | Stored for performance and clarity |
| IncludeInCapacity | Yes/No | Yes | Snapshot/controlled calculation flag |
| Notes | Multiple lines text | No | Optional allocation notes |

## ERP_Leave

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Generated label |
| PersonId | Number | Yes | ERP_People item ID |
| PersonName | Single line text | Yes | Denormalised for reporting |
| LeaveDate | Date | Yes | Date of unavailable capacity |
| LeaveHours | Number | Yes | Unavailable hours |
| LeaveType | Choice | Yes | Holiday, Sick, Training, Other |
| Notes | Multiple lines text | No | Optional notes |

## ERP_Settings

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Setting key |
| Value | Multiple lines text | No | Text or JSON value |
| Scope | Choice | Yes | Global or User |

## ERP_AuditLog

| Column | Type | Required | Notes |
|---|---|---:|---|
| Title | Single line text | Yes | Short action summary |
| EntityType | Choice | Yes | Person, Project, Allocation, Leave, Setting |
| EntityId | Single line text | Yes | SharePoint item ID as text |
| Action | Choice | Yes | Create, Update, Delete |
| ChangedByEmail | Single line text | Yes | Current user email |
| ChangedAt | Date/time | Yes | UTC timestamp |
| Payload | Multiple lines text | No | JSON snapshot |

## Required indexes

Create indexes before meaningful data volume accumulates.

| List | Indexed fields |
|---|---|
| ERP_People | Email, Discipline, IsActive |
| ERP_Projects | ProjectType, Status, IncludeInCapacity, StartDate, EndDate |
| ERP_Allocations | AllocationMonth, PersonId, ProjectId, Discipline, IncludeInCapacity |
| ERP_Leave | LeaveDate, PersonId |
| ERP_Settings | Title, Scope |

## Design decisions

- Allocations are monthly rows, not spreadsheet-style month columns.
- Project and person display fields are denormalised onto allocations to reduce expensive lookups.
- The application does aggregation in the web part, not in complex SharePoint views.
- The MVP does not require a separate database, API, Azure Function or Supabase instance.
