---
sidebar_position: 5
title: Monitoring & logging
description: Hoe Yres elke laadrun vastlegt — spWriteLoadStatus, LS_Pipeline, LS_Trans, LoadLog, ProcessLog en EventLog — en hoe je dit terugleest via de webapp en de views vwLoads en vwMonitor.
---

# Monitoring & logging

Elke laadrun in Yres laat een spoor achter. De data-plane database (`IRIS_DWH`) schrijft op drie niveaus weg — **per workflow**, **per pipeline-run** en **per micro-stap** — plus een doorlopend **proc-log** en een **DDL-/permissie-audit**. Dit hoofdstuk legt uit welke procedure schrijft, in welke tabellen, en met welke views je het terugleest in de webapp of via een SQL-endpoint (SSMS, Azure Data Studio).

:::tip Lees eerst de gegevensstroom
De logging is het beste te begrijpen naast de [gegevensstroom](../concepten/gegevensstroom.md) (`vwExtractor → STAGE → spLoadDWH → spHIS_InsertAndUpdate → HIS → spWriteLoadStatus`). Elke stap in die keten schrijft een logregel.
:::

## In het kort

| Niveau | Geschreven door | Tabel | Granulariteit |
|---|---|---|---|
| Pipeline-run | `[Monitoring].[spWriteLoadStatus]` | `[Monitoring].[LS_Pipeline]` | 1 rij per run (bij *Start workflow* / *Start load*) |
| Micro-stap | `[Monitoring].[spWriteLoadStatus]` | `[Monitoring].[LS_Trans]` | 1 rij per stap (altijd) |
| Tabel-load (status) | `[LoadManagement].[spPrepareWorkload]` (PLANNED/SKIPPED) → `[Monitoring].[spWriteLoadStatus]` (RUNNING/SUCCEEDED/FAILED) | `[LoadManagement].[LoadLog]` | duurzame status per tabel-load |
| Proc-/app-log | `[Config].[spWriteMessage]` / `Warning` / `Error` / `Log` | `[Config].[ProcessLog]` | berichten en fouten per stored procedure |
| DDL-/permissie-audit | databasetriggers | `[Config].[EventLog]` | object- en rechtenwijzigingen |

Lezen doe je via de **monitoringviews** — vooral **`vwLoads`** (de per-pipeline laadtijdlijn) en **`vwMonitor`** (breder: ook gematerialiseerde views en Power BI-refreshes).

:::warning `vwLoadMonitor` bestaat niet
De view `[Monitoring].[vwLoadMonitor]` is **niet gedeployd** (hij komt alleen voor in een verouderd `.sqlproj_backup`). Gebruik in plaats daarvan **`vwLoads`** (pipeline-tijdlijn) of **`vwMonitor`** (breder).
:::

## Vóór de start: `PLANNED` en `SKIPPED`

`spWriteLoadStatus` (hieronder) zet een tabel-load pas op `RUNNING` zodra ADF hem daadwerkelijk oppakt. Vóór dat moment doorloopt de `LoadLog`-rij twee statussen die **niet** door `spWriteLoadStatus` maar door **`[LoadManagement].[spPrepareWorkload]`** worden gezet — in de Lookup-stap "Get tables" van `Dynamic Workflow YRES`, vóórdat `vwExtractor`/`fxExtractor` de werklijst teruggeeft (zie [gegevensstroom, stap 3](../concepten/gegevensstroom.md)):

- **`PLANNED`** — er is (nog) geen andere `PLANNED`- of `RUNNING`-rij voor dezelfde `Source`/`SourceSchema`/`SourceTable`. Deze rij wordt écht meegenomen: `spPrepareWorkload` bouwt aan het eind dynamisch een `SELECT` die alleen `LoadLog`-rijen met `LoadStatus = 'PLANNED'` voor deze `WorkFlow` teruggeeft aan de `ForEach`-lus.
- **`SKIPPED`** — `spPrepareWorkload` vond (via `fxExtractor`, dat linkt met `vwLatestLoad` beperkt tot `LoadStatus IN ('PLANNED','RUNNING')`) al een niet-afgeronde load voor precies diezelfde tabel. Er wordt toch een `LoadLog`-rij weggeschreven — voor traceerbaarheid, "deze aanvraag is binnengekomen" — maar meteen met status `SKIPPED`, en die rij komt **niet** terug in de `ForEach`-lus.

Dit is de non-concurrency-vergrendeling: zonder deze check zou een tweede trigger (of een overlappende handmatige run) dezelfde tabel nóg een keer inplannen terwijl de vorige load nog bezig is. **`[LoadManagement].[vwLatestLoad]`** sluit `SKIPPED`-rijen expliciet uit bij het bepalen van "de laatste load" per tabel, zodat een overgeslagen duplicaat de echte (nog lopende of al afgeronde) load niet verbergt in de monitoringschermen of in `vwMonitor`.

:::note `SKIPPED` is geen fout
Een `SKIPPED`-rij betekent niet dat er iets misging — hij betekent dat dezelfde tabel al ergens anders in de wachtrij stond of aan het laden was toen deze aanvraag binnenkwam (bijvoorbeeld twee triggers die elkaar overlappen). De Monitoring-pagina behandelt zo'n rij niet als storing.
:::

## De centrale logger: `spWriteLoadStatus`

`[Monitoring].[spWriteLoadStatus]` is het hart van de monitoring. De ADF-workflow roept hem op vaste punten aan — bij *Start workflow*, per tabel bij *Start load* en *End load*, en bij *End Workflow* — en hij doet drie dingen tegelijk:

1. **`LS_Pipeline`** — bij `@Step IN ('Start workflow','Start load')` wordt één rij per run weggeschreven.
2. **`LS_Trans`** — bij **elke** aanroep wordt één rij weggeschreven (de hoogvolume-stappentijdlijn).
3. **`LoadLog`** — de duurzame status per tabel-load wordt omgezet: bij *Start* op `RUNNING`, bij `@Status IN ('Success','Succeeded')` op `SUCCEEDED`, en bij `@Status IN ('Failed','Fail','Error')` op `FAILED` (waarbij `@Log` aan `LoadLog.Error` wordt toegevoegd).

### Parameters

De procedure heeft **16 parameters** (alle behalve `@PipelineID` optioneel):

| Parameter | Type | Rol |
|---|---|---|
| `@PipelineID` | `NVARCHAR(255)` | Run-identifier. `'UNKNOWN'` → wordt opgelost uit `LS_Pipeline` (laatste 24 u, op Target + LoadType). |
| `@Process` | `NVARCHAR(255)` | Bijv. `Workflow` of `load`. |
| `@Step` | `NVARCHAR(255)` | Stapnaam (bepaalt of `LS_Pipeline` wordt geschreven). |
| `@Status` | `NVARCHAR(255)` | Bepaalt de `LoadLog`-status en of er een fout wordt opgeworpen. |
| `@Rows` | `BIGINT` | Aantal verwerkte rijen voor deze stap. |
| `@WorkflowID` | `NVARCHAR(255)` | Workflow-identifier. `NULL` → wordt afgeleid uit recente runs. |
| `@PipelineName` | `NVARCHAR(255)` | Naam van de ADF-pipeline. |
| `@Started_by` | `NVARCHAR(255)` | Wie/wat de run startte (trigger, gebruiker, webapp). |
| `@Target` | `NVARCHAR(255)` | Doel (geconcateneerde target-naam). |
| `@Source_system` | `NVARCHAR(255)` | Bronsysteem. |
| `@Table` | `NVARCHAR(255)` | Brontabel. |
| `@Schema` | `NVARCHAR(255)` | Bronschema. |
| `@LoadType` | `NVARCHAR(255)` | Laadtype van deze run (FULL, DELTA, …). |
| `@LatestRecord` | `NVARCHAR(255)` | Hoogste deltawaarde van deze run (het watermerk voor DELTA-achtige laadtypes). |
| `@ETL_Date` | `DATETIME` | Laadtijdstempel. |
| `@Log` | `NVARCHAR(MAX)` | Vrije logtekst; standaard `'No details provided'`. Bij fouten de foutmelding. |

:::note `@LatestRecord`, niet "LapageRecord"
In oudere wiki-extracties stond deze parameter als `@LapageRecord`. Dat is een OCR-fout: de parameter heet `@LatestRecord`. Hetzelfde geldt voor de kolommen `LatestRecord`, `LatestRuntime` en `[LatestLoad]` in de views en logtabellen.
:::

### Robuustheid

`spWriteLoadStatus` is gehard zodat monitoring nooit een laadrun breekt:

- Alle bookkeeping-writes zitten in een `TRY/CATCH` en zijn **best-effort** — een mislukte logregel mag de aanroepende load niet stoppen. Bij een interne fout schrijft de procedure een gewaakte broodkruimel onder de stap `'spWriteLoadStatus logging error'`.
- De bewuste `RAISERROR` voor `@Status IN ('Failed','Fail','Error')` staat **buiten** de `TRY`, zodat echte laadfouten altijd doorkomen naar ADF (en dus zichtbaar worden in de pipeline-run).

## De logtabellen

De views hieronder zijn afgeleid van vijf ruwe tabellen. Je kunt ze ook direct bevragen via een SQL-endpoint, maar voor dagelijks gebruik zijn de views (en de webapp) handiger.

### `[Monitoring].[LS_Pipeline]` — één rij per run

Kolommen: `WorkflowID, PipelineID, PipelineName, Process, Source_system, Target, DateTime DATETIME2, Started_by, Schema, Table, LoadType, CopiedRows BIGINT, LatestRecord DATETIME2, ETLDate DATETIME2`.

### `[Monitoring].[LS_Trans]` — één rij per micro-stap

Kolommen: `PipelineID, Rows BIGINT, Step, DateTime DATETIME2, Status, Process, log NVARCHAR(MAX)`. Dit is de hoogvolume-tijdlijn die de pivotviews (`vwLoads`, `vwMonitor`, `vwWorkflow`) verdichten tot per-stap-runtimes.

### `[LoadManagement].[LoadLog]` — duurzame status per tabel-load

`RowId IDENTITY, Source, SourceSchema, SourceTable, TargetTable, SourceType, TriggerName, LoadType, Script, LoadName, WorkFlow, Pipeline, PlannedAt, StartedAt, FinishedAt, LoadStatus, Error, …`. Dit is de status-ruggengraat: `spWriteLoadStatus` zet hier `RUNNING` → `SUCCEEDED`/`FAILED`, en `vwMonitor` joint hierop.

### `[Config].[ProcessLog]` — proc-/app-log

Het volledige berichtenlog per stored procedure: `processID, logID, timestamp, callSource, appUser, spName, spStep, returnCode, message1-4, dbUser, dbServer, dbName, dbRequest`, en bij fouten `errorLine, errorMessage, errorNumber, errorPrecedure, errorSeverity, errorState`.

:::info `errorPrecedure` is geen typefout van deze wiki
De kolom heet letterlijk `errorPrecedure` (zonder de tweede `o`) — zo staat hij in zowel `ProcessLog` als de procedure `spWriteError`. We nemen de naam bewust onveranderd over.
:::

De vier schrijvers (`[Config].[spWriteMessage]`, `spWriteWarning`, `spWriteError`, `spWriteLog`) delen hetzelfde 10-parameterblok en schrijven allemaal naar `ProcessLog`. Een `INSTEAD OF DELETE,UPDATE`-trigger blokkeert wijzigen/verwijderen tenzij de instelling `AllowSettingsUpdates` aanstaat.

### `[Config].[EventLog]` — DDL-/permissie-audit

Object- en rechtenwijzigingen: `EventType, ObjectType, TimeStamp, ServerName, DatabaseName, SchemaName, ObjectName, script, fullCommand XML, ChangedBy, …`. Dit is de bron van `vwAccessManagement`, `vwUserManagement` en `vwObjectAlterations`.

## De monitoringviews

| View | Niveau | Gebruik |
|---|---|---|
| `[Monitoring].[vwLoads]` | per pipeline-run | **De canonieke laadtijdlijn.** Pivot van `LS_Trans` over de stappen (Start load → upsert HIS → End load), met per-stap-runtime, rijtellingen (Copied/Delta/New/Deleted), de `[LatestLoad]`-vlag en ADF-deeplinks. |
| `[Monitoring].[vwMonitor]` | breder | Draait op `LoadLog` en voegt twee extra bronnen toe via UNION: **gematerialiseerde views** (`Materialize Views`) en **Power BI-refreshes** (`Refresh_PBI`). Basis voor `fxGetTableLoads` en `vwUsedTables`. |
| `[Monitoring].[vwWorkflow]` | per workflow | Pivot van `LS_Trans` (Process = `Workflow`) over de workflow-stappen, gejoind met `LS_Pipeline`. |
| `[Monitoring].[vwUsedTables]` | per tabel | De laatste load + status per gebruikte tabel (`LatestLoad` = de `[ETL Date]`, `LatestStatus` = de status). |
| `[Monitoring].[vwAccessManagement]` | audit | Eén rij per Grantee × Permission uit `EventLog` (GRANT/DENY/REVOKE). |
| `[Monitoring].[vwUserManagement]` | audit | Gebruiker-/rol-lifecycle-events. |
| `[Monitoring].[vwObjectAlterations]` | audit | DDL-wijzigingen door echte gebruikers (exclusief `ADF`/`Unknown`). |
| `[Config].[vwUserlog]` / `[Config].[vwUserLogJSON]` | proc-log | Leesbare weergave van `ProcessLog` (de tweede als JSON voor de webapp). |

:::tip Vuistregel
`vwLoads` voor de vraag *"hoe verliep deze pipeline-run, stap voor stap?"*. `vwMonitor` voor het bredere overzicht inclusief view-materialisatie en PBI-refreshes. Voor proc-niveau-berichten en fouten: `vwUserlog` (of de **DWH logs**-pagina in de webapp).
:::

## Terugkijken in de webapp

### Load management → Monitoring

De **Monitoring**-pagina (`/loadmanagement/monitoring`) toont per target de laadstatus, de afzonderlijke runs en — bij een fout — de stappen. Onderliggend leest hij `vwLoads`/`vwMonitor` en de `LS_Trans`-tabel.

![Monitoring-scherm met de Targets-boom links en de pipeline-runs en stappen rechts](/img/screens/loadmanagement-monitoring.png)

*De Monitoring-pagina: kies links een target, bekijk rechts de runs en open per run de stappen.*

1. **Targets-boom** — Source / Schema / Table met per regel de laaddatum, status (SUCCEEDED / RUNNING / FAILED) en een status-rollup per bron.
2. **Geselecteerde target** — naam plus een samenvatting van grootte (tabel + index) en aantal records.
3. **Reset table** — zet de tabel terug (bevestiging vereist). Zie ook [rollback & reset](../concepten/rollback-reset.md).
4. **Runs-grid** — per run: Status, DateTime, Load type, Runtime, Copied / New / Delta rijen. Een mislukte run toont een rood info-icoon.
5. **Per-run-acties** — het info-icoon opent de stappen-modal; het klok-icoon start een rollback van die run.
6. **Stappen-modal** — de stappen van de run uit `[Monitoring].[LS_Trans]` (Step / DateTime / Status / Log / Rows) met een **Link to ADF**. Bij een FAILED-run verschijnen de foutmelding en de ADF-link boven het grid.

### Admin → DWH logs

De **DWH logs**-pagina (`/admin/dwhlogs`) toont de stap-voor-stap-acties van stored procedures uit `[Config].[ProcessLog]` — handig om te zien wélke procedure faalde en met welke melding.

![DWH logs-scherm met filterrij, logtabel en een stappen-modal voor een mislukte procedure](/img/screens/admin-dwhlogs.png)

*De DWH logs-pagina leest `Config.ProcessLog`; filter op datum, procedure en log-level, en open per regel de stappen.*

1. **Datumfilter** — beperk de logregels tot een datumbereik.
2. **Proc- en log-levelfilters** — filter op een specifieke procedure en op niveau (Information / Warning / Error), met een "equal and worse"-optie.
3. **Clear count** — reset de foutteller (badge).
4. **Info** — opent de stappen-modal voor die logregel.
5. **Mislukte stap + ADF-link** — de modal toont de stappen en de foutmelding; bij laadfouten kun je doorklikken naar ADF.

:::note DWH logs niet op elke omgeving
De DWH logs-pagina is gebonden aan een omgeving (bijv. Productie) en is **niet beschikbaar op Development**.
:::

## Een mislukte load onderzoeken

Volg deze stappen wanneer een load faalt:

1. Open **Load management → Monitoring** en selecteer het betreffende target in de Targets-boom (de FAILED-status is rood gemarkeerd).
2. Klik in het runs-grid op het **info-icoon** van de mislukte run om de stappen-modal te openen. Daar zie je welke stap faalde (bijv. *Load DWH* / `spHIS_InsertAndUpdate`) plus de foutmelding en de **Link to ADF**.
3. Gebruik de ADF-link om de onderliggende pipeline-run in Azure Data Factory te openen voor het volledige foutspoor.
4. Voor proc-niveau-detail: open **Admin → DWH logs**, filter op de betrokken procedure en op log-level **Error**, en open de stappen-modal voor de exacte melding.
5. Los de oorzaak op (bijv. een timeout → schaal de databasetier op of verklein `PageSize`) en start de load opnieuw via **Run pipelines**.

:::tip Direct via SQL
Hetzelfde is via een SQL-endpoint op te vragen: `SELECT * FROM [Monitoring].[vwLoads] WHERE [Status] = 'FAILED' ORDER BY [DateTime] DESC` voor de mislukte runs, en `SELECT * FROM [Config].[vwUserlog] WHERE MessageType = 8` voor de bijbehorende foutmeldingen.
:::

## Verder lezen

- [Logs & views](sql/logs-views.md) — alle logtabellen en views met hun volledige output-kolommen.
- [SQL Interaction](sql-interaction.md) — de catalogus van procedures, functions en views.
- [Gegevensstroom](../concepten/gegevensstroom.md) — de laadketen waar deze logregels uit voortkomen.
- [Historie & SCD2](../concepten/historie-scd2.md) en [Laadtypes](../concepten/load-types.md) — wat de rijtellingen (New / Delta / Closed) betekenen.
- [Troubleshooting](../troubleshooting.md) — veelvoorkomende fouten en oplossingen.
