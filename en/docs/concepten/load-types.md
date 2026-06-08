---
sidebar_position: 2
title: Load types
description: All load types in Yres and what they do to the target table.
---

# Load types

A **load type** determines what happens to the existing data in the target table during a load. You set it per table (and can override it per run with an *alternative load*).

| Load type | What it does | History? |
|---|---|---|
| **FULL** | Replaces existing records with new ones. | No |
| **DELTA** | Compares old and new data and only adds **changed** records. | Yes (via staging) |
| **OVERWRITE** | Deletes all existing records and adds all new ones. | No |
| **RELOAD** | Like FULL, but with optimized updates that do **not** replace unchanged data. | Keeps unchanged |
| **IMAGE** | Does not replace/reload, but keeps a **record of older data**. | Yes |
| **ADDITIONAL** | Adds new records **without** replacing existing ones. | Yes (append only) |
| **Delta Image** *(v1.53+)* | Selectively reloads a **period** (e.g. last year), removes outdated records from that period and keeps the remaining history. | Yes (per period) |

## Which load type when?

- **FULL / OVERWRITE** — small tables or tables to be fully refreshed; no history needed.
- **DELTA** — large tables with a reliable change column; process only changes.
- **RELOAD** — reload the full set but avoid unnecessary writes (and therefore cost/time).
- **IMAGE** — when you want to keep historical snapshots.
- **ADDITIONAL** — append-only sources (logs, events).
- **Delta Image** — periodically reload a defined period (e.g. fiscal-year corrections).

## Related settings

- **Key columns** — uniquely identify records when column positions may change. For SQL sources (except MySQL), two delta columns are possible (comma-separated in `LoadManagement.UsedTables.deltaColumn`, same data type — the highest value counts).
- **Staging (`DefaultKeepStage`)** — for delta loads, a staging table that is truncated or kept after processing.
- **Surrogate keys (`DefaultSurrogate`)** — automatically generated keys on the natural key (stored in `[LoadManagement].[SurrogateKeys]`).
- **Pagination (`UsePagination` / `PageSize`)** — process large datasets (100M+ records) in pages.

See also [Connecting & loading a data source](../setup/databron-koppelen.md) and the [glossary](./test/glossary.md).
