---
sidebar_position: 2
title: Functions
description: Complete reference of all 66 scalar and table-valued functions in the IRIS_DWH database, grouped by schema.
---

> Management is best done through the webapp; these objects are for the SQL endpoint (SSMS / Azure Data Studio).

This page describes all **66 functions** in the data-plane database `IRIS_DWH` (as of August 2026 — the count grows with each release), grouped by schema.
For each function you'll find the fully qualified name, the signature (as it appears in the `CREATE FUNCTION`
header) and its purpose. The names and types are taken directly from the source code — the code is authoritative.

:::note Schemas
The functions are spread across seven schemas: **`LoadManagement`** (the load engine), **`Config`**
(settings, license, logging), **`Change`** (DTAP change management), **`Metadata`** (lineage),
**`dbo`** (text and conversion utilities), **`oData`** (OData endpoint) and **`Expose`** (reporting RBAC).
:::

See also: [Stored procedures](stored-procedures.md) and [Logs & views](logs-views.md).

---

## LoadManagement (load engine)

The heart of the load engine. These functions determine *what* gets loaded and how `STAGE` is merged into
`HIS` (SCD2).

### `[LoadManagement].[fxArchivingPredicate]` — scalar

**Signature:**

```sql
(@Target NVARCHAR(512)) RETURNS NVARCHAR(MAX)
```

**Purpose:** builds the per-table **archiving condition** (the WHERE part) from the configuration on `UsedTables`: `CLOSED` → `isCurrent = 0 AND ETL_EndDate < '<cutoff>'`, `BUSINESS` → `[<ArchivingColumn>] < '<cutoff>'`, or the free-form `ArchivingClause` verbatim. The cutoff date is rendered as a **fixed literal**, so the copy and purge steps within one run use the same rule. `NULL` = archiving off or incompletely configured (the health checks flag that). Consumers: `fxExtractor` (builds the `ArchivingScript` from it), `spHIS_InsertAndUpdate` (blocks incoming rows in the archived space for `BUSINESS`) and — via ADF — `spArchivePurge`. See [Archiving](../../concepten/archivering.md).

### `[LoadManagement].[fxExtractor]` — table-valued

**Signature:**

```sql
(@LoadFilter NVARCHAR(MAX) = NULL, @LoadType NVARCHAR(MAX) = NULL) RETURNS TABLE
```

**Purpose:** the heart of "what needs to be loaded". For each active source table, this function builds the
source-specific extract command (the `DeltaScript` / OData `$select…$filter` / AFAS query string), the
target schema and table names, file and delimiter metadata, package size and the archiving script.
It is the TVF behind the view `[LoadManagement].[vwExtractor]` (which does nothing more than
`SELECT * FROM [LoadManagement].[fxExtractor](NULL,NULL)`). ADF reads that view to learn which tables
need to be loaded. Each returned row = one table to load.

**Output:** ~40 columns, including `sourceType`, `isFile`, `Source`, `SourceSchema`, `SourceTable`,
`TechSchema`, `TechTable`, `DataPlatform`, `LoadType`, `DeltaColumn`, `LatestRecord`, `DeltaScript`,
`loadFilter`, `Pipeline`, `Trigger`, `fileLocation`, `fileName`, `TargetSource`, `TargetSchema`,
`TargetTable`, `Target`, `keepStage`, `TargetSchemaHIS`, `TargetSchemaSTAGE`, `CellRange`, `Sheet`,
`FileType`, `ColumnDelimiter`, `RowDelimiter`, `QuoteCharacter`, `FirstRowHeader`, `EscapeCharacter`,
`CompressionType`, `LatestRuntime`, `noKey`, `deltaOverlap`, `deltaOverlapUnit`, `PackageSize`,
`ArchivingScript`, `paginationType`, `paginationDetails`, `LoadStatus`.

:::caution Two parameters, no `@PackageSize`
`fxExtractor` has **exactly two parameters**: `@LoadFilter` and `@LoadType`. There is **no** third parameter
`@PackageSize`. `PackageSize` is an **output column** (`COALESCE(u.PackageSize, st.MaxPackageSize, 25000)`),
not an input parameter. Likewise: the output columns are named `LatestRecord` and `LatestRuntime` (not
"LapageRecord" / "LapageRuntime").
:::

### `[LoadManagement].[fxGetActualTablename]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Purpose:** returns `UsedTables.ActualTableName` for the source/schema/table combination. If nothing is
found, the function falls back to `CustomYres.Extractor.[TARGET]`.

### `[LoadManagement].[fxGetDataType]`

**Signature:**

```sql
(@source NVARCHAR(256), @dataType NVARCHAR(256), @sourceLength INT, @sourcePrecision INT,
 @sourceScale INT, @schema NVARCHAR(256)='N/A', @table NVARCHAR(256)='N/A',
 @column NVARCHAR(256)='N/A') RETURNS NVARCHAR(256)
```

**Purpose:** maps the source data type to the full target column type via `LoadManagement.TypeMapping` and
`LoadManagement.GlobalTypeMapping`. Takes length, precision and scale into account, and applies any
overrides.

### `[LoadManagement].[fxGetInitialDataType]`

**Signature:** the same parameter set as `fxGetDataType` (`@source, @dataType, @sourceLength,
@sourcePrecision, @sourceScale, @schema, @table, @column`) `RETURNS NVARCHAR(256)`.

**Purpose:** like `fxGetDataType`, but determines the full target column type **without** applying column
overrides (the "initial" mapping).

### `[LoadManagement].[fxGetKeyColumns]`

**Signature:**

```sql
(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024), @withType BIT=0,
 @enclosureChar NVARCHAR(1)='"', @seperatorChar NVARCHAR(1)=',') RETURNS NVARCHAR(MAX)
```

**Purpose:** retrieves the key columns of the table from `LoadManagement.vwDictionary`. If none are marked,
all columns fall back as the key. With `@withType=1` the data type is also included;
`@enclosureChar`/`@seperatorChar` control the formatting of the returned list.

### `[LoadManagement].[fxGetRowColumns]`

**Signature:** identical to `fxGetKeyColumns` (`@Source, @Schema, @Table, @withType BIT=0,
@enclosureChar NVARCHAR(1)='"', @seperatorChar NVARCHAR(1)=','`) `RETURNS NVARCHAR(MAX)`.

**Purpose:** retrieves the row columns (the columns that participate in change detection) from
`LoadManagement.vwDictionary`, with the same formatting options as above.

### `[LoadManagement].[fxGetKeyHashColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Purpose:** builds the concatenation of key columns from which the `KeyHash` (`HASHBYTES('SHA2_512', …)`) is
computed. If there are no key columns, all columns are used.

### `[LoadManagement].[fxGetRowHashColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Purpose:** builds the concatenation of row columns from which the `RowHash` is computed. Columns with
`RowHash=0` are excluded from change detection.

### `[LoadManagement].[fxGetOptimized]`

**Signature:** `(@Type NVARCHAR(50), @Table NVARCHAR(250), @Status NVARCHAR(50)='Intended') RETURNS NVARCHAR(20)`

**Purpose:** determines whether a table is memory-optimized, based on `LoadManagement.UsedTables` or
`Config.Settings`. `@Type` is `'STAGE'` or `'HIS'`. `@Status` accepts the literal values
**`'Intended'`** (the configured wish) or **`'Real'`** (the actual status); `spHIS_InsertAndUpdate`
calls the function with `'Real'`.

### `[LoadManagement].[fxGetStoreType]`

**Signature:** `(@Table NVARCHAR(250), @Status NVARCHAR(50)='Intended') RETURNS NVARCHAR(20)`

**Purpose:** determines whether a table uses row- or column-store, based on `LoadManagement.UsedTables` or
`Config.Settings`. The same `'Intended'`/`'Real'` logic as `fxGetOptimized`.

### `[LoadManagement].[fxGetTablockHint]`

**Signature:** `(@SchemaTableName NVARCHAR(MAX)) RETURNS NVARCHAR(20)`

**Purpose:** returns the hint fragment `' WITH (TABLOCK)'` when the given physical table (e.g.
`[ODS].[Source_Schema_Table]`) has a clustered columnstore index, otherwise an empty string.
`spHIS_InsertAndUpdate` appends the result to the table name in the generated `HIS` inserts, so
columnstore tables load through the bulk-load path; rowstore tables stay hint-free. Inspects the
ACTUAL storage (`sys.indexes`), not the configured `storeType`.

### `[LoadManagement].[fxGetSurrogate]`

**Signature:** `(@Table NVARCHAR(4000)) RETURNS INT`

**Purpose:** returns the table's surrogate-key setting from `LoadManagement.UsedTables` (for the
`ActualTableName` with `Active=1`). If that is empty/NULL, the function falls back to the
**`DefaultSurrogate`** setting in `Config.Settings`.

### `[LoadManagement].[fxGetOptimalPageSize]`

**Signature:** `(@object NVARCHAR(4000)) RETURNS INT`

**Purpose:** computes an optimal page size for paging `STAGE` → `HIS`, based on the measured KB-per-row of
the object and the available tempdb space. Used when the `PageSize` setting has the value `OPTIMAL`.

### `[LoadManagement].[fxGetDeltaValue]`

**Signature:** `(@target NVARCHAR(4000), @addCorrectQuotation BIT) RETURNS NVARCHAR(100)`

**Purpose:** supplies the current delta watermark value for a target table (the highest processed delta
value), optionally with correct quoting for use in dynamic SQL.

### `[LoadManagement].[fxPredictKeyColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Purpose:** predicts the key columns for a new table based on existing metadata in
`LoadManagement.Dictionary`. If none are found, all non-nullable columns fall back as the predicted key.
Used by the "Add table" wizard as a suggestion.

### `[LoadManagement].[fxPredictTableName]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Purpose:** predicts the target table name based on source/schema/table, taking into account any overrides
in `LoadManagement.UsedTables`.

### `[LoadManagement].[fxGenerateAdfUrl]`

**Signature:** `(@runId NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Purpose:** builds the full URL to view a specific pipeline run in the Azure Data Factory portal.
Used by the monitoring views to show deep links to ADF runs.

### `[LoadManagement].[fxCreateNetsuiteAuthHeader]`

**Signature:**

```sql
(@consumer_key VARCHAR(8000), @Consumer_secret VARCHAR(8000), @oAuth_Token VARCHAR(8000),
 @Token_secret VARCHAR(8000), @URL VARCHAR(8000), @Method VARCHAR(50)) RETURNS VARCHAR(8000)
```

**Purpose:** builds the OAuth 1.0 `Authorization` header (with HMAC-SHA256 signature, nonce and timestamp) for
NetSuite API calls.

### `[LoadManagement].[fxDeltaOrWhere]` — scalar

**Purpose:** builds the delta `WHERE` fragment for dialects without `CASE`/`COALESCE` (such as SOQL): one column → `c1 >= v`, two columns → `(c1 >= v OR c2 >= v)` — equivalent to "greatest of the two ≥ value".

### `[LoadManagement].[fxGetActualTargetName]` — scalar

**Purpose:** resolves the **physical** target table name for an effective (Overwrite\*-applied) source triple: returns `UsedTables.ActualTableName` and only falls back to the historical `CONCAT_WS('_', …)` rule when no name is stored. Sibling of `fxGetActualTablename`, which works on the raw source triple.

### `[LoadManagement].[fxLakeFeedColumns]` — table-valued

**Purpose:** resolves the column set of the Parquet change feed for one lake target — per schema generation or as the union across all generations; the column order is binding because Parquet maps by position. Single source of truth for the objects `spMaintainLakeExternal` generates.

---

## Config (settings, license, logging)

### `[Config].[fxGetSetting]`

**Signature:** `(@SettingName NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Purpose:** retrieves the value of a setting from `Config.Settings`. Contains special GodMode logic: a
second lookup reads the `GodMode` row with a time-rotating `id`; if the requested setting name starts with
`Allow%` **and** GodMode resolves to `'1'`, the function returns `'1'` (force-allow).

### `[Config].[fxGetSchemaName]`

**Signature:** `(@Target NVARCHAR(MAX), @Type NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Purpose:** determines the schema name for a target and type. The base schema is `fxGetSetting('SchemaHIS')`
or `fxGetSetting('SchemaSTAGE')` (otherwise `'ERROR'`). If the corresponding `UsedTables` row has a non-empty
`OverwriteSettingSchema`, the result becomes `CONCAT_WS('_', baseSchema, OverwriteSettingSchema)`
(for example `ODS_Finance`).

### `[Config].[fxAddTryCatch]`

**Signature:**

```sql
(@SQL NVARCHAR(MAX), @process UNIQUEIDENTIFIER, @spName NVARCHAR(MAX), @spStep NVARCHAR(MAX),
 @spCall NVARCHAR(MAX), @appUser NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)
```

**Purpose:** wraps a SQL script between two `EXECUTE [Config].[spWriteMessage]` calls ("Preparing for
step" / after the step) for breadcrumb logging. Used by `spHIS_InsertAndUpdate` just before the
generated load SQL is executed.

### `[Config].[fxCheckLicense]`

**Signature:**

```sql
(@feature NVARCHAR(1024), @value NVARCHAR(1024), @check NVARCHAR(50)='SYSTEM',
 @checkvalue NVARCHAR(1024)) RETURNS NVARCHAR(4000)
```

**Purpose:** validates the license key (`Config.Settings.LicenseKey`) against a feature/limit. Checks
installation binding, end date and type, and returns an issue string (e.g. *"The provided license key is
not valid anymore"*) or an empty/OK status. This is the technical enforcement behind the license tiers; this
is how over-quota tables/databases in `fxExtractor` return no rows.

### `[Config].[fxCheckSystem]`

**Signature:** `(@value NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Purpose:** checks system/installation restrictions (tied to `@@SERVERNAME`) as a supplement to the
license check.

### `[Config].[fxViewLicense]` — table-valued

**Signature:** `() RETURNS TABLE`

**Purpose:** decrypts the stored `LicenseKey` (via `DECRYPTBYPASSPHRASE` with a server-name salt) and returns
the license contents as `[key]`/`[value]` pairs — handy for inspecting the active license.

### `[Config].[fxGetSession]`

**Signature:** `() RETURNS NVARCHAR(MAX)`

**Purpose:** queries `sys.dm_exec_connections` and `sys.dm_exec_sessions` and returns the details of active
sessions as JSON.

### `[Config].[fxGetHmacSha256]`

**Signature:** `(@Key VARCHAR(MAX), @baseString VARCHAR(MAX)) RETURNS VARCHAR(MAX)`

**Purpose:** computes an HMAC-SHA256 signature in pure T-SQL (including the inner/outer padding). Used for
signing outgoing API calls.

### `[Config].[fxUrlEncode]`

**Signature:** `(@Input NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Purpose:** URL-encodes a string (replaces spaces and special characters with their `%XX` equivalent) for
use in API URLs and OAuth signatures.

### `[Config].[fxAddTransactionalTryCatch]` — scalar

**Purpose:** wraps dynamic SQL in one all-or-nothing transaction: same logging as `fxAddTryCatch`, but with `SET XACT_ABORT ON` — on any error the whole block is rolled back, so the target object is never left half-modified. Used for multi-step mutations such as the remodel in `spUpdateTablesFromDictionary`.

### `[Config].[fxCheckLicenseCore]` — scalar

**Purpose:** holds the entire license validation/enforcement; `fxCheckLicense` is a thin, signature-unchanged wrapper around it. The extra fifth parameter (settings override) exists only here, so existing four-parameter call sites kept working.

### `[Config].[fxServiceTierLadder]` — table-valued

**Purpose:** the Azure SQL **DTU tier ladder as data**: one row per Basic/Standard/Premium tier with `LevelOrder`, so tiers can be compared without string parsing. vCore tiers are deliberately absent — they fall outside the automatic scaling.

### `[Config].[fxResolveServiceTier]` — table-valued

**Purpose:** THE scaling decision as a pure function: from the current tier, the requested tier, the highest live scaling request and the number of live workloads it determines the effective target tier plus the action (`SCALE UP`/`SCALE DOWN`/`NOTHING`/…). Deliberately reads no tables, so the decision is testable.

### `[Config].[fxWorkflowHeartbeat]` — table-valued

**Purpose:** when did this workflow run last show a sign of life? The newest of that workflow's `LoadLog` stamps and `LS_Trans` steps; the automatic tier scaling uses it to tell a working workflow from a cancelled run.

---

## Change (DTAP change management)

Functions that support change management (Projects → Changes → Release/Install).

### `[Change].[fxGetChangeIsOpen]`

**Signature:** `(@ChangeId INT) RETURNS INT`

**Purpose:** determines whether a change (identified by `@ChangeId`) is currently open. Joins
`Change.Changes` with `Change.Status` and verifies that the change originates from the correct server/database.
Returns `1` (open) or `0` (not open).

### `[Change].[fxGetLastestChangeIdFor]`

**Signature:** `(@objectType INT, @objectName NVARCHAR(1024)) RETURNS INT`

**Purpose:** retrieves the **latest** change ID that contains a specific object type and name, by searching
`Change.ChangeContent`.

:::note Naming
In the code, the function is literally named `fxGetLastestChangeIdFor` — with the typo "Lastest" (the spelling
is deliberately kept verbatim). The earlier wiki spelling "fxGetLaspageChangeIdFor" is wrong on two counts:
it is *Latest*, not "Lapage", and the code itself spells it "Lastest".
:::

### `[Change].[fxGetLatestOpenChange]`

**Signature:** `(@ObjectType NVARCHAR(10), @ObjectName NVARCHAR(1024)) RETURNS INT`

**Purpose:** combines `fxGetLastestChangeIdFor` and `fxGetChangeIsOpen` to find and return the latest **open**
change for an object type/name.

### `[Change].[fxPossibleChanges]` — table-valued

**Signature:** `(@ObjectType NVARCHAR(10), @ObjectName NVARCHAR(1024)) RETURNS TABLE`

**Purpose:** returns the possible change actions for an object, taking into account whether an open change
already exists (via `fxGetLastestChangeIdFor`/`fxGetChangeIsOpen`).

### `[Change].[fxMockDelete]` — table-valued

**Signature:** `(@ObjectName NVARCHAR(4000)) RETURNS TABLE`

**Purpose:** simulates what happens when an object is deleted: determines which dependent objects use the
object (and the corresponding open change ID), so the impact is visible before the delete is carried out.

### `[Change].[fxGetReleasedJson]`

**Signature:** `(@ChangeID INT) RETURNS NVARCHAR(MAX)`

**Purpose:** retrieves the JSON data stored with a specific change ID in `Change.Changes`.

### `[Change].[fxGetTableDefinition]`

**Signature:**

```sql
(@ObjectName NVARCHAR(1024), @UseTransaction BIT=0, @GenerateFKs BIT=1, @GenerateIdentity BIT=1,
 @GenerateCollation BIT=0, @GenerateCreateTable BIT=1, @GenerateIndexes BIT=1, …) RETURNS NVARCHAR(MAX)
```

**Purpose:** generates a complete SQL script to rebuild a table definition — columns, indexes, constraints
and optionally the contents as JSON. The flag parameters control whether foreign keys, identity columns,
collation, the `CREATE TABLE` statement itself and indexes are included.

### `[Change].[fxGetTableTypeDefinition]`

**Signature:** `(@ObjectName NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Purpose:** generates the `CREATE TYPE … AS TABLE(...)` script to rebuild a user-defined table type,
including the columns and their properties.

---

## Metadata (lineage and dependencies)

### `[Metadata].[fxGetViewSources]` — table-valued

**Signature:** `(@VIEW NVARCHAR(256)) RETURNS TABLE`

**Purpose:** determines the source objects (tables or views) that a given view directly uses, by parsing the
view definition and querying system tables.

### `[Metadata].[fxGetViewSourcesRecursive]` — table-valued

**Signature:** `(@VIEW NVARCHAR(256)) RETURNS TABLE`

**Purpose:** like `fxGetViewSources`, but **recursive**: the sources of the found views are expanded as well,
so you see the complete lineage chain.

### `[Metadata].[fxGetDependencies]` — table-valued

**Signature:** `(@ObjectName VARCHAR(500)) RETURNS TABLE`

**Purpose:** uses a recursive CTE to retrieve all dependent objects (and the objects below those) of a
stored procedure, view, function or table.

### `[Metadata].[fxGetReferencedObjects]` — table-valued

**Signature:** `(@sql NVARCHAR(MAX)) RETURNS TABLE`

**Purpose:** a best-effort T-SQL parser that extracts object names following `FROM`, `JOIN`, `APPLY`, `UPDATE`,
`INTO`, `MERGE` and `DELETE FROM` from ad-hoc SQL text. Keep its limitations in mind: objects in dynamic SQL,
synonyms and complex nested subqueries/CTEs are not always recognized (requires SQL Server 2022+).

### `[Metadata].[fxGetObjectTree]`

**Signature:** `() RETURNS NVARCHAR(MAX)`

**Purpose:** builds an overview tree of all database objects (name, type, schema) and marks for each object
whether it originates from `Yres` or is `custom`.

### `[Metadata].[fxColumnUsage]` — table-valued

**Signature:** `(@SchemaName SYSNAME, @TableName SYSNAME) RETURNS TABLE`

**Purpose:** returns the column usage for a given schema/table (which columns are used where) — useful for
impact analysis.

---

## dbo (text and conversion utilities)

General helper functions for string manipulation and type conversion.

### `[dbo].[fxGeneratePassword]`

**Signature:** `(@Length INT = 16) RETURNS NVARCHAR(1024)`

**Purpose:** generates a random password of the given length (characters from ASCII 48–122).

### `[dbo].[fxStripCharacters]`

**Signature:** `(@String NVARCHAR(MAX), @MatchExpression VARCHAR(255)) RETURNS NVARCHAR(MAX)`

**Purpose:** removes from the input string all characters that match the given match expression.

### `[dbo].[fxRemoveNonAlphaCharacters]`

**Signature:** `(@Temp VARCHAR(1000)) RETURNS VARCHAR(1000)`

**Purpose:** removes all non-alphabetic characters from the input string (keeps only `a–z`; the deployed
version was made accent-strict via a binary collation, so accented letters no longer slip through the
`[a-z]` range). The repo file `fxRemoveNonAlphaCharacters_1.sql` is an **old, undeployed copy** without
that fix — it is not part of the build, so the two definitions are no longer identical.

### `[dbo].[fxToProper]`

**Signature:** `(@string NVARCHAR(4000)) RETURNS NVARCHAR(4000)`

**Purpose:** converts a string to proper case (first letter uppercase, the rest lowercase).

### `[dbo].[fxToDecimal]`

**Signature:** `(@string NVARCHAR(1024), @decimals INT=0, @findNegative BIT=1) RETURNS DECIMAL(25,8)`

**Purpose:** converts a string to a decimal and handles various formats; with `@findNegative=1` negative
values are recognized.

### `[dbo].[fxToReadableSize]`

**Signature:** `(@kb DECIMAL(38,10)) RETURNS NVARCHAR(50)`

**Purpose:** formats a size in kilobytes into a readable string (`KB`, `MB` or `GB`).

### `[dbo].[fxUNIXtoDateTime]`

**Signature:** `(@epochStringDate NVARCHAR(50)) RETURNS DATETIME2(0)`

**Purpose:** converts a UNIX timestamp (epoch, as a string) to a SQL Server datetime value.

### `[dbo].[fxUTC2CET]`

**Signature:** `(@UTC_DateTime DATETIME) RETURNS DATETIME`

**Purpose:** converts a UTC datetime to Central European Time (CET). Used among other things by the
monitoring views to show times in local time.

### `[dbo].[fxGetJsonCollection]`

**Signature:** `(@Json NVARCHAR(MAX)) RETURNS NVARCHAR(1024)`

**Purpose:** determines the (first/relevant) JSON collection within a JSON string by querying
`dbo.fxGetJsonCollections`.

### `[dbo].[fxGetJsonCollections]` — table-valued

**Signature:** `(@Json NVARCHAR(MAX)) RETURNS TABLE`

**Purpose:** returns all collections (arrays) within a JSON string, with a ranking that prioritizes known
keys such as `RESULT`, `RESULTS`, `DATA` and `VALUE`. Used when reading REST/OData responses.

### `[dbo].[UNQUOTENAME]`

**Signature:** `(@input SYSNAME, @quotechar NCHAR(1)=N'[') RETURNS NVARCHAR(4000)`

**Purpose:** the counterpart of `QUOTENAME`: removes the surrounding quote characters (default `[ ]`) from an
identifier.

---

## oData (OData endpoint)

Functions that feed the database's OData reporting endpoint.

### `[oData].[fxBaseResponse]`

**Signature:** `(@BaseUrl NVARCHAR(3000)) RETURNS NVARCHAR(MAX)`

**Purpose:** builds the base OData response URL: adds the metadata endpoint and lists all available tables
and views in the database.

### `[oData].[fxMetadataResponse]`

**Signature:** `(@BaseUrl NVARCHAR(3000)) RETURNS NVARCHAR(MAX)`

**Purpose:** generates the OData `$metadata` response, including entity types and entity sets, and maps SQL
types to the corresponding OData EDM types according to the OData standard.

---

## Expose (reporting RBAC)

### `[Expose].[fxGenerateDefinitions]`

**Signature:**

```sql
(@Schema NVARCHAR(1024), @Name NVARCHAR(1024), @DataType NVARCHAR(256), …) RETURNS NVARCHAR(MAX)
```

**Purpose:** generates the definitions for reporting objects in the `Exposed` schema. `@DataType` indicates
the reporting role of the column (`[None]`, `[FACT]`, `[DIM1]`, `[DIM2]`, `[DIM4]`); based on the
linked Yres source/table and surrogate key, the function builds the object definition.

### `[Expose].[fxGetExposedViews]` — table-valued

**Purpose:** the single source of truth for the naming of the decoupling views in the `[Exposed]` schema: one row per view belonging to an exposed object (`<Schema>__<Name>`, plus `<Schema>__<Name>_History` for `DIM4`). Every procedure that creates, drops or grants views resolves the name here.

---

:::info Lapage → Latest
Older documentation contained the token **"Lapage"** (for example `LapageRecord` or
`fxGetLapageOpenChange`). That is an OCR error: the correct word is **"Latest"**. In the live database
"Lapage" appears nowhere. The correct names are `LatestRecord`, `LatestRuntime`, `fxGetLastestChangeIdFor`
(with the "Lastest" typo from the code) and `fxGetLatestOpenChange`.
:::
