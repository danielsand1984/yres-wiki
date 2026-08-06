---
sidebar_position: 5
title: Lake feed (change feed)
description: How Yres lands every load as an append-only Parquet change feed in the Data Lake — with an I/U/D marker per row, so you can derive both the current state and the full history from it.
---

# Lake feed (change feed)

Besides loading into the SQL database, Yres can write every table to the Azure Data Lake **as well**.
From **v1.56** it does so as an **append-only change feed**: each load run lands one Parquet file holding
**only that run's mutations**, where every row carries a marker `I` (insert), `U` (update) or `D`
(delete).

That turns the Data Lake from a series of loose snapshots into a proper mutation stream: you derive both
the **current state** and the **full history** from it, and you can feed it straight into a `MERGE`
towards a Delta table.

:::note The database remains the source of truth
The feed is **derived** data. The SCD2 history in Azure SQL (`STAGE` → `HIS`) stays authoritative; the
lake is a parallel landing for analytics, data science and lakehouse scenarios.
:::

## What changed compared to before

Before v1.56 the `Load DL` step simply copied the entire contents of the staging table to the Data Lake.
Every run therefore rewrote everything — unchanged rows included — and deletions were invisible: the row
just disappeared from the next dump.

| | Before (STAGE dump) | Now (change feed) |
|---|---|---|
| Contents per run | the entire staging table | only that run's mutations |
| Run without changes | wrote a file anyway | writes **no** file |
| Unchanged rows | rewritten every run | never sent |
| Deleted rows | invisible | explicit `D` row (tombstone) |
| History | only the last dumped state | fully derivable from all files |
| Growth | scales with reload volume | scales with mutation volume |
| Path | `<Source>/<Schema>/<year>/<month>` | `lake/<Source>/<Schema>/<Table>/Year=…/Month=…` |
| File name | `<Table>-<timestamp>` (no extension) | `<Table>-g<Generation>-<PipelineRunId>.parquet` |
| Restarting a run | produced an extra file | overwrites its own file (within the same generation) |

:::caution What this means for existing consumers
The feed writes to a **new path**. Files that landed earlier under `<Source>/<Schema>/<year>/<month>`
stay untouched — nothing is migrated or cleaned up. Reports or notebooks that pointed at the old path
*and* assumed a full snapshot per file need adjusting: a feed file holds only the mutations. Use the
[read pattern](#reading-the-feed) below for that.
:::

## What lands in the Data Lake

```
datalake-yres
└── lake/<Source>/<Schema>/<Table>/Year=<yyyy>/Month=<mm>/<Table>-g<Generation>-<PipelineRunId>.parquet
```

- **One file per load run per table.** Runs without mutations write nothing.
- **`Year=` / `Month=`** are hive-style partition folders, so any query engine can prune on period.
- The file name carries the **generation number** (`g<Generation>`, tracked in
  `LoadManagement.LakeFeedGeneration`) and the **ADF pipeline run id**: rerun the same run within the
  same generation and it overwrites its own file. Duplicate rows caused by a restart are therefore
  impossible.

Alongside the regular data columns and `ETL_Date`, every row carries four framework columns:

| Column | Meaning |
|---|---|
| `KeyHash` | SHA2_512 hash over the key columns — the row's stable identity. |
| `RowHash` | SHA2_512 hash over the tracked columns of *this* version. |
| `YresAction` | `I` = new key, `U` = new version of an existing key, `D` = key deleted. |
| `YresDateStart` | The moment this version became current; on a `D` row, the moment of deletion. |

:::info `D` rows carry no data
A tombstone holds the hashes and `YresDateStart`, but its business columns are empty (`NULL`). It says
"this key no longer exists", not "this key held these values".
:::

`D` rows only appear for the load types that can detect deletions — **IMAGE**, **DELTAIMAGE**,
**OVERWRITE** and **RELOAD**. See [Load types](./load-types.md). The **ADDITIONAL** load type has no
notion of mutation: it delivers the full staging table as `I` rows every run (pure append).

## Turning it on

The feed hangs off the existing **`DataPlatform`** column on the table configuration
(`[LoadManagement].[UsedTables]`):

| Value | Effect |
|---|---|
| `DWH` | the SQL database only (default) |
| `DL` | the lake feed only |
| `DWH,DL` | both |

For a **DL-only table** (`DL` without `DWH`), Yres deliberately creates no history table in the
database — the data lives entirely in the Data Lake. You can still query it from SQL: Yres automatically
maintains read objects in the `[DL]` schema for it (see [below](#dl-schema)).

Switch `DL` back off and the Parquet files already written stay put; a health check points you at the
leftover bookkeeping in the database (see [Monitoring](#monitoring)).

:::caution Deploy order
The ADF pipelines call procedures that ship with the database. So **always update the database first
(DACPAC) and publish the ADF factory afterwards**. The other way round, the lake branch fails.
:::

## How Yres determines the mutations

To know *what* changed in a run, Yres keeps a **slim bookkeeping** table per lake table in the `[LAKE]`
schema (configurable with the `SchemaLAKE` setting). That table holds **no business data** — only the
hashes, the dates and the delta column, if any.

```
Source ──Copy──► STAGE.<Table>
                     │
                     ├─ Prepare lake load  →  [LoadManagement].[spLoadLake]
                     │      └→ spHIS_InsertAndUpdate @LakeMode = 1   (SCD2 merge on the slim [LAKE] table)
                     │
                     ├─ Load DWH           →  [LoadManagement].[spLoadDWH]   (the regular SCD2 merge into HIS)
                     │
                     ├─ Lookup lake feed   →  [LoadManagement].[spGetLakeFeed]
                     │      └→ mutation query + mutation count
                     │
                     └─ Write lake feed    →  Copy → Parquet in the Data Lake  (only if there are mutations)
                            └→ Maintain lake view  →  [LoadManagement].[spMaintainLakeExternal] (Scope=VIEW)
```

So it is the **same, proven SCD2 merge** that builds the history in the database, here applied to a
contentless bookkeeping table. What the merge marks as new or changed is exactly what the feed sends;
what it closes without a counterpart in staging becomes a `D` row. If a run yields zero mutations, ADF
skips the copy step and no empty file appears. After a successful copy, the **Maintain lake view** step
(`spMaintainLakeExternal` with scope `VIEW`) brings the external view over the feed files up to date.

The **Write lake feed** step runs **in parallel with Load DWH**, not after it: the lake output therefore
does not slow down loading the data warehouse.

## Reading the feed {#reading-the-feed}

You get the current state by taking the latest version per key and dropping tombstones. This pattern
works in every engine:

```sql
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY KeyHash ORDER BY YresDateStart DESC) AS rn
    FROM <feed>
)
SELECT * FROM ranked WHERE rn = 1 AND YresAction <> 'D';
```

The **full history** is simply all rows; a version's end date follows from
`LEAD(YresDateStart) OVER (PARTITION BY KeyHash ORDER BY YresDateStart)`.

| Platform | How you read it |
|---|---|
| **Microsoft Fabric** | `OPENROWSET(BULK '…/lake/<Source>/<Schema>/<Table>/**', FORMAT='parquet')` in a Warehouse — no Spark required. For Direct Lake, fold the feed into a Delta table with Spark. |
| **Databricks** | `read_files(…, format => 'parquet')`, or fold incrementally into Delta with Auto Loader: `MERGE` on `KeyHash`, `D` rows as deletes. |
| **Azure SQL Database** | For **DL-only tables** Yres builds this for you: ready-made views in the `[DL]` schema (see [below](#dl-schema)). Doing it by hand also works, through data virtualization (`OPENROWSET` over an external data source). Requires a managed identity on the SQL server with **Storage Blob Data Reader** — the same setup as the [archive union views](./archivering.md). |

:::caution Azure SQL: data virtualization is preview
Reading from Azure SQL works, but it is a preview feature of Azure SQL Database. Mind these: always use
an **external data source** (a bare URL in `BULK` demands a credential anyway), use the `adls://` scheme
(not `https://`), and state column types explicitly. If the path points at a folder holding **no** files,
you get an error rather than an empty result set.
:::

## Querying DL-only tables from SQL: the `[DL]` schema {#dl-schema}

For DL-only tables, **`[LoadManagement].[spMaintainLakeExternal]`** automatically generates and
maintains three kinds of read objects in the `[DL]` schema (configurable with the `SchemaDL` setting):

| Object | What it is |
|---|---|
| `[DL].[<Table>_Feed_g<N>]` | **External table per schema generation** — reads that generation's Parquet files straight from the Data Lake. |
| `[DL].[<Table>_Feed]` | **Union view across all generations** — the complete raw change feed as one table. |
| `[DL].[<Table>]` | **HIS-shaped view** — derives the familiar SCD2 shape from the feed (`ETL_Date`, `ETL_EndDate`, `isCurrent`), so you query a DL-only table exactly like a regular history table. |

When the source schema changes (a new generation), the objects follow automatically: the external
tables are maintained per generation during the load and the views are refreshed after every successful
copy — no manual work required.

One-time setup per environment: the settings **`SchemaDL`** and **`LakeLocation`**
(`adls://<container>@<account>.dfs.core.windows.net`), a **managed identity on the SQL server** with
**Storage Blob Data Reader** on the Data Lake, and database compatibility level **130 or higher** — the
[health checks](#monitoring) point out anything that is missing. Data virtualization is a preview
feature of Azure SQL Database.

## Rebuilding

If the bookkeeping drifts out of step — after manual intervention, say, or because no feed was written
for a while — you wipe it for one table or for all of them:

```sql
EXEC [LoadManagement].[spResetLakeIndex] @Target = 'Source_Schema_Table';  -- empty = all lake tables
```

The next load then resends the complete current dataset as `I` rows. Consumers that derive the current
state with the pattern above notice nothing; a Delta fold simply merges the fresh rows over the top.

## Monitoring {#monitoring}

A series of [health checks](../frontend/admin.md) guards the feed and the read objects:

| Check | Signals |
|---|---|
| **2.12** | A table is set to `DL` and has successful loads, but there is no bookkeeping in the `[LAKE]` schema — so no feed is being produced for it. Usually the ADF factory still runs an older version. |
| **2.13** | A `[LAKE]` bookkeeping table remains for a table no longer set to `DL`. The check supplies a cleanup script; the Parquet files are left alone. |
| **2.14** | A DL-only table has been loaded but is missing (part of) its read objects in the `[DL]` schema — the feed cannot be fully queried from SQL. |
| **2.15** | `[DL]` read objects remain for a table that is no longer an active DL-only table. The check supplies a cleanup script; the Parquet files are left alone. |
| **2.16** | There are active DL-only tables, but `SchemaDL` or `LakeLocation` has not been configured yet. |
| **2.17** | The database compatibility level is below 130, while external tables/`OPENROWSET` require it. Comes with a ready-made fix script. |
| **2.18** | Recent messages that maintenance of the read objects failed or was skipped — with the details in monitoring. |

## Growth

The feed grows with the **number of mutations**, not the number of reloads: a table that is fully
reloaded daily but barely changes yields barely any files. At high mutation volumes it is common to
periodically fold the feed into a Delta table or a snapshot on the consumer side; Yres does not compact
the feed itself.

## See also

- [Data flow](./gegevensstroom.md) — where the lake steps sit in the load flow.
- [History & SCD2](./historie-scd2.md) — the merge mechanism the feed is based on.
- [Archiving](./archivering.md) — the other Parquet output, for old history.
- [Azure Data Lake](../integraties/bronnen/azure-data-lake.md) — the storage itself.
