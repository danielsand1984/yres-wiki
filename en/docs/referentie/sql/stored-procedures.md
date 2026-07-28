---
sidebar_position: 1
title: Stored procedures
description: Reference for the stored procedures in the IRIS_DWH database, per schema, with parameters and purpose.
---

> Management is best done through the Yres web app. These objects are the SQL layer underneath; you query or call them directly via the SQL endpoint (SSMS / Azure Data Studio).

This page describes the stored procedures in the data-plane database **`IRIS_DWH`**. The names are taken verbatim from the live repository; in code, the product is still called **IRIS** in many places. The content was regenerated from the source code (the code takes precedence over older documentation).

The database contains **108 stored procedures, 58 functions, and 48 views** (counted on the deploy source, July 2026). Functions are documented in [Functions](./functions.md); log tables and views in [Logs & views](./logs-views.md).

:::note Schema overview
The procedures are spread across the schemas `LoadManagement` (the load engine), `Config` (settings, logging, DB tuning), `Change` (DTAP change management), `Monitoring` (load-status logging), `Maintenance` (maintenance, health checks), `Expose` (reporting RBAC), and `dbo` (helper procedures).
:::

---

## LoadManagement — the load engine

The `LoadManagement` schema contains the core of Yres: the procedures that merge `STAGE` into `HIS` (SCD2), prepare the workload, and maintain the metadata.

### `[LoadManagement].[spLoadDWH]`

**Purpose:** The entry point that ADF calls once `STAGE` has been filled. It is a **thin pass-through**: the procedure simply calls `[LoadManagement].[spHIS_InsertAndUpdate]` and forwards the five parameters one-to-one.

**Parameters:**

- `@Target (NVARCHAR(MAX), default NULL)`: The target table.
- `@Pipeline_ID (NVARCHAR(MAX), default 1)`: ID of the ADF pipeline.
- `@Execute (BIT, default 0)`: `1` = execute, `0` = only print the generated SQL.
- `@DeltaColumn (NVARCHAR(MAX), default '')`: The column used for delta detection (empty string as default, not NULL).
- `@TableLoadType (NVARCHAR(MAX), default NULL)`: The load type (e.g. `FULL`, `DELTA`).

:::warning No separate end-dating anymore
`spLoadDWH` does **not** call `[LoadManagement].[spUpdateETL_EndDate]` (anymore): that second call is **commented out** ("Update ETL Enddate not required anymore"). End-dating of rows now happens inside `spHIS_InsertAndUpdate` itself, in the `@LatestRecord` UPDATE block. So `spLoadDWH` does nothing other than pass through to `spHIS_InsertAndUpdate`.
:::

### `[LoadManagement].[spHIS_InsertAndUpdate]`

**Purpose:** The SCD2 merge engine — the heart of the load logic. For a single target, the procedure resolves source/schema/table from `UsedTables` (with a fallback to `CustomYres.Extractor`), reads `vwDictionary` for the read/write/delete columns, computes the KeyHash/RowHash columns, and **builds a large dynamic SQL string** that — depending on the load type — inserts new rows, closes off changed/disappeared rows (`isCurrent=0`, `ETL_EndDate`), deduplicates, and works through `STAGE` in pages. With `@Execute=1` it executes that SQL (wrapped by `Config.fxAddTryCatch`); otherwise it prints the SQL via `dbo.spLongPrint`.

**Parameters:** those of `spLoadDWH` (`@Target`, `@Pipeline_ID`, `@Execute`, `@DeltaColumn` (default empty string), `@TableLoadType`), plus `@LakeMode (BIT, default 0)`. With `@LakeMode = 1` the same merge targets the slim bookkeeping table of the [lake feed](../../concepten/lake-feed.md) instead of the HIS schema: no surrogate keys are generated and only the delta columns are carried. This mode is set exclusively by `spLoadLake`.

**Load types (as derived from the code, which is authoritative):** the procedure branches explicitly on six values of `@TableLoadType` — **`DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL`** — plus `FULL` as the implicit default path (the non-special path).

| Load type | Behavior in `spHIS_InsertAndUpdate` | History |
|---|---|---|
| `FULL` | Default path: insert new, version changed rows (close off the old one), leave the rest open | **kept (SCD2)** |
| `DELTA` | Like FULL but only changed records; updates `UsedTables.LatestRecord = MAX(deltaColumn)` | kept |
| `DELTAIMAGE` | DELTA + closes missing keys within the delta window | kept |
| `IMAGE` | Full snapshot: upsert + close **all** missing keys (soft-delete) | kept |
| `OVERWRITE` | Truncate HIS first via `spHIS_TruncateTable`, then insert all STAGE rows | **NONE (truncate)** |
| `RELOAD` | First close all current rows, then insert all STAGE rows | **kept (old generation closed off)** |
| `ADDITIONAL` | Pure append; also updates `LatestRecord` | kept |

:::danger Don't confuse OVERWRITE and RELOAD
Only **`OVERWRITE` deletes history** (truncate, RowId restarts). **`RELOAD` keeps history** (close-then-insert: the old generation is closed off, then the new rows are added). **`FULL` also keeps the full SCD2 history** — only `OVERWRITE` truncates.
:::

Additional behavior: pagination is setting-driven (`Config.fxGetSetting('UsePagination')`, `'PageSize'` — with the literal `OPTIMAL` → `fxGetOptimalPageSize` — and `'retryCount'`, default 3 in the proc). When `fxGetSurrogate(@Target)=1`, surrogate keys are inserted into `LoadManagement.SurrogateKeys`. With a memory-optimized STAGE (`fxGetOptimized('STAGE',…,'Real')='1'`), `spUpdateKeyAndRowHash` runs first. Every micro-step writes a row to `[Monitoring].[LS_Trans]` (e.g. `New rows`, `Delta rows`, `Closed rows`, `Inserted into Target`).

### `[LoadManagement].[spLoadLake]`

**Purpose:** The lake counterpart of `spLoadDWH`, called by the ADF step **Prepare lake load** just before `Load DWH` (only when `DataPlatform` contains `DL`). The procedure creates the slim bookkeeping table for the target if needed, stamps a start marker into `[Monitoring].[LS_Trans]` (the anchor by which *this* run's mutations are recognised) and then delegates to `spHIS_InsertAndUpdate` with `@LakeMode = 1`. For load type `ADDITIONAL` it skips the merge entirely. See [Lake feed](../../concepten/lake-feed.md).

**Parameters:** `@Target`, `@Pipeline_ID`, `@TableLoadType` (empty = from `UsedTables`), `@DeltaColumn`, `@Execute` (default `1`).

### `[LoadManagement].[spGetLakeFeed]`

**Purpose:** Hands the ADF step **Write lake feed** a single row holding `FeedQuery` (the query selecting exactly this run's mutations) and `MutationCount`. At `MutationCount = 0` ADF skips the copy step, so no empty file appears in the Data Lake. The query marks every row as `I`, `U` or `D`; deleted keys come back as a tombstone with empty business columns.

**Parameters:** `@Target`, `@Pipeline_ID` (locates the start marker), `@TableLoadType`.

### `[LoadManagement].[spResetLakeIndex]`

**Purpose:** Wipes the slim lake bookkeeping for one table or — without an argument — for all lake tables. The next load then resends the complete current dataset as `I` rows. Intended for recovery and backfill; the Parquet files already written are left alone.

**Parameters:** `@Target` (empty = all lake tables).

### `[LoadManagement].[spPrepareWorkload]`

**Purpose:** Prepares the workload by writing a row to `[LoadManagement].[LoadLog]` (the durable status per table load) for every table `fxExtractor` returns. Called by the master pipeline (Lookup "Get tables") before `vwExtractor` is read further.

**PLANNED/SKIPPED logic:** For each candidate table, the procedure checks — via `fxExtractor`'s join with `vwLatestLoad`, restricted to `LoadStatus IN ('PLANNED','RUNNING')` — whether a not-yet-finished load for that exact `Source`/`SourceSchema`/`SourceTable` already exists. If so: the new row is immediately given `LoadStatus = 'SKIPPED'` (logged, not executed — a non-concurrency guard against overlapping triggers). If not: the row gets `LoadStatus = 'PLANNED'`. Finally, the procedure dynamically builds a `SELECT` over `vwExtractor`'s columns, filtered to `WorkFlow = @Workflow AND LoadStatus = 'PLANNED'` — that is the actual work list which (when `@execute = 1`) is executed and returned to the ADF `ForEach`. See [Monitoring & logging](../monitoring-logging.md) for the full status lifecycle.

**Parameters:** `@Source`, `@SourceSchema`, `@SourceTable`, `@TriggerName`, `@Pipeline`, `@Workflow`, `@LoadType`, `@Filter` (all `NVARCHAR(1024)`), `@execute (INT, default 1 — at 0 the built SELECT is only printed, not executed)`.

### `[LoadManagement].[spPrepareCopy]`

**Purpose:** Prepares the copy/load: truncates staging tables, performs mapping lookups, and starts the load process. Logs status and errors via `[Monitoring].[spWriteLoadStatus]`.

**Parameters:** `@PipelineID`, `@Process`, `@Step`, `@Status`, `@Rows (BIGINT)`, `@WorkflowID`, `@PipelineName`, `@Started_by`, `@Target`, `@Source_system`, `@Table`, `@Schema`, `@LoadType`, **`@LatestRecord`**, `@ETL_Date (DATETIME)` (the text parameters are `NVARCHAR(255)`).

### `[LoadManagement].[spMaterializeViews]`

**Purpose:** Materializes views into tables based on the trigger mapping in `[LoadManagement].[TriggerMapping]`. Logs progress via `[Monitoring].[spWriteLoadStatus]`.

**Parameters:** `@WorkFlow`, `@PipelineName`, `@Trigger`, `@ISource` ('AUTO' or 'ALL'), `@ISchema` ('ALL' possible), `@IView` ('ALL' possible) (all `NVARCHAR(255)`), `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spMaterializeViewToTable]`

**Purpose:** Materializes one specific view into the corresponding table; supports full and delta loads. Returns the number of rows processed.

**Parameters:** `@SourceSchemaName (SYSNAME)`, `@SourceViewName (SYSNAME)`, `@execute (BIT)`, `@rows` (output, number of rows processed).

### `[LoadManagement].[spHIS_TruncateTable]`

**Purpose:** Truncates or deletes all records from a history table (`HIS`). Whether it truncates or deletes depends on whether the table is memory-optimized. Called by `OVERWRITE` loads.

**Parameters:** `@Target (NVARCHAR(MAX))`, `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spSTAGE_TruncateTable]`

**Purpose:** Empties a single staging table after a load (unless `keepStage=1`).

**Parameters:** `@Target (NVARCHAR(MAX), default NULL)`, `@Pipeline_ID (NVARCHAR(MAX), default 1)`, `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spSTAGE_TruncateAll]`

**Purpose:** Empties all staging tables at once.

**Parameters:** `@execute (BIT, default 0)`.

### `[LoadManagement].[spTruncate]`

**Purpose:** Deletes (within a transaction) all data from a given target table.

**Parameters:** `@Execute (BIT, default 1)`, `@Target (NVARCHAR(4000))`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spRollback]`

**Purpose:** Rolls back the delta of a HIS table to a specific point in time. Part of the "rollback per load" functionality.

**Parameters:** `@Execute (BIT, default 0)`, `@HIS_TABLE (NVARCHAR(1024))`, `@DateTime (DATETIME2)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spReset]`

**Purpose:** Resets a HIS table (or all tables) to the initial state of the delta administration.

**Parameters:** `@Execute (BIT, default 0)`, `@HIS_TABLE (NVARCHAR(1024), default NULL)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spUpdateETL_EndDate]`

**Purpose:** Updates the `ETL_EndDate` of closed-off rows. Still exists as a standalone procedure but is **no longer called by `spLoadDWH`** (see the warning there); end-dating now lives inside `spHIS_InsertAndUpdate`.

### `[LoadManagement].[spUpdateLatestDelta]`

**Purpose:** Updates the "Latest record" (the delta watermark) in all delta tables, or in a single specified ODS table.

**Parameters:** `@Execute (BIT, default 0)`, `@ODS_TABLE (NVARCHAR(1024), default NULL)`.

### `[LoadManagement].[spUpdateKeyAndRowHash]` / `[spUpdateKeyAndRowHash_ODS]`

**Purpose:** (Re)computes the `KeyHash` and `RowHash` columns for STAGE (or the ODS variant). Run before the merge when STAGE is memory-optimized.

**Parameters (`spUpdateKeyAndRowHash`):** `@Execute (BIT, default 0)`, `@Source (NVARCHAR(MAX))`, `@Schema (NVARCHAR(MAX))`, `@Table (NVARCHAR(MAX))`.

### `[LoadManagement].[spGetRowCount]`

**Purpose:** Returns the number of rows in a table, with a choice between an exact count and an estimated value.

**Parameters:**

- `@table (NVARCHAR(1024))`: The table to count.
- `@Exact (BIT, default NULL)`: **`NULL` (default) = return the estimated size**; `1` = exact count; `0` = only check whether the table is non-empty.
- `@Active (NCHAR(1), default 0)`: `1` = count only records with `isCurrent = 1`.

### `[LoadManagement].[spRegenerateSurrogateKeys]`

**Purpose:** Fully rebuilds the surrogate keys of one table, typically after source-data changes. The procedure first validates that the table exists in `UsedTables`, that surrogate keys are enabled for the table (`fxGetSurrogate` = 1) and that key columns are defined; `OverwriteSource`/`OverwriteSchema`/`OverwriteTable` are honoured. The rebuild is atomic: `DELETE` + `INSERT` run in a single transaction, so on failure the existing keys remain in place. `intKey` values are **reassigned** in the process; the `jsonKey` is built with the same alphabetical column order as during loading.

**Parameters:** `@Source`, `@SourceSchema`, `@SourceTable`, `@Execute (BIT, default 0 = dry run: only print the script)`, `@AppUser`.

### `[LoadManagement].[spCheckKeyAndRowHash]`

**Purpose:** Checks the integrity of key and row hashes; compares staging and history data and reports inconsistencies.

**Parameters:** `@EXECUTE (BIT, default 0)`, `@Source (NVARCHAR(MAX))`, `@Schema (NVARCHAR(MAX))`, `@Table (NVARCHAR(MAX))`, `@sampleSize (NVARCHAR(MAX), default 10)`.

### `[LoadManagement].[spGenerateTypeMapping]`

**Purpose:** Generates missing type mappings for source systems and adds them to `LoadManagement.TypeMapping` (additive — existing mappings are left untouched).

**Parameters:** `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spGetColumnMapping]`

**Purpose:** Builds a JSON object with the column mappings between source and target, used in the ETL process.

**Parameters:** `@tablename`, `@schemaname`, `@source` (`VARCHAR(256)`, optional), `@Target (NVARCHAR(MAX))`, `@Pipeline_ID (NVARCHAR(MAX), default 1)`.

### `[LoadManagement].[spFillDictionary_AFAS]` / `[spFillDictionary_oDATA]`

**Purpose:** Import metadata from an AFAS or OData source, respectively (columns + data types). Since the June 2026 hardening they write into the staging table **`LoadManagement.Dictionary_Stage`**; a separate swap step atomically promotes those rows into the live `Dictionary` (see [Metadata staging](#metadata-staging-stage-swap-and-finalize)).

**Parameters (AFAS):** `@input (ttDictionary_AFAS READONLY)`, `@source (NVARCHAR(1024))`, `@EXECUTE (BIT, default 1)`. **OData** adds `@schema (NVARCHAR(1024), default 'API')`.

### `[LoadManagement].[spFillTable_Json]` / `[spFillTable_Monday]`

**Purpose:** Fill a target table with data from JSON or Monday.com, respectively, converting the structure into tabular form.

**Parameters (`spFillTable_Json`):** `@Collection (NVARCHAR(1024))`, `@jsonTable (ttTable_JsonAdf READONLY)`, `@targetSchema`, `@targetTable`. **`spFillTable_Monday`:** `@Table (ttTable_Monday READONLY)`.

### `[LoadManagement].[spFindTablesBehindSQL]`

**Purpose:** Determines which tables a SQL query uses (dependency analysis). Uses `[Config].[fxGetDependenciesSQL]` under the hood.

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### The `spMaintain*` family

These procedures write the metadata that drives the load engine (in `LoadManagement.UsedTables`, `UsedColumns`, `SourceSystems`, `ViewPersistence`, etc.). They are called from the web app when you manage sources, tables, files, or triggers. All of them support an `@action` parameter (`ADD`, `UPDATE`, `DELETE`, sometimes `DEACTIVATE`).

| Procedure | Purpose (short) |
|---|---|
| `[LoadManagement].[spMaintainSource]` | Manages data sources in `SourceSystems` (`@action`, `@source`, `@sourceType`, `@AppUser`). |
| `[LoadManagement].[spMaintainTable]` | Manages tables (`UsedTables`/`UsedColumns`); many extra params (`@DataPlatform`, `@fieldList`, `@loadType`, …) — since v1.56 also the archiving configuration (`@ArchivingMode`, `@ArchivingColumn`, `@ArchivingRetention(+Unit)`, `@ArchivingClause`), validated against the Dictionary. |
| `[LoadManagement].[spMaintainFiles]` | Manages file sources for import. |
| `[LoadManagement].[spMaintainRestService]` | Manages REST service endpoints (`@service`, `@endpoint`, …). |
| `[LoadManagement].[spMaintainTrigger]` | Manages triggers per source/schema/table (`@action` = `ADD`/`DELETE`; `"all"`/`"ALL"` possible). |
| `[LoadManagement].[spMaintainPersistView]` | Manages view persistence in `ViewPersistence`. |
| `[LoadManagement].[spMaintainFilesInDictionary]` | Manages file metadata in `Dictionary`/`UsedColumns`. |
| `[LoadManagement].[spMaintainRestInDictionary]` | Manages REST metadata in the dictionary. |

### Archiving: verify and purge (v1.56)

See [Archiving](../../concepten/archivering.md) for the full story; these are the two procedures behind it.

#### `[LoadManagement].[spArchivePurge]`

**Purpose:** the verified purge step of archiving. The `Dynamic Archiving Workflow YRES` calls this procedure per table after a successful Copy-to-Parquet, passing exactly the same archiving condition (the `ArchivingScript`) and the number of copied rows. The procedure recounts how many rows match the condition and deletes **only on an exact match** — in batches, and double-gated by the settings `ArchivingPurgeEnabled` and `AllowDeletesFromDB` (switch off = clean copy-only run, not an error). If the counts differ, nothing is deleted and the step fails visibly via `spWriteLoadStatus`.

#### `[LoadManagement].[spArchiveMaintainView]`

**Purpose:** after every successful archive copy, refreshes the per-table union view `[<HIS schema>].[<Target>_IncArchive]` (live table `UNION ALL` archived Parquet via data virtualization / `OPENROWSET`, deduplicated on the `RowID` with precedence for live). Idempotently creates the required credential and external data source (`YresArchiveLake`, from the `ArchiveLakeLocation` setting). This procedure must never block archiving: every error is logged and swallowed (e.g. while the Data Lake permissions for SQL are not yet in place).

### Metadata staging: stage, swap, and finalize

The `GetMetaData - <source>` pipelines refresh the source metadata: the columns (the **dictionary**) and — for SAC — the **services**. Since the June 2026 hardening, the fill procedures (`spFillDictionary_oDATA`/`_AFAS`, `spFillServices_SAC`) no longer write straight into the live table, but first into a **staging table** (`LoadManagement.Dictionary_Stage`, `Config.Services_Stage`). Only after a successful, non-empty Copy is the live partition **atomically swapped**. Benefits: a failed or partial refresh leaves the existing metadata intact (no more empty columns), and the same refresh can never half-overwrite the live table.

| Procedure | Purpose |
|---|---|
| `[LoadManagement].[spClearDictionaryStage]` | Empties `Dictionary_Stage` for a source before the Copy. Params: `@Source`, `@SourceSchema (default NULL)`, `@SourceTable (default NULL)`. |
| `[LoadManagement].[spSwapDictionary]` | After the Copy, atomically replaces the source's live `Dictionary` rows (`XACT_ABORT` + `TRAN`) from stage. **Zero-row guard:** with 0 staged rows the swap is skipped and a `WARNING` is logged; live is left untouched. Params: `@Source`, `@PipelineID (default NULL)`, `@SourceSchema (default NULL)`, `@SourceTable (default NULL)`. |
| `[LoadManagement].[spFinalizeDictionary]` | Finalizes a per-part load: removes live rows whose `(SourceSchema, SourceTable)` combination no longer appears in stage (vanished parts), then clears the stage partition. Param: `@Source`. |
| `[Config].[spClearServicesStage]` | Like `spClearDictionaryStage`, but for `Services_Stage` (SAC). Params: `@SourceSystem`, `@ServiceNamePrefix (default NULL)`. |
| `[Config].[spSwapServices]` | Swaps the live `Config.Services` rows from stage; same zero-row guard and transaction. Params: `@SourceSystem`, `@PipelineID (default NULL)`, `@ServiceNamePrefix (default NULL)` (namespace scope). |
| `[Config].[spFinalizeServices]` | Finalizes a per-namespace SAC load: removes vanished `ServiceName` rows and clears stage. Param: `@SourceSystem`. |

:::note Whole source vs. per part (per-part)
Call `spSwapDictionary`/`spSwapServices` **without** scope parameters and the whole source is swapped in one go and stage is cleared. Pass a `@SourceSchema`/`@SourceTable` (or `@ServiceNamePrefix`) and **only that partition** is swapped, with stage left in place for the closing `Finalize` step. The seven loop-oriented GetMetaData pipelines (ExactOnline, AFAS, SAC, NetSuite, Monday, SAP_BDC, Salesforce) use that per-part variant: they swap **per loop iteration**, so one failing partial extraction no longer blocks the entire metadata refresh — the successful parts land in live immediately. The swap procedures **surface errors to ADF**: unlike most DWH procedures, they roll back the live table and let the pipeline fail.
:::

---

## Config — settings, logging, and DB tuning

### `[Config].[spAddFrameWorkColumns]`

**Purpose:** Adds the framework columns (`ETL_Date`, `KeyHash`, `RowHash`) to a staging table.

**Parameters:** `@Execute (BIT, default 0)`, `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[Config].[spCreateTablesFromDictionary]` / `[spUpdateTablesFromDictionary]` / `[spDeleteTablesFromDB]` / `[spCreateExternalTablesFromDictionary]`

**Purpose:** Create, update, delete, or generate as external tables the DWH tables based on the dictionary metadata.

**Parameters (shared):** `@Execute (BIT, default 0)`, `@SelectedSource`, `@SelectedSchema`, `@SelectedTable` (all `NVARCHAR(MAX), default 'NoneSelected'`), `@AppUser`. `spUpdateTablesFromDictionary` adds: `@Methods` (`ADD`/`REMOVE`/`UPDATE`), `@Stage (BIT)`, `@HIS (BIT)`.

### `[Config].[spCompareMetadata]`

**Purpose:** Compares the current metadata with the stored metadata and fills `Config.MetadataComparison` with the differences (missing/removed columns, type mismatches). No parameters.

### `[Config].[spEnableColumnstore]`

**Purpose:** Enables a columnstore index on existing tables for faster analytical queries.

**Parameters:** `@Execute (BIT)`, `@Schema (NVARCHAR(50), default 'BOTH')` (`HIS`, `STAGE`, or `BOTH`), `@Table (NVARCHAR(1024))`.

### `[Config].[spEnableMemoryOptimization]`

**Purpose:** Turns on memory optimization in the database (adds a `MEMORY_OPTIMIZED_DATA` filegroup).

**Parameters:** `@Execute (BIT, default 1)`.

### `[Config].[spApplyDbSettings]`

**Purpose:** Applies the database settings stored in `Config.Settings` (including collation/case-sensitivity).

**Parameters:** `@overwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Config].[spSetDatabaseParameter]`

**Purpose:** Sets a single database parameter to a value.

**Parameters:** `@Execute (BIT, default 0)`, `@Parameter (NVARCHAR(256))`, `@Setting (NVARCHAR(256))`.

### `[Config].[spSetDatabaseServiceTier]`

**Purpose:** Changes the Azure SQL service tier (scales the database up/down). Called in the master pipeline around a load.

**Parameters:** `@toTier (NVARCHAR(250), default 'Default')`, `@requestor (NVARCHAR(1024), default 'Unknown')`, `@AppUser (NVARCHAR(1024), default '')`, `@EXECUTE (BIT, default 1)`.

### `[Config].[spUpdateRefreshToken]`

**Purpose:** Updates the refresh and access tokens in the tokens table (for API authentication).

**Parameters:** `@Source (NVARCHAR(4000))`, `@RefreshToken (NVARCHAR(4000))`, `@AccessToken (NVARCHAR(4000))`, `@ExpirationTime (INT, default 10)`.

### `[Config].[spFillServices_SAC]`

**Purpose:** Imports SAC (SAP Analytics Cloud) providers into the **staging table `Config.Services_Stage`**; a swap step promotes them into the live `Config.Services` (see [Metadata staging](#metadata-staging-stage-swap-and-finalize)).

**Parameters:** `@input (ttServices_SAC READONLY)`, `@source (NVARCHAR(1024))`, `@Execute (BIT, default 1)`.

### `[Config].[spGetDependenciesSQL]`

**Purpose:** Analyzes a `SELECT` statement and determines which tables/views/objects it uses (temporarily turns it into a view and reads the dependencies via `Metadata.fxGetDependencies`).

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### `[Config].[fxGetDependenciesSQL]`

**Purpose:** Despite the `fx` prefix a **stored procedure** (not a function). Same behaviour as `spGetDependenciesSQL`; this is the variant that `[LoadManagement].[spFindTablesBehindSQL]` calls. Part of the deploy again since July 2026 (the procedure used to be missing from the source, which broke `spFindTablesBehindSQL`).

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### `[Config].[spGenerateDbreader]`

**Purpose:** (Re)builds the database role **`Yres_dbreader`**: drops and recreates the role, adds it to `db_datareader`, and then places `DENY` statements on internal schemas/objects plus `DENY INSERT/UPDATE/DELETE` on the HIS schema (`Config.fxGetSetting('SchemaHIS')`). Existing role members are re-added. **No parameters.**

### The `Config.spWrite*` logging family

All of the below write to `Config.ProcessLog`. The "message-class" writers (`spWriteMessage`, `spWriteWarning`) share an identical **10-parameter block**.

#### `[Config].[spWriteMessage]` and `[Config].[spWriteWarning]`

**Purpose:** Log an informational message and a warning, respectively. The `returnCode` level is hard-coded into the procedure, so it is *not* a parameter.

**Parameters (10, identical for both):**

- `@processID (UNIQUEIDENTIFIER)`
- `@spName (NVARCHAR(4000))`
- `@spStep (NVARCHAR(4000))`
- `@spCall (NVARCHAR(MAX))`
- `@appUser (NVARCHAR(4000))`
- `@message1 (NVARCHAR(4000))`
- `@message2 (NVARCHAR(4000), default NULL)`
- `@message3 (NVARCHAR(4000), default NULL)`
- `@message4 (NVARCHAR(4000), default NULL)`
- `@dbRequest (NVARCHAR(MAX), default NULL)`

#### `[Config].[spWriteError]`

**Purpose:** Logs an error to `Config.ProcessLog`.

**Parameters:** the 10-parameter block of `spWriteMessage` **plus** the error fields `@errorLine (INT, default NULL)`, `@errorMessage (NVARCHAR(4000), default NULL)`, `@errorNumber (INT, default NULL)`, **`@errorPrecedure (NVARCHAR(4000), default NULL)`**, `@errorSeverity (INT, default NULL)`, `@errorState (INT, default NULL)`.

:::note `errorPrecedure` is not a typo in the wiki
The column/parameter is named literally `errorPrecedure` (sic) in both the procedure and the `ProcessLog` table. Leave the spelling as is.
:::

#### `[Config].[spWriteLog]`, `[spWriteFullLog]`, `[spWriteCrash]`, `[spWriteDump]`

**Purpose:** Write more extensive log entries to `Config.ProcessLog`. `spWriteLog` logs messages/warnings/errors with an explicit `@ReturnCode`; `spWriteFullLog` includes the full set of fields (incl. `@CallSource`, `@DbUser`, `@DbServer`, `@DbName`); `spWriteCrash` and `spWriteDump` capture detailed error/dump information on crashes. They share the process/step/message/error fields of `spWriteError`.

---

## Change — DTAP change management

The `Change` schema supports promoting changes between environments (dev → test → prod) through projects and changes.

### `[Change].[spMaintainProject]`

**Purpose:** Manages projects (add, update, delete).

**Parameters:** `@Action (NVARCHAR(256), default 'ADD')`, `@Name (NVARCHAR(1024), default '')`, `@Description (NVARCHAR(MAX), default 'No description')`, `@DueDate (DATE, default NULL)`, `@Status (INT, default 1)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`, `@Id (INT, default -1)`.

### `[Change].[spMaintain]`

**Purpose:** Manages changes (add, update, delete) within change management.

**Parameters:** the same set as `spMaintainProject` (`@Action`, `@Name`, `@Description`, `@Project (INT, default NULL)`, `@DueDate`, `@Status`, `@AppUser`, `@Id`).

### `[Change].[spAddTable]`

**Purpose:** Adds a table with its associated metadata (columns, keys, data types) to an existing change; manages dependencies and guards against conflicting active changes.

**Parameters:** `@ChangeID (INT)`, `@Source (NVARCHAR(1024))`, `@Schema (NVARCHAR(1024))`, `@Table (NVARCHAR(1024))`, `@appUser (NVARCHAR(MAX), default 'Unknown')`, `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Change].[spAddScriptedObject]`

**Purpose:** Adds a scripted object (procedure, function, trigger, view, table) to a change and tracks the object plus its dependencies.

**Parameters:** `@ChangeID (INT)`, `@ObjectType (NVARCHAR(5))` (e.g. `'P'`, `'FN'`), `@ObjectName (NVARCHAR(4000))`, `@Delete (BIT, default 0)`, `@AddDependencies (BIT, default 1)`, `@IgnoreYresObjects (BIT, default 1)`, `@appuser (NVARCHAR(512))`, `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Change].[spCopyTableContent]`

**Purpose:** Copies data from a source to a target table, with optional column mapping and casting (handy for similar but not identical structures).

**Parameters:** `@SourceTable (NVARCHAR(256))`, `@TargetTable (NVARCHAR(256))`, `@Execute (BIT, default 0)`.

### `[Change].[spImport]`

**Purpose:** Imports changes supplied as JSON into change management (changes, projects, content, dependencies).

**Parameters:** `@JSON (NVARCHAR(MAX))`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[Change].[spInstall]`

**Purpose:** Installs a change into the target system, with a choice between executing, printing the SQL, or running an impact analysis.

**Parameters:** `@ChangeID (NVARCHAR(1024))`, `@Execute (INT, default 2)` (**1** = execute, **0** = print SQL, **2** = impact analysis), `@AppUser (NVARCHAR(4000), default 'Unknown')`, `@CommitPartial (BIT, default 0)`.

### `[Change].[spRelease]`

**Purpose:** Releases a change: validates dependencies, updates the status, and logs the release process.

**Parameters:** `@ChangeId (INT)`, `@UseLatestVersion (BIT, default 1)` (whether the most recent version of the objects in the change is used), `@AppUser (NVARCHAR(1024))`.

### `[Change].[spDeleteObject]`

**Purpose:** Marks/removes an object within a change. (In this release the live procedure is an empty stub with only a header comment; the working delete logic runs through `spAddScriptedObject` with `@Delete=1`.)

---

## Monitoring — load-status logging

### `[Monitoring].[spWriteLoadStatus]`

**Purpose:** The central load-status logger. On `@Step IN ('Start workflow','Start load')` it writes a row to `Monitoring.LS_Pipeline` and sets the corresponding `LoadManagement.LoadLog.LoadStatus` to `RUNNING`. **Every** call writes a row to `Monitoring.LS_Trans`. On `@Status IN ('Success','Succeeded')`, `LoadLog` → `SUCCEEDED`; on `('Failed','Fail','Error')` → `FAILED` (with `@Log` appended to `LoadLog.Error`).

**Parameters (16):**

- `@PipelineID (NVARCHAR(255))`
- `@Process (NVARCHAR(255), default NULL)`
- `@Step (NVARCHAR(255), default NULL)`
- `@Status (NVARCHAR(255), default NULL)`
- `@Rows (BIGINT, default NULL)`
- `@WorkflowID (NVARCHAR(255), default NULL)`
- `@PipelineName (NVARCHAR(255), default NULL)`
- `@Started_by (NVARCHAR(255), default NULL)`
- `@Target (NVARCHAR(255), default NULL)`
- `@Source_system (NVARCHAR(255), default NULL)`
- `@Table (NVARCHAR(255), default NULL)`
- `@Schema (NVARCHAR(255), default NULL)`
- `@LoadType (NVARCHAR(255), default NULL)`
- **`@LatestRecord (NVARCHAR(255), default NULL)`**
- `@ETL_Date (DATETIME, default NULL)`
- `@Log (NVARCHAR(MAX), default 'No details provided')`

:::note Robust design
All bookkeeping writes are wrapped in a `TRY/CATCH` and are best-effort: a failed monitoring write must never break the caller's load. The deliberate `RAISERROR` for `@Status IN ('Failed','Fail','Error')` sits *outside* the TRY, so that real load failures are always surfaced in ADF. When `@PipelineID='UNKNOWN'`, the real PipelineID is resolved from `LS_Pipeline` (last 24 hours, on Target+LoadType); when `@WorkflowID IS NULL`, it is derived via `SELECT TOP 1`.
:::

### `[Monitoring].[spDeleteDuplicatesInAdfMonitor]`

**Purpose:** Removes duplicate records from `Monitoring.AdfLoadMonitor` (the ADF load fetches all available monitoring records; afterwards only the most recent one per `id` remains). No parameters.

### `[Monitoring].[spWhoIsActive]`

**Purpose:** Shows the current active sessions/queries on the database (the well-known `sp_WhoIsActive` diagnostic). For ad-hoc troubleshooting.

---

## Maintenance — maintenance and health checks

This schema contains maintenance routines and the health-check implementation. The health-check results can be queried through the view `[Maintenance].[vwYresChecks]` (the source file is still named `vwIrisChecks.sql`).

### `[Maintenance].[spApplyRetentionPolicy]` (v1.56)

**Purpose:** Applies the [retention policy](../monitoring-logging.md#retention-of-the-log-tables) from `[Monitoring].[RetentionPolicy]` to the log tables: deletes everything older than the retention period in batches, with fixed integrity rules (the latest run per table load, `PLANNED`/`RUNNING` loads and their detail rows always survive; only tables with an explicit cleanup rule are touched). Called on a schedule by the ADF pipeline `Maintenance Retention YRES`.

**Parameters:** `@PipelineID (NVARCHAR(255))`, `@DryRun (BIT, default 0)` — 1 = only count what would be deleted, `@BatchSize (INT, default 100000)`, `@Scope (NVARCHAR(255))` and `@OverrideRetentionDays (INT)` — test/ops scoping (an override without a scope is refused). Returns one summary row per processed table.

### `[Maintenance].[spImplementSolution]`

**Purpose:** Automatically applies a fix proposed by the health-check view (`[Maintenance].[vwYresChecks]`).

**Parameters:** `@SolutionID (NVARCHAR(512))`, `@AppUser (NVARCHAR(1024))`.

### `[Maintenance].[spDatabaseRestore]`

**Purpose:** Performs a database restore (part of backup/restore maintenance).

### Maintenance and diagnostic procedures (third-party)

The following procedures are widely known SQL Server maintenance and diagnostic tools shipped with `IRIS_DWH`. You use them read-only for diagnosis; they are not driven by Yres from the web app.

| Procedure | Purpose |
|---|---|
| `[Maintenance].[spAdaptiveIndexDefrag]` | Adaptive index and statistics defragmentation. |
| `[Maintenance].[spBlitz]`, `spBlitzFirst`, `spBlitzCache`, `spBlitzIndex`, `spBlitzQueryStore`, `spBlitzWho`, `spBlitzBackups`, `spBlitzAnalysis` | The "Blitz" diagnostic family: health, bottlenecks, indexes, query store, active sessions, and backup checks. |
| `[Maintenance].[spAllNightLog]`, `spAllNightLog_Setup` | Continuous log-backup routine. |
| `[Maintenance].[spInEachDb]` | Runs a command in every database. |

---

## Expose — reporting layer and RBAC

The `Expose` schema manages the reporting objects and access to them (users, roles, role assignments).

### `[Expose].[spMaintainObjects]`

**Purpose:** Drops and (re)creates reporting objects (views/tables) in the exposed layer, with the desired service type and data-model shape.

**Parameters:** `@Action (NVARCHAR(20))` (`ADD`/`UPDATE`/`DELETE`), `@Schema`, `@Name`, `@type` (`[View]`/`[Table]`), `@ServiceTypes` (`[ODATA]`/`[SQL]`), `@DataType` (`[None]`/`[FACT]`/`[DIM1]`/`[DIM2]`/`[DIM4]`), `@AppUser`, `@execute (INT, default 0)`.

### `[Expose].[spRebuildObjects]`

**Purpose:** Rebuilds all reporting objects at once.

**Parameters:** `@AppUser (NVARCHAR(4000))`, `@execute (INT, default 0)`.

### `[Expose].[spMaintainRoles]`

**Purpose:** Manages reporting roles (add, rename, delete).

**Parameters:** `@Action (NVARCHAR(20))`, `@Name (NVARCHAR(1024))`, `@NewName (NVARCHAR(1024), default NULL)` (only with `UPDATE`), `@AppUser`.

### `[Expose].[spMaintainUsers]`

**Purpose:** Manages reporting users.

**Parameters:** `@Action (NVARCHAR(20))`, `@NickName (NVARCHAR(1024), default '')`, `@UserID (NVARCHAR(1024))` (default a guid), `@Provider (NVARCHAR(1024))` (`[ENTRA]`/`[LOCAL]`), `@ServiceTypes (NVARCHAR(1024))` (`[ODATA]`/`[SQL]`), `@AppUser`.

### `[Expose].[spMaintainRoleAssignment]`

**Purpose:** Adds members to or removes them from a reporting role.

**Parameters:** `@Action (NVARCHAR(20))` (`ADD`/`REMOVE`), `@member (NVARCHAR(1024))`, `@Role (NVARCHAR(1024))`, `@AppUser`.

---

## dbo — helper procedures

Generic helper procedures used by the other schemas.

| Procedure | Purpose | Key parameters |
|---|---|---|
| `[dbo].[spLongPrint]` | Prints long strings in chunks (works around the `PRINT` length limit). | `@String (NVARCHAR(MAX))` |
| `[dbo].[spRunSQL]` | Executes an arbitrary SQL statement dynamically. | `@SQL (NVARCHAR(MAX))` |
| `[dbo].[spJsonToTable]` | Converts JSON into a relational table. | `@Collection`, `@json (default '{}')`, `@targetSchema`, `@targetTable` |
| `[dbo].[spCopyDB]` | Makes a copy of a database, optionally with drop and service tier. | `@sourceDB`, `@targetDB`, `@targetTier (default 'GP_Gen5_2')`, `@dropIfExists (BIT, default 0)` |
| `[dbo].[spMSForEachTable]` / `[spMSForEachWorker]` | Runs a command against every table (batch operation); `@replacechar` is replaced by the table name. | `@command1 (NVARCHAR(2000))`, `@replacechar (NCHAR(1), default '?')`, … |
| `[dbo].[spAdaptiveIndexDefrag_CurrentExecStats]` | Reports the progress of the index defragmentation. | `@dbname (NVARCHAR(255), optional)` |
| `[dbo].[spAdaptiveIndexDefrag_Exceptions]` | Manages exceptions to the defragmentation (DBs, days, tables, indexes). | `@exceptionMask_DB`, `@exceptionMask_days`, `@exceptionMask_tables`, `@exceptionMask_indexes` |
| `[dbo].[spAdaptiveIndexDefrag_PurgeLogs]` | Cleans up old defragmentation logs. | `@daystokeep (SMALLINT, default 90)` |

---

## See also

- [Functions](./functions.md) — all scalar and table-valued functions (`fxExtractor`, `fxGetSetting`, `fxGetSchemaName`, …).
- [Logs & views](./logs-views.md) — the log tables (`LS_Pipeline`, `LS_Trans`, `LoadLog`, `ProcessLog`, `EventLog`) and monitoring views (`vwLoads`, `vwMonitor`, `vwWorkflow`, `vwUsedTables`).
