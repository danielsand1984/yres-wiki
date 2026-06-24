---
sidebar_position: 1
title: Product overview
description: The Yres proposition — from source to dashboard, fully automated, inside your own Azure environment.
---

# Product overview

## The proposition

**The Azure data platform for reliable dashboards and reporting.** Yres builds and manages your complete data warehouse in Microsoft Azure, so data teams can deliver faster with less maintenance and complexity — without writing a single line of code.

> *"Yres is a cloud-based platform that connects all your data, keeps it updated automatically, and makes it easy to use—without needing technical skills. It runs entirely in your own Azure environment, saves costs through smart scaling, and ensures full control of your data without vendor lock-in."*

## From source to dashboard — fully automated

The entire chain runs within a single Azure environment:

```
Sources            Configuration   Orchestration   Storage                Reporting
(Exact, AFAS,  →   (wizards:    →  (Azure Data  →  (Azure SQL,        →   (Power BI)
 SQL, REST)         sources,        Factory)         Data Lake)
                    tables,
                    load types)
```

1. **Sources** — Exact, AFAS, SQL, REST and more
2. **Configuration** — you capture sources, tables and load types in wizards; you write no pipelines
3. **Orchestration** — based on that, Yres automatically generates the Azure Data Factory (ADF) pipelines
4. **Storage** — Azure SQL and (optionally) Data Lake
5. **Reporting** — reliable, up-to-date data for Power BI

:::tip No visual pipeline designer, but metadata-driven generation
You don't draw pipelines on a canvas. You enter *what* needs to be loaded (source, tables, load type, key columns) and Yres translates that into the corresponding ADF pipelines and linked services. Adding a source is therefore entering metadata — not building custom work.
:::

## The problem Yres solves

Data platforms often grow into complex custom structures that are hard to manage:

- Reports lag behind or are incorrect
- Scripts break and nobody knows what happens when things change
- Every new data source costs time and custom work
- Knowledge sits with a single engineer or consultant

With Yres you centralize data sources, data flows and management within one Azure environment. This lets you work faster with reliable data, without unnecessary complexity.

## One platform you understand, manage and keep in your own hands

### Your data, your environment

Yres runs entirely within your **own Azure tenant**. You retain ownership of your data, infrastructure and costs. Yres never has direct access to your sources, and all processes keep running — even if you stop using Yres. No vendor lock-in.

:::info To be confirmed
The option to have Yres host the environment is a commercial choice that is not part of the product documentation; the documentation instead emphasizes that everything runs 100% in your own Azure tenant. Have the owner confirm whether, and on what terms, a Yres-hosted variant is offered.
:::

### Less dependent on standalone scripts and specific knowledge

By standardizing data sources, data flows and management, the platform stays understandable, transferable and manageable for the whole team — not just for a single engineer.

### Built on proven Azure best practices

Yres uses standardized Azure structures and proven architectures, so data environments stay stable, scalable and manageable. Smart scaling of the database saves costs: you only pay for extra capacity during heavy processing.

### Designed to grow with you

With Yres you add data sources without building up extra management overhead or technical debt. This keeps the platform clear as your organization grows.

## Fast onboarding

A complete Yres environment is typically operational **within an hour** — no lengthy implementation project, no external consultants for the setup. A typical installation takes about **20 minutes**, depending on the number of environments.

:::info To be confirmed
The guideline "you connect a new source in about five minutes" does not appear in the official product documentation. Have the owner confirm or replace this figure before it is published externally.
:::
