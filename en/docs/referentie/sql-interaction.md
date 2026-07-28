---
sidebar_position: 4
title: SQL Interaction (reference)
description: Catalog of stored procedures, functions and views in IRIS_DWH — management through a SQL endpoint.
---

# SQL Interaction

Every Yres database (`IRIS_DWH`) can be managed through a **SQL endpoint** (SSMS, Azure Data Studio). **Recommendation: use the webapp for most tasks.** Some functions are only available through SQL, and without a frontend subscription the SQL endpoint keeps existing sources available. **Adding new sources via SQL is not possible** — that always goes through the wizard in the webapp (which generates the corresponding ADF pipelines).

:::tip This page is the catalog
Below are the **names per schema** with a short description. The full **purpose, inputs and outputs per object** are on the detail pages:

- [Stored procedures](./sql/stored-procedures.md) — all 108 procedures
- [Functions](./sql/functions.md) — all 58 functions
- [Logs & views](./sql/logs-views.md) — log tables + all 48 views with output columns
:::

## Overview: schemas and counts

`IRIS_DWH` contains **108 stored procedures, 58 functions and 48 views**, spread across these schemas:

| Schema | Role |
|---|---|
| `[LoadManagement]` | The load engine: sources, tables, STAGE→HIS merge (SCD2), materialization. |
| `[Config]` | Settings (`Settings`), logging, metadata maintenance, database tuning. |
| `[Change]` | Change management for DTAP (projects, changes, release, install). |
| `[Monitoring]` | Load-status logging (`LS_Pipeline`, `LS_Trans`) and monitoring views. |
| `[Maintenance]` | Index maintenance, sp_Blitz diagnostics, health checks. |
| `[Expose]` | Reporting/RBAC: managing roles, users and exposed objects. |
| `[Metadata]` | Lineage and dependencies between objects. |
| `[oData]` | OData helpers for exposing data. |
| `[LAKE]` | Slim per-table bookkeeping for the [lake feed](../concepten/lake-feed.md) — hashes and dates only, no business data. The tables are created by the load engine itself. |
| `[Test]` | The bundled [regression test suite](./testsuite.md): framework, per-object tests and run history. |
| `[dbo]` | General utilities and maintenance routines. |
| `Security` | `CREATE SCHEMA` files that create the runtime schemas and roles (no procs/functions). |

:::info Code still says "IRIS"
The product is called **Yres**, but in the database many identifiers still read `IRIS` (`IRIS_DWH`, `Iris_dbreader`, the source file `vwIrisChecks.sql`). The object and column names below are **literally** as they appear in the database.
:::

## Stored procedures

### Schema `[LoadManagement]` — loading
`spLoadDWH` · `spHIS_InsertAndUpdate` · `spHIS_TruncateTable` · `spPrepareCopy` · `spMaterializeViews` · `spMaterializeViewToTable` · `spMaintainPersistView` · `spCheckKeyAndRowHash` · `spRegenerateSurrogateKeys` · `spGetRowCount` · `spGetColumnMapping` · `spGenerateTypeMapping` · `spFindTablesBehindSQL` · `spFillDictionary_AFAS` · `spFillDictionary_oDATA` · `spFillTable_Json` · `spFillTable_Monday` · `spMaintainSource` · `spMaintainTable` · `spMaintainFiles` · `spMaintainFilesInDictionary` · `spMaintainRestService` · `spMaintainTrigger` · `spUpdateETL_EndDate`

> `spLoadDWH` is the entry point that ADF calls once STAGE has been filled; it is a **pure pass-through** to `spHIS_InsertAndUpdate` (the old `spUpdateETL_EndDate` call is commented out — end-dating now happens inside `spHIS_InsertAndUpdate` itself).

### Schema `[Config]` — configuration, logging & metadata
`spAddFrameWorkColumns` · `spCompareMetadata` · `spCreateExternalTablesFromDictionary` · `spCreateTablesFromDictionary` · `spDeleteTablesFromDB` · `spEnableColumnstore` · `spEnableMemoryOptimization` · `spFillServices_SAC` · `spGetDependenciesSQL` · `fxGetDependenciesSQL` · `spGenerateDbreader` · `spSetDatabaseParameter` · `spSetDatabaseServiceTier` · `spUpdateRefreshToken` · `spUpdateTablesFromDictionary` · `spWriteCrash` · `spWriteDump` · `spWriteError` · `spWriteFullLog` · `spWriteLog` · `spWriteMessage` · `spWriteWarning`

> The four "message-class" writers (`spWriteMessage` / `spWriteWarning` / `spWriteError` / `spWriteLog`) write to `Config.ProcessLog`. `spGenerateDbreader` (no parameters) rebuilds the database role **`Yres_dbreader`**. Despite the `fx` prefix, `fxGetDependenciesSQL` is a **stored procedure** — the variant that `spFindTablesBehindSQL` calls.

### Schema `[Change]` — change management
| Procedure | Purpose |
|---|---|
| `spAddScriptedObject` | Adds a scripted object (SP/FN/trigger/view/table) to a change, with dependencies. |
| `spAddTable` | Adds a table + metadata (columns, keys, data types) to a change. |
| `spCopyTableContent` | Copies data between tables with column mapping/casting. |
| `spImport` | Imports changes from JSON into the change system. |
| `spInstall` | Installs a change into the target environment (execute / print SQL / impact analysis). |
| `spMaintain` | ADD/UPDATE/DELETE of a change. |
| `spMaintainProject` | ADD/UPDATE/DELETE of a project. |
| `spRelease` | Releases a change after dependency validation. |

### Schema `[Monitoring]` — load status
`spWriteLoadStatus`

> `spWriteLoadStatus` is the central load-status logger (16 parameters, incl. `@LatestRecord`). It writes `LS_Pipeline` (on Start workflow/Start load) and always `LS_Trans`, and sets `LoadLog.LoadStatus` to RUNNING/SUCCEEDED/FAILED.

### Schema `[Maintenance]` — maintenance & diagnostics
`spAdaptiveIndexDefrag` · `spImplementSolution` · `spInEachDb` · `spDatabaseRestore` · `spAllNightLog` · `spAllNightLog_Setup` · `spBlitz` · `spBlitzAnalysis` · `spBlitzBackups` · `spBlitzCache` · `spBlitzFirst` · `spBlitzIndex` · `spBlitzQueryStore` · `spBlitzWho`

> The `spBlitz*` family is the well-known open-source SQL Server diagnostics set; `spAdaptiveIndexDefrag` handles the index maintenance.

### Schema `[Expose]` — reporting & RBAC
`spMaintainObjects` · `spMaintainRoles` · `spMaintainRoleAssignment` · `spMaintainUsers` · `spRebuildObjects`

### Schema `[dbo]` — general & maintenance
`spAdaptiveIndexDefrag_CurrentExecStats` · `spAdaptiveIndexDefrag_Exceptions` · `spAdaptiveIndexDefrag_PurgeLogs` · `spCopyDB` · `spJsonToTable` · `spLongPrint` · `spMSForEachTable` · `spMSForEachWorker` · `spRunSQL`

## Functions

### `[LoadManagement]`
`fxExtractor` · `fxGetActualTablename` · `fxGetDataType` · `fxGetKeyColumns` · `fxGetKeyHashColumns` · `fxGetRowColumns` · `fxGetRowHashColumns` · `fxGetOptimized` · `fxGetStoreType` · `fxGetSurrogate` · `fxPredictKeyColumns` · `fxPredictTableName`

> `fxExtractor` `(@LoadFilter, @LoadType)` is the core function behind `vwExtractor`: for each active source table it builds the extract command, the target schemas, the `DeltaScript` and the `PackageSize`. Note: `PackageSize` is an **output column**, not a parameter.

### `[Config]`
`fxAddTryCatch` · `fxGetSchemaName` · `fxGetSession` · `fxGetSetting`

> `fxGetSchemaName(@Target, 'HIS'|'STAGE')` resolves the runtime schema (default `ODS` for HIS, `STAGE` for STAGE). `fxGetSetting(@SettingName)` reads `Config.Settings`.

### `[Change]`
`fxGetChangeIsOpen` · `fxGetLastestChangeIdFor` · `fxGetLatestOpenChange` · `fxGetReleasedJson` · `fxGetTableDefinition` · `fxGetTableTypeDefinition` · `fxMockDelete` · `fxPossibleChanges`

> The name `fxGetLastestChangeIdFor` was kept **literally on purpose** — the code itself contains the typo "Lastest".

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

> **`vwLoads`** = the per-pipeline load timeline; **`vwMonitor`** = broader (incl. materialized views and Power BI refreshes). The three `vw*Management`/`vwObjectAlterations` views come from `Config.EventLog`.

### `[LoadManagement]`
`vwExtractor` · `vwDictionary` · `vwInitialDictionary` · `vwLatestLoad` · `vwUsedTables` · `vwUsedColumns` · `vwUsedODSTablesAndColumns` · `vwUnusedTables` · `vwViewPersistence` · `vwViewsAndColumns` · generated `<Target>_IncArchive` archive views

> `vwExtractor` is the contract ADF reads to determine what needs to be loaded: `SELECT * FROM [LoadManagement].[fxExtractor](NULL, NULL)`.

### `[Config]`
`vwSettings` · `vwUserlog` · `vwUserLogJSON` · `vwObjectHistory` · `vwDictionaryVsHis` · `vwDictionaryVsStage`

### `[Metadata]`
`vwObjectTree` · `vwParameters` · `vwScriptedObjects` · `vwUserObjects` · `vwCustomSchemas`

### `[Maintenance]`
`vwYresChecks`

:::note Health-checks view
The health-check view is **`[Maintenance].[vwYresChecks]`**. The source file is still named `vwIrisChecks.sql`, but the created object is `vwYresChecks`. This view contains the expected roster of settings and checks that the webapp reads out.
:::

## Log tables

The monitoring views read from these raw log tables:

| Table | Contents |
|---|---|
| `[Monitoring].[LS_Pipeline]` | One row per pipeline run (contains e.g. `LatestRecord`, `ETLDate`). |
| `[Monitoring].[LS_Trans]` | One row per micro-step — the high-volume timeline that feeds the pivot views. |
| `[LoadManagement].[LoadLog]` | Durable status per table load (RUNNING/SUCCEEDED/FAILED); join backbone of `vwMonitor`. |
| `[Config].[ProcessLog]` | App/proc log (messages and errors). |
| `[Config].[EventLog]` | DDL/permission audit (source of the access/user/object views). |

:::warning Outdated view names
`[Monitoring].[vwLoadMonitor]` **does not exist** as a deployed view. Use **`vwLoads`** (pipeline timeline) or **`vwMonitor`** (broader) instead. Point new documentation and queries at these two.
:::
