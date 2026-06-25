---
sidebar_position: 6
title: Data Engineering
description: Manage view persistence (Level/Delta) and object history (version comparison and dependency trees) from the Yres web app.
---

# Data Engineering

The **Data engineering** section (icon bar, key `general.dataEngineering`) contains two screens that let you manage database objects without working directly in the database:

- **View persistence** (`/dataengineering/viewpersistence`) — materialize views into tables.
- **Object history** (`/dataengineering/objecthistory`) — view the version history and dependencies of objects.

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

## View persistence

A **persisted (materialized) view** stores the result of a view query in an actual table. That way reports read straight from a table instead of recomputing a (potentially slow) view every time. The screen reads from the view **`Loadmanagement.vwViewPersistence`** and lets you manage the configuration and start the **Materialize View** pipeline.

![View persistence screen: a table of persisted views (source view to destination table, Level, Delta, dates) and a form to create a new persisted view.](/img/screens/dataengineering-viewpersistence.svg)

*The View persistence screen: on the left the section icon bar, next to it the sub-links, and in the main pane the persistence table with the create form below it.*

(1) **Run materialize view (all)** — button in the top right (`runMaterializeViewAll`). Appears as soon as the **Materialize View** pipeline exists and runs it for every row in the table.
(2) **Persistence table** — one row per persisted view, including `SourceSchemaName`, `SourceViewName`, `DestinationSchemaName`, `DestinationTableName`, `Level`, `Delta`, `LastPersistDate`, `LastETLDate` and `Active`.
(3) **Run materialize view (per row)** — a row action that fills the `Materialize View` pipeline parameters Schema/Table and opens the ad-hoc runner.
(4) **Maintain-persist-view form** — create/edit/delete a persisted view (CRUD via `MaintainPersistView`).
(5) **Level + load type** — determines the load order and whether the view is updated fully (Full) or incrementally (Delta).

### Creating a persisted view

1. Click **+ Add persisted view** (or edit an existing row).
2. Choose the **source**: `SourceSchemaName` + `SourceViewName` — the view you want to materialize.
3. Choose the **destination**: `DestinationSchemaName` + `DestinationTableName` — the table where the result is stored.
4. Set the **Level** (see below).
5. Choose the **load type** (`Full` or `Delta`); for `Delta` you specify the source object and the `DeltaColumn`.
6. Save. Then materialize right away with **Run materialize view** (per row or for all rows).

### Level — the load order

`Level` determines the **order** in which persisted views are materialized. That matters when one view depends on another:

- If view **B** depends on view **A**, give **A `Level 0`** and **B `Level 1`**.
- A is then materialized first, so that B has an up-to-date source.

Views with a lower level are processed first. For independent views the level doesn't matter.

### Full vs. Delta

The `Delta` column of the table (and the load type in the form) shows how the view is updated:

| Mode | What happens |
|---|---|
| **Full** | The entire view is re-materialized into the destination table on every run. |
| **Delta** | Only changed records are updated, tracked via a source object (view/table) and a `DeltaColumn`. |

:::note Under the hood
The configuration is stored via `MaintainPersistView`; the actual materialization is done by the stored procedure **`[LoadManagement].[spMaterializeViews]`**, which is called by the **Materialize View** pipeline. The same step also sits as **Materialize Views** at the end of the standard load workflow, so that persisted views automatically stay current after a load.
:::

## Object history

The **Object history** screen (`/dataengineering/objecthistory`) shows all database objects — created by a user and by Yres — with their **definition**, **version history** and **dependencies**. You can compare versions, explore dependency trees and add objects to a change.

The object tree on this screen is also the **Object Explorer**: this is where you manage your **scripted/custom objects** (your own tables, views, stored procedures and functions). You browse your DWH objects here and add a custom object — or an existing database object — to a change directly from the explorer via the **Add to change** action. There is no separate "Scripted objects" screen anymore; scripted objects live here in the Object Explorer.

![Object history screen: on the left a schema and object tree with a right-click context menu, top right the version comparison with a diff of the object definition, and bottom right a dependency tree.](/img/screens/dataengineering-objecthistory.png)

*The Object history screen: the object tree on the left, the version comparison with diff in the top right, and the dependency graph in the bottom right.*

(1) **Comparison dropdown** — at the top of the object tree; choose what you compare against (default "No comparison").
(2) **Schema/object tree** — all schemas and objects (for example `CustomYres`, `dbo`, `Expose`, `ODS`, `STAGE`). Click an object to load its definition and dependencies.
(3) **Right-click context menu** — actions on an object (see [Adding objects to a change](#adding-objects-to-a-change)).
(4) **Version comparison + diff** — two dropdowns select the versions; the main pane shows the definition or a line-by-line difference. The button in the bottom left compares the current with the previous definition.
(5) **Dependency tree** — the objects this object **depends on** and those that **depend on it**; click a node to highlight linked objects (handy in large trees).

### Comparing versions

1. Select an object in the tree.
2. In the dropdowns, choose the **current** version and the version you want to **compare** with.
3. Read the difference in the main pane (added and removed lines are highlighted).
4. Or click the button in the bottom left to quickly compare the **current vs. previous** definition.

### Adding objects to a change

Select an object in the **Object Explorer** (the tree) and use the **Add to change** action to include it in a change. This is how your scripted/custom objects — your own tables, views, stored procedures and functions — end up in a change, together with existing database objects you want to take along.

Right-click an object in the tree to open the context menu. From there you can:

- **add it to a change with dependencies** — also includes the objects this object depends on;
- **add it to a change without dependencies** — only the object itself;
- **add it with content** — including the object content (for a custom table this determines whether the table content travels);
- **delete it with a change** — record the deletion in a change.

:::note Changes & DTAP
Adding to a change is part of the [Projects → Changes](projecten-changes.md) process, which promotes changes through your DTAP environments in a controlled way. This menu is meant for setups with multiple environments.
:::

## Further reading

- [History & SCD2](../concepten/historie-scd2.md) — how Yres tracks history (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `IsCurrent`, `Delta`); background on the `Delta` mode of persisted views.
- [Load management](load-management.md) — where you start individual pipelines, including **Persist View** (the Materialize Views pipeline).
- [Data flow](../concepten/gegevensstroom.md) — where the **Materialize Views** step fits in the overall load workflow.
