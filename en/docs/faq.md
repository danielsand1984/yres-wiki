---
sidebar_position: 11
title: FAQ
description: Frequently asked questions about Yres — positioning, technology, integrations, security and implementation.
---

# Frequently asked questions

## About Yres

**Is Yres also a good fit if we already use Power BI?**
Yes. Yres sits *beneath* Power BI, not next to it or in place of it. It ensures that the data Power BI retrieves is reliable, up to date and correctly structured. Yres manages the Power BI models per environment and can include them in the master pipeline refresh.

**Can we try Yres before deciding?**
We don't offer a self-service trial, but we do offer a personal demo in which we take your situation as the starting point.

**What is the difference with TimeXtender or AnalyticsCreator?**
Yres stands out through native Dutch ERP integrations (Exact, AFAS), preset NL data sources (such as CBS, Tweede Kamer and Simplicate), a wizard-driven no-code approach that automatically generates ADF pipelines, and automated health checks. Every tool has its own strengths — get in touch for a fair comparison.

:::info To be confirmed
The claim "transparent fixed pricing" and the direct comparison with specific competitors are commercial statements that need to be confirmed by the team before they are published externally. The technical differentiators above have been verified.
:::

## Technical

**How do I design my data pipelines in Yres?**
You don't *design* pipelines by hand. You configure your sources, tables and load types in wizards (the "Create source" and used-table wizards), and based on that metadata Yres **generates** the corresponding ADF pipelines and linked services automatically. So there is no drag-and-drop pipeline designer — the power lies in the metadata-driven generation.

**Can I combine Yres with existing ADF pipelines?**
Yes. Yres generates and manages its own ADF pipelines and linked services entirely. Existing manual ADF pipelines can keep running alongside Yres in the same Azure environment.

**Do you support CI/CD?**
Yes. Yres uses **Azure DevOps** for version control and rollout across **DTAP** (Development → Test → Acceptance → Production). There are two deployment tracks: the data warehouse (`IRIS_DWH`, Azure SQL) is rolled out with **SSDT/DACPAC**, and the ADF factory via a Git-integrated publish to the `adf_publish` branch and then to the target factory. Structural changes between already running environments go through runtime change management (the **Changes › Release › Install** screens). See [CI/CD & DTAP](./architectuur/cicd-dtap.md) for the full model.

**Do you offer column-level lineage?**
Yres offers lineage at the **object level** (tables, views, procedures, functions and materialized views) with impact analysis. **Column-level lineage is currently not available.**

**What if I want to switch from another platform?**
Yres supports the use of existing Azure databases. We discuss a migration in an architecture session.

## Integrations

**Which sources are supported?**
Databases, ERP systems (Exact, AFAS, SAP, Dynamics 365), APIs and cloud applications. See the [integration catalog](./integraties/catalogus.md).

**Our source isn't listed?**
Through database, OData and REST integrations we support many more than we show. Is your application not yet listed and is it a standard application? Then we usually help you connect it free of charge and add the application to a future release. Get in touch.

## Security & Compliance

**Do our data and pipelines run on your infrastructure?**
No. Yres runs **entirely within your own Azure tenant**; your data never leaves your environment. Yres never has direct access to your sources, and all processes keep working — even if you stop using Yres (no vendor lock-in).

:::info To be confirmed
The "hosting by Yres" option is mentioned on the marketing site, but it isn't in the official product documentation and sits uneasily with the repeated promise of "100% in your own Azure tenant". Have the team confirm the exact wording of any Yres-hosted variant.
:::

**What about access?**
Azure SSO and role-based access control (RBAC), tying into your existing security environment. SSO can be enforced per user.

:::info To be filled in
ISO 27001 / certifications, data residency details and a data processing agreement have not yet been confirmed. These answers need to be supplied by the team (see internal → security).
:::

## Implementation

**How quickly are we live?**
A complete Yres environment is usually operational quickly: a typical installation takes about 20 minutes, depending on the number of environments.

:::info To be confirmed
The claim "you connect a new source in ~5 minutes" comes from the marketing copy and isn't in the official documentation. Have the team confirm this lead time.
:::

**Can we scale up later?**
Yes, at any time, without your environment going offline. Adding sources, tables or environments happens within your existing license limits.

:::info To be confirmed
The exact scalability per license tier (number of sources and environments) and any commercial terms are owner input; see [Pricing](./prijzen.md).
:::
