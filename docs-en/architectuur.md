---
sidebar_position: 6
title: Architecture
description: How Yres is built technically — Azure, ADF, DTAP and lineage.
---

# Architecture (high-level)

> This page describes the architecture at a high level. For the deeper Azure details (resources, access levels, setups, naming, firewall) see [Azure architecture](./referentie/azure-architectuur.md).

## Stack

| Layer | Technology |
|---|---|
| Sources | Exact, AFAS, SAP, Salesforce, databases, REST APIs |
| Orchestration | Azure Data Factory (ADF) — generated and managed by Yres |
| Storage | Azure SQL, Azure Data Lake |
| Reporting | Power BI |
| Identity | Azure SSO + role-based access control (RBAC) |
| Local networks | Integration Runtime (IR) |

## Hosting
By default Yres runs entirely within the customer's **own Azure tenant** — data, infrastructure and costs remain with the customer. Hosting *by Yres* is an explicit option.

## Pipelines
Yres generates ADF pipelines and manages them fully. Existing manual ADF pipelines can keep running alongside Yres in the same Azure environment.

## Lifecycle / DTAP
Yres supports the full lifecycle from development to production, with complete CI/CD integration via Azure DevOps and environment management (DTAP: Development, Test, Acceptance, Production). You test changes in advance, roll them out safely, and recover when needed without data loss.

## Lineage & impact analysis
Visual lineage at **object level** (tables, views, procedures, functions, materialized views) with impact analysis. Column-level lineage is currently not available.

## Existing databases
Yres supports the use of existing Azure databases. A migration from another platform is discussed in an architecture session.

## Further reading

- [Azure architecture](./referentie/azure-architectuur.md) — resources, access levels, setups, naming, firewall, scaling
- [Installation](./setup/installatie.md) — step-by-step setup
- [SQL Interaction](./referentie/sql-interaction.md) — stored procedures, functions and views
