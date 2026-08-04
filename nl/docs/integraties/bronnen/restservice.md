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
- **Offset** / **OffsetPage**: voegen **Offset Object** en **Limit Object** toe — de naam van de offset- en limit-parameter die de API gebruikt.
- **Paging**: voegt alleen een **Page Object** toe — de naam van de paginanummer-parameter. Er is bij dit type géén Limit Object.

Yres genereert overigens **altijd alle drie de paginatie-pipelines** (`Paging`/`Offset`/`OffsetPage`) plus de main-pipeline, ongeacht het gekozen paginatietype; het gekozen type bepaalt welke pipeline bij een load daadwerkelijk wordt gebruikt.

### Authenticatie — velden per type

- **Anonymous**: geen credentials.
- **Basic**: **Username** + **Password**. Worden opgeslagen in Key Vault als `adf-{bronnaam}-basic-http-username` en `adf-{bronnaam}-basic-http-password`.
- **OAuth2ClientCredential**: **Token endpoint** + **Client ID** + **Client Secret** + **Scope** + **Resource**. Worden opgeslagen als `adf-{bronnaam}-tokenEndpoint`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret` (en optioneel `scope` en `resource`).

## Integration runtime

`AutoResolveIntegrationRuntime` (cloud) is de standaard en de juiste keuze voor een publiek bereikbare REST-API. Kies een **self-hosted integration runtime** alleen wanneer de API on-premises of achter een firewall draait. De backend (`RestServiceSource.php`) schrijft de gekozen IR via `withConnectVia` in de linked service en zet `enableServerCertificateValidation=true`.

## Hoe Yres de request-URL opbouwt

Yres bouwt de volledige request-URL **zelf op in de pipeline** — de connector doet geen eigen URI-resolutie. Dat voorkomt de bekende valkuilen van relatieve URL's (waarbij .NET het pad van de Base URL zou weggooien). Je levert twee dingen aan; Yres combineert ze bij elke run.

### Wat jij invoert

| Invoer | Waar | Wat het is |
|---|---|---|
| **Base URL** | Eenmalig bij de **bron** (stap 1 van de wizard) | De root van de API. Opgeslagen in de Key Vault als `adf-{bronnaam}-http-url`. Mag zelf al een querystring bevatten (bv. een vaste `?api-version=2.0`). |
| **Endpoint** | Per **tabel** (het *Endpoint*-veld) | Het pad en/of de query van dat specifieke endpoint. Dit veld bepaalt of Yres een pad óf een query aanplakt. |

Bij elke run leest de pipeline het `http-url`-secret, splitst het op de eerste `?` in een **basispad** en een **basisquery**, ontleedt jouw endpoint, en voegt alles samen tot één URL.

### De regels

Yres beslist puur op basis van hoe je het **Endpoint**-veld schrijft:

- **Leeg** → alleen de Base URL wordt gebruikt.
- Begint met `/`, of een kale naam zoals `cars` of `cars/active` → wordt als **pad** achter het basispad geplakt.
- Begint met `?` of `&`, of een kale `naam=waarde` (bevat `=` en géén `/`) → wordt als **query** toegevoegd.
- Bevat zowel een pad als een `?` → alles vóór de `?` is pad, alles erna is query.

Verdere details die het gedrag bepalen:

- **Queryparameters uit de Base URL blijven altijd behouden** en komen vóór de endpoint- en paginatie-query te staan.
- Een **afsluitende `/`** op de Base URL wordt alleen weggehaald wanneer er een pad wordt aangeplakt; zonder pad blijft hij staan.
- Een `=` **in een pad-segment** (bv. `/path/a=b`) blijft gewoon onderdeel van het pad — de `=`-regel geldt alleen als er géén `/` in het endpoint staat.
- Yres **ontdubbelt geen queryparameters**: staat `key=` zowel in de Base URL als in het endpoint, dan komen beide in de URL (`?key=1&key=2`). Zet een parameter dus op één plek.

### Voorbeelden

Ervan uitgaande dat de **Base URL** is opgeslagen als het `http-url`-secret:

| Base URL (secret) | Endpoint (per tabel) | Resulterende request-URL |
|---|---|---|
| `https://api.example.com/v1` | `/customers` | `https://api.example.com/v1/customers` |
| `https://api.example.com/v1` | `customers` | `https://api.example.com/v1/customers` |
| `https://api.example.com/v1` | `customers/active` | `https://api.example.com/v1/customers/active` |
| `https://api.example.com/v1` | `?$top=100` | `https://api.example.com/v1?$top=100` |
| `https://api.example.com/v1` | `&$top=100` | `https://api.example.com/v1?$top=100` |
| `https://api.example.com/v1` | `active=true` | `https://api.example.com/v1?active=true` |
| `https://api.example.com/v1/` | `/cars` | `https://api.example.com/v1/cars` |
| `https://api.example.com/v1/` | *(leeg)* | `https://api.example.com/v1/` |
| `https://api.example.com/v1` | `/path/a=b` | `https://api.example.com/v1/path/a=b` |

Complexere combinaties, waarbij de Base URL zélf al een vaste query heeft:

| Base URL (secret) | Endpoint (per tabel) | Resulterende request-URL |
|---|---|---|
| `https://api.example.com/v1?api-version=2.0` | `/orders?status=open` | `https://api.example.com/v1/orders?api-version=2.0&status=open` |
| `https://api.example.com/v1?key=abc` | `cars?type=ev&year=2024` | `https://api.example.com/v1/cars?key=abc&type=ev&year=2024` |
| `https://api.example.com/v1?key=abc` | *(leeg)* | `https://api.example.com/v1?key=abc` |
| `https://api.example.com/v1?key=abc` | `&$select=id,name` | `https://api.example.com/v1?key=abc&$select=id,name` |

### Paginatie

Bij een paginatietype anders dan *No pagination* voegt de bijbehorende pipeline per pagina de pagina-parameters achteraan dezelfde querystring toe. De namen komen uit de velden **Offset Object** en **Limit Object** (bij *Paging*: het **Page Object**) die je bij de bron invult; `pageSize` is de laadinstelling. Uitgaande van Base URL `https://api.example.com/v1?key=abc`, endpoint `/orders` en `pageSize = 500`:

| Type | Velden | Pagina 1 | Pagina 2 | … |
|---|---|---|---|---|
| **Offset** | Offset Object `offset`, Limit Object `limit` | `…/orders?key=abc&offset=0&limit=500` | `…&offset=500&limit=500` | offset telt op met `pageSize` |
| **OffsetPage** | Offset Object `page`, Limit Object `limit` | `…/orders?key=abc&page=0&limit=500` | `…&page=1&limit=500` | page telt op met 1, `limit` blijft `pageSize` |
| **Paging** | Page Object `page` | `…/orders?key=abc&page=1` | `…&page=2` | page telt op met 1, geen limit |

De loop stopt zodra een pagina geen rijen meer teruggeeft. **BodyUrl** en **RFC5988** gebruiken géén offset/limit-velden: die volgen de volgende-pagina-link uit respectievelijk de response-body en de `Link`-header, startend vanaf de hierboven opgebouwde URL.

## Van JSON-respons naar tabel

Yres laat ADF de JSON **niet** kolom-voor-kolom mappen: het haalt de hele respons als tekst op en
ontleedt die **server-side in SQL Server**. Zo maakt en verruimt Yres de tabel automatisch op basis van
de velden in de respons, zonder dat je een veldmapping opgeeft. De enige knop die je meestal nodig hebt
is de **collection** (het pad naar de records-array, standaard `AUTO`). Hoe dit precies werkt — geneste
objecten, arrays, datatypes en uitgewerkte voorbeelden — staat op **[JSON naar tabellen](restservice-json.md)**.

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

**Zie ook:** [JSON naar tabellen](restservice-json.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
