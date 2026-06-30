---
title: OData OAuth
sidebar_label: OData OAuth
description: OData OAuth koppelen aan Yres — verbindingseisen.
---

# OData OAuth

**Categorie:** OData

Een OData-feed die met **OAuth 2.0** is beveiligd. Gebruik deze bron voor OData-services achter een
OAuth-aanmelding. Voor een OData-feed zonder OAuth (anoniem, Basic of API-key in een header) gebruik je
in plaats hiervan de bron [OData](./odata.md).

Yres bouwt voor deze bron twee linked services: een **REST**-linked service voor de data en een
**HTTP**-linked service voor de metadata. Paginering verloopt via de OData-vervolgkoppeling
(`@odata.nextLink`).

## Verwachte input

Deze velden vul je in het Yres-formulier "Bron toevoegen" in (sub-formulier voor `OData OAuth`).

| Veld | Toelichting |
|---|---|
| **Url** | De service-root (basis-URL) van de OData-feed. Yres voegt automatisch een afsluitende `/` toe. |
| **PaginationType** | Vast op `BodyUrl` (alleen-lezen). |
| **Body url** | Het JSON-pad naar de vervolgkoppeling; vast op `$['@odata.nextLink']`. |
| **Client id** | De client-/applicatie-id (UUID) van de geregistreerde OAuth-client. |
| **Client secret** | Het clientgeheim van de OAuth-client. |
| **Access token url** | Het token-endpoint van de aanbieder waar Yres het toegangstoken ophaalt. |
| **Scope** | De scope(s) die toegang geven tot de gewenste data. |
| **Grant Type** | `Client Credentials` of `Authorization Code` (keuzelijst). |
| **Refresh token** | Alleen bij **Authorization Code**: een geldig refresh token (verplicht). |

Naast deze bronspecifieke velden vraagt de wizard de standaard "bron"-gegevens: **bronnaam** (uniek,
2–45 tekens, begint met een letter), **integration runtime**, **gelden de credentials voor alle
omgevingen?**, **vervaldatum van de credentials** en optionele **tags**.

### Authenticatie

**OAuth 2.0.** Twee grant types worden ondersteund:

- **Client Credentials** — server-naar-server. Yres haalt met `Client id` + `Client secret` een
  toegangstoken op bij de `Access token url`. Geen gebruikersinteractie nodig.
- **Authorization Code** — vereist bovendien een **refresh token**, waarmee Yres telkens een nieuw
  toegangstoken ophaalt. Zonder refresh token weigert de validatie de bron.

De validatie vereist dat `Url`, `Client id`, `Client secret` en `Access token url` zijn ingevuld, dat
`Grant Type` één van `Authorization Code` / `Client Credentials` is, en dat bij `Authorization Code`
een refresh token aanwezig is.

### Integration runtime

Standaard de cloud-IR **`AutoResolveIntegrationRuntime`** — geschikt voor een OData-service die
publiek (via internet) bereikbaar is. Kies alleen een **self-hosted integration runtime** wanneer de
OData-service zich on-premises of achter een firewall bevindt en niet rechtstreeks vanuit Azure
bereikbaar is. Yres schrijft de gekozen IR via `connectVia` naar beide linked services.

### Vereisten en geheimen

- **OAuth-client registreren** bij de aanbieder van de OData-service. Daaruit komen de `Client id`,
  het `Client secret`, de `Access token url` en de toegestane `Scope`(s). Bij `Authorization Code`
  lever je daarnaast een geldig **refresh token** aan.
- **Credentials staan nooit in de frontend.** Yres schrijft ze naar de **Azure Key Vault** van de
  klant, onder de bronnaam-prefix `adf-{bronnaam}-…`. Voor deze bron zijn dat onder meer
  `adf-{bronnaam}-http-url`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret` en
  `adf-{bronnaam}-grantType`. De OAuth-**tokens** (refresh token, scope, token-URL, grant type)
  worden afzonderlijk opgeslagen.
- Raadpleeg de API- en OAuth-documentatie van de aanbieder voor de exacte service-root, scope-namen
  en het token-endpoint.

:::tip Gebruik de presetpagina voor die diensten
Een aantal vaste presets (Microsoft Graph, Dynamics 365, Intune Data Warehouse) gebruikt onder water
hetzelfde OData-OAuth-mechanisme maar wordt als backend-type `OData` opgeslagen (en via de standaard
OData-bouwer uitgerold). Voor die diensten gebruik je de betreffende presetpagina in plaats van deze
generieke OData-OAuth-bron.
:::

## Load types en delta

OData OAuth gedraagt zich als een generieke OData/REST-bron. Metadata wordt opgehaald via de
HTTP-linked service; de daadwerkelijke records via de REST-linked service met paginering op
`@odata.nextLink`. Of incrementeel (DELTA) laden mogelijk is, hangt af van de aanwezigheid van een
geschikte delta-/wijzigingskolom in de feed. Zie [Load types](../../concepten/load-types.md) voor de
beschikbare laadtypen.

---

**Officiële documentatie:** [OAuth 2.0 client credentials flow (Microsoft)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow) · [OAuth 2.0 authorization code flow (Microsoft)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)

**Zie ook:** [OData](./odata.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
