---
title: SQL Server
sidebar_label: SQL Server
description: SQL Server koppelen aan Yres — verbindingseisen.
---

# SQL Server

**Categorie:** Directe koppeling

Microsoft SQL Server. Directe koppeling.

## Verbindingseisen

- Host
- Port
- Database name
- Username
- Password

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop SQL Server draait (bij een named instance eventueel `server\instance`); Port is de luisterpoort van de database (standaard **1433**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van de specifieke database (catalog) waarmee je wilt koppelen.
- **Username / Password** — Gebruik bij voorkeur een apart SQL-serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

> Officiële documentatie: [JDBC Driver for SQL Server — Connection URL](https://learn.microsoft.com/sql/connect/jdbc/building-the-connection-url)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
