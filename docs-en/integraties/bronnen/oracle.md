---
title: Oracle
sidebar_label: Oracle
description: Connect Oracle to Yres — connection requirements.
---

# Oracle

**Category:** Direct connection

Oracle database. Note: **Service name** instead of Database name.

## Connection requirements

- Host
- Port
- Service name
- Username
- Password

## Where to find these

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address where Oracle runs; Port is the listener's listening port (default **1521**). Found in the server configuration or available from your DBA.
- **Service name** — Oracle uses a **Service name** (or the older **SID**) instead of a database name. The service name is listed in the `tnsnames.ora` file on the server/client, can be obtained via `lsnrctl status` on the server, or from your DBA.
- **Username / Password** — Preferably use a dedicated service account with **read-only** rights (least privilege) on the relevant schemas, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

> Official documentation: [Oracle JDBC — Database URLs and Database Specifiers](https://docs.oracle.com/en/database/oracle/oracle-database/21/jjdbc/data-sources-and-URLs.html)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
