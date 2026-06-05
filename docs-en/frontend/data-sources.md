---
sidebar_position: 4
title: Data Sources
description: Add and manage sources — the heart of Yres.
---

# Data Sources

> Data sources are the heart of Yres; without sources it does not function.

The panel lets you add/manage sources, generate type mapping and refresh metadata. For the exact connection requirements per source type: see [data source requirements](../referentie/databron-vereisten.md).

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

![Data sources: per source the name, type, integration runtime, credential expiry and the type-mapping button.](/img/screens/source-catalog.png)

## Sources — overview

Per source you manage the name, type and credential expiry date. Two options that deserve attention:

- **Integration runtimes** — choose the IR per source; the default is `AutoResolveIntegrationRuntime`. Custom IRs (in ADF or via [Shared integration runtimes](./admin.md)) are detected automatically.
- **Tags** — comma-separated (e.g. `sales, salesforce`); use them to group sources in the sidebar by type and tag.

### Global typemapping
Via the blue gear: unify data types/properties that differ per source, for a smoother experience with views that combine source types.

## What happens when you add a source

- A number of SQL tables are populated with information about the source (name, type, basic connection info).
- Every source **except file sources and REST services** is stored in a **dictionary** with source metadata (tables, fields, keys and relations).

## Adding tables

After creating the source and refreshing the metadata, you add tables / data integrations. The wizard offers type mapping and load types per table. For file sources (such as Azure Blob) you upload files directly.

:::tip
Refresh the source metadata manually after creation for optimal compatibility.
:::

## Actions (depending on the source type)

| Action | Available for | Purpose |
|---|---|---|
| **Compare metadata** | all sources except file & RestService | Shows metadata differences; compare in HIS and STAGE tables. |
| **Column info** | all sources except file & RestService | Shows columns with source and target data types. |
| **Activate / deactivate** | all sources | Determines whether the table is included in future loads. |
