---
sidebar_position: 2
title: Admin
description: The Admin panel — users, roles, environments and settings.
---

# Admin

The Admin panel manages users and environments: role management, data warehouse logs and announcements.

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

## Announcements
Send messages to all users or only to those of a specific organization (organization admins can only reach their own organization). Appears on the homepage.

![Announcements: list with title, priority, period and the Create button.](/img/screens/admin-announcements.png)

- **Start and end date** are optional; empty = visible immediately until removed.
- **Notify Users** also shows the message in the notification tab at the top.
- **Priority** places an announcement at the top.
- The body supports **Markdown** (headers, lists, links).

## Audit Logs
Monitor actions by organization users: user agent, client IP and additional properties per log type. Filterable by date range, severity or user.

## Database overview
View all databases the organization uses. A custom database can be updated directly here.

## Firewall
Grant or deny access per IP address, so admins can control where Yres may be accessed from.

![Firewall: manage IP rules with Create.](/img/screens/admin-firewall.png)

## PowerBI Models
Manage unified models per environment, so the correct models are called (e.g. on refresh via the master pipeline). **Setup:** first add a data source of type **PowerBI** (see [data source requirements](../referentie/databron-vereisten.md)); the tenant then appears and you can retrieve workspaces/models.

## Rebuild
Reset data to factory settings — for the whole organization or only the Azure Data Factory.

## Settings (entire application)
Applies to all environments. Includes, among other things, the number of **parallel processes** used to load sources into the database/data lake (integer 1–50). The **Danger Zone** lets you cancel the subscription by deleting the organization (does not affect your Azure environment, only removes the organization from the Yres portal).

## Secrets
View secrets in the associated key vault, with scope and any expiry date. With the right permission you can update a value.

## Shared integration runtimes
Manage self-hosted integration runtimes for ADF. An IR requires a name + description; after creation you download the Microsoft IR tool via the info icon and register it with the keys shown. **Cannot be undone.**

## Update Environment
Update an environment to the latest Yres version. **Advice:** test a new version on `dev` first before updating `prod`. See [release notes](../referentie/release-notes.md).

## Users & Roles
- **Users** — create with email, role and whether SSO is required. New users receive an email with a default password (changeable in account settings).
- **Roles** — standard roles plus custom roles, usually following CRUD per permission type. Permissions outside CRUD (such as building ADF code) are listed under "Other".

## Environment admin (environment-specific)

### Azure Resources
Overview of linked Azure resources: name, type, location and direct hyperlink.

### Change deployment rules
Translate object names between environments, e.g. `ERP_DEV.Product` (dev) → `ERP_TST.Product` (test) → `ERP.Product` (prod). Apply **before** importing a change; often combined with Source/Schema/Table overwrite so the table name stays stable across all environments.

### Data Warehouse Logs
View and filter logs with step-by-step actions of executed stored procedures (by date, type of sproc, severity). **Not available on Development.**

### Environment Settings
DWH settings configurable per environment. **Configure these before the first source is added**, for consistency. The **Stage and HIS schema settings must be the same (in sync) between environments**. Most important:

| Setting | Meaning |
|---|---|
| `DefaultStore` | Row- (default) or column-oriented storage. Row = reading/writing, column = queries. |
| `DefaultKeepStage` | Truncate the staging table after a delta load (NO) or keep records (YES). |
| `DefaultODSMemOptimized` / `DefaultStageMemOptimized` | Store ODS/STAGE tables memory-optimized. |
| `DefaultServiceTier` / `HighServiceTier` | Azure database service tier (and what to scale up to under high load). |
| `AutomaticDatabaseScaling` | Automatically scale the database for managed loads. |
| `DefaultSurrogate` | Automatically create surrogate keys (stored in `[LoadManagement].[SurrogateKeys]`; overridable per table). |
| `UsePagination` / `PageSize` | Process large datasets in pages (overrides `DefaultKeepStage`). |
| `RetryCount` | Number of retries per request. |
| `SchemaHIS` / `SchemaStage` | Names of the HIS and STAGE schema. |
| `StorageSize` | Storage in GB (depends on the service tier). |
| `BIDashboardUrl` / `BIDashboardHeight` | Embed URL and height of the Power BI dashboard. |
| `AllowUpdatesInYresSchemas`, `AllowDeletesFromDB`, `AllowSettingsUpdates`, `AllowLogManipulation` | Whether users may directly modify/delete/configure/edit logs in the database. |

### Health Checks
Status of the DWH side of Yres. Based on `[Maintenance].[vwYresChecks]`; shows common issues, often with an error message and sometimes a SQL script to fix them. **Be careful with scripts — consult a Yres admin if in doubt.**

![Health checks: detected issues with description, type and actions.](/img/screens/admin-healthchecks.png)

### PowerBI Dashboard
Shows a Power BI report in the web app via an embed URL.

## More admin screens

Besides the above, the app also has: **Azure resources** (`/admin/azure/resources`), **Change overwrites** (`/admin/changeoverwrites`), **Database settings** (`/admin/dbsettings`), **Theme** (`/admin/theme`: upload icon/background, blur, primary_color) and **Power BI credentials** (`/admin/powerBiCredentials`). See [Web app screens](../referentie/webapp-schermen.md) for all routes.
