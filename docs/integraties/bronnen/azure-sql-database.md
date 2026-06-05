---
title: Azure SQL Database
sidebar_label: Azure SQL Database
description: Azure SQL Database koppelen aan Yres — verbindingseisen.
---

# Azure SQL Database

**Categorie:** Directe koppeling · Azure

Beheerde SQL-database in Azure. Directe koppeling.

## Verbindingseisen

- Host
- Port
- Database name
- Username
- Password

## Gegevens ophalen

Deze waarden vind je in de Azure Portal.

- **Host / Port** — Host is de volledige servernaam in de vorm `xxx.database.windows.net`. Open in de Azure Portal je **SQL database → Overzicht (Overview)** en kopieer de waarde naast **Servernaam**. Port is altijd **1433**.
- **Database name** — De naam van de database, eveneens te vinden op het **Overzicht**-scherm van de SQL database.
- **Username / Password** — Gebruik een **SQL-login** (Yres maakt gebruik van SQL-authenticatie). Maak bij voorkeur een apart account met **alleen-lezen** rechten op de betreffende database.

> Officiële documentatie: [Microsoft Learn — Connect and query Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/connect-query-content-reference-guide)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
