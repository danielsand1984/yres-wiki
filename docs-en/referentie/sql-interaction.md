---
sidebar_position: 2
title: SQL Interaction (reference)
description: Stored procedures, functions and views — management via a SQL endpoint.
---

# SQL Interaction

Yres databases can be managed via a **SQL endpoint** (SSMS, Azure Data Studio). **Advice: use the web app for most functions.** Some features are only available via SQL, and without a frontend subscription the SQL endpoint keeps existing sources available. **Adding new sources is not possible via SQL.**

:::tip Full reference
This page is the **catalog** (names + short description). The full **purpose, inputs and outputs per object** can be found at:
- [Stored procedures](./sql/stored-procedures.md) — all 64 procedures
- [Functions](./sql/functions.md) — all 35 functions
- [Logs & views](./sql/logs-views.md) — log tables + all 17 views with output columns
:::

## Stored procedures

### Schema `[Change]` — change management
| Procedure | Purpose |
|---|---|
| `spAddScriptedObject` | Adds a scripted object (SP/FN/trigger/view/table) to a change, with dependencies. |
| `spAddTable` | Adds a table + metadata (columns, keys, data types) to a change. |
| `spCopyTableContent` | Copies data between tables with column mapping/casting. |
| `spImport` | Imports changes from JSON into the change system. |
| `spInstall` | Installs a change in the target environment (execute / print SQL / impact analysis). |
| `spMaintain` | ADD/UPDATE/DELETE of a change. |
| `spMaintainProject` | ADD/UPDATE/DELETE of a project. |
| `spRelease` | Releases a change after dependency validation. |

### Schema `[Config]` — configuration & metadata
`spAddFrameWorkColumns` · `spCompareMetadata` · `spCreateExternalTablesFromDictionary` · `spCreateTablesFromDictionary` · `spDeleteTablesFromDB` · `spEnableColumnstore` · `spEnableMemoryOptimization` · `spFillServices_SAC` · `spGetDependenciesSQL` · `spSetDatabaseParameter` · `spSetDatabaseServiceTier` · `spUpdateRefreshToken` · `spUpdateTablesFromDictionary` · `spWriteCrash` · `spWriteDump` · `spWriteError` · `spWriteFullLog` · `spWriteLog` · `spWriteMessage` · `spWriteWarning`

### Schema `[dbo]` — general & maintenance
`spAdaptiveIndexDefrag_CurrentExecStats` · `spAdaptiveIndexDefrag_Exceptions` · `spAdaptiveIndexDefrag_PurgeLogs` · `spCopyDB` · `spJsonToTable` · `spLongPrint` · `spMSForEachTable` · `spMSForEachWorker` · `spRunSQL`

### Schema `[LoadManagement]` — loading
`spCheckKeyAndRowHash` · `spFillDictionary_AFAS` · `spFillDictionary_oDATA` · `spFillTable_Json` · `spFillTable_Monday` · `spFindTablesBehindSQL` · `spGenerateTypeMapping` · `spGetColumnMapping` · `spGetRowCount` · `spHIS_InsertAndUpdate` · `spHIS_TruncateTable` · `spLoadDWH` · `spMaintainFiles` · `spMaintainFilesInDictionary` · `spMaintainPersistView` · `spMaintainRestService` · `spMaintainSource` · `spMaintainTable` · `spMaintainTrigger` · `spMaterializeViews` · `spMaterializeViewToTable` · `spPrepareCopy` · `spRegenerateSurrogateKeys`

### Other
`[Monitoring].[spWriteLoadStatus]` · `config.spGenerateDbreader`

## Functions

### `[Change]`
`fxGetChangeIsOpen` · `fxGetLaspageChangeIdFor` · `fxGetLapageOpenChange` · `fxGetReleasedJson` · `fxGetTableDefinition` · `fxGetTableTypeDefinition`

### `[Config]`
`fxAddTryCatch` · `fxGetSchemaName` · `fxGetSession` · `fxGetSetting`

### `[dbo]`
`fxGeneratePassword` · `fxGetJsonCollection` · `fxRemoveNonAlphaCharacters` · `fxStripCharacters` · `fxToDecimal` · `fxToProper` · `fxUNIXtoDateTime` · `fxUTC2`

### `[LoadManagement]`
`fxGetActualTablename` · `fxGetDataType` · `fxGetKeyColumns` · `fxGetKeyHashColumns` · `fxGetOptimized` · `fxGetRowColumns` · `fxGetRowHashColumns` · `fxGetStoreType` · `fxGetSurrogate` · `fxPredictKeyColumns` · `fxPredictTableName` · `fxExtractor`

### `[oData]` / `[Metadata]` / `[Monitoring]`
`oData.fxBaseResponse` · `oData.fxMetadataResponse` · `Metadata.fxGetViewSources` · `Metadata.fxGetViewSourcesRecursive` · `Monitoring.fxGetTableLoads`

## Views

### `[Monitoring]`
`vwLoadMonitor` *(replaced by `vwMonitor`)* · `vwMonitor` · `vwUsedTables` · `vwLoads` · `vwWorkflow`

### `[LoadManagement]`
`vwDictionary` · `vwUsedTables` · `vwExtractor` · `vwArchivingExtractor` · `vwUnusedTables` · `vwUsedColumns` · `vwUsedODSTablesAndColumns` · `vwViewPersistence` · `vwViewsAndColumns`

### `[Config]`
`vwUserlog` · `vwUserLogJSON` · `vwDictionaryVsHis` · `vwDictionaryVsStage`

:::warning Breaking change
`[Monitoring].[LoadMonitor]` has been replaced by `[Monitoring].[Monitor]` (v1.51). The old view was removed after v1.53 — reference `[Monitoring].[Monitor]`.
:::
