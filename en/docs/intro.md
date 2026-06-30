---
slug: /
sidebar_position: 1
title: What is Yres?
description: Yres is the Azure data platform that automates your data warehouse for reliable dashboards and reporting.
---

# What is Yres?

**Yres designs, builds and manages your complete data warehouse in Microsoft Azure**, so data teams can deliver faster with less maintenance and complexity.

Yres runs entirely in **your own Azure tenant** and sits *beneath* Power BI — not beside it or instead of it. It ensures that the data your dashboards pull in is reliable, up to date and correctly structured.

> Want to understand right away how data flows through Yres? Read [Data flow](./concepten/gegevensstroom.md) (the common thread: from source to historized data) and the [Architecture overview](./architectuur/overzicht.md) (which Azure resources Yres uses).

## In one sentence

> Yres is a cloud platform that connects all your data, keeps it automatically up to date and makes it usable — without technical knowledge. It runs entirely in your own Azure environment, saves costs through smart scaling, and gives you full control over your data without vendor lock-in.

## The core idea

Data platforms often grow into complex custom structures that are hard to manage and become dependent on a single engineer. With Yres you centralize and standardize data sources, pipelines and management within **one Azure environment**. This lets you work faster with reliable data, without unnecessary complexity.

The key principle: you don't add a pipeline, you add **metadata**. You configure sources, tables and load types in wizards, and from these Yres automatically **generates** the Azure Data Factory (ADF) pipelines. No one writes a pipeline by hand.

| | Without Yres | With Yres |
|---|---|---|
| **Connections** | Set up differently per application, custom-built | Standardized, off-the-shelf |
| **Management** | Knowledge held by one engineer | Transparent and transferable |
| **Pipelines** | Fragile scripts | Wizards configure sources/tables/load types; Yres generates the ADF pipelines |
| **Reporting** | Data from various places, often outdated | One reliable source, historized (SCD2) |
| **Onboarding** | Long implementation process | Typical setup in ~20 minutes |

## Who it is for

Organizations working with **Microsoft Azure** and **Power BI** that want control over the management of their data sources, pipelines and data warehouse — without manual work or hidden complexity. Yres is no-code: you don't need data engineering knowledge to connect and load sources.

## Name change: Iris → Yres

The product used to be called **Iris** and is now called **Yres**. You will still come across "Iris" in older sources, Azure resource names, Confluence spaces (`spaceKey=IRIS`) and internal identifiers — that is the same product. In the code you'll see this reflected in names like `IRIS_DWH`, `Dynamic Workflow IRIS`, `IRIS_VERSION` and Key Vault names `kv-iris-…`. Those identifiers stay unchanged; in the wiki we refer to **Yres**.

## Contact & feedback

For **feedback, questions or a demo request**, email **feedback@yres.app** — you'll get a reply at your own account address. The in-app feedback forms (Bug report / Feature request / Feedback) arrive at the same address.

The **web app runs on a per-organization subdomain**; there is therefore no fixed web-app address to list here.

## Core concepts

Technically, Yres consists of a set of **Azure resources and templates**. During installation these are created and configured according to the Yres templates; Yres gains access to the Azure tenant via an **App Registration** with the right roles. Everything runs within your own Azure tenant — Yres never has direct access to your sources, and all processes keep working even if you stop using Yres.

- **Organization** — the isolated space in which a customer uses Yres. An organization gets a unique, freely chosen name (without non-alphanumeric characters); in addition, Yres generates a secondary name for resource and DevOps names.
- **Environment** — a DTAP environment within the organization. The **first environment is always `dev`** (fixed in resource names, e.g. `sqlsrv-xxx-dwh-dev`). Depending on your license you add extra environments such as `test`/`acceptance`/`quality`/`prod`.
- **Projects & changes** — categorize work and transport changes through the DTAP chain (e.g. dev → prod). Only available for organizations with multiple environments.
- **Data sources** — the heart of Yres; the sources data is loaded from.
- **Load Management** — pipelines (ADF), triggers, monitoring and persisted views.

:::note The number of environments depends on your license
The **Essentials** license gives **1 environment** (so only `dev`). **Advanced** gives 2, **Ultimate** unlimited. The recommendation in the course is to work with **2 to 4 environments**. "At least dev and prod" therefore does not apply to every license — Essentials works with a single environment. See [Pricing](./prijzen.md).
:::

Core features: **SSO** (Azure), **Log Management**, **Life Cycle Management** (changes via projects & changes through the DTAP chain), and **flexibility & scalability** by leveraging Azure resources (including automatic scaling of the database).

## How this wiki is structured

| Section | Content |
|---|---|
| **Product** | Proposition, use cases, features, how it works |
| **Concepts** | Yres explained, [data flow](./concepten/gegevensstroom.md), [load types](./concepten/load-types.md), [history & SCD2](./concepten/historie-scd2.md), glossary |
| **Architecture** | [Azure resources, access and setups](./architectuur/overzicht.md) |
| **Usage (frontend)** | What each panel in the web app does |
| **Setup & installation** | Installing Yres in an Azure tenant |
| **Integrations** | Sources + connection requirements per source |
| **Reference** | SQL interaction, release notes |
| **Pricing · FAQ · Troubleshooting** | Other |
