---
sidebar_position: 1
title: Integrations — overview
description: Yres connects databases, ERP systems, APIs and cloud applications within your own Azure environment.
---

# Integrations

**Yres connects databases, ERP systems, APIs and cloud applications within your own Azure environment. No custom development, no scripts.**

Add new data sources without extra manual work. For each source you run through a wizard where you fill in the source type, the connection details and the integration runtime; Yres then automatically generates the corresponding Azure Data Factory pipelines. This way Yres standardizes how data is loaded and structured, so your setup stays consistent as it grows.

## Categories

Sources fall under one or more connection types. These categories match the breakdown in the [integration catalog](./catalogus.md).

| Category | What it is |
|---|---|
| **Direct connections** | Native connectors to databases and applications (e.g. SQL Server, MySQL, Oracle, Exact Online, AFAS) |
| **OData** | Connection via the OData protocol (e.g. SAP, CBS, Microsoft Graph) |
| **REST** | Connection via REST APIs (generic, plus e.g. Monday, Salesforce, Mendix) |
| **Custom** | Tailored work based on the database, OData and REST integrations |

Some sources (Mendix, Monday, Salesforce, Microsoft Graph) connect via multiple protocols and therefore appear under multiple categories.

➡️ View the full [integration catalog](./catalogus.md).

## How a source connects

Every source follows the same pattern, regardless of category:

- **Wizard-driven.** You add a source via the "Add source" wizard. You provide a unique **source name** (2–45 characters, starting with a letter), choose the **type**, select the **integration runtime** and fill in the connection details and any login credentials.
- **Credentials stay in your own Azure.** The web app does not store any secrets itself. Passwords, tokens and keys are written to the **Azure Key Vault** in your own tenant (per source under `adf-{bronnaam}-…`). The generated linked service in Data Factory only references those secrets.
- **Integration runtime — cloud or self-hosted.** For sources that are reachable from the cloud, you use the default **`AutoResolveIntegrationRuntime`**. For sources behind a firewall or on a local network (on-premises databases, file servers, local files) you select a **self-hosted integration runtime**.

:::note Local networks
Sources on a local network are reached from Azure Data Factory via a **self-hosted Integration Runtime (IR)**. Available in all packages.
:::

The exact connection fields, the authentication type and the requirements differ per source. See the individual source pages under **Sources (A–Z)** or the [integration catalog](./catalogus.md) for the details per source.

## Is your source not listed?

Through our database, OData and REST integrations we support far more than we can show. Get in touch and we will look together at whether we can support your scenario and how quickly it can be realized.
