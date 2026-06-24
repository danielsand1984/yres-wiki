---
sidebar_position: 4
title: How it works
description: One platform, from data source to dashboard — you capture sources and tables in wizards, and Yres generates the Azure Data Factory pipelines.
---

# How it works

> One platform, from data source to dashboard. You capture *what* needs to be loaded in wizards; Yres generates the Azure Data Factory pipelines from that. You don't write any code.

Yres runs entirely within your **own Azure environment** and automates the full chain from source to reliable dashboard. Under the hood everything is **metadata-driven**: adding a source means inserting metadata rows, not building a pipeline. To see exactly how a single load runs from trigger to historized data, read [Data flow](../concepten/gegevensstroom.md).

## 1. Connect your sources without code

Native connectors with Exact Online, AFAS, SAP, Salesforce, databases (SQL Server, MySQL, PostgreSQL, Oracle, Snowflake, DB2), OData, REST APIs and more. You add a source through a wizard — no custom work. See the [integration catalog](../integraties/catalogus.md).

![Create source wizard: step 1 of 2 with fields for source name, type, integration runtime and credentials](/img/screens/source-create-wizard.svg)

*The "Create source" wizard. You enter *which* source you're connecting; the credentials go straight to your own Azure Key Vault, not to Yres.*

(1) **Source name** — unique (2–45 characters); becomes the name of the linked service and the matching Key Vault secret group.
(2) **Type** — choose the source type (database, ERP, REST, OData, file source, …).
(3) **Integration runtime** — `AutoResolveIntegrationRuntime` for cloud-reachable sources, or a self-hosted IR for on-prem and behind-the-firewall sources.
(4) **Credentials** — do they apply to all environments or per environment? The frontend never stores secrets itself: they are placed in your **Azure Key Vault** and the linked service references them.

## 2. Configure in wizards, Yres generates the ADF pipelines

Yres has **no visual pipeline designer** in which you draw components on a canvas. Instead, you capture *what* needs to happen in wizards — sources, tables, load types and key columns — and Yres automatically generates the corresponding **Azure Data Factory (ADF)** pipelines and linked services from that.

- You add tables and choose a [load type](../concepten/load-types.md) per table (such as FULL, DELTA or IMAGE).
- Based on that metadata, Yres generates the ADF objects; the generic `Dynamic Workflow YRES` pipeline runs the loads and calls the SQL load engine.
- Existing, manually built ADF pipelines can keep running alongside Yres in the same Azure environment.

:::tip Metadata-driven, not visually designed
Adding a source or table is a matter of entering metadata. Yres translates that metadata into ADF pipelines — you don't have to build or maintain a pipeline. The common thread underlying all of this is described in [Data flow](../concepten/gegevensstroom.md).
:::

:::info To be confirmed
"Existing manual ADF pipelines keep running alongside Yres" is plausible (Yres adds its own pipelines and linked services), but it is not stated explicitly in the product documentation. Have the owner confirm this.
:::

## 3. Automatic health checks and monitoring

Yres provides insight into your load processes: per-pipeline timelines, per-step status and error messages are logged in the data warehouse and visible in the web app. In addition, **automatic health checks** run that verify the setup and settings of your environment (driven by the view `[Maintenance].[vwYresChecks]`).

- **Monitoring** — load status, run times and counts of processed rows, per run and per step. See [Load Management](../frontend/load-management.md).
- **Health checks** — periodic checks on your environment and settings, so anomalies surface early.

:::info To be confirmed
Earlier versions of this page mentioned "cost monitoring" as a product feature. No cost-monitoring screen or function is documented; the documentation only warns that scaling up affects your Azure costs. Have the owner confirm whether a cost-monitoring function exists before listing it as a feature.
:::

---

## The demo

Not a standard sales demo. In a no-obligation conversation with a data architect, we look together at your current Azure environment, discuss pain points and show how Yres helps.

**What you can expect:**

1. **Analysis of your current data environment** — how is your platform set up, which sources do you use, where are the challenges?
2. **Demonstration of Yres** — a live demo of how sources, tables, load types and workflows are configured and automated within Azure.
3. **Application to your situation** — where can you gain in terms of stability, management and scalability?

> Within 30 minutes you'll know whether Yres is a fit for you.

:::info To be confirmed
The demo setup and the promise "within 30 minutes you'll know whether Yres is a fit" are sales framing and are not in the official product documentation. Have the owner confirm the exact demo promise.
:::
