---
sidebar_position: 2
title: Integration catalog
description: All supported data sources, categorized.
---

# Integration catalog

This is the complete list of data sources that Yres supports. The catalog is grouped by
**connection type** (direct database connection, OData, REST, file sources, Microsoft platform).
Each source has its own page covering its category, expected input, connection requirements and setup — see
**Sources (A–Z)** in the menu.

:::note How Yres connects
Many SaaS sources don't connect through a dedicated, source-specific connector but rather via a **generic
protocol** (OData or REST) or via **Microsoft Graph**. The catalog indicates this in the
**Notes** column, so you know which underlying technique and which input to expect.
:::

## Expected input (in brief)

The data you provide per source depends on the category. The full details are on each source page;
this is the general pattern:

- **Databases** (Microsoft SQL, Azure SQL, MySQL, PostgreSQL, DB2, Oracle, Snowflake): host/account ·
  database (or *service name* for Oracle) · port · username · password. **Auth:** Basic.
- **Azure storage** (Azure Blob Storage, SAP Business Data Cloud, SAP Datasphere, Azure Data Lake):
  account/container + **SAS token**. **Auth:** SAS.
- **OData / REST**: service URL + pagination setting, with Anonymous, Basic or OAuth2.
- **Microsoft platform** (SharePoint, Teams, Microsoft Graph, Dynamics 365, Power BI,
  Intune): an **Entra ID (Azure AD) app registration** with Tenant ID, Client ID and Client secret.
- **SaaS with token** (AFAS, Monday, Simplicate, Exact Online, Salesforce): API token or OAuth2.

**Integration Runtime:** cloud-reachable sources run on the cloud IR `AutoResolveIntegrationRuntime`;
on-premises or firewalled sources (local databases, File Server, local files) require a
**self-hosted Integration Runtime**.

**Secrets:** Yres never stores credentials in the webapp. Everything goes to the customer's **Azure Key
Vault**, using the naming convention `adf-{sourcename}-{suffix}`; the linked service references it there.

---

## Databases (direct connection)

Direct database connection via Azure Data Factory. Auth is username/password (Basic),
stored in the Key Vault. On-premises databases require a self-hosted Integration Runtime.

| Source | Notes |
|---|---|
| Microsoft SQL | |
| Azure SQL Database | Cloud — AutoResolve IR is sufficient |
| MySQL | No support for two delta columns (see source page) |
| PostgreSQL | |
| DB2 | |
| Oracle | Requires *service name* instead of database name |
| Snowflake | Cloud — AutoResolve IR is sufficient |

## OData

Sources exposed via the OData protocol. Auth is Anonymous, Basic or OAuth2 (see source page).

| Source | Notes |
|---|---|
| SAP Analytics Cloud (SAC) | 🏅 Official partner — OAuth2 |
| SAP S/4HANA | 🏅 Official partner — OData service via SAP Gateway |
| SAP HANA | 🏅 Official partner — `.xsodata` or direct ODBC connection |
| OData (generic) | Any OData v4 service; Anonymous or Basic |
| OData OAuth | OData service with OAuth2 (client credentials / authorization code) |
| Centraal Bureau voor de Statistiek (CBS) | Fixed OData URL, anonymous |
| Tweede Kamer | Fixed OData URL, anonymous |

## REST

Generic REST connection and SaaS sources that run on REST under the hood.

| Source | Notes |
|---|---|
| REST APIs (generic) | Optional OpenAPI spec; Anonymous, Basic or OAuth2 client credentials |
| AFAS | 🏅 Official partner — API token via the AFAS app connector |
| Monday | API token (dedicated `Monday` type, REST under the hood) |
| Simplicate | REST under the hood; two auth headers (key + secret) |
| Exact Online | OAuth2 authorization code; separate app per environment |
| Salesforce | OAuth2 client credentials |
| Mendix | Via a published OData or REST service in Studio Pro |
| Onestream | *(preview)* — OAuth2 or Personal Access Token (PAT) |
| Board (BoardEPM) | OAuth2 client credentials |

## Microsoft platform (Entra ID / Graph)

Sources exposed via an **Entra ID (Azure AD) app registration**. Teams, Dynamics 365 and
Topdesk don't connect with a dedicated connector but ride along under the hood on **Microsoft Graph** or
**OData**; in all cases the input is Tenant ID, Client ID and Client secret (or, for Topdesk,
username + password).

| Source | Notes |
|---|---|
| SharePoint | Azure AD app-only; permissions via `appinv.aspx` |
| Microsoft Teams | Via **Microsoft Graph** (OData/REST under the hood) |
| Microsoft Graph | OAuth2 (client credentials or authorization code) |
| Dynamics 365 (Business Central) | Via **OData** + OAuth2 under the hood |
| Topdesk | Via **OData** (reporting endpoint) + Basic auth under the hood |
| Microsoft Intune (Intune Data Warehouse) | Via **OData** + OAuth2 under the hood |
| Power BI | Azure AD service principal; consumed via the Power BI API (no ADF copy) |

## Azure storage & SAP (SAS token)

Sources with an Azure Blob/Data Lake endpoint, exposed with a **SAS token**.

| Source | Notes |
|---|---|
| Azure Blob Storage | SAS token on the storage account |
| SAP Business Data Cloud (SAP_BDC) | 🏅 Official partner — SAS URI + container + SAS token |
| SAP Datasphere | 🏅 Official partner — AzureBlobFS / SAS (separate SAP product, see below) |

:::info SAP Business Data Cloud vs. SAP Datasphere
**SAP Business Data Cloud (SAP_BDC)** and **SAP Datasphere** are two **different** SAP products.
Both are exposed in Yres as an **AzureBlobFS / SAS** source (account + container + SAS token),
but they are separate connections — not synonyms. SAP_BDC has its own input form in the
webapp; for Datasphere the same SAS input is used.
:::

## File sources

| Source | Notes |
|---|---|
| Local files (CSV, Excel) | Self-hosted IR **required** |
| File Server | UNC path; self-hosted IR **required** |
| Azure Data Lake (Gen2) | SAS token (AzureBlobFS) |

:::note Not a separate wizard choice
**Azure Data Lake** and **SAP Datasphere** do have an ADF template (`AzureBlobFS`), but are **not a
separate option** in the source wizard (`SourceField.tsx`). Azure Data Lake is internal Yres
infrastructure (staging/output); SAP Datasphere is connected via the **SAP_BDC** form.
:::

## Custom

Don't see your source listed? Through our database, OData and REST integrations we support far more
than we can show here. Get in touch and we'll look together at whether we can support your scenario.

---

:::note Local networks
Sources on a local network are reached from Azure Data Factory via a **self-hosted
Integration Runtime (IR)**. Available in all packages.
:::

:::tip Official documentation
For the exact input per source (field labels, auth method, IR requirement and preparation such as
app registration, client secret or SAS token) — see the individual source page under **Sources (A–Z)**.
:::
