---
title: Snowflake
sidebar_label: Snowflake
description: Snowflake koppelen aan Yres — verbindingseisen.
---

# Snowflake

**Categorie:** Directe koppeling

Cloud datawarehouse. Gebruikt standaard column-georiënteerde opslag.

## Verbindingseisen

- Account name
- Username
- Password
- Database
- Warehouse
- Role (optioneel)

## Gegevens ophalen

Deze waarden vind je in Snowsight (de Snowflake-webinterface).

- **Account name** — Dit is de **account identifier** (bij voorkeur in de vorm `organisatie-account`, of de oudere account locator). Te vinden via het accountmenu linksonder in Snowsight → **View account details**, of af te leiden uit de account-URL `https://<account>.snowflakecomputing.com`.
- **Warehouse** — Een bestaande virtual warehouse die de query's uitvoert. Te vinden in Snowsight onder **Admin → Warehouses**.
- **Role** — De rol die voor de verbinding wordt gebruikt (bepaalt de rechten). Te vinden/wisselen via de rol-switcher in Snowsight. Optioneel; bij weglaten wordt de standaardrol van de gebruiker gebruikt.
- **Database** — De database waarmee je wilt koppelen, te vinden in de lijst **Databases** in Snowsight.
- **Username / Password** — De inloggegevens van een Snowflake-gebruiker. Gebruik bij voorkeur een apart account met **alleen-lezen** rechten op de betreffende database.

> Officiële documentatie: [Snowflake — Account identifiers](https://docs.snowflake.com/en/user-guide/admin-account-identifier)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
