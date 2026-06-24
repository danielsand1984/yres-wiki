---
title: Azure SQL Database
sidebar_label: Azure SQL Database
description: Connect Azure SQL Database to Yres — connection requirements.
---

# Azure SQL Database

**Category:** Direct connection · Azure

Managed SQL database in Azure. Direct connection: Yres reads the tables via a Copy activity in
Azure Data Factory and loads them into the data warehouse.

## Expected input

When adding the source (type **Azure SQL Database**), you fill in the same five database fields as
for SQL Server:

| Field | Explanation |
|---|---|
| **Host** | The full server name, in the form `xxx.database.windows.net`. |
| **Port** | The database's listening port. For Azure SQL Database always **1433**. |
| **Database name** | The name of the database (catalog) you want to connect to. |
| **Username** | A SQL login (Yres uses SQL authentication). |
| **Password** | The password for that login. |

**Authentication:** Basic (username + password, SQL authentication).

**Integration runtime:** Azure SQL Database is publicly reachable from the cloud, so the default
**`AutoResolveIntegrationRuntime`** (cloud) is sufficient. A self-hosted Integration Runtime is only
needed if the database is shielded behind a private network or firewall and is not directly
reachable.

**Requirements / preparation:**

- A **SQL login** with read access to the relevant database (see *Where to find these*).
- Allow the Azure Data Factory IP range in the SQL server's firewall, or enable the
  **"Allow Azure services and resources to access this server"** option on the Azure SQL server, so the
  cloud Integration Runtime can reach the database.

:::info To be confirmed
Yres does not store the credentials itself: the connection is placed as a single secret
**`adf-{sourcename}-connectionstring`** in the customer's Azure Key Vault and read from there by the
linked service (`type: AzureSqlDatabase`). The exact secret naming and the writing to Key Vault
happen in the (off-limits) webapp/provisioning layer.
:::

## Where to find these

You'll find these values in the Azure Portal.

- **Host / Port** — Host is the full server name in the form `xxx.database.windows.net`. In the Azure Portal, open your **SQL database → Overview** and copy the value next to **Server name**. Port is always **1433**.
- **Database name** — The database name, also found on the SQL database's **Overview** screen.
- **Username / Password** — Use a **SQL login** (Yres uses SQL authentication). Preferably create a dedicated account with **read-only** rights on the relevant database.

> Official documentation: [Microsoft Learn — Connect and query Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/connect-query-content-reference-guide)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
