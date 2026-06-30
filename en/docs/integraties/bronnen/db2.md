---
title: DB2
sidebar_label: DB2
description: Connecting DB2 to Yres — connection requirements.
---

# DB2

**Category:** Direct connection

IBM Db2 relational database. Direct connection via a username/password login.

## Expected input

You create the source through the **Add source** wizard. Besides the general fields (source name,
integration runtime, credentials per environment, expiry date, tags), the Db2 form asks for the
standard database fields.

### Connection fields

The labels below are exactly as they appear in the form:

| Field | Description |
|---|---|
| **host** | Server name or IP address on which Db2 runs. |
| **database name** | The name of the specific Db2 database you are connecting to. |
| **port** | The database's listening port (numeric). Default **50000**, or **50001** for SSL. |
| **user name** | Username of the database account. |
| **password** | Password for the account. |

### Authentication

- **Basic** (username + password). The linked service is created as `type: Db2` with
  `authenticationtype=Basic`.
- The password/connection string is never stored in the frontend. Yres saves the credential in
  the **Azure Key Vault** of your own environment under the name **`adf-{bronnaam}-connectionstring`**, and
  the linked service references it.

### Integration runtime

- Db2 almost always runs **on-premises or behind a firewall**. That is why a **self-hosted
  integration runtime** is required; the bundled linked service references
  `pwccIntegrationRuntimeLinked` via `connectVia`.
- Select the correct self-hosted IR in the wizard. `AutoResolveIntegrationRuntime` (cloud) only works
  if the Db2 server is publicly reachable, which is rarely the case.

### Requirements

- **Network access** from the machine running the self-hosted IR to the Db2 host and port (open up the
  firewall / VPN).
- Preferably a dedicated **service account with read-only rights** (least privilege) on the
  relevant database, rather than a personal or admin account.
- A working self-hosted IR — see [Connecting a data source](../../setup/databron-koppelen.md).

:::note Older deploy route with a single connection-string secret
Db2 has no dedicated backend builder; the source is created through the older deploy path
(`SourceSystemManager`/`AddLinkedService`), which writes a single combined secret
**`adf-{sourcename}-connectionstring`** to the Key Vault.
:::

## Gathering the details

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **host / port** — Host is the server name or IP address on which Db2 runs; port is the listening port
  (default **50000**, or **50001** for SSL). Found in the server configuration, or available from your
  DBA.
- **database name** — The name of the specific Db2 database you want to connect to.
- **user name / password** — Preferably use a service account with read-only rights.

## Load types and delta

Db2 belongs to the SQL-based sources and supports **two delta columns** (unlike MySQL, which allows
only one delta column). The standard load types (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD,
ADDITIONAL) are available. See [Load types](../../concepten/load-types.md) for how each type works.

> Official documentation: [IBM Db2 — URL format for the JDBC driver](https://www.ibm.com/docs/en/db2/12.1.0?topic=cdsudidsdjs-url-format-data-server-driver-jdbc-sqlj-type-4-connectivity)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
