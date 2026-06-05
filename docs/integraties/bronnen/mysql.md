---
title: MySQL
sidebar_label: MySQL
description: MySQL koppelen aan Yres — verbindingseisen.
---

# MySQL

**Categorie:** Directe koppeling

Relationele database. Directe koppeling.

## Verbindingseisen

- Host
- Port
- Database name
- Username
- Password

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop MySQL draait; Port is de luisterpoort van de database (standaard **3306**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van het specifieke schema/de database waarmee je wilt koppelen (zichtbaar via `SHOW DATABASES;` of bij je DBA).
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

> Officiële documentatie: [MySQL Connector/J — Connection URL Syntax](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
