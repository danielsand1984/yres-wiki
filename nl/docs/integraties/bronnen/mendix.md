---
title: Mendix
sidebar_label: Mendix
description: Mendix koppelen aan Yres — verbindingseisen.
---

# Mendix

**Categorie:** Directe koppeling · OData / REST

Low-code applicatieplatform. Een Mendix-app kan haar data ontsluiten als een **gepubliceerde
OData-service**; Yres benadert die service via de generieke **OData**- of **RestService**-koppeling.
Mendix heeft géén eigen invulscherm in Yres — je kiest bij het toevoegen van de bron het type
**OData** (of **RestService**) en vult de service-URL en credentials van je Mendix-app in.

## Verwachte input

Omdat Mendix via de generieke OData/REST-route loopt, vul je de velden van het gekozen type in
(formulier `getFormAddSourceOdata`, respectievelijk `getFormAddSourceRestService`). Naast de gedeelde
velden (bronnaam, type, integration runtime, credentials gelijk voor alle omgevingen?, vervaldatum
credentials, tags) zijn dit de relevante velden voor Mendix:

| Veld (label) | Toelichting |
|---|---|
| **Url** / **Base URL** | De service-URL van de gepubliceerde Mendix OData-service: `https://<app-host>/<location>/` (de *location* stel je in Studio Pro in, bijv. `svc/products/v1/`). Bij OData voegt Yres automatisch een afsluitende `/` toe; bij RestService mag de Base URL niet op `/` eindigen. |
| **Authentication type** | Doorgaans **`Basic`** (een Mendix-gebruikersrol met gebruikersnaam + wachtwoord). Stel de gepubliceerde service in Mendix zo in dat zij authenticatie vereist. Bij een publieke service kies je `Anonymous`. |
| **Username** + **Password** | Alleen bij Basic: de gebruiker (Mendix-rol) en het wachtwoord waarmee de OData-service mag worden benaderd. |
| **HTTP headers** (optioneel) | Eén of meer header/waarde-paren, bijvoorbeeld een API-key-header als je Mendix-app dat verwacht (keuzelijst: `Authorization`, `APIKey`, `X-API-KEY`). |
| **Pagination type** / **Body url** | Bij OData staat alleen het paginatietype vast op **`BodyUrl`**; het body-pad is **bewerkbaar**, met `$['@odata.nextLink']` als default (paginering via de OData-`nextLink`). |

- **Authenticatie:** Basic (gebruikersnaam + wachtwoord van een Mendix-gebruikersrol) of Anonymous voor
  een publieke service. Extra headers (bijv. een API-key) worden als authenticatie-headers meegestuurd.
- **Integration runtime:** standaard **`AutoResolveIntegrationRuntime`** (cloud) als de Mendix-app
  publiek bereikbaar is. Draait de app achter een firewall of in een afgeschermd netwerk, kies dan een
  **self-hosted integration runtime**.
- **Geheimen in Key Vault:** Yres slaat zelf geen geheimen op. De backend schrijft de ingevoerde waarden
  naar de **Azure Key Vault** van de klant: de URL als `adf-{bronnaam}-http-url` en bij Basic de
  credentials als `adf-{bronnaam}-basic-http-username` en `adf-{bronnaam}-basic-http-password`. De
  linked service verwijst naar deze secrets.

### Vooraf in Mendix regelen

- **OData-service publiceren** — Voeg in de Mendix-app (Studio Pro) een *Published OData service* toe en
  exposeer de gewenste entiteiten/resources. De *location* van de service bepaalt het pad in de URL.
- **Service-URL achterhalen** — Een overzicht van gepubliceerde services staat op de root-URL van de app
  gevolgd door `/odata-doc/` (bijv. `https://<app-host>/odata-doc/`). De service zelf draait op
  `https://<app-host>/<location>/`.
- **Authenticatie instellen** — Stel in dat de service authenticatie vereist (een Mendix-gebruikersrol
  of API-key/Basic-auth, afhankelijk van de app-configuratie) en geef die gebruiker/sleutel door bij het
  toevoegen van de bron.

:::note Koppel via OData of RestService
Mendix is geen apart bron-type in Yres; de koppeling verloopt via de generieke **OData**- of
**RestService**-bron. Welke van de twee het handigst is, hangt af van hoe je Mendix-app de data
publiceert (OData-feed of een eigen REST-API). Voor een Mendix-service met OAuth-authenticatie gebruik
je in plaats daarvan de bron [**OData OAuth**](odata-oauth.md).
:::

Officiële docs: [Published OData Services (Mendix Documentation)](https://docs.mendix.com/refguide/published-odata-services/).

---

**Zie ook:** [OData](odata.md) · [RestService](restservice.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
