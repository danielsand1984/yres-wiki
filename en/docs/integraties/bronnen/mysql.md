---
title: MySQL
sidebar_label: MySQL
description: Connect MySQL to Yres — connection requirements.
---

# MySQL

**Category:** Direct connection

Relational database. Direct connection.

## Connection requirements

- Host
- Port
- Database name
- Username
- Password

## Where to find these

These values come from your database administrator (DBA) or from the existing JDBC/ODBC connection string.

- **Host / Port** — Host is the server name or IP address where MySQL runs; Port is the database's listening port (default **3306**). Found in the server configuration or available from your DBA.
- **Database name** — The name of the specific schema/database you want to connect to (visible via `SHOW DATABASES;` or from your DBA).
- **Username / Password** — Preferably use a dedicated service account with **read-only** rights (least privilege) on the relevant database, rather than a personal or admin account.

Is the database behind a firewall or on-premises? Then an Integration Runtime is needed to establish the connection — see [Connecting a data source](../../setup/databron-koppelen.md).

> Official documentation: [MySQL Connector/J — Connection URL Syntax](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
