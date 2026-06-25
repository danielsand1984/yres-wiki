---
sidebar_position: 3
title: Projects & Changes
description: Lifecycle management in Yres — bundle work into projects and changes and transport it safely from dev through test to prod.
---

# Projects & Changes

**Projects** and **Changes** form the **lifecycle management** of Yres: you bundle all work on the data warehouse (adding or updating tables, scripted objects, view persistence) into manageable units and then transport those changes in a controlled way from **dev** through **test** to **prod**. This keeps your environments in sync and ensures you never push half-finished work to production.

:::warning Only with multiple environments
The entire **Projects** section (and therefore Changes) is **hidden and blocked for organizations with a single environment**. The icon bar then does not show *Projects*, and the backend refuses to create a project or change with the message *"is not allowed for organizations with a single environment"*. With a single environment there is no dev → prod transport needed: changes are applied directly and the wizard internally uses `ChangeId 1` automatically.
:::

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

## The lifecycle in brief

The five steps a change goes through — **you trigger every action from the change itself** on the **Changes** screen; the *Where* column shows which environment the action runs from:

| Step | What | Where | Behind the scenes |
|---|---|---|---|
| 1 | **Create a change** under a project and book work into it | from the change · dev | — |
| 2 | **Release** — lock the change and make it available to install | from the open change · dev | `[Change].[spRelease]` |
| 3 | **Import** — fetch the change JSON in the target environment (DWH only) | from the released change · env-hop to test/prod | `[Change].[spImport]` |
| 4 | **Install** — install the change and publish the ADF factory | from the released change · env-hop to test/prod | `[Change].[spInstall]` + `publish-datafactory` |
| 5 | **publish-datafactory** — new pipelines land in the target factory | target environment (test/prod) | Azure DevOps pipeline |

## Projects

A **project** groups changes within an environment and gives the work a name, a description and a due date.

![The Projects screen: a table of projects with their status, the button to create a project, and the warning that the section is only available with multiple environments.](/img/screens/projects.png)

The numbers (1)–(6) in the screenshot refer to:

1. **Sub-links** of the section — *Projects* and *Changes*.
2. **Create project** — opens the create form with the fields **Name**, **Description** and **DueDate**.
3. **Projects table** — columns **Name**, **Description**, **DueDate**, **Creator** and **Status**.
4. **Status** — the status code is translated into text: *1 Open · 2 Closed · 3 released · 9 Deleted · 99 Discontinued*.
5. **Row actions** — edit and delete.
6. **Single-environment warning** — the section is hidden and blocked with a single environment.

### Creating a project

1. In the **Projects** section, open the **Projects** sub-link.
2. Click **Create project**.
3. Fill in **Name**, **Description** and **DueDate** and confirm.

:::note Rules for projects
- A project **cannot be deleted** as long as it contains **open changes**.
- The **DueDate** of every change under the project must be **on or before** the DueDate of the project.
:::

## Changes

A **change** categorizes modifications to the data warehouse and is the unit you later release and install. Changes always belong to a project. All data-plane edits in dev are booked under a change (see adding tables in [Data sources](./data-sources.md)), so they travel through the environments together. **Every action — create, release, import and install — happens from the change itself on this screen**; which buttons appear depends on the change's status.

![The Changes screen: the project and change selection at the top, the changes table with statuses, the button to create a change and the contextual actions on the change itself — an open change shows Release, a released change shows Import and Install with the environment hop.](/img/screens/changes.png)

The numbers (1)–(6) in the screenshot:

1. **Project/Change selection (ProjectSelection)** — first choose a **project**; the second dropdown optionally filters on a specific change.
2. **Create change** — appears **only when the selected project has status Open**.
3. **Changes table** — columns **Name**, **Description**, **Project**, **DueDate**, **Creator**, **Status**, **ReleasedDate** and **ReleasedBy**.
4. **Status** — *Open* or *released* (same status translation as for projects); the status determines which actions the change shows.
5. **Open change** — shows the **Release** action (and is still editable); a released change loses its edit actions and instead shows **Import** and **Install** with the environment hop.
6. **Contextual change actions** — from the change itself; **Release** calls `[Change].[spRelease]`, while **Import** and **Install** appear on a released change (see [Releasing](#releasing-a-change) and [Installing](#installing-a-change)).

### Creating a change

1. Open the **Changes** sub-link and choose a **project** at the top.
2. Click **Create change** (only visible with an Open project and the right permissions).
3. Give the change a **Name**, **Description** and **DueDate** and confirm.

:::note Rule for the due date
The **DueDate** of a change must be **on or before** the DueDate of the parent project.
:::

## Scripted Objects

Custom SQL objects that were not generated by Yres — your own tables, views, stored procedures and functions — are managed from the **Object Explorer**: the database-object tree under **Data Engineering**. There you browse your DWH objects and **add a custom object — or include an existing database object — into a change directly from the explorer**. There is no separate "Scripted objects" screen anymore; scripted/custom objects live in the Object Explorer and travel via the change when releasing and installing to test and prod.

- Under **Data Engineering**, open the **Object Explorer** and right-click an object to add it — with or without dependencies, and optionally with content — to a change. See [Adding objects to a change](./data-engineering.md#adding-objects-to-a-change).
- For a **custom table** you choose whether the table's content travels along (behind the scenes: `[Change].[spCopyTableContent]`).

## Release Changes

Releasing makes a change available to be installed on another environment. You do this **from the change itself** on the **Changes** screen: as long as a change is open, it shows the **Release** action.

### Releasing a change

1. Open the **Changes** sub-link and choose the **project** and the **change** you want to release at the top.
2. Review the content (see *Viewing change content* below).
3. On the open change, click **Release** and confirm.

What happens:

- After releasing, the change **can no longer be edited** — the change is locked.
- Yres **blocks** releasing if the change contains content that **another change** depends on; the error message names the dependent change(s).
- Behind the scenes, Yres runs `[Change].[spRelease]` for the relevant `ChangeId`.

### Viewing change content

You can view the content of a change in two ways:

- **As a diagram** — a tree structure per source (**source → schema → table**) that you can expand per node; handy with many objects.
- **As a table** — per object the details: the **load type**, the **delta column** for a delta load, and the behavior when the object already exists.

:::tip Including dependencies (since v1.53)
Since **v1.53** you can choose to include **dependencies and/or content** when adding to a change, and you can include existing database objects directly from the object tree into a change.
:::

## Install Changes

Installing brings a **released** change to the next environment (e.g. dev → test, or test → prod). You also do this **from the change itself**: once a change is released, it shows the **Import** and **Install** actions on the **Changes** screen together with the **environment hop** (from → to).

![A released change with inline actions: the DTAP flow from change to publish-datafactory, the change content, the environment hop and the Import change and Install change buttons — all from the change itself.](/img/screens/changes-release-install.png)

The numbers (1)–(6) in the screenshot:

1. **DTAP flow** — Change (dev) → Release → Import → Install → `publish-datafactory`.
2. **Released change** — only a released change shows the install actions.
3. **Environment hop** — choose the **from** (source) and **to** (target) environment; the combinations are consecutive environments.
4. **Import change** — DWH only; does not publish the ADF factory.
5. **Install change** — DWH and ADF; also publishes the factory.
6. **Progress** — a monitor toast shows the status; `publish-datafactory` runs in Azure DevOps and can take a while.

### Installing a change

1. Open the **Changes** sub-link and choose the **project** and the **released** change at the top.
2. On the change, choose the **environment hop** (from → to).
3. Choose one of the two actions on the change:
   - **Import change** → calls `[Change].[spImport]`: re-fetches the change and project data (including dependencies and content) in the target environment. This is **DWH only** and does **not** publish the ADF factory.
   - **Install change** → imports and **installs** the change with `[Change].[spInstall]` (via the `InstallChange` pipeline where present) **and publishes the ADF factory** by running the Azure DevOps pipeline `publish-datafactory`, so that new data-source pipelines land in the target factory as well.
4. Follow the progress in the monitor toast.

:::note Versions must match
Importing and installing first check whether the **DWH versions** of the source and target environment match. If they differ, you get *"Environment versions do not match, please update"* and you must first update the environment via [Update environments](./admin.md).
:::

### Reimporting and reinstalling

You can reprocess an already installed change:

- **Reimport** → calls `[Change].[spImport]` and re-fetches the change/project data (including dependencies and content).
- **Reinstall** → calls `[Change].[spInstall]` and installs the change again on the environment.

:::info All actions from the change
Releasing, importing and installing all happen **from the change itself** on the **Changes** screen: an open change shows **Release**, a released change shows **Import** and **Install** with the environment hop. There are no separate *Release change* or *Install change* screens anymore.
:::
