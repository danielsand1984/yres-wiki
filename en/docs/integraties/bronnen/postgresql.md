---
title: PostgreSQL
sidebar_label: PostgreSQL
description: Connecting PostgreSQL to Yres — connection requirements.
---

# PostgreSQL

**Category:** Direct connection

PostgreSQL relational database. Yres connects directly to the database. New PostgreSQL sources are
automatically set to **driver version 2.0** and deploy as an ADF linked service of type
**`AzurePostgreSql`**. There is a single PostgreSQL source type; the database must be reachable from
Azure (see *Integration runtime* below).

## Expected input

When adding the source via **Add source**, you first fill in the shared fields that apply to every
source — **Source name** (unique, starts with a letter, 2-45 characters; becomes the name of the
linked service and the basis of the Key Vault secret), **type** (PostgreSQL), **integration
runtime**, **credentials identical across all environments?**, **credentials expiry date** (optional)
and **tags** (optional).

Then you fill in the PostgreSQL-specific connection fields:

| Field | Description |
|---|---|
| **Host** | Server name or IP address on which PostgreSQL runs. |
| **Database name** | The name of the specific database you want to connect to. |
| **Port** | The listening port of the database (default **5432**). |
| **User name** | The username used to establish the connection. |
| **Password** | The password; never stored by the frontend but written to Azure Key Vault. |

**Authentication:** Basic (username + password), with **SslMode 3** (SSL required). The wizard sets
this automatically; you don't compose a connection string yourself.

**Integration runtime:** the linked service is deployed **without `connectVia`** and therefore runs on
the **cloud IR** (`AutoResolveIntegrationRuntime`). The IR choice you make in the wizard is currently
**not applied** to the linked service for PostgreSQL. The PostgreSQL server must therefore be reachable
from Azure (public endpoint or opened firewall); an on-premises database behind a closed firewall does
not currently work without a manual adjustment of the linked service.

## Prerequisites

- **Reachability from Azure**: network access from the Azure cloud IR to `Host:Port` (default `5432`);
  if needed, adjust the firewall or `pg_hba.conf` so the service account is allowed to connect. The
  connection requires SSL (SslMode 3).
- **Service account** with **read-only** rights on the relevant database (least privilege), rather than
  a personal or admin account.

The connection details are stored by the backend in the customer's Azure Key Vault as **five separate
secrets**: `adf-{Source name}-server`, `adf-{Source name}-database`, `adf-{Source name}-port`,
`adf-{Source name}-username` and `adf-{Source name}-password`. The linked service references the
corresponding secret per field; you therefore never enter credentials in pipelines or configuration.

:::note Historical: the legacy connection-string path
Older PostgreSQL sources (created before driver version 2.0 was enforced) still use the old deploy
route with a single combined `adf-{Source name}-connectionstring` secret. New sources always get the
`AzurePostgreSql` form with the five separate secrets listed above.
:::

## Obtaining the details

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address on which PostgreSQL runs; Port is the
  listening port of the database (default **5432**). Found in the server configuration or available from
  your DBA.
- **Database name** — The name of the specific database you want to connect to (visible via `\l` in
  psql or from your DBA).
- **User name / Password** — Preferably use a dedicated service account with **read-only** rights
  (least privilege) on the relevant database.

> Official documentation: [PostgreSQL — Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
