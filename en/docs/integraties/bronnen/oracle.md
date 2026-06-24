---
title: Oracle
sidebar_label: Oracle
description: Connecting Oracle to Yres — connection requirements.
---

# Oracle

**Category:** Direct connection

Oracle database. Direct connection. Note: Oracle uses a **Service name** (or the older **SID**) instead of a database name.

## Expected input

You add Oracle through the **Add source** wizard. In addition to the general fields that apply to every source — **Source name** (unique, 2–45 characters; becomes the name of the linked service and the basis for the Key Vault secrets `adf-{sourcename}-…`), **type**, **integration runtime**, *credentials identical across all environments?*, *credential expiry date* and *tags* — the Oracle form asks for the following connection fields:

| Field (label) | Description |
|---|---|
| **Host** | Server name or IP address on which Oracle runs. |
| **Port** | Listening port of the listener (default **1521**). |
| **Service name** | The Oracle **Service name** (or the older **SID**) — not the database name. |
| **User name** | Username of the database account. |
| **Password** | Password of that account. |

- **Authentication:** Basic — username + password.
- **Integration runtime:** choose **`AutoResolveIntegrationRuntime`** (cloud) if the database is publicly reachable. If Oracle is **on-premises or behind a firewall**, choose a **self-hosted integration runtime** (in the supplied template, `pwccIntegrationRuntimeLinked`). See [Connecting a data source](../../setup/databron-koppelen.md).
- **Secrets:** the password and connection details are never stored by the frontend. They go to the customer's **Azure Key Vault** under the group **`adf-{sourcename}-…`**; the linked service references them. To do this, Yres builds the server string as **`host:port/service_name`** and stores it, together with the username and password, as separate secrets (`adf-{sourcename}-server`, `adf-{sourcename}-username`, `adf-{sourcename}-password`).

:::info Driver version 2.0
For Oracle, Yres uses **driver version 2.0**. With this driver, encryption (`encryptionClient=accepted`, AES/3DES) and a crypto checksum (SHA) are enabled by default. You don't need to configure this yourself; the wizard handles it.
:::

### Prerequisites

- A database account with **read-only** permissions (least privilege) on the relevant schemas — preferably use a dedicated service account rather than a personal or admin account.
- For an on-prem/firewalled database: an installed and published **self-hosted integration runtime** that can reach the Oracle server.

## Gathering the details

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address on which Oracle runs; Port is the listening port of the listener (default **1521**). Found in the server configuration or available from your DBA.
- **Service name** — Oracle uses a **Service name** (or the older **SID**) instead of a database name. The service name is listed in the `tnsnames.ora` file on the server/client, can be obtained via `lsnrctl status` on the server, or from your DBA.
- **Username / Password** — Preferably use a dedicated service account with **read-only** permissions (least privilege) on the relevant schemas, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

## Load types and delta

Oracle supports the standard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL). As a SQL-based source, you can configure two delta columns for a delta load.

> Official documentation: [Oracle JDBC — Database URLs and Database Specifiers](https://docs.oracle.com/en/database/oracle/oracle-database/21/jjdbc/data-sources-and-URLs.html)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
