---
title: SQL Server
sidebar_label: SQL Server
description: Connect SQL Server to Yres — connection requirements.
---

# SQL Server

**Category:** Direct connection

Microsoft SQL Server. Direct connection.

## Connection requirements

- Host
- Port
- Database name
- Username
- Password

## Where to find these

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address where SQL Server runs (for a named instance possibly `server\instance`); Port is the database's listening port (default **1433**). Found in the server configuration or available from your DBA.
- **Database name** — The name of the specific database (catalog) you want to connect to.
- **Username / Password** — Preferably use a dedicated SQL service account with **read-only** rights (least privilege) on the relevant database, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

> Official documentation: [JDBC Driver for SQL Server — Connection URL](https://learn.microsoft.com/sql/connect/jdbc/building-the-connection-url)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
