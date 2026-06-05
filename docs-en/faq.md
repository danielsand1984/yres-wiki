---
sidebar_position: 7
title: FAQ
description: Frequently asked questions about Yres.
---

# Frequently asked questions

## About Yres

**Is Yres also suitable if we already use Power BI?**
Yes. Yres sits *beneath* Power BI, not beside it or instead of it. It ensures that the data Power BI pulls in is reliable, up to date and correctly structured.

**Can we try Yres before deciding?**
We do not offer a self-service trial, but we do offer a personal demo in which we take your situation as the starting point.

**What is the difference with TimeXtender or AnalyticsCreator?**
Yres stands out through native Dutch ERP connections (Exact, AFAS), preset NL data sources, visual pipeline design that translates into ADF, automated health checks and transparent fixed pricing. Every tool has its own strengths — get in touch for an honest comparison.

## Technical

**Can I combine Yres with existing ADF pipelines?**
Yes. Yres fully generates and manages ADF pipelines. Existing manual ADF pipelines can keep running alongside Yres in the same Azure environment.

**Do you support CI/CD?**
Yes, full CI/CD integration via Azure DevOps with environment management (DTAP).

**Do you offer column-level lineage?**
Yres offers visual lineage at the object level with impact analysis. Column-level lineage is currently not available.

**What if I want to migrate from another platform?**
Yres supports the use of existing Azure databases. We discuss a migration in an architecture session.

## Connections

**Which sources are supported?**
Databases, ERP systems (Exact, AFAS, SAP, Dynamics 365), APIs and cloud applications. See the [integration catalog](./integraties/catalogus.md).

**Is your source not listed?**
Through database, OData and REST integrations we support many more than we show. Get in touch.

## Security & Compliance

**Do our data and pipelines run on your infrastructure?**
By default no — Yres runs within your own Azure tenant and your data never leaves your environment. Hosting by Yres is optional.

**What about access?**
Azure SSO and role-based permissions (RBAC), aligning with your existing security environment.

:::info To be completed
ISO 27001 / certifications, data residency details and a data processing agreement have not yet been confirmed. These answers need to be added by the team (see internal → security).
:::

## Implementation

**How quickly are we live?**
A complete Yres environment is operational within an hour; you typically connect a new source in ~5 minutes.

**Can we scale up later?**
Yes, at any time, without your environment going offline.
