---
title: OData OAuth
sidebar_label: OData OAuth
description: OData OAuth koppelen aan Yres — verbindingseisen.
---

# OData OAuth

**Categorie:** OData

OData met OAuth-authenticatie. Grant Type "Authorization Code" vereist een refresh token.

## Verbindingseisen

- URL
- Body URL
- Client ID
- Client secret
- Access token URL
- Scope
- Grant Type

## Gegevens ophalen

Deze gegevens krijg je door bij de aanbieder van de OData-service een **OAuth-client te registreren**. De exacte waarden staan in de API- en OAuth-documentatie van die aanbieder.

- **URL**: de service-root van de OData-feed.
- **Body URL**: het token-endpoint waar het tokenverzoek (met de OAuth-body) naartoe gaat.
- **Client ID** en **Client secret**: ontvang je bij het registreren van de OAuth-client bij de aanbieder.
- **Access token URL**: het token-endpoint van de aanbieder (vaak gelijk aan de Body URL).
- **Scope**: de scope(s) die toegang geven tot de gewenste data; staat in de documentatie van de aanbieder.
- **Grant Type**: meestal "Client Credentials" (server-naar-server) of "Authorization Code". Bij **Authorization Code** is bovendien een **refresh token** nodig.

Zie voor de werking van de client-credentials-flow een algemene referentie: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
