---
title: REST API
sidebar_label: REST API
description: REST API koppelen aan Yres — verbindingseisen.
---

# REST API

**Categorie:** REST

Generieke REST-koppeling voor elke JSON-API. OpenAPI/Swagger wordt ondersteund: kies endpoints visueel in de frontend.

## Verbindingseisen

- API specification URL
- Base URL
- Pagination type
- Authentication type
- Extra headers (optioneel)

## Gegevens ophalen

Al deze gegevens komen uit de documentatie van de doel-API.

- **API specification URL**: als de API een OpenAPI/Swagger-specificatie heeft, de URL daarvan (vaak `openapi.json` of `swagger.json`). Daarmee kun je de endpoints visueel kiezen.
- **Base URL**: de basis-URL (root) van de API.
- **Pagination type**: hoe de API resultaten in pagina's opdeelt (bijvoorbeeld offset/limit, paginanummer of RFC 5988 link-headers). Controleer dit in de API-documentatie.
- **Authentication type**: Basic of OAuth2. Bij **OAuth2 client credentials** heb je het token-endpoint, client ID, client secret, scope en eventueel een resource nodig.
- **Extra headers**: eventuele aanvullende headers die de API verlangt (bijvoorbeeld een API-key-header).

Raadpleeg voor al deze waarden de officiële documentatie van de API waarmee je koppelt. Voor de OAuth2-flow zie: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
