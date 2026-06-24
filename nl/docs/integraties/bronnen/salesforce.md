---
title: Salesforce
sidebar_label: Salesforce
description: Salesforce koppelen aan Yres — verbindingseisen.
---

# Salesforce

**Categorie:** Directe koppeling · REST

CRM-platform. Yres koppelt via de Salesforce-connector (`SalesforceV2`) met OAuth2 client-credential authenticatie.

## Verwachte input

Bij het toevoegen van de bron vul je in het formulier de volgende velden in:

| Veld | Toelichting |
|---|---|
| **Source name** | Naam van de bron (uniek per organisatie, 2–45 tekens, begint met een letter). Wordt de naam van de ADF linked service en de prefix van de Key Vault-secrets (`adf-{naam}-…`). |
| **Environment url** | Je Salesforce My Domain-/login-URL, bijvoorbeeld `https://<mijnbedrijf>.my.salesforce.com`. |
| **Client Id** | De **Consumer Key** van je Connected App. |
| **Client Secret** | De **Consumer Secret** van je Connected App. |

Daarnaast gelden de gedeelde bronvelden die voor elke bron worden gevraagd: **integration runtime**, **credentials voor alle omgevingen identiek? (Ja/Nee)**, **vervaldatum credentials** (optioneel) en **tags** (optioneel).

**Authenticatie:** OAuth2 client-credential (`authenticationType: OAuth2ClientCredential`). Yres bouwt hiermee een `SalesforceV2`-linked-service (API-versie `60.0`) voor de data, plus een aanvullende anonieme HTTP-linked-service (`{naam}_HTTP`) voor het ophalen van metadata.

**Integration runtime:** standaard de cloud-IR **`AutoResolveIntegrationRuntime`** — Salesforce is publiek bereikbaar. Een self-hosted IR is alleen nodig wanneer je het uitgaande verkeer via je eigen netwerk wilt routeren; de gekozen IR wordt in de linked service vastgelegd (`connectVia`).

**Delta-kolommen:** Salesforce hoort bij de SQL-bronnen die **twee delta-kolommen** ondersteunen. De standaard laadtypes (FULL/DELTA/OVERWRITE/RELOAD/IMAGE/ADDITIONAL) werken normaal.

## Vereisten vooraf

- Een **Connected App** in Salesforce met **OAuth-instellingen ingeschakeld** en als grant-type **Client Credentials** geconfigureerd.
- De **Consumer Key** (Client Id) en **Consumer Secret** (Client secret) uit de App Manager.
- De juiste **OAuth-scopes** en een geautoriseerde uitvoerende gebruiker voor de client-credentials-flow (zie de Salesforce-documentatie).

Yres slaat zelf nooit credentials op: de ingevoerde waarden gaan naar de Azure Key Vault van de klant en worden door de linked service opgehaald. De secrets worden opgeslagen onder de prefix `adf-{naam}-` (onder andere de Environment url, Client Id en Client secret).

## Gegevens ophalen

- **Environment url** — dit is je My Domain-/login-URL van Salesforce, bijvoorbeeld `https://<mijnbedrijf>.my.salesforce.com`. Je vindt je My Domain in **Setup → Company Settings → My Domain**.
- **Client Id (Consumer Key) + Client secret (Consumer Secret)** — maak een **Connected App** aan via **Setup → App Manager → New Connected App**. Zet **Enable OAuth Settings** aan, kies bij de OAuth-flow **Client Credentials**, vul een callback-URL en de gewenste OAuth-scopes in en sla op. Open daarna de app in App Manager → **Manage Consumer Details** om de **Consumer Key** (Client Id) en **Consumer Secret** (Client secret) te bekijken en te kopiëren.

Officiële documentatie: [Salesforce — Connected App / OAuth client credentials](https://help.salesforce.com/s/articleView?id=xcloud.connected_app_client_credentials_setup.htm&type=5).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
