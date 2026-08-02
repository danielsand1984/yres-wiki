---
sidebar_position: 4
title: SQL Interaction (referentie)
description: Catalogus van stored procedures, functions en views in IRIS_DWH — beheer via een SQL-endpoint.
---

# SQL Interaction

Elke Yres-database (`IRIS_DWH`) is te beheren via een **SQL-endpoint** (SSMS, Azure Data Studio). **Advies: gebruik voor de meeste taken de webapp.** Sommige functies zijn alleen via SQL beschikbaar, en zonder frontend-abonnement houdt het SQL-endpoint bestaande bronnen beschikbaar. **Nieuwe bronnen toevoegen kan niet via SQL** — dat loopt altijd via de wizard in de webapp (die de bijbehorende ADF-pipelines genereert).

:::tip Deze pagina is de catalogus
Hieronder staan de **namen per schema** met een korte omschrijving. De volledige **purpose, inputs en outputs per object** staan op de detailpagina's:

- [Stored procedures](./sql/stored-procedures.md) — alle 108 procedures
- [Functions](./sql/functions.md) — alle 58 functions
- [Logs & views](./sql/logs-views.md) — logtabellen + alle 48 views met output-kolommen
:::

## Overzicht: schema's en aantallen

`IRIS_DWH` bevat **108 stored procedures, 58 functions en 48 views**, verdeeld over deze schema's:

| Schema | Rol |
|---|---|
| `[LoadManagement]` | De laadengine: bronnen, tabellen, STAGE→HIS-merge (SCD2), materialisatie. |
| `[Config]` | Instellingen (`Settings`), logging, metadata-onderhoud, database-tuning. |
| `[Change]` | Change management voor DTAP (projecten, changes, release, install). |
| `[Monitoring]` | Laadstatus-logging (`LS_Pipeline`, `LS_Trans`) en monitoringviews. |
| `[Maintenance]` | Index-onderhoud, sp_Blitz-diagnostiek, gezondheidschecks. |
| `[Expose]` | Reporting/RBAC: rollen, gebruikers en exposed objecten beheren. |
| `[Metadata]` | Lineage en afhankelijkheden tussen objecten. |
| `[oData]` | OData-helpers voor het exposeren van data. |
| `[LAKE]` | Slanke administratie per tabel voor de [lake feed](../concepten/lake-feed.md) — alleen hashes en datums, geen businessdata. De tabellen worden door de laadmotor zelf aangemaakt. |
| `[Test]` | De meegeleverde [regressietestsuite](./testsuite.md): framework, per-object-tests en runhistorie. |
| `[dbo]` | Algemene utilities en onderhoudsroutines. |
| `Security` | `CREATE SCHEMA`-bestanden die de runtimeschema's en rollen aanmaken (geen procs/functions). |

:::info Code zegt nog "IRIS"
Het product heet **Yres**, maar in de database staan veel identifiers nog op `IRIS` (`IRIS_DWH`, `Iris_dbreader`, het bronbestand `vwIrisChecks.sql`). Object- en kolomnamen hieronder zijn **letterlijk** zoals ze in de database voorkomen.
:::

## Stored procedures

### Schema `[LoadManagement]` — laden
`spLoadDWH` · `spHIS_InsertAndUpdate` · `spHIS_TruncateTable` · `spPrepareCopy` · `spMaterializeViews` · `spMaterializeViewToTable` · `spMaintainPersistView` · `spCheckKeyAndRowHash` · `spRegenerateSurrogateKeys` · `spGetRowCount` · `spGetColumnMapping` · `spGenerateTypeMapping` · `spFindTablesBehindSQL` · `spFillDictionary_AFAS` · `spFillDictionary_oDATA` · `spFillTable_Json` · `spFillTable_Monday` · `spMaintainSource` · `spMaintainTable` · `spMaintainFiles` · `spMaintainFilesInDictionary` · `spMaintainRestService` · `spMaintainTrigger` · `spUpdateETL_EndDate`

> `spLoadDWH` is het instappunt dat ADF aanroept nadat STAGE gevuld is; het is een **pure pass-through** naar `spHIS_InsertAndUpdate` (de oude `spUpdateETL_EndDate`-aanroep is uitgecommentarieerd — end-dating gebeurt nu binnen `spHIS_InsertAndUpdate` zelf).

### Schema `[Config]` — configuratie, logging & metadata
`spAddFrameWorkColumns` · `spCompareMetadata` · `spCreateExternalTablesFromDictionary` · `spCreateTablesFromDictionary` · `spDeleteTablesFromDB` · `spEnableColumnstore` · `spEnableMemoryOptimization` · `spFillServices_SAC` · `spGetDependenciesSQL` · `fxGetDependenciesSQL` · `spGenerateDbreader` · `spSetDatabaseParameter` · `spSetDatabaseServiceTier` · `spUpdateRefreshToken` · `spUpdateTablesFromDictionary` · `spWriteCrash` · `spWriteDump` · `spWriteError` · `spWriteFullLog` · `spWriteLog` · `spWriteMessage` · `spWriteWarning`

> De vier "message-class" schrijvers (`spWriteMessage` / `spWriteWarning` / `spWriteError` / `spWriteLog`) schrijven naar `Config.ProcessLog`. `spGenerateDbreader` (geen parameters) bouwt de databaserol **`Yres_dbreader`** opnieuw op. `fxGetDependenciesSQL` is ondanks het `fx`-voorvoegsel een **stored procedure** — de variant die `spFindTablesBehindSQL` aanroept.

### Schema `[Change]` — change management
| Procedure | Doel |
|---|---|
| `spAddScriptedObject` | Voegt een scripted object (SP/FN/trigger/view/table) toe aan een change, met dependencies. |
| `spAddTable` | Voegt een tabel + metadata (kolommen, keys, datatypes) toe aan een change. |
| `spCopyTableContent` | Kopieert data tussen tabellen met kolom-mapping/casting. |
| `spImport` | Importeert changes vanuit JSON in het change-systeem. |
| `spInstall` | Installeert een change in de doelomgeving (uitvoeren / SQL printen / impactanalyse). |
| `spMaintain` | ADD/UPDATE/DELETE van een change. |
| `spMaintainProject` | ADD/UPDATE/DELETE van een project. |
| `spRelease` | Released een change na dependency-validatie. |

### Schema `[Monitoring]` — laadstatus
`spWriteLoadStatus`

> `spWriteLoadStatus` is de centrale laadstatus-logger (16 parameters, incl. `@LatestRecord`). Hij schrijft `LS_Pipeline` (bij Start workflow/Start load) en altijd `LS_Trans`, en zet `LoadLog.LoadStatus` op RUNNING/SUCCEEDED/FAILED.

### Schema `[Maintenance]` — onderhoud & diagnostiek
`spAdaptiveIndexDefrag` · `spImplementSolution` · `spInEachDb` · `spDatabaseRestore` · `spAllNightLog` · `spAllNightLog_Setup` · `spBlitz` · `spBlitzAnalysis` · `spBlitzBackups` · `spBlitzCache` · `spBlitzFirst` · `spBlitzIndex` · `spBlitzQueryStore` · `spBlitzWho`

> De `spBlitz*`-familie is de bekende open-source SQL Server-diagnostiekset; `spAdaptiveIndexDefrag` doet het index-onderhoud.

### Schema `[Expose]` — reporting & RBAC
`spMaintainObjects` · `spMaintainRoles` · `spMaintainRoleAssignment` · `spMaintainUsers` · `spRebuildObjects`

### Schema `[dbo]` — algemeen & onderhoud
`spAdaptiveIndexDefrag_CurrentExecStats` · `spAdaptiveIndexDefrag_Exceptions` · `spAdaptiveIndexDefrag_PurgeLogs` · `spCopyDB` · `spJsonToTable` · `spLongPrint` · `spMSForEachTable` · `spMSForEachWorker` · `spRunSQL`

## Functions

### `[LoadManagement]`
`fxExtractor` · `fxGetActualTablename` · `fxGetDataType` · `fxGetKeyColumns` · `fxGetKeyHashColumns` · `fxGetRowColumns` · `fxGetRowHashColumns` · `fxGetOptimized` · `fxGetStoreType` · `fxGetSurrogate` · `fxPredictKeyColumns` · `fxPredictTableName`

> `fxExtractor` `(@LoadFilter, @LoadType)` is de hartfunctie achter `vwExtractor`: per actieve brontabel bouwt hij het extract-commando, de doelschema's, het `DeltaScript` en de `PackageSize`. Let op: `PackageSize` is een **outputkolom**, geen parameter.

### `[Config]`
`fxAddTryCatch` · `fxGetSchemaName` · `fxGetSession` · `fxGetSetting`

> `fxGetSchemaName(@Target, 'HIS'|'STAGE')` lost het runtimeschema op (standaard `ODS` voor HIS, `STAGE` voor STAGE). `fxGetSetting(@SettingName)` leest `Config.Settings`.

### `[Change]`
`fxGetChangeIsOpen` · `fxGetLastestChangeIdFor` · `fxGetLatestOpenChange` · `fxGetReleasedJson` · `fxGetTableDefinition` · `fxGetTableTypeDefinition` · `fxMockDelete` · `fxPossibleChanges`

> De naam `fxGetLastestChangeIdFor` is **bewust letterlijk** zo overgenomen — de code zelf bevat de typefout "Lastest".

### `[dbo]`
`fxGeneratePassword` · `fxGetJsonCollection` · `fxGetJsonCollections` · `fxRemoveNonAlphaCharacters` · `fxStripCharacters` · `fxToDecimal` · `fxToProper` · `fxToReadableSize` · `fxUNIXtoDateTime` · `fxUTC2CET` · `UNQUOTENAME`

### `[Metadata]` — lineage
`fxColumnUsage` · `fxGetDependencies` · `fxGetObjectTree` · `fxGetReferencedObjects` · `fxGetViewSources` · `fxGetViewSourcesRecursive`

### `[Expose]`
`fxGenerateDefinitions`

### `[oData]` / `[Monitoring]`
`oData.fxBaseResponse` · `oData.fxMetadataResponse` · `Monitoring.fxGetTableLoads`

## Views

### `[Monitoring]`
`vwLoads` · `vwMonitor` · `vwWorkflow` · `vwUsedTables` · `vwHisTableSize` · `vwAccessManagement` · `vwUserManagement` · `vwObjectAlterations`

> **`vwLoads`** = de per-pipeline laadtijdlijn; **`vwMonitor`** = breder (incl. gematerialiseerde views en Power BI-refreshes). De drie `vw*Management`/`vwObjectAlterations`-views komen uit `Config.EventLog`.

### `[LoadManagement]`
`vwExtractor` · `vwDictionary` · `vwInitialDictionary` · `vwLatestLoad` · `vwUsedTables` · `vwUsedColumns` · `vwUsedODSTablesAndColumns` · `vwUnusedTables` · `vwViewPersistence` · `vwViewsAndColumns` · gegenereerde `<Target>_IncArchive`-archiefviews

> `vwExtractor` is het contract dat ADF leest om te bepalen wat geladen moet worden: `SELECT * FROM [LoadManagement].[fxExtractor](NULL, NULL)`.

### `[Config]`
`vwSettings` · `vwUserlog` · `vwUserLogJSON` · `vwObjectHistory` · `vwDictionaryVsHis` · `vwDictionaryVsStage`

### `[Metadata]`
`vwObjectTree` · `vwParameters` · `vwScriptedObjects` · `vwUserObjects` · `vwCustomSchemas`

### `[Maintenance]`
`vwYresChecks`

:::note Gezondheidschecks-view
De health-check-view is **`[Maintenance].[vwYresChecks]`**. Het bronbestand heet nog `vwIrisChecks.sql`, maar het aangemaakte object is `vwYresChecks`. Deze view bevat het verwachte roster van instellingen en checks dat de webapp uitleest.
:::

## Logtabellen

De monitoringviews lezen uit deze ruwe logtabellen:

| Tabel | Inhoud |
|---|---|
| `[Monitoring].[LS_Pipeline]` | Eén rij per pipeline-run (bevat o.a. `LatestRecord`, `ETLDate`). |
| `[Monitoring].[LS_Trans]` | Eén rij per micro-stap — de hoogvolume-tijdlijn die de pivotviews voeden. |
| `[LoadManagement].[LoadLog]` | Duurzame status per tabel-load (RUNNING/SUCCEEDED/FAILED); join-ruggengraat van `vwMonitor`. |
| `[Config].[ProcessLog]` | App-/proc-log (berichten en fouten). |
| `[Config].[EventLog]` | DDL-/permissie-audit (bron van de access-/user-/object-views). |

:::note Verouderde view-namen
`[Monitoring].[vwLoadMonitor]` **bestaat niet** als gedeployde view. Gebruik in plaats daarvan **`vwLoads`** (pipeline-tijdlijn) of **`vwMonitor`** (breder). Verwijs nieuwe documentatie en queries naar deze twee.
:::
