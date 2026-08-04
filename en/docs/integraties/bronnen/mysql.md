---
title: MySQL
sidebar_label: MySQL
description: Connecting MySQL to Yres — connection requirements.
---

# MySQL

**Category:** Direct connection

Relational database. Direct connection.

## Expected input

You add MySQL through the **Add source** wizard. Besides the general fields that apply to every source — **Source name** (unique, 2–45 characters; becomes the name of the linked service and the basis for the Key Vault secrets `adf-{bronnaam}-…`), **type**, **integration runtime**, *credentials identical across all environments?*, *credential expiry date* and *tags* — the MySQL form asks for the following connection fields:

| Field (label) | Description |
|---|---|
| **Host** | Server name or IP address on which MySQL runs. |
| **Database name** | The name of the specific schema/database you want to connect to. |
| **Port** | The database's listening port (default **3306**). |
| **User name** | Username of the database account. |
| **Password** | Password for that account. |

- **Authentication:** Basic — username + password.
- **Integration runtime:** choose **`AutoResolveIntegrationRuntime`** (cloud) if the database is publicly reachable. If MySQL runs **on-premises or behind a firewall**, choose a **self-hosted integration runtime** (in the bundled template, `pwccIntegrationRuntimeLinked`). See [Connecting a data source](../../setup/databron-koppelen.md).
- **Secrets:** the password (and the other connection details) are never stored by the frontend. They go to the customer's **Azure Key Vault** under the group **`adf-{bronnaam}-…`**; the linked service references them.

### Requirements

- A database account with **read-only** rights (least privilege) on the relevant database — preferably use a dedicated service account rather than a personal or admin account.
- For an on-prem/firewalled database: an installed and published **self-hosted integration runtime** that can reach the MySQL server.

## Gathering the details

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address on which MySQL runs; Port is the database's listening port (default **3306**). Found in the server configuration, or available from your DBA.
- **Database name** — The name of the specific schema/database you want to connect to (visible via `SHOW DATABASES;` or from your DBA).
- **Username / Password** — Preferably use a dedicated service account with **read-only** rights (least privilege) on the relevant database, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

## Load types and delta

MySQL supports the standard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL, DELTAIMAGE).

:::note Two delta columns supported
MySQL supports — like the other SQL/database sources — **two delta columns** (comma-separated, same data type; the highest value counts). See [Load types → Multiple delta columns](../../concepten/load-types.md#multiple-delta-columns).
:::

> Official documentation: [MySQL Connector/J — Connection URL Syntax](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
