---
title: OneStream
sidebar_label: OneStream
description: OneStream koppelen aan Yres — verbindingseisen.
---

# OneStream

**Categorie:** REST

Corporate Performance Management. **Preview** — kan instabiel zijn.

## Verbindingseisen

- URL
- Client ID
- Client secret
- Access token URL
- Application

## Gegevens ophalen

OneStream koppelt via de **REST API**, beveiligd met OAuth 2.0 (`client_credentials`). Dit is een **preview**-connector.

- **URL** — De basis-URL van de OneStream REST API van jouw omgeving (de Web API / OneStream-server-URL).
- **Application** — De naam van de OneStream-applicatie waaruit data wordt gehaald.
- **Client ID + Client secret** — Komen uit de geregistreerde applicatie bij je identity provider (Azure AD / Microsoft Entra ID, Okta of PingFederate) die de OneStream Web API gebruikt. Kopieer de client secret direct na aanmaak — deze is maar één keer zichtbaar.
- **Access token URL** — De token-endpoint van die identity provider. Bij Azure AD is dat `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`.

Laat deze waarden door je **OneStream-beheerder** configureren/aanleveren. Officiële docs: [OneStream Web API Authentication](https://documentation.onestream.com/docs/Content/SPC/Web%20API%20Authentication.html) · [Azure AD (Microsoft Entra ID) Configuration](https://documentation.onestream.com/docs/Content/REST%20API/Azure%20AD%20Configuration.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
