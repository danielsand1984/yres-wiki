---
title: REST API
sidebar_label: REST API
description: REST API koppelen aan Yres — verbindingseisen.
---

# REST API

**Categorie:** REST

Generieke REST-koppeling (`RestService`) voor elke JSON-API. Heeft de API een OpenAPI/Swagger-specificatie, dan kun je in de frontend de endpoints kiezen op basis van die specificatie. De koppeling ondersteunt meerdere paginatie- en authenticatievormen, zodat vrijwel elke REST-bron via één generiek formulier te koppelen is.

## Verwachte input

Je vult deze velden in het "Bron toevoegen"-formulier (`getFormAddSourceRestService.ts`). Naast de bronspecifieke velden hieronder vraagt elke bron ook de gedeelde velden uit stap 1 (bronnaam, type, integration runtime, credentials gelijk voor alle omgevingen, vervaldatum, tags).

| Veld (label) | Verplicht | Toelichting |
|---|---|---|
| **OpenAPI specification URL** | Optioneel | URL van de OpenAPI 3.x-specificatie (JSON of YAML). Ingevuld kun je de endpoints visueel kiezen. Wordt gevalideerd (`ValidApiSpecificationRule`). |
| **Base URL** | Ja | De basis-URL (root) van de API. **Mag niet eindigen op een `/`.** |
| **paginationType** | Ja | Keuze: `No pagination`, `RFC5988`, `BodyUrl`, `Offset`, `Paging`, `OffsetPage`. Bepaalt welke extra velden verschijnen (zie hieronder). |
| **AuthenticationType** | Ja | Keuze: `Anonymous`, `Basic` of `OAuth2ClientCredential`. Bepaalt welke credential-velden verschijnen (zie hieronder). |
| **HTTP headers** | Optioneel | Eén of meer extra header/waarde-paren (bijvoorbeeld een API-key-header) die de API verlangt. |

### Paginatie — velden per type

Controleer in de documentatie van de doel-API hoe die resultaten in pagina's opdeelt en kies het bijbehorende `paginationType`:

- **No pagination**: geen extra velden; alle resultaten komen in één response.
- **RFC5988**: paginering via `Link`-headers (RFC 5988); geen extra velden.
- **BodyUrl**: voegt een veld **Body url** toe — het JSON-pad naar de volgende-pagina-URL in de response body (bijvoorbeeld `$['@odata.nextLink']`).
- **Offset** / **OffsetPage** / **Paging**: voegen **Offset Object** en **Limit Object** toe — de naam van de offset- en limit-parameter die de API gebruikt.

Het gekozen paginatietype bepaalt ook welke dynamische pipelines Yres genereert (`Paging`/`Offset`/`OffsetPage`).

### Authenticatie — velden per type

- **Anonymous**: geen credentials.
- **Basic**: **Username** + **Password**. Worden opgeslagen in Key Vault als `adf-{bronnaam}-basic-http-username` en `adf-{bronnaam}-basic-http-password`.
- **OAuth2ClientCredential**: **Token endpoint** + **Client ID** + **Client Secret** + **Scope** + **Resource**. Worden opgeslagen als `adf-{bronnaam}-tokenEndpoint`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret` (en optioneel `scope` en `resource`).

## Integration runtime

`AutoResolveIntegrationRuntime` (cloud) is de standaard en de juiste keuze voor een publiek bereikbare REST-API. Kies een **self-hosted integration runtime** alleen wanneer de API on-premises of achter een firewall draait. De backend (`RestServiceSource.php`) schrijft de gekozen IR via `withConnectVia` in de linked service en zet `enableServerCertificateValidation=true`.

## Hoe Yres de request-URL opbouwt

De **Base URL** wordt opgeslagen in de Key Vault van de klant als `adf-{bronnaam}-http-url`. Bij elke run leest de pipeline dit secret en bouwt Yres zelf de volledige request-URL op uit de Base URL en het endpoint:

- **Queryparameters in de Base URL blijven behouden** en worden samengevoegd met de queryparameters van het endpoint en de paginatie. Voorbeeld: Base URL `https://api.example.com/v1?key=123` + endpoint `/cars?json=full` → `https://api.example.com/v1/cars?key=123&json=full`.
- Een endpoint dat met `/` begint (of zonder scheidingsteken, zoals `cars`) wordt als **pad** achter het pad van de Base URL geplakt.
- Een endpoint dat met `?` of `&` begint, of een kale `naam=waarde`, wordt als **queryparameter** toegevoegd.
- De paginatiepipelines (Offset / Paging / OffsetPage) voegen hun pagina-parameters toe aan dezelfde querystring.

## Vereisten

- **Base URL** van de API (zonder afsluitende `/`).
- Wil je endpoints visueel kunnen kiezen: een geldige **OpenAPI/Swagger-specificatie-URL**.
- Het juiste **paginatietype** met de bijbehorende velden (body-url of offset/limit-object).
- De juiste **credentials** voor het gekozen authenticatietype (Basic: gebruikersnaam + wachtwoord; OAuth2 client credentials: token endpoint, client ID, client secret, scope en eventueel resource). Yres slaat deze op in de Azure Key Vault van de klant onder `adf-{bronnaam}-…`; de frontend bewaart zelf geen secrets.
- Eventuele **extra HTTP-headers** die de API verplicht stelt.

:::note Geen metadata-stap
REST-bronnen hebben **geen metadata-stap**: het ophalen/vernieuwen van metadata wordt overgeslagen (`hasMetadata()=false`). Je configureert de op te halen data daarom direct op basis van de OpenAPI-specificatie of de bekende endpoints, niet via een metadata-dictionary zoals bij database-bronnen.
:::

## Gegevens ophalen

Al deze gegevens komen uit de documentatie van de doel-API:

- **OpenAPI specification URL**: als de API een OpenAPI/Swagger-specificatie publiceert, de URL daarvan (vaak `openapi.json` of `swagger.json`). Daarmee kies je de endpoints in de frontend.
- **Base URL**: de basis-URL (root) van de API, zonder afsluitende `/`.
- **paginationType**: hoe de API resultaten in pagina's opdeelt (offset/limit, paginanummer, `BodyUrl` via een volgende-pagina-link in de body, of RFC 5988 `Link`-headers). Controleer dit in de API-documentatie.
- **AuthenticationType**: `Anonymous`, `Basic` (gebruikersnaam + wachtwoord) of `OAuth2ClientCredential`. Bij **OAuth2 client credentials** heb je het token-endpoint, client ID, client secret, scope en eventueel een resource nodig.
- **HTTP headers**: eventuele aanvullende headers die de API verlangt (bijvoorbeeld een API-key-header).

Raadpleeg voor al deze waarden de officiële documentatie van de API waarmee je koppelt. Voor de OAuth2-flow zie: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
