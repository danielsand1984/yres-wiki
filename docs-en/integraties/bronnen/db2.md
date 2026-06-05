---
title: DB2
sidebar_label: DB2
description: Connect DB2 to Yres — connection requirements.
---

# DB2

**Category:** Direct connection

IBM Db2 relational database. Direct connection.

## Connection requirements

- Host
- Port
- Database name
- Username
- Password

## Where to find these

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address where Db2 runs; Port is the database's listening port (default **50000**, or **50001** for SSL). Found in the server configuration or available from your DBA.
- **Database name** — The name of the specific Db2 database you want to connect to.
- **Username / Password** — Preferably use a dedicated service account with **read-only** rights (least privilege) on the relevant database, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

> Official documentation: [IBM Db2 — URL format for the JDBC driver](https://www.ibm.com/docs/en/db2/12.1.0?topic=cdsudidsdjs-url-format-data-server-driver-jdbc-sqlj-type-4-connectivity)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
