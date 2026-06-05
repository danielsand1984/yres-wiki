---
sidebar_position: 2
title: SQL Interaction (referentie)
description: Stored procedures, functions en views — beheer via een SQL-endpoint.
---

# SQL Interaction

Yres-databases zijn te beheren via een **SQL-endpoint** (SSMS, Azure Data Studio). **Advies: gebruik voor de meeste functies de webapp.** Sommige features zijn alleen via SQL beschikbaar, en zonder frontend-abonnement houdt het SQL-endpoint bestaande bronnen beschikbaar. **Nieuwe bronnen toevoegen kan niet via SQL.**

:::tip Volledige referentie
Deze pagina is de **catalogus** (namen + korte omschrijving). De volledige **purpose, inputs en outputs per object** staan op:
- [Stored procedures](./sql/stored-procedures.md) — alle 64 procedures
- [Functions](./sql/functions.md) — alle 35 functions
- [Logs & views](./sql/logs-views.md) — logtabellen + alle 17 views met output-kolommen
:::

## Stored procedures

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

### Schema `[Config]` — configuratie & metadata
`spAddFrameWorkColumns` · `spCompareMetadata` · `spCreateExternalTablesFromDictionary` · `spCreateTablesFromDictionary` · `spDeleteTablesFromDB` · `spEnableColumnstore` · `spEnableMemoryOptimization` · `spFillServices_SAC` · `spGetDependenciesSQL` · `spSetDatabaseParameter` · `spSetDatabaseServiceTier` · `spUpdateRefreshToken` · `spUpdateTablesFromDictionary` · `spWriteCrash` · `spWriteDump` · `spWriteError` · `spWriteFullLog` · `spWriteLog` · `spWriteMessage` · `spWriteWarning`

### Schema `[dbo]` — algemeen & onderhoud
`spAdaptiveIndexDefrag_CurrentExecStats` · `spAdaptiveIndexDefrag_Exceptions` · `spAdaptiveIndexDefrag_PurgeLogs` · `spCopyDB` · `spJsonToTable` · `spLongPrint` · `spMSForEachTable` · `spMSForEachWorker` · `spRunSQL`

### Schema `[LoadManagement]` — laden
`spCheckKeyAndRowHash` · `spFillDictionary_AFAS` · `spFillDictionary_oDATA` · `spFillTable_Json` · `spFillTable_Monday` · `spFindTablesBehindSQL` · `spGenerateTypeMapping` · `spGetColumnMapping` · `spGetRowCount` · `spHIS_InsertAndUpdate` · `spHIS_TruncateTable` · `spLoadDWH` · `spMaintainFiles` · `spMaintainFilesInDictionary` · `spMaintainPersistView` · `spMaintainRestService` · `spMaintainSource` · `spMaintainTable` · `spMaintainTrigger` · `spMaterializeViews` · `spMaterializeViewToTable` · `spPrepareCopy` · `spRegenerateSurrogateKeys`

### Overig
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
`vwLoadMonitor` *(vervangen door `vwMonitor`)* · `vwMonitor` · `vwUsedTables` · `vwLoads` · `vwWorkflow`

### `[LoadManagement]`
`vwDictionary` · `vwUsedTables` · `vwExtractor` · `vwArchivingExtractor` · `vwUnusedTables` · `vwUsedColumns` · `vwUsedODSTablesAndColumns` · `vwViewPersistence` · `vwViewsAndColumns`

### `[Config]`
`vwUserlog` · `vwUserLogJSON` · `vwDictionaryVsHis` · `vwDictionaryVsStage`

:::warning Breaking change
`[Monitoring].[LoadMonitor]` is vervangen door `[Monitoring].[Monitor]` (v1.51). De oude view is na v1.53 verwijderd — verwijs naar `[Monitoring].[Monitor]`.
:::
