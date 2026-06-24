---
title: Snowflake
sidebar_label: Snowflake
description: Snowflake koppelen aan Yres — verbindingseisen.
---

# Snowflake

**Categorie:** Directe koppeling

Cloud datawarehouse. Snowflake gebruikt intern column-georiënteerde (kolomgewijze) opslag.

## Verwachte input

Bij het toevoegen van een Snowflake-bron vraagt de wizard (formulier `getFormAddSourceSnowflake`) om de volgende velden:

| Veld | Verplicht | Toelichting |
|---|---|---|
| **Account name** | Ja | De Snowflake account-identifier, bv. in de vorm `fffffff.ca-central-1.aws` (organisatie/account + regio + cloud). |
| **User name** | Ja | Snowflake-gebruikersnaam. |
| **Password** | Ja | Wachtwoord van die gebruiker. |
| **Database** | Ja | De database waarmee je wilt koppelen. |
| **Warehouse** | Ja | De virtual warehouse die de query's uitvoert. |
| **Role** | Nee (optioneel) | De rol die de verbinding gebruikt (bepaalt de rechten). Bij weglaten wordt de standaardrol van de gebruiker gebruikt. |

Daarnaast deel je de bron de algemene bronvelden mee die voor elke bron gelden: **bronnaam** (uniek, 2–45 tekens), **type**, **integration runtime**, **of de credentials gelijk zijn voor alle omgevingen**, een optionele **vervaldatum voor credentials** en **tags**.

### Authenticatie

- **Methode:** Basic (gebruikersnaam + wachtwoord).
- De verbinding wordt opgebouwd als een `SnowflakeV2`-linked service met `authenticationType: "Basic"`.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`)** is de normale keuze: Snowflake is een publiek bereikbaar clouddatawarehouse.
- Een **self-hosted integration runtime** is optioneel en alleen nodig wanneer Snowflake achter netwerkbeperkingen (firewall/private link) bereikbaar is. Yres schrijft de gekozen IR in de linked service.

### Vereisten

- Een Snowflake-gebruiker met **leesrechten** op de betreffende database. Gebruik bij voorkeur een apart account met **alleen-lezen** rechten.
- Een bestaande, actieve **virtual warehouse**.
- De inloggegevens worden niet in Yres opgeslagen. Yres plaatst ze als secrets in de **Azure Key Vault** van de klant onder de namen `adf-{bronnaam}-database`, `adf-{bronnaam}-warehouse`, `adf-{bronnaam}-accountName`, `adf-{bronnaam}-userName`, `adf-{bronnaam}-password` en `adf-{bronnaam}-role`. De linked service verwijst naar deze secrets.

:::info Te bevestigen
Voor staging gebruikt de connector intern een blob-storagecontainer uit de dev-omgeving. Dit is interne Yres-infrastructuur en vereist geen extra invoer van de klant; controleer dit detail bij twijfel met je Yres-beheerder.
:::

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
