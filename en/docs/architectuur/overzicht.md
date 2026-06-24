---
slug: /architectuur
sidebar_position: 1
title: Architecture
description: How Yres is put together technically — two planes, the Azure stack, the vwExtractor → STAGE → HIS data flow, DTAP and lineage.
---

# Architecture (high-level)

> This page describes the architecture at a high level. For the deeper Azure details (resources, access levels, setups, naming, firewall) see [Azure architecture](./azure-architectuur.md). The full load flow is covered in [Data flow](../concepten/gegevensstroom.md) and the history model in [History & SCD2](../concepten/historie-scd2.md).

## The two planes

Yres consists of **two planes that never share data**. This distinction is the heart of the architecture:

| | Control plane | Data plane |
|---|---|---|
| **What** | The multi-tenant SaaS web app (one deployment for all customers) | One ADF factory + one Azure SQL database (`IRIS_DWH`) **per customer organization × environment** |
| **Where** | Hosted centrally by Yres | **Inside the customer's own Azure tenant** |
| **Contains** | Organizations, users, environments and billing in a PostgreSQL database. **Never customer data.** | This is where the data actually moves: source → ADF → Azure SQL → optionally Data Lake → Power BI |

The control plane **provisions and drives** each data plane via the Azure Management API, the ADF API, the Key Vault API, the Azure DevOps API and a direct SQL connection. The web app never reads or stores customer data itself — that stays entirely within the customer's Azure environment.

## Stack (data plane)

| Layer | Technology |
|---|---|
| Sources | Exact, AFAS, SAP, Salesforce, databases, REST APIs and dozens of other connectors |
| Orchestration | Azure Data Factory (ADF) — generated and managed by Yres |
| Storage (warehouse) | Azure SQL (`IRIS_DWH`) — holds both the data and the load engine |
| Storage (optional) | Azure Data Lake Gen2 — Parquet files |
| Secrets | Azure Key Vault — all source and database credentials |
| CI/CD | Azure DevOps — Git + deployment for both ADF and the database |
| Reporting | Power BI |
| Identity | Azure SSO + role-based access control (RBAC) |
| Local networks | Integration Runtime (IR) |

## Hosting

By default Yres runs entirely within the customer's **own Azure tenant** — data, infrastructure and costs stay with the customer. This is a deliberate choice: no vendor lock-in and full control over your own data.

:::info To be confirmed
The wiki previously also mentioned hosting *by Yres* as an explicit option. Both Yres sources, however, consistently emphasize that everything runs 100% within the customer's own Azure tenant. Whether a Yres-hosted variant is offered, and under what conditions, is a commercial decision that the owner must confirm before this is published.
:::

## The core idea: metadata drives, ADF executes

Nothing about a customer's specific tables is hardcoded in ADF or SQL. The data warehouse publishes, through a single view — **`[LoadManagement].[vwExtractor]`** — exactly which tables need to be loaded and with which parameters. ADF reads that view, copies the bytes for each table into the `STAGE` schema and then calls back into SQL to run the set-based SCD2 merge into history.

The upshot: **adding a source means inserting metadata rows, not writing a new pipeline.** The load logic lives entirely in SQL; ADF only moves bytes.

> **Note (clarification):** Yres is not a visual drag-and-drop pipeline designer. You **configure sources, tables and load types in wizards**, after which Yres **automatically generates** the ADF pipelines.

## The data flow of a single load

The same common thread runs underneath every load. At a high level:

1. **Trigger / manual run / web app call** starts the orchestrator pipeline (`Dynamic Workflow YRES`).
2. **Start workflow** logs the start via `[Monitoring].[spWriteLoadStatus]`.
3. **Get tables** reads `vwExtractor` (the underlying logic lives in the function `[LoadManagement].[fxExtractor]`) and determines which tables are loaded.
4. Per table (in parallel) ADF copies the source via **Copy** into **`STAGE.<Target>`**.
5. **Load DWH** calls `[LoadManagement].[spLoadDWH]`, which forwards to `[LoadManagement].[spHIS_InsertAndUpdate]` — the SCD2 merge from `STAGE` into **`HIS`** (by default the `ODS` schema).
6. Optionally, **Load DL** lands a copy as **Parquet** in the Data Lake.
7. `STAGE` is cleaned up (unless `keepStage=1`) and the status is closed out via `spWriteLoadStatus`.

The three layers the data flows through:

| Layer | Schema | Contents |
|---|---|---|
| **STAGE** | `STAGE` | Raw landing of the source extract + `ETL_Date` + computed `Keyhash`/`Rowhash` |
| **HIS** | default `ODS` | Full SCD2 history (business columns + framework columns) |
| **Expose / reporting** | `Exposed`, user schemas | Reporting views/tables + access management (RBAC) |

> The full step-by-step explanation, including monitoring and logging, is in [Data flow](../concepten/gegevensstroom.md). How Yres keeps history (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `isCurrent`, `Delta`) is covered in [History & SCD2](../concepten/historie-scd2.md).

## Data Lake (medallion / Parquet)

Alongside the Azure SQL warehouse, Yres can **optionally** also write each load as **Parquet** to Azure Data Lake Gen2, partitioned by source/schema/table/year/month. This is a separate, parallel landing for analytics and data lake scenarios (medallion approach).

:::note Two separate tracks
The Data Lake copy is **independent of** the SCD2 history engine. The SCD2 history is built in Azure SQL (`STAGE` → `HIS`) by `spHIS_InsertAndUpdate`; the Parquet landing is a separate ADF Copy from `STAGE` to the Data Lake. Don't confuse the two: the warehouse is the source of truth for history, the Data Lake is an optional extra landing.
:::

## Pipelines

Yres generates ADF pipelines and manages them entirely. Existing manual ADF pipelines can keep running alongside Yres in the same Azure environment.

## Lifecycle / DTAP

Yres supports the full lifecycle from development to production, with CI/CD integration via Azure DevOps and environment management (DTAP: Development, Test, Acceptance, Production). You test changes up front, roll them out safely and roll them back when needed without data loss. The first environment is always **development**; depending on your license you can set up multiple environments.

## Lineage & impact analysis

Visual lineage at the **object level** (tables, views, procedures, functions, materialized views) with impact analysis. Column-level lineage is not currently available.

## Existing databases

Yres supports the use of existing Azure databases. A migration from another platform is something we discuss in an architecture session.

## Further reading

- [Azure architecture](./azure-architectuur.md) — resources, access levels, setups, naming, firewall, scaling
- [Data flow](../concepten/gegevensstroom.md) — how a single load runs from trigger to historized data
- [History & SCD2](../concepten/historie-scd2.md) — surrogate keys, `ETL_Date`, `isCurrent`, hash-based change detection
- [Load types](../concepten/load-types.md) — the seven load types and what they do to the history table
- [Installation](../setup/installatie.md) — set up step by step
- [SQL Interaction](../referentie/sql-interaction.md) — stored procedures, functions and views
