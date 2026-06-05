---
sidebar_position: 2
title: Web app screens (routes & fields)
description: All screens in the Yres web app with their route and key fields.
---

# Web app screens — routes & fields

Overview of the screens in the Yres web app, with the **actual route** and the main **form fields** per screen. Useful to map the documentation to what you see in the app.

:::note
Routes are relative to the web app (the org subdomain, e.g. `…/admin/announcements`). The web app is an SPA: a section's sub-navigation only appears after you click its icon in the left rail.
:::

## Home

| Screen | Route |
|---|---|
| Dashboard | `/` |
| Power BI Dashboard | `/admin/powerBiDashboard` |

## Admin

| Screen | Route | Key fields |
|---|---|---|
| Users & Roles | `/admin/panel` | — |
| Announcements | `/admin/announcements` | title · start date · start time · end date · end time · notify users · priority · body |
| Audit logs | `/admin/auditlogs` | date (filter) |
| Databases | `/admin/databases` | host · db_name · server_name · port · username · password |
| Secrets | `/admin/secrets` | — |
| Firewall | `/admin/firewall` | — |
| Health checks | `/admin/healthchecks` | — |
| DWH logs | `/admin/dwhlogs` | date (filter) |
| Azure resources | `/admin/azure/resources` | — |
| Change overwrites | `/admin/changeoverwrites` | — |
| Database settings | `/admin/dbsettings` | — |
| Rebuild | `/admin/rebuild` | — |
| Theme | `/admin/theme` | upload icon · upload background · blur · primary_color |
| Update environment | `/admin/environments` | — |
| Power BI credentials | `/admin/powerBiCredentials` | — |
| Shared integration runtimes | `/admin/shared-integration-runtimes` | name · description |

## Projects & Changes

| Screen | Route | Key fields |
|---|---|---|
| Projects | `/projects` | Name · Description · DueDate |
| Changes | `/changes` | — |
| Install changes | `/changes/install` | — |
| Release changes | `/changes/release` | — |
| Scripted objects | `/loadmanagement/scriptedObjects` | — |

## Data sources

| Screen | Route |
|---|---|
| Sources | `/sources` |
| Source detail | `/sources/:id` |
| Type mapping | `/sources/:id/typemapping` |

## Load Management

| Screen | Route | Key fields |
|---|---|---|
| Run pipelines | `/loadmanagement/runPipelines` | date range (filter) |
| Triggers | `/loadmanagement/triggers` | — |
| Monitoring | `/loadmanagement/monitoring` | — |
| Master pipelines | `/loadmanagement/masterPipelines` | — |
| Integration runtimes | `/loadmanagement/integration-runtimes` | name · description · type |
| Scripted objects | `/loadmanagement/scriptedObjects` | — |
| Datawarehouse processes | `/loadmanagement/datawarehouse-processes` | — |
| Datawarehouse queries | `/loadmanagement/datawarehouse-queries` | — |

## Data Engineering

| Screen | Route | Key fields |
|---|---|---|
| View persistence | `/dataengineering/viewpersistence` | DestinationSchemaName · DestinationTableName · Level (+ source, object type, load type) |
| Object history | `/dataengineering/objecthistory` | — |

## Settings

| Screen | Route |
|---|---|
| Settings | `/settings` |

:::info Maintenance
This overview was captured from the live web app. Screens may change per release — use the tool in `tools/playwright-capture/` to re-capture.
:::
