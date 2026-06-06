---
title: Oracle
sidebar_label: Oracle
description: Oracle koppelen aan Yres — verbindingseisen.
---

# Oracle

**Categorie:** Directe koppeling

Oracle-database. Let op: **Service name** in plaats van Database name.

## Verbindingseisen

- Host
- Port
- Service name
- Username
- Password

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop Oracle draait; Port is de luisterpoort van de listener (standaard **1521**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Service name** — Oracle gebruikt een **Service name** (of het oudere **SID**) in plaats van een database-naam. De service name staat in het `tnsnames.ora`-bestand op de server/client, is op te vragen via `lsnrctl status` op de server, of bij je DBA.
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende schema's, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

> Officiële documentatie: [Oracle JDBC — Database URLs and Database Specifiers](https://docs.oracle.com/en/database/oracle/oracle-database/21/jjdbc/data-sources-and-URLs.html)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
