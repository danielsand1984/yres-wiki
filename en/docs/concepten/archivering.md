---
sidebar_position: 4
title: Archiving
description: How Yres moves older history to Parquet in the Data Lake with verification — copy, check, purge — and presents live + archive as one whole.
---

# Archiving

**Archiving** moves older rows from the history schema (`HIS`/`ODS`) to **Parquet files in the Azure Data Lake**. This keeps the active data warehouse database small and cheap, while the older history is preserved as column-oriented files — and, through an automatically maintained **union view**, still queries together with the live table.

Archiving works in three steps per table, within a single run of the `Dynamic Archiving Workflow YRES`:

1. **Copy** — the rows matching the archiving rule are written as Parquet to the `archive/` path in the Data Lake.
2. **Verify & purge** — `[LoadManagement].[spArchivePurge]` counts the rows that match the rule *right now* and deletes them **only on an exact match** with the number of copied rows. If the counts differ (a load ran in between), **nothing** is deleted and you can safely rerun.
3. **Refresh the union view** — `[LoadManagement].[spArchiveMaintainView]` generates the per-table view `[<HIS schema>].[<Target>_IncArchive]` that presents the live table and the archived Parquet files as one whole.

:::tip Trial-run first, purge later
The purge is **off** by default (setting `ArchivingPurgeEnabled = 0`). In that mode the workflow only copies to the Data Lake and deletes nothing — ideal for validating the configuration and the Parquet output. Then set `ArchivingPurgeEnabled` to `1` (plus `AllowDeletesFromDB` to `1` — a double safeguard) to actually clean up.
:::

## Two archiving modes per table

Archiving is **opt-in per table** and comes in two modes, configured on `LoadManagement.UsedTables` (via `spMaintainTable`):

| Mode | What gets archived | Typical use |
|---|---|---|
| **`CLOSED`** | Only **closed SCD2 versions**: rows with `isCurrent = 0` whose `ETL_EndDate` is older than the retention period. The current row always stays in the database. | History cleanup without functional impact: the current state stays complete. |
| **`BUSINESS`** | **Real data** based on a **date column in the dataset** (the `ArchivingColumn`), e.g. invoices older than 10 years — including current rows. | Legal/functional retention: "anything older than X years may leave the data warehouse". |

The configuration columns:

| Column (`UsedTables`) | Meaning |
|---|---|
| `ArchivingMode` | `NULL` = off, `CLOSED` or `BUSINESS`. |
| `ArchivingColumn` | `BUSINESS` only: the dataset column holding the business date (must exist in the Dictionary). |
| `ArchivingRetention` + `ArchivingRetentionUnit` | The retention period: a number of `YEAR` / `MONTH` / `DAY` (e.g. `10` + `YEAR`). |
| `ArchivingClause` | Advanced: a free-form WHERE clause that **overrides** the mode — for edge cases such as a Unix-timestamp column. With `BUSINESS`, such a clause may only reference data columns (no `ETL_*`/`isCurrent`). |

From this configuration the function **`[LoadManagement].[fxArchivingPredicate]`** builds a single archiving condition, with the cutoff date as a **fixed literal** — so the copy and the purge within one run are guaranteed to use exactly the same rule. The result appears as **`ArchivingScript`** (`FROM <HIS schema>.<Target> WHERE <condition>`) on the contract view `[LoadManagement].[vwExtractor]`; the workflow only picks up tables where this script is populated.

:::note Archived data does not come back (BUSINESS)
With `BUSINESS` archiving, a deleted row may still exist in the source system. That is why, in this mode, the load engine (`spHIS_InsertAndUpdate`) **blocks** all incoming rows that fall inside the "archived space" (business date older than the cutoff): they never reach `HIS` again, not even through a FULL or IMAGE load. The number of blocked rows is logged per load (`Blocked archived-space rows in page` in monitoring). Tip: align the table's `LoadFilter` with the archiving cutoff so the source extraction stops fetching that old data as well. `CLOSED` does not need this blocking: the current row simply stays in the database.
:::

## When does archiving run?

Archiving is a **separate workflow** (`Dynamic Archiving Workflow YRES`), independent of the normal load. It runs when you start it explicitly — manually or via your own trigger — with the same scope and tier parameters as the regular load:

| Parameter | Default | Meaning |
|---|---|---|
| `Source` / `Schema` / `Table` | `ALL` | Limit the run to one source, schema or table. |
| `RunningTier` | `Current` | Temporarily scale the database up during the run. |
| `RevertToTier` | `Previous` | Tier to scale back to afterwards. |

The `ForEach` over the tables runs in parallel (`batchCount: 3`); the pipeline itself has `concurrency: 1` — at most one archiving workflow runs at a time.

## How it works (outline)

```
Manual run / trigger  (Source, Schema, Table, RunningTier, RevertToTier)
  → (optional) Set DB Tier           → temporarily scale the database up
  → Get tables (Lookup)              → SELECT … FROM [LoadManagement].[vwExtractor]
                                        WHERE [ArchivingScript] IS NOT NULL
  → ForEach per table (parallel):
        Copy data                    → 'SELECT * ' + ArchivingScript
                                        → Parquet on archive/… (AzureDataLakeStorage_ARCHIVE)
        Purge archived rows          → [LoadManagement].[spArchivePurge]
                                        recounts; deletes only on an exact match,
                                        batched, double-gated by settings
        Maintain archive view        → [LoadManagement].[spArchiveMaintainView]
                                        refreshes the <Target>_IncArchive union view
  → (optional) Set DB Tier Back      → scale the database back
```

As with a regular load, ADF is the generic executor and the logic lives in SQL: the `ArchivingScript` deliberately starts with `FROM`, so both a `SELECT *` (copy) and a `DELETE` (purge) can be prefixed to it — both therefore operate on **exactly the same** row selection.

## What lands in the Data Lake

The Copy step writes the result as **Parquet** to a dedicated archive path (dataset `AzureDataLakeStorage_ARCHIVE`), separated from the regular Data Lake loads:

```
archive / <Source> / <TargetSchema> / <Target> / <year> / <month> / <Target>-<timestamp>.parquet
```

The exported rows keep all SCD2 framework columns (`KeyHash`, `RowHash`, `ETL_Date`, `ETL_EndDate`, `isCurrent` and the `RowID`), so the archive has the same structure as the source in `HIS`.

## Live + archive as one whole: the `_IncArchive` views

After every successful copy, `spArchiveMaintainView` refreshes the per-table view **`[<HIS schema>].[<Target>_IncArchive]`**: a `UNION ALL` of the live table and the archived Parquet files, read through **Azure SQL data virtualization** (`OPENROWSET` over an external data source on the Data Lake). Consumers that also need the archived history simply query this view instead of the table.

- The view **deduplicates** on the internal `RowID` with precedence for the live row — a copy-only trial run or a restart can legitimately put the same rows in the archive twice.
- The column list and data types are **regenerated** from the live table on every archiving run, so column changes follow automatically.
- View maintenance can **never block archiving**: if it fails (e.g. permissions not set up yet), that is logged and archiving simply continues. The view appears automatically on the next run once the issue is resolved.

:::caution Permissions for the union views
The views read the Data Lake directly from SQL. This requires a one-time per-environment setup: a **system-assigned managed identity on the logical SQL server**, **Storage Blob Data Reader** for that identity on the Data Lake container, and the setting **`ArchiveLakeLocation`** (`adls://<container>@<account>.dfs.core.windows.net`). Until that is done, archiving itself works fine — only the views are skipped (with a message in monitoring). Data virtualization is a preview feature of Azure SQL Database.
:::

## The settings

| Setting (`[Config].[Settings]`) | Default | What it controls |
|---|---|---|
| **`ArchivingPurgeEnabled`** | `0` (No) | Master switch of the purge step. `0` = copy only (trial mode), `1` = also delete from `HIS` after a verified copy. |
| **`AllowDeletesFromDB`** | existing | Must also be `1` before the purge deletes anything (double safeguard). |
| **`ArchiveLakeLocation`** | empty | `adls://…` location of the Data Lake for the union views; filled by provisioning. Empty = views are skipped. |

The **[health checks](../referentie/monitoring-logging.md)** (`vwYresChecks`, group 7) guard the configuration: `BUSINESS` without a date column, an `ArchivingColumn` missing from the Dictionary, a missing retention period, a clause on `ETL_` columns, and a purge that is enabled while `AllowDeletesFromDB` is off are all flagged.

:::note Retired: settings-driven default archiving
Older versions contained an alternative design (`vwArchivingExtractor` with the settings `DefaultArchivingDate`/`DefaultArchivingLoadtypes`) that would archive all DELTA tables automatically. Since v1.56, archiving is deliberately an explicit per-table choice; the deploy cleans up the old view and settings itself.
:::

## Monitoring

Archiving runs show up in the regular monitoring screens: the per-table steps log as `Process = 'load'` (visible in `vwLoads`/`vwMonitor`, with the HIS table as target) and the workflow steps as `Process = 'Workflow'` (visible in `vwWorkflow`). In addition, the archiving procedures write **detail steps** with `Process = 'Archiving'`: the verification counts (copied vs. currently present), the number of deleted rows, skipped purges (switch off) and the view maintenance. If verification fails, the run fails visibly with the reason in the log — and rerunning is always safe, because nothing was deleted.

## Difference from the load types

Archiving is **independent of** the [load types](./load-types.md). A load type determines what happens to the history table when *loading*; archiving determines what happens to *old* rows. In particular:

- **OVERWRITE** wipes the history on every load — little to archive there.
- **FULL**, **DELTA**, **IMAGE**, **RELOAD** and the other types do build SCD2 history; those tables benefit most from `CLOSED` archiving.
- Tables from **file sources** do not (yet) participate in archiving.

See also [Load types](./load-types.md), [History & SCD2](./historie-scd2.md), the [glossary](./glossary.md) and [Views & pipelines](../setup/views-pipelines.md).
