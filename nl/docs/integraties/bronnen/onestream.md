---
title: OneStream
sidebar_label: OneStream
description: OneStream koppelen aan Yres — verbindingseisen.
---

# OneStream

**Categorie:** REST

Corporate Performance Management. Yres koppelt OneStream via de REST API met OAuth 2.0 of een Personal
Access Token.

## Verbindingseisen

- URL
- Application
- Authentication type (`OAUTH2` of `PAT`)
- Bij `OAUTH2`: Client ID · Client secret · Access token URL
- Bij `PAT`: Personal access token (PAT)

## Verwachte input

OneStream koppelt via de **REST API**. Je vult in het wizard-scherm de volgende velden in. De **authenticatiemethode** kies je zelf via het keuzeveld **Authentication type**: OAuth 2.0 client-credential (`OAUTH2`) of een Personal Access Token (`PAT`).

**Altijd vereist:**

- **URL** — De basis-URL van de OneStream REST API van jouw omgeving (de Web API / OneStream-server-URL).
- **Application** — De naam van de OneStream-applicatie waaruit data wordt gehaald.
- **Authentication type** — Keuzeveld met twee opties: `OAUTH2` of `PAT`. De rest van de velden hangt af van je keuze.

**Bij Authentication type = `OAUTH2`** (OAuth 2.0, `client_credentials`):

- **Client ID** + **Client secret** — Komen uit de geregistreerde applicatie bij je identity provider (Azure AD / Microsoft Entra ID, Okta of PingFederate) die de OneStream Web API gebruikt. Kopieer de client secret direct na aanmaak — deze is meestal maar één keer zichtbaar.
- **Access token URL** — De token-endpoint van die identity provider. Bij Azure AD is dat `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`.

**Bij Authentication type = `PAT`:**

- **Personal access token (PAT)** — Een persoonlijk toegangstoken dat je in OneStream aanmaakt.

**Authenticatie:** OAuth 2.0 client-credential (`OAUTH2`) **of** Personal Access Token (`PAT`). Onder water bouwt Yres een linked service van het type **RestService** met authenticatie **Anonymous**; het token of de OAuth-credentials worden als HTTP-credential meegegeven vanuit Key Vault.

**Integration runtime:** Standaard de cloud-IR **`AutoResolveIntegrationRuntime`**. OneStream is via HTTPS bereikbaar, dus een self-hosted integration runtime is normaal gesproken niet nodig. Yres schrijft de gekozen integration runtime mee in de linked service (`connectVia`); selecteer een self-hosted IR alleen als jouw OneStream-omgeving uitsluitend binnen een afgeschermd netwerk bereikbaar is.

**Voorwaarden (prerequisites):**

- Bij `OAUTH2`: een geregistreerde applicatie bij je identity provider (Azure AD / Entra ID, Okta of PingFederate) met een **client secret**, geautoriseerd voor de OneStream Web API. Laat deze door je **OneStream-beheerder** configureren en aanleveren.
- Bij `PAT`: een **Personal Access Token** dat in OneStream is aangemaakt.
- De ingevulde geheimen worden door Yres opgeslagen in jouw **Azure Key Vault** onder de naamgeving `adf-{bronnaam}-…`. Bij `OAUTH2` zijn dat onder meer `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret`, `adf-{bronnaam}-url`, `adf-{bronnaam}-application` en `adf-{bronnaam}-authType`; bij `PAT` zijn dat `adf-{bronnaam}-token`, `adf-{bronnaam}-url`, `adf-{bronnaam}-application` en `adf-{bronnaam}-authType`. De frontend bewaart zelf nooit geheimen.

## Gegevens ophalen

Laat de waarden hierboven door je **OneStream-beheerder** configureren en aanleveren. OneStream wordt door Yres als **REST**-bron behandeld; metadata-detectie en het toevoegen van tabellen verlopen via het REST-mechanisme van de bron.

Officiële documentatie: [OneStream Web API Authentication](https://documentation.onestream.com/docs/Content/SPC/Web%20API%20Authentication.html) · [Azure AD (Microsoft Entra ID) Configuration](https://documentation.onestream.com/docs/Content/REST%20API/Azure%20AD%20Configuration.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
