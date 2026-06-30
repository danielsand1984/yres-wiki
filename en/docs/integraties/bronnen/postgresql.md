---
title: PostgreSQL
sidebar_label: PostgreSQL
description: Connecting PostgreSQL to Yres — connection requirements.
---

# PostgreSQL

**Category:** Direct connection

PostgreSQL relational database. Yres connects directly to the database via an
ADF linked service of type `PostgreSql`. There is a single PostgreSQL source type: the same connection
works for both on-premises and cloud-hosted PostgreSQL databases.

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

**Authentication:** Basic (username + password). From these, Yres builds a single connection string of
the form `host=…;port=5432;database=…;uid=…;encryptionmethod=0`.

**Integration runtime:** a **self-hosted Integration Runtime** is required. The linked service
references the self-hosted IR `pwccIntegrationRuntimeLinked` via `connectVia`. A PostgreSQL source
therefore does not run on the cloud IR (`AutoResolveIntegrationRuntime`): select a published
self-hosted IR that can reach the database — even when the database runs in the cloud.

## Prerequisites

- **Self-hosted Integration Runtime** installed and published on a machine that can reach the
  PostgreSQL server (see [Connecting a data source](../../setup/databron-koppelen.md)).
- **Network access** from the IR machine to `Host:Port` (default `5432`); if needed, adjust the firewall
  or `pg_hba.conf` so the service account is allowed to connect.
- **Service account** with **read-only** rights on the relevant database (least privilege), rather than
  a personal or admin account.

The credentials are stored by the backend in the customer's Azure Key Vault as a single secret
following the convention `adf-{Source name}-connectionstring`; the linked service references it. You
therefore never enter credentials in pipelines or configuration.

:::note A single connection-string secret, self-hosted IR
PostgreSQL uses the older deploy route with a single combined `…-connectionstring` secret. Previously a
separate cloud variant (`AzurePostgreSql`) also existed, but that mapping is disabled (commented out) in
the codebase and is no longer used — all PostgreSQL connections run through the single `PostgreSql`
type with a self-hosted IR.
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
