---
title: Azure SQL Database
sidebar_label: Azure SQL Database
description: Connect Azure SQL Database to Yres — connection requirements.
---

# Azure SQL Database

**Category:** Direct connection · Azure

Managed SQL database in Azure. Direct connection.

## Connection requirements

- Host
- Port
- Database name
- Username
- Password

## Where to find these

You'll find these values in the Azure Portal.

- **Host / Port** — Host is the fully qualified server name in the form `xxx.database.windows.net`. In the Azure Portal, open your **SQL database → Overview** and copy the value next to **Server name**. Port is always **1433**.
- **Database name** — The database name, also shown on the SQL database **Overview** page.
- **Username / Password** — Use a **SQL login** (Yres uses SQL authentication). Preferably create a dedicated account with **read-only** rights on the relevant database.

> Official documentation: [Microsoft Learn — Connect and query Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/connect-query-content-reference-guide)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
