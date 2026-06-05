---
sidebar_position: 3
title: Connecting & loading a data source
description: Adding a source, refreshing metadata, load types and key columns.
---

# Connecting & loading a data source

Yres supports Oracle, Azure, MySQL, SAP, Salesforce and generic OData/REST, among others. Connection requirements differ per type — see [data source requirements](../referentie/databron-vereisten.md).

## Connecting a source
Example (SQL Server): host, port, database name, username and password. After creating it, it takes a moment before the source is published to **Azure Data Factory**.

## Refreshing metadata
Click **Refresh Metadata** on a source for up-to-date data; use the link icon to follow the progress.

## Load types

| Load type | Description |
|---|---|
| **FULL** | Replaces existing records with new ones. |
| **DELTA** | Compares old and new data and adds changed records. |
| **OVERWRITE** | Removes existing records and adds all new ones. |
| **RELOAD** | Like FULL, but with optimized updates that do not replace unchanged data. |
| **IMAGE** | Does not replace or reload, but keeps a record of older data. |
| **ADDITIONAL** | Adds new records without replacing existing ones. |

> Since v1.53 there is also **Delta Image**: selectively reload a period (e.g. last year) while outdated records are removed and history is preserved.

## Key columns
Key columns uniquely identify columns when the column composition may change. Specify them when adding a source. (For SQL sources except MySQL, two delta columns are also supported — comma-separated in `LoadManagement.UsedTables.deltaColumn`, same data type, highest value wins.)
