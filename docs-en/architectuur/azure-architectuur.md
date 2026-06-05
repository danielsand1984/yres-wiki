---
slug: /referentie/azure-architectuur
sidebar_position: 2
title: Azure architecture
description: Which Azure resources Yres uses, access levels and setups.
---

# Azure architecture

> Complements [Installation](../setup/installatie.md).

## Azure resources that Yres uses

| Resource | Purpose | Yres integration | Cost |
|---|---|---|---|
| **Azure Data Factory (ADF)** | Orchestration & ETL | Yres triggers pipelines and monitors runs; manages Integration Runtimes | Pay-per-activity + IR costs |
| **Azure Blob Storage** | Raw data landing | Staging of files for import | Hot/Cool tier |
| **Azure Data Lake** | Unprocessed data (data science) | Stores data raw; Yres adds **RowHash, KeyHash, EtlDate** → medallion architecture | Storage |
| **Azure SQL Database** | Curated storage & queries | Yres Copy + stored procedures | DTU-based |
| **Azure Key Vault** | Credentials | ADF reads secrets to connect to sources | Pay-per-activity |

Data from a source can be stored in the **database**, the **Data Lake**, or **both**.

## App Registration — required permissions

Yres gains access to an existing Azure tenant via an **App Registration** (single tenant) with:

- **Azure DevOps** — User impersonation
- **Azure Key Vault** — User impersonation
- **Azure Service Management** — User impersonation
- **Microsoft Graph** — User.Read

## Access levels

Access can be granted at three levels; in all cases Yres needs **Owner rights** for the installation (to assign roles to the managed identities of resources):

1. **Tenant** — discouraged; only briefly, for test scenarios.
2. **Subscription** — fine if the subscription is for Yres only.
3. **Resource Group** — recommended for long-term use. Do you already have the resource groups? Use level 3. Otherwise: start at subscription level and move the access to resource-group level once the groups exist.

:::warning Owner is required
The App Registration needs **Owner** rights (not just Contributor), because Yres has to assign roles to the managed identities of resources during installation. Preferably grant this at resource-group level.
:::

## Azure setups

| Setup | Description |
|---|---|
| **Single subscription** | Yres on one subscription; environments distributed across resource groups. |
| **Split subscriptions** | Each environment its own (existing) subscription. Subscriptions must exist beforehand. |
| **Shared subscriptions** | Some environments share a subscription (e.g. dev+test), prod separate. Shared subscriptions → separate resource groups. |

> Multiple environments in one resource group is possible, but **discouraged** (errors and incorrect resource mapping in the frontend).

## Resource providers (must be registered)

Missing provider registrations are a primary cause of failed installations. The following must be active in the subscription:

- `Microsoft.DataFactory`
- `Microsoft.KeyVault`
- `Microsoft.Sql`
- `Microsoft.Storage`

## Naming

Yres follows existing naming conventions, with one fixed constraint: **the first environment is always named `dev`**. Resource names (SQL Server, ADF) therefore always contain `dev`, e.g. `sqlsrv-xxx-dwh-dev`. This cannot be changed, even if you use a different name for development internally.

## Firewall & network

- The **database firewall is enabled by default**; Yres IPs are added automatically during installation. Add extra rules manually.
- Storage accounts, Key Vault and ADF have **no** active firewall by default.
- All network rules are supported, provided resources can reach each other and the web app.
- **VPN access** for the web app is available on request; the web app itself also has a firewall to restrict access by location.

## Scaling

Azure auto-scaling works on CPU usage, but SQL Server does not easily release memory — databases then stay expensively stuck on a high tier. Yres manages scaling around loads/refreshes: **scale up only when needed, then scale back down immediately**.

## Installation model (invitation link)

Installing requires an **invitation link from Plainwater**: tied to a single Microsoft account, single-use, configured for the purchased version and the number of environments in the license. Reusable until the installation is complete; invalid afterwards.

| Version | Sources | Environments |
|---|---|---|
| **Essentials** | 2 | 1 |
| **Advanced** | 5 | 2 |
| **Ultimate** | Unlimited | Unlimited |
