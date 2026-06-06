---
title: PostgreSQL
sidebar_label: PostgreSQL
description: PostgreSQL koppelen aan Yres — verbindingseisen.
---

# PostgreSQL

**Categorie:** Directe koppeling

PostgreSQL relationele database. Directe koppeling.

## Verbindingseisen

- Host
- Port
- Database name
- Username
- Password

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop PostgreSQL draait; Port is de luisterpoort van de database (standaard **5432**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van de specifieke database/het schema waarmee je wilt koppelen (zichtbaar via `\l` in psql of bij je DBA).
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

> Officiële documentatie: [PostgreSQL — Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
