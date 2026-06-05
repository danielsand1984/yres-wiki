---
title: DB2
sidebar_label: DB2
description: DB2 koppelen aan Yres — verbindingseisen.
---

# DB2

**Categorie:** Directe koppeling

IBM Db2 relationele database. Directe koppeling.

## Verbindingseisen

- Host
- Port
- Database name
- Username
- Password

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop Db2 draait; Port is de luisterpoort van de database (standaard **50000**, of **50001** voor SSL). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van de specifieke Db2-database waarmee je wilt koppelen.
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

> Officiële documentatie: [IBM Db2 — URL format for the JDBC driver](https://www.ibm.com/docs/en/db2/12.1.0?topic=cdsudidsdjs-url-format-data-server-driver-jdbc-sqlj-type-4-connectivity)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
