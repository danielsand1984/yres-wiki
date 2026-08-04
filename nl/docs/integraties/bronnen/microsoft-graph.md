---
title: Microsoft Graph
sidebar_label: Microsoft Graph
description: Microsoft Graph koppelen aan Yres — verbindingseisen.
---

# Microsoft Graph

**Categorie:** OData · REST

Microsoft 365-data via Microsoft Graph (`https://graph.microsoft.com/v1.0`). Graph is de
onderliggende koppeling voor scenario's als Teams en Office 365: je registreert één
Microsoft Entra ID-app (Azure AD) en authenticeert met OAuth2.

## Verwachte input

In de wizard **Bron toevoegen** vul je de volgende velden in (frontend-preset **Graph**,
formulier `getFormAddGraph.ts`):

| Veld | Toelichting |
|---|---|
| **URL** | Alleen-lezen; vast op `https://graph.microsoft.com/v1.0`. |
| **Token URL** | Alleen-lezen; automatisch samengesteld uit je tenant: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| **Tenant ID** | De Directory (tenant) ID van je Microsoft Entra-tenant (GUID). |
| **Client ID** | De Application (client) ID van de geregistreerde app (GUID). |
| **Client Secret** | Het client secret van de app (wordt als geheim behandeld). |
| **Scope** | De OAuth-scope, bijv. `https://graph.microsoft.com/.default`. |
| **Grant Type** | Keuze `Client Credentials` of `Authorization Code`. Bij **Authorization Code** verschijnt een extra veld **Refresh token** (verplicht). |

Verborgen, vast ingestelde waarden voor deze bron: `paginationType=BodyUrl`,
`body_url=@odata.nextLink` en `authenticationType=Anonymous` (de OAuth-token wordt door de
pipeline opgehaald en als header meegestuurd; paginering volgt de Graph-`@odata.nextLink`).

### Authenticatie

**OAuth2 via een Microsoft Entra ID (Azure AD) service principal.** Je levert tenant ID,
client ID en client secret aan; afhankelijk van **Grant Type** gebruikt Yres de
client-credential-flow (client credentials) of de authorization-code-flow (met refresh token).

### Integration runtime

Standaard de cloud-runtime **`AutoResolveIntegrationRuntime`** — Microsoft Graph is publiek
bereikbaar over HTTPS, dus dit is doorgaans de juiste keuze. Een **self-hosted integration
runtime** is alleen nodig als je het verkeer via een afgeschermd of on-prem netwerk moet
routeren.

### Waar de gegevens terechtkomen

De frontend slaat geen geheimen op. De **http-url, client ID, client secret en grant type**
gaan als secrets naar de **Azure Key Vault** van de klant, onder de groep `adf-{bronnaam}-…`
(de bronnaam die je in de wizard kiest, wordt de naam van de linked service én de prefix van
de Key Vault-geheimen). Het **refresh token, de scope en de token-URL** staan in de tabel
**`Config.Tokens`** in de klant-DWH-database, waar de token-flow ze gebruikt. De linked
services zelf staan op `Anonymous` en refereren alleen het http-url-secret.

## Vereisten (prerequisites)

1. **Registreer een app in Microsoft Entra ID (Azure AD).** Microsoft Entra-beheercentrum →
   **Identity → Applications → App registrations → New registration**.
   - **Client ID** — staat na registratie op de **Overzicht (Overview)**-pagina als
     **Application (client) ID**.
   - **Tenant ID** — eveneens op de **Overzicht**-pagina als **Directory (tenant) ID**.
2. **Maak een client secret aan** onder de app → **Certificates & secrets** →
   **New client secret**. Kopieer de **Value** direct; deze waarde wordt **maar één keer
   getoond**.
3. **Voeg Microsoft Graph-permissies toe** onder **API permissions** (application- of
   delegated-permissies, afhankelijk van je scenario) en laat een beheerder **admin consent**
   verlenen.
4. **Bepaal de Grant Type.** Voor service-to-service-toegang (achtergrond, zonder ingelogde
   gebruiker) gebruik je **Client Credentials**. Voor toegang namens een gebruiker gebruik je
   **Authorization Code** en lever je daarnaast een **Refresh token** aan.

> Officiële documentatie: [Een applicatie registreren bij het Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
