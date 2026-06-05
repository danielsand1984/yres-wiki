---
sidebar_position: 5
title: Webapp-schermen (routes & velden)
description: Alle schermen in de Yres-webapp met hun route en belangrijkste velden.
---

# Webapp-schermen — routes & velden

Overzicht van de schermen in de Yres-webapp, met de **werkelijke route** en de belangrijkste **formuliervelden** per scherm. Handig om de documentatie te koppelen aan wat je in de app ziet.

:::note
Routes zijn relatief aan de webapp (het org-subdomein, bv. `…/admin/announcements`). De webapp is een SPA: de subnavigatie van een sectie verschijnt pas als je het sectie-icoon links aanklikt.
:::

## Home

| Scherm | Route |
|---|---|
| Dashboard | `/` |
| Power BI Dashboard | `/admin/powerBiDashboard` |

## Admin

| Scherm | Route | Belangrijkste velden |
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

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Projects | `/projects` | Name · Description · DueDate |
| Changes | `/changes` | — |
| Install changes | `/changes/install` | — |
| Release changes | `/changes/release` | — |
| Scripted objects | `/loadmanagement/scriptedObjects` | — |

## Data sources

| Scherm | Route |
|---|---|
| Sources | `/sources` |
| Source detail | `/sources/:id` |
| Type mapping | `/sources/:id/typemapping` |

## Load Management

| Scherm | Route | Belangrijkste velden |
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

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| View persistence | `/dataengineering/viewpersistence` | DestinationSchemaName · DestinationTableName · Level (+ source, object type, load type) |
| Object history | `/dataengineering/objecthistory` | — |

## Settings

| Scherm | Route |
|---|---|
| Settings | `/settings` |

:::info Onderhoud
Dit overzicht is vastgelegd uit de live webapp. Schermen kunnen per release wijzigen — gebruik de tool in `tools/playwright-capture/` om opnieuw vast te leggen.
:::
