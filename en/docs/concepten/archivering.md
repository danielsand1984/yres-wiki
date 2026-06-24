---
sidebar_position: 4
title: Archiving
description: How Yres writes older history to Parquet in the Data Lake via vwArchivingExtractor and the Dynamic Archiving Workflow YRES.
---

# Archiving

**Archiving** writes older rows from the history schema (`HIS`/`ODS`) to **Parquet files in the Azure Data Lake**. This keeps the active data warehouse database smaller and cheaper, while the older history is retained as column-oriented files that you can still query later.

:::note What archiving does and does not do
Archiving **copies** rows older than a configured cut-off date to the Data Lake. In the current `Dynamic Archiving Workflow YRES`, those rows are **not** automatically removed from `HIS`/`ODS` — the workflow contains only a Copy step to Parquet, no delete step on the history schema. Archiving is therefore primarily an **offload/back-up mechanism** to the Data Lake, not a purge.
:::

## When does archiving run?

Archiving is a **separate workflow** (`Dynamic Archiving Workflow YRES`), independent of the normal load. It runs when you explicitly start it:

- via a **trigger** (schedule) attached to this pipeline, or
- via a **manual run** with parameters (`Source`, `Schema`, `Table`).

It is therefore **not part of every load**: a regular load (`Dynamic Workflow YRES`) does not touch the Data Lake archives. Archiving is a scheduled, recurring clean-up action that you set up separately.

## How it works (high level)

```
Trigger / manual run  (Source, Schema, Table, RunningTier, RevertToTier)
  → WLS Start workflow                 → [Monitoring].[spWriteLoadStatus]  (Process = 'Archiving Workflow')
  → (optional) Set DB Tier             → temporarily scale the database up
  → Get tables (Lookup)                → SELECT … FROM [LoadManagement].[vwExtractor]
                                          WHERE [ArchivingScript] IS NOT NULL
  → ForEach "Load data" (parallel, batchCount 3), per table:
        WLS Start DL Archiving load    → spWriteLoadStatus  (Process = 'Archiving')
        Copy data                      → run [ArchivingScript] (a SELECT from HIS)
                                          → Parquet in the Data Lake (AzureDataLakeStorage_MAIN)
        WLS End DL load                → spWriteLoadStatus
  → (optional) Set DB Tier Back        → scale the database back
  → WLS End Workflow                   → spWriteLoadStatus
```

The key idea: the **SQL database decides what gets archived** (via a view), and ADF only executes the Copy command to the Data Lake. As with a regular load, ADF is a generic executor; the logic lives in SQL.

### The archiving script comes from a view

Which rows qualify for archiving is computed in **`[LoadManagement].[vwArchivingExtractor]`**. That view builds an **`ArchivingDeltaScript`** per table: a `SELECT * FROM <HIS-schema>.<Target> WHERE …` with a filter on the cut-off date.

- For **DELTA** tables, the script filters on the **delta column**: `WHERE [DeltaColumn] < [ArchivingDate]` (with a data-type-dependent cast to `date`/`datetime`/`datetime2`/etc.).
- For the other tables, it filters on the load date: `WHERE ETL_DATE < [ArchivingDate]`.

The final script is exposed to ADF via the **`[ArchivingScript]`** column on the contract view `[LoadManagement].[vwExtractor]`. The archiving workflow only retrieves the tables for which this script is populated (`WHERE [ArchivingScript] IS NOT NULL`); tables without a cut-off date are not included.

## Determining the cut-off date

The cut-off date (`ArchivingDate`) is determined per table as follows (see `vwArchivingExtractor`):

1. **Per-table override** — the column `LoadManagement.UsedTables.ArchivingClause`. If a value is present here, it takes precedence.
2. **Default settings** — otherwise: if the table's load type appears in the **`DefaultArchivingLoadtypes`** setting (a comma-separated list), then the **`DefaultArchivingDate`** cut-off date is used.
3. **No archiving** — if the table matches neither, `ArchivingDate` stays empty and the table is skipped.

This way you can enable archiving broadly with two settings (which load types, from which date), while still being able to deviate per table via `ArchivingClause`.

### The settings

| Setting | What it controls | Type |
|---|---|---|
| **`DefaultArchivingDate`** | The cut-off date: rows older than this date qualify for archiving. | Code setting in `[Config].[Settings]` |
| **`DefaultArchivingLoadtypes`** | Comma-separated list of load types for which the default cut-off date applies. | Code setting in `[Config].[Settings]` |

Both settings are **read** in the data warehouse code (by `vwArchivingExtractor`), but they are not part of the default seed (`Script.PostDeployment.sql`) and not in the user manual. They are expected to be populated by the webapp (control plane).

:::info To be confirmed
Who fills in `DefaultArchivingDate` and `DefaultArchivingLoadtypes`, and when, cannot be determined from the data warehouse repository: the values are *read* in the database but not *seeded* there. This presumably happens from the webapp during provisioning or configuration. Confirm the exact origin and the management process before instructing customers to adjust these settings themselves.
:::

## What lands in the Data Lake

The `Copy data` step writes the result of the `ArchivingScript` as **Parquet** to the `AzureDataLakeStorage_MAIN` dataset, partitioned by:

```
<Source> / <TargetSchema> / <Target> / <year> / <month>
```

The year and month come from the time of the archiving run (`utcnow()`). The exported rows retain the SCD2 framework columns (`KeyHash`, `RowHash`, `ETL_Date`), so the Parquet history has the same structure as the source in `HIS`.

## Workflow parameters

`Dynamic Archiving Workflow YRES` accepts the same scope and tier parameters as the regular load:

| Parameter | Default | Meaning |
|---|---|---|
| `Source` | `ALL` | Limit to one source system (or `ALL` for all, or `AUTO` for the tables linked to *this* trigger). |
| `Schema` | `ALL` | Limit to one source schema. |
| `Table` | `ALL` | Limit to one table. |
| `RunningTier` | `Current` | Temporarily scale the database to this tier during the run (`Current` = do not scale). |
| `RevertToTier` | `Previous` | Tier to scale back to afterwards. |

The `ForEach` over the tables runs in parallel with `batchCount: 3`; the pipeline itself has `concurrency: 1` (no more than one archiving workflow ever runs at a time).

## Monitoring

Every step logs via **`[Monitoring].[spWriteLoadStatus]`**, just like a regular load — but with `Process = 'Archiving Workflow'` (at workflow level) and `Process = 'Archiving'` (per table). You will therefore find the runs back in the monitoring views (`vwLoads`, `vwMonitor`) and on the monitoring screen in the webapp. If a table fails, the workflow writes `Status = FAILED` with the error context.

## Difference from the load types

Archiving is **independent of** the [load types](./load-types.md). A load type determines what happens to the history table during loading; archiving determines what happens to *old* rows from that history table (writing them to the Data Lake). Note in particular:

- **OVERWRITE** wipes the history on *every* load (truncate, no history) — so there is little to archive there.
- **FULL**, **DELTA**, **IMAGE**, **RELOAD** and the other types *do* build up SCD2 history; those are precisely the tables that benefit from archiving to keep the database small.

See also [Load types](./load-types.md), the [glossary](./glossary.md) and [Views & pipelines](../setup/views-pipelines.md).
