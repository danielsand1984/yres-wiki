---
sidebar_position: 5
title: Scheduling maintenance with a master pipeline
description: Bundle the periodic maintenance tasks — garbage collection, log retention, archiving and index maintenance — into one master pipeline with a single trigger.
---

# Scheduling maintenance with a master pipeline

Besides loading data, a Yres environment has a handful of **periodic maintenance tasks**: synchronizing the monitor with the actual ADF run statuses, cleaning up old log rows, archiving history and defragmenting indexes. Yres ships these tasks as separate technical pipelines. You can schedule each one with its own trigger, but it is much tidier to build one **maintenance master pipeline** that runs them in the right order — with a single weekly trigger and a single run in the history.

This page shows which building blocks exist, in which order to place them and how to schedule the whole. The general walkthrough of the master pipeline editor is in [Views, pipelines & triggers](./views-pipelines.md#setting-up-a-master-pipeline); here we apply it to maintenance.

## The periodic tasks

| Pipeline | What it does | Parameters (default) |
|---|---|---|
| `GarbageCollection` | Retrieves the factory's recent pipeline runs from the Azure Management API and writes them to `[Monitoring].[AdfLoadMonitor]`, so stuck `RUNNING` statuses in the monitor get reconciled. | none |
| `Maintenance Retention YRES` | Applies the retention policy from `[Monitoring].[RetentionPolicy]`: deletes log rows older than the retention period in batches, via `[Maintenance].[spApplyRetentionPolicy]`. See [Retention of the log tables](../referentie/monitoring-logging.md#retention-of-the-log-tables). | `DryRun` (`false`), `BatchSize` (`100000`) |
| `Dynamic Archiving Workflow YRES` | Copies old history to Parquet in the archive with verification and then purges it from `HIS` — see [Archiving](../concepten/archivering.md). Only does anything for tables with archiving configured. | `Source`/`Schema`/`Table` (`ALL`), `RunningTier` (`Current`), `RevertToTier` (`Previous`) |
| `AdaptiveIndexDefragmentation` | Defragments or rebuilds indexes within a time limit via `[Maintenance].[spAdaptiveIndexDefrag]`, then runs `[Config].[spCompareMetadata]` to flag differences between the dictionary and the database. | e.g. `timeLimit` (`480` min), `minFragmentation` (`5`), `rebuildThreshold` (`30`), `minPageCount` (`8`) |

All four log their progress and errors via `[Monitoring].[spWriteLoadStatus]`, so every step can be reviewed afterwards in **Load Management → Monitoring**.

## Which order?

An order that works well in practice:

1. **`GarbageCollection`** first — maintenance starts with a monitor that is correct, and stuck `RUNNING` statuses are reconciled before retention starts cleaning up.
2. **`Maintenance Retention YRES`** — cleans up the log tables according to the retention policy.
3. **`Dynamic Archiving Workflow YRES`** — moves old history to the archive and purges `HIS`.
4. **`AdaptiveIndexDefragmentation`** last — retention and archiving delete a lot of rows; index maintenance immediately cleans up the fragmentation that this causes.

Schedule the whole thing **outside your load windows** (Sunday night, for example): otherwise index maintenance and the cleanup steps compete with running loads for the same tables.

## Steps

1. Open **Load Management → Design master pipeline** and create a new flow.
2. Drag four **Run pipeline** nodes onto the canvas and pick the pipeline from the table above for each node (a Run pipeline node can start any Yres, custom or master pipeline).
3. **Connect** the nodes in the order above. Choose the output deliberately:
   - **On success** (green) where a step only makes sense if the previous one succeeded;
   - **On completion** (blue) where maintenance should simply continue even if an earlier step failed — for these four tasks that is usually the best choice, because they are functionally independent and a failed step still lands in monitoring as `FAILED`.
4. Fill in the **parameters** per node (or keep the defaults).
5. Click **Save** and then **Publish**. The generated pipeline appears in the Data Factory (folder `MasterPipelines`) and in **Run pipelines** after a few minutes.
6. **Test** the master pipeline once manually via **Run pipelines** and check the steps in **Monitoring**.
7. Under **Load Management → Triggers**, create a **weekly trigger** on the master pipeline, for example every Sunday at 03:00 — see [Scheduling triggers](./views-pipelines.md#scheduling-triggers) (note the timezone remark there).

:::warning Don't schedule twice
For log retention Yres also ships its own weekly trigger **`Retention`** (Sunday 03:00, delivered in stopped state). If you include `Maintenance Retention YRES` in your maintenance master pipeline, leave that `Retention` trigger **off** — otherwise the cleanup runs twice.
:::

:::note Points of attention
- **Simulate first:** before the first real run, run `Maintenance Retention YRES` once on its own with `DryRun = true`. You then see per table how many rows *would* be deleted, without anything being removed.
- **Archiving never runs twice:** the archiving workflow has `concurrency: 1` — if your master pipeline starts while an archiving run is already active, that step waits.
- **Index maintenance time limit:** `timeLimit` (default 480 minutes) is an upper bound, not an expected duration; the procedure stops cleanly as the limit approaches. Reduce it if your maintenance window is shorter.
- **Tier parameters:** the archiving workflow can temporarily scale up the database during the run (`RunningTier`/`RevertToTier`) — useful when archiving takes too long on the normal tier.
:::

## Alternative: your own ADF pipeline

If you prefer to work directly in Azure Data Factory, you can build the same chain as your own pipeline with **Execute Pipeline** activities and put an ADF trigger on it. Place such a hand-built pipeline in the **`custom pipelines`** folder — that folder is reserved for your own work and coexists with the pipelines managed by Yres. The pipeline then simply appears in **Run pipelines** in the web app.

## Further reading

- [Views, pipelines & triggers](./views-pipelines.md) — the general walkthrough for master pipelines and triggers.
- [Load Management → Master pipelines](../frontend/load-management.md#master-pipelines) — all node types and their points of attention.
- [Archiving](../concepten/archivering.md) — what the archiving workflow does exactly and how to configure it.
- [Monitoring & logging → Retention of the log tables](../referentie/monitoring-logging.md#retention-of-the-log-tables) — the retention policy and its protection rules.
