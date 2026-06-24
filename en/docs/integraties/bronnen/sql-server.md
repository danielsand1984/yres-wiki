---
title: SQL Server
sidebar_label: SQL Server
description: Connecting SQL Server to Yres — connection requirements.
---

# SQL Server

**Category:** Direct connection

Microsoft SQL Server. Direct connection. In Yres this source has the source type **`MSSQL`**; in the data warehouse it is processed as source type **`MSSQL_ADF`**.

## Expected input

When you create the source (the **Add source** wizard), besides the general fields — source name, type, integration runtime, "credentials identical across all environments?", credential expiry date, tags — you fill in the following connection fields:

| Field | Description |
|---|---|
| **Host** | Server name or IP address of the SQL Server (for a named instance, optionally `server\instance`). |
| **Port** | The database's listening port (default **1433**). |
| **Database name** | Name of the specific database (catalog). |
| **Username** | SQL login with read access to the database. |
| **Password** | Password for that user. |

- **Authentication:** Basic (username + password).
- **Integration runtime:** by default the cloud runtime **`AutoResolveIntegrationRuntime`** when the server is publicly reachable. If the server is **on-premises or behind a firewall**, choose a **self-hosted integration runtime** (`pwccIntegrationRuntimeLinked`); this must be published first.
- **No secrets in the frontend:** your password is never stored in the web app. Yres writes the details as a single Key Vault secret to the Azure Key Vault of your own environment, under the name **`adf-{bronnaam}-connectionstring`**. The ADF linked service (`type: SqlServer`) references that secret.

:::info To be confirmed
Unlike, for example, MySQL, Oracle and Snowflake, SQL Server has no separate modern deploy builder. The source is published through the older `SourceSystemManager` route, with one combined `…-connectionstring` secret instead of separate secrets per field. The exact secret layout cannot be verified from the data-plane repos.
:::

## Gathering the details

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address on which SQL Server runs (for a named instance, optionally `server\instance`); Port is the database's listening port (default **1433**). Found in the server configuration, or available from your DBA.
- **Database name** — The name of the specific database (catalog) you want to connect to.
- **Username / Password** — Preferably use a dedicated SQL service account with **read-only** rights (least privilege) on the relevant database, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then a self-hosted Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

## Load types and delta

All standard load types are available (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL). For SQL Server, **two delta columns** are supported for incremental loading — this is the norm for SQL sources (only MySQL is an exception here and supports a single delta column).

> Official documentation: [JDBC Driver for SQL Server — Connection URL](https://learn.microsoft.com/sql/connect/jdbc/building-the-connection-url)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
