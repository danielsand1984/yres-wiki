---
sidebar_position: 5
title: Load Management
description: Pipelines, triggers, monitoring and master pipelines.
---

# Load Management

Manage data loading via pipelines, their triggers, monitoring and master pipelines.

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

![Run Pipelines: pick a pipeline on the left, filter by period/status and start it with **Start pipeline**.](/img/screens/run-pipelines.png)

## Run Pipelines
Start pipelines manually (load a table, fetch metadata). Custom ADF pipelines also appear in the menu on the left. Filter by date range and status; the **Dynamic Yres Workflow** supports additional filters on source, schema and table.

## Triggers
Schedule pipelines with a recurrence pattern.

![Triggers: pick a pipeline and schedule it with Create.](/img/screens/loadmanagement-triggers.png)

1. Select a pipeline on the left.
2. Click **Create**.
3. Fill in the form and click **Submit**.

## Monitoring
View the load history per table, detailed log steps, and roll back or reset tables. The menu tree on the left follows **source → schema → table**; tables show the last load date and status. The **worst status bubbles up** to the schema and source level, so failed loads are visible at a glance. Per run: detail steps, error messages, link to the ADF pipeline, roll back (clock icon) or fully reset the table.

![Monitoring: targets per source with their load status.](/img/screens/loadmanagement-monitoring.png)

## Master Pipelines
Design ADF pipelines with custom flows from the frontend (UI based on [reactflow](https://reactflow.dev/)).

**Basics:** drag a node type from the left onto the grid; connect nodes by dragging from a point on the right to the dark point on the left of another node; delete with Backspace. **Save** = draft; **Publish** (after save) converts the pipeline to ADF (folder `MasterPipelines`).

The three outputs on the right of a node are: **On success**, **On failure**, **On completion** — this is how you build logic-driven flows.

### Node types

| Node | Purpose | Notes |
|---|---|---|
| **Load Sources** | Runs the Dynamic Workflow Yres pipeline. | Requires source, schema, table. |
| **Alternative load** | Like Load Sources, with a customizable load type. | Only FULL, IMAGE, OVERWRITE, RELOAD. |
| **Wait** | Waits until a specific time. | Takes the time zone from user settings into account. |
| **Change ServiceTier** | Changes the service tier for the pipeline. | < S3 no Columnstore index; < P1 no in-memory tables. |
| **Run Pipeline** | Runs other Yres/custom/master pipelines. | |
| **Refresh PowerBI** | Refreshes a Power BI model created in Yres. | See [Admin → PowerBI Models](./admin.md). |
| **Persist View** | Runs the Materialize Views pipeline. | Requires source, schema, table. |

> The list of node types may be expanded in the future.

## Screens & routes

Load Management consists of: Run pipelines (`/loadmanagement/runPipelines`), Triggers (`/loadmanagement/triggers`), Monitoring (`/loadmanagement/monitoring`), Master pipelines (`/loadmanagement/masterPipelines`), Integration runtimes (`/loadmanagement/integration-runtimes`), Scripted objects (`/loadmanagement/scriptedObjects`), Datawarehouse processes (`/loadmanagement/datawarehouse-processes`) and Datawarehouse queries (`/loadmanagement/datawarehouse-queries`).
