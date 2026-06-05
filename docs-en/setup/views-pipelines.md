---
sidebar_position: 4
title: Views, pipelines & triggers
description: Generating persisted views and automating pipelines.
---

# Views, pipelines & triggers

## Generating persisted views
A persisted view first requires a **view** in the database. Example: a view `DM.Vw760` in the `sqldb-Yres-dev` database, created via SSML/SSMS.

1. Create the view (via [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) or similar).
2. The view appears under the specified source schema name in the **Create persisted view** dialog.
3. Specify the target schema and table, plus level, source delta object type and load type.

See also [View Persistence](../frontend/data-engineering.md).

## Setting up pipelines & triggers
In the [Load Management panel](../frontend/load-management.md) you run pipelines manually, set up triggers and monitor runs.

- Run **Refresh All Metadata** via **Start Pipeline** after selecting on the left.
- For the **Dynamic Workflow Yres** pipeline you set: source, source schema, source table, the running tier and the tier to return to.
- **Triggers** automate pipelines at fixed intervals (e.g. weekly).

:::tip Master pipelines
For more complex flows with conditional steps (on success/failure/completion) use [Master Pipelines](../frontend/load-management.md) — e.g. deltas during the week and a full reload in the weekend, or a conditional Power BI refresh.
:::
