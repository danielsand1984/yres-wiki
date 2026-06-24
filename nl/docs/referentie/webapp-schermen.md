---
sidebar_position: 2
title: Webapp-schermen (routes & velden)
description: Alle schermen in de Yres-webapp met hun werkelijke (subdomein-scoped) route en belangrijkste velden.
---

# Webapp-schermen — routes & velden

Overzicht van de schermen in de Yres-webapp, met de **werkelijke route** en de belangrijkste **formuliervelden** per scherm. Handig om de documentatie te koppelen aan wat je in de app ziet.

## Hoe de routering werkt

De Yres-webapp kiest zijn navigatie op basis van het **(sub)domein** waarop je inlogt. Eén codebasis bedient drie *scopes*:

| Scope | Wanneer | Voorbeeld-host |
|---|---|---|
| **organization** | een klant-subdomein | `acme.<host>` |
| **superadmin** | de admin-host | `admin.<host>` |
| **front** | accountkeuze / uitgelogd | de front-host |

Omdat de organisatie al door het subdomein bepaald wordt, gebruiken alle org-schermen **kale paden** zonder organisatie-id: `/sources`, `/loadmanagement/monitoring`, `/admin/panel`, enzovoort. Je vindt deze route niet terug als `/organizations/:organizationId/...` — dat is een **verouderde** routevariant die niet meer draait.

:::note
Routes zijn relatief aan het org-subdomein (bv. `acme.<host>/admin/announcements`). De webapp is een SPA: de subnavigatie van een sectie verschijnt pas als je het sectie-icoon links aanklikt. Sommige schermen zijn **versie-gated** (zie de versie-noten hieronder) of alleen zichtbaar bij meerdere omgevingen.
:::

## Gedeelde chrome (elk ingelogd scherm)

Elk ingelogd scherm deelt dezelfde "schil": een vaste **bovenbalk**, een **icoonkolom** links en een contextuele **sub-link-zijbalk**.

![Wireframe van de gedeelde Yres-chrome: bovenbalk met logo en omgevingswisselaar, links de icoonkolom en de sub-link-zijbalk, rechts het dashboard.](/img/screens/dashboard-nav.svg)

*De gedeelde chrome rond elk scherm: bovenbalk, icoonkolom en contextuele sub-links. De genummerde markeringen verwijzen naar de uitleg hieronder.*

1. **Logo + organisatietitel** — toont de organisatienaam; klikken brengt je naar Home (`/`). In de superadmin-scope luidt de titel "SuperAdmin Yres".
2. **Omgevingswisselaar** — alleen zichtbaar bij **meer dan één omgeving**; wisselt tussen Development / Test / Production. De wisselaar is uitgeschakeld op niet-omgevingsgebonden routes en springt dan terug naar `dev`.
3. **Help "?"** — opent de Yres-wiki op `wiki.yres-dwh.app` (verborgen voor superadmin).
4. **Icoonkolom** — de hoofdsecties: Home, Admin, Projects, Data sources, Load management, Data engineering. Permissie- en versie-gated; **Projects is verborgen bij een single-environment-organisatie**.
5. **Sub-link-zijbalk** — de schermen binnen de gekozen sectie (resizable, sleep aan de rechterrand).
6. **Acties rechts** — Refresh, monitored jobs, notificaties en het gebruikersmenu.

## Home

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Dashboard | `/` | welkomstkaart · quick-nav-tegels · monitored jobs · "Error logs (3 days)" · laadhistorie-tabel |
| Power BI dashboard | `/admin/powerBiDashboard` | ingebedde Power BI-rapportweergave |

## Data sources

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Sources | `/sources` | "Create source" (wizard) · tabel (type · name · credentials_expiry) · connectiviteitstest |
| Source detail | `/sources/:sourceId` | dispatcht naar UsedTables / UsedFiles / UsedRestService (zie hieronder) |
| Type mapping (per bron) | `/sources/:sourceId/typemapping` | "Generate Typemapping" · SQL-editor op `LoadManagement.TypeMapping` (`WHERE SourceSystem = <bron>`) |

Het detailscherm `/sources/:sourceId` kiest automatisch de juiste weergave op basis van het brontype:

- **Database-bronnen** → *Used tables*: metadata-kaart (`GetMetaData - <bron>`), knoppen **Refresh metadata** en **Load data (all)**, en de tabel uit `LoadManagement.vwUsedTables` met o.a. `SourceSchema`, `SourceTable`, `DataPlatform`, `LoadType`, `DeltaColumn`, `LatestRecord`, `TargetTable`.
- **Bestandsbronnen** (bv. `AzureBlobStorage`) → *Used files*: kolommen als `fileName`, `Sheet`, `CellRange`, `ColumnDelimiter`; **Upload File** alleen voor blob-bronnen in dev.
- **REST-bronnen** (`RestService`) → *Used REST service*: `OverwriteSchema`, `OverwriteTable`, `SourceSchema`, `SourceTable`, `LoadType`, `pageSize`.

## Load management

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Run pipelines | `/loadmanagement/runPipelines` | pipeline-lijst · datumbereik (`runEnd`) · status-filter · (dynamische workflow) Source/Schema/Table-cascade · "Start pipeline" |
| Triggers | `/loadmanagement/triggers` | tabel: `Name` · `status` · `frequency` · `on` · `time` · `timezone` · acties (start/stop/delete) |
| Monitoring | `/loadmanagement/monitoring` | Targets-boom (Source→Schema→Table) · runs-grid (Status · DateTime · Load type · Runtime · Copied · New · Delta) · "Reset table" · rollback |
| Design master pipeline | `/loadmanagement/masterPipelines` | master-pipeline-ontwerp (versie ≥1.53) |
| Master pipeline detail | `/loadmanagement/masterPipelines/:masterPipelineId` | — |
| Integration runtimes | `/loadmanagement/integration-runtimes` | name · description · type |
| Scripted objects | `/loadmanagement/scriptedObjects` | — |
| Datawarehouse processes | `/loadmanagement/datawarehouse-processes` | — |
| Datawarehouse queries | `/loadmanagement/datawarehouse-queries` | — |

:::note
Bij **Triggers** wordt de timezone van de ingelogde gebruiker gebruikt (niet een vaste UTC+1), ondanks wat de UI-hint suggereert.
:::

## Data engineering

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| View persistence | `/dataengineering/viewpersistence` | `DestinationSchemaName` · `DestinationTableName` · `Level` · `Delta` · "Run materialize view (all)" |
| Object history | `/dataengineering/objecthistory` | objecthistorie-overzicht |

## Projects & Changes

:::note
Deze hele sectie is **verborgen bij een single-environment-organisatie**. Projects/Changes verschijnen pas vanaf twee omgevingen.
:::

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Projects | `/projects` | `Name` · `Description` · `DueDate` · `Creator` · status-tekst |
| Changes | `/changes` | project/change-selectie · changes-tabel (`Name` · `Status` · `Released*`) · "Create change" (alleen bij open project) |
| Release change | `/changes/release` | bevestiging om een change vrij te geven (`POST /changes/release`) |
| Install change | `/changes/install` | change importeren/installeren naar de volgende omgeving |

:::caution Verouderd: PublishChange
Het oude scherm **PublishChange** (legacy route `…/projects/dictionaryvs`) is **niet bereikbaar** in de draaiende app — de route is uitgecommentarieerd. De functionaliteit is in de live app opgesplitst over **Release change** (`/changes/release`) en **Install change** (`/changes/install`). Gebruik die twee.
:::

## Admin (organisatie)

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Org panel (users & roles) | `/admin/panel` | users-tabel (name · email · role · SSO) · roles-tabel |
| DWH settings | `/admin/dbsettings` | `Setting` · friendly value · per-setting editor (tier-combobox, schemanamen, storage min/max) |
| Global type mapping | `/admin/globaltypemapping` | SQL-editor op `LoadManagement.GlobalTypeMapping` |
| Update environments | `/admin/environments` | omgevingskaarten · DWH-versie · laatste CI/CD State/Result/Ran · deploy-bevestiging |
| Theme | `/admin/theme` | upload logo · upload achtergrond · blur · primary_color · licht/donker/auto · live preview |
| Announcements | `/admin/announcements` | title · start date · start time · end date · end time · notify users · priority · body |
| Audit logs | `/admin/auditlogs` | date (filter) |
| Databases | `/admin/databases` | host · db_name · server_name · port · username · password |
| Secrets | `/admin/secrets` | — |
| Power BI credentials | `/admin/powerBiCredentials` | — |
| Firewall | `/admin/firewall` | — |
| Health checks | `/admin/healthchecks` | resultaten van `[Maintenance].[vwYresChecks]` (versie ≥1.51) |
| Change overwrites | `/admin/changeoverwrites` | (multi-env, versie ≥1.54) |
| DWH logs | `/admin/dwhlogs` | date (filter) · stored-procedure-filter · log level |
| Azure resources | `/admin/azure/resources` | — |
| Rebuild | `/admin/rebuild` | (system-admin) |
| Shared integration runtimes | `/admin/shared-integration-runtimes` | name · description (versie ≥1.55) |
| Settings | `/settings` | — |
| Deployment status | `/deployments/:deploymentId/status` | live status van een lopende deploy |

:::note Upgrade-scherm niet in de zijbalk
Het scherm **Upgrade** (`/admin/upgrade`, voor het ophogen van de webapp-major-versie) bestaat als route en component, maar de zijbalk-link ernaartoe is uitgecommentarieerd. Het is daardoor **niet normaal bereikbaar** via de live navigatie.
:::

## Auth (front-scope, uitgelogd)

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Login | `/login` | email · password · "Sign in" · "Forgot password?" |
| Forgot password | `/forgot-password` | email · "Reset password" |
| Reset password | `/reset-password/:token` | Email · Password (min 12) · Confirm Password |
| Register (invite) | `/register` | naam · email (vooraf ingevuld uit de uitnodiging) |

## Account (gebruiker)

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| User settings | `/user/settings` | Name · Timezone · Date format · Language · wachtwoord wijzigen |
| DWH logs (per gebruiker) | `/user/logs` | datumbereik · stored-procedure-filter · log level · "Clear error count" |
| Feedback | `/user/feedback` | feedback indienen |

## Superadmin (`admin.<host>`)

| Scherm | Route | Belangrijkste velden |
|---|---|---|
| Admin panel | `/adminpanel/general` | organisaties-tabel · users-tabel · "Add organization" |
| Organisaties (accountkeuze) | `/organizations` | pending invitations · org-kaarten |
| Create organization (7-staps wizard) | `/adminpanel/organizations/create` | org+project · plan/versie · omgevingen (dev+prod vereist, max 6) · database · resource-namen · Azure-app + permissies |
| Release updates | `/adminpanel/releaseUpdates` | versiekaarten (dev→test / test→prod) · bevestiging |

:::info Onderhoud
Dit overzicht is afgeleid uit de live webapp-code (`yres_frontend`). Schermen, routes en velden kunnen per release wijzigen, en de webapp is buiten scope van deze datawarehouse-documentatie. Beschouw deze pagina als referentie; bij twijfel telt wat de app daadwerkelijk toont. Leg opnieuw vast met de tool in `tools/playwright-capture/` als de app is gewijzigd.
:::
