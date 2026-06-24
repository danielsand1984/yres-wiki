---
title: NetSuite
sidebar_label: NetSuite
description: NetSuite koppelen aan Yres — verbindingseisen.
---

# NetSuite

**Categorie:** REST · Dedicated ADF-connector

Oracle NetSuite (ERP/CRM). Yres koppelt via de **SuiteTalk REST-API** van NetSuite met **Token-Based Authentication (TBA)**. Voor NetSuite bestaat een eigen ADF-connector — linked services `NetSuite` (`RestService`) en `NetSuite_HTTP` (`HttpServer`), datasets `NetSuite_MAIN`/`NetSuite_HTTP`, de pijplijn **`Dynamic Pipeline YRES - NetSuite`** en de metadata-pijplijn **`GetMetaData - NetSuite`** (allemaal in de ADF-map `PW - Yres/Sources/NetSuite`).

:::info Te bevestigen
NetSuite heeft (versie 1.55) **geen keuze-item in de wizard "Bron toevoegen"** (`CreateSource.tsx`) — anders dan de meeste bronnen is het op dit moment dus **geen self-service selecteerbare bron**, maar een toegewijde/voorbeeld-connector die in samenwerking met Yres wordt geconfigureerd. De velden hieronder zijn afgeleid uit de ADF-linked-services, -datasets en -pijplijnen; bevestig met Yres of NetSuite voor jouw omgeving als selecteerbare bron beschikbaar is en welk invoerformulier dan geldt.
:::

## Verwachte input

Yres bouwt de NetSuite-verbinding op de SuiteTalk REST-API. De volgende waarden zijn vereist; bij een self-service-formulier zouden ze als velden worden gevraagd, anders worden ze door Yres ingericht. Daarnaast gelden de gedeelde bronvelden uit stap 1 (**bronnaam**, **type**, **integration runtime**, **credentials gelijk voor alle omgevingen?**, **vervaldatum credentials**, **tags**).

| Waarde | Toelichting |
|---|---|
| **Source name** | Naam van de bron (uniek per organisatie, 2–45 tekens, begint met een letter). Wordt de naam van de ADF linked service en de prefix van de Key Vault-secrets (`adf-{naam}-…`). |
| **Base URL** | De account-specifieke SuiteTalk REST-URL: `https://<account-id>.suitetalk.api.netsuite.com` (bijvoorbeeld `https://td2872575.suitetalk.api.netsuite.com`). Het `<account-id>`-deel is je NetSuite Account ID (lowercase, met `_` in plaats van punten/streepjes). Opgeslagen als `adf-{naam}-baseUrl`. |
| **Consumer Key** | De Consumer Key van de **Integration Record** (gekoppelde NetSuite-applicatie). Opgeslagen als `adf-{naam}-consumerKey`. |
| **Consumer Secret** | De Consumer Secret van de Integration Record. Opgeslagen als `adf-{naam}-consumerSecret`. |
| **Token ID** | De Token ID (oAuth-token) van het **Access Token** dat aan de integratie en rol is gekoppeld. Opgeslagen als `adf-{naam}-oAuthToken`. |
| **Token Secret** | De Token Secret van het Access Token. Opgeslagen als `adf-{naam}-oAuthSecret`. |

**Authenticatie:** **NetSuite Token-Based Authentication (TBA)** — een OAuth 1.0a-flow met **`HMAC-SHA256`**-signering. Yres berekent per request zelf de `Authorization: OAuth …`-header met de functie `LoadManagement.fxCreateNetsuiteAuthHeader` (op basis van Consumer Key/Secret, Token ID/Secret, account-`realm`, timestamp en nonce). De vier credential-waarden (Consumer Key, Consumer Secret, Token ID, Token Secret) plus de Base URL komen daarbij uit de Azure Key Vault.

:::note
In de gepubliceerde linked services staat `authenticationType: Anonymous`. Dat is **geen** anonieme verbinding: de echte authenticatie wordt op uitvoertijd via de berekende TBA-header (`fxCreateNetsuiteAuthHeader`) en de Key Vault-secrets toegevoegd. De `Anonymous`-waarde en de in de connector achtergebleven voorbeeld-account-id (`td2872575`) zijn seed-/voorbeeldgegevens, geen klantwaarden.
:::

**Integration runtime:** standaard de cloud-IR **`AutoResolveIntegrationRuntime`** — de SuiteTalk REST-API is publiek bereikbaar. Een self-hosted IR is alleen nodig wanneer je het uitgaande verkeer via je eigen netwerk wilt routeren; de gekozen IR wordt in de linked service vastgelegd (`connectVia`).

## Gegevens ophalen

Alle credentials maak je aan in NetSuite zelf. Schakel eerst **Token-Based Authentication** in via **Setup → Company → Enable Features → SuiteCloud → Manage Authentication → Token-Based Authentication**.

- **Account ID (Base URL):** je NetSuite Account ID vind je in **Setup → Company → Company Information** (veld *Account ID*). De REST-host is `https://<account-id>.suitetalk.api.netsuite.com`, waarbij je in de host punten/streepjes door `_` vervangt (bijvoorbeeld account `TD2872575` → `td2872575`).
- **Consumer Key + Consumer Secret:** maak een **Integration Record** aan via **Setup → Integration → Manage Integrations → New**. Zet **Token-Based Authentication** aan; bij het opslaan toont NetSuite eenmalig de **Consumer Key** en **Consumer Secret** (bewaar deze direct, ze zijn daarna niet meer opvraagbaar).
- **Token ID + Token Secret:** maak een **Access Token** aan via **Setup → Users/Roles → Access Tokens → New**, gekoppeld aan de integratie, een gebruiker en een rol met REST-rechten. Bij het opslaan toont NetSuite eenmalig de **Token ID** en **Token Secret**.

**Data en metadata:** Yres haalt records op met **SuiteQL** via het endpoint `query/v1/suiteql/` (dataset `NetSuite_MAIN`, met paginering via `offset`/`limit`). Veld- en objectmetadata komt uit de **REST metadata-catalog** (`record/v1/metadata-catalog/…`, dataset `NetSuite_HTTP`). De pijplijn **`GetMetaData - NetSuite`** vult hiermee `LoadManagement.Dictionary`, zodat je daarna tabellen kunt selecteren; deze metadata-stap moet dus vóór het toevoegen van tabellen zijn uitgevoerd. De rol die aan het Access Token hangt, moet leesrechten hebben op de records en velden die je wilt ophalen.

Officiële documentatie: [NetSuite — SuiteTalk REST Web Services & Token-Based Authentication](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1545222128.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
