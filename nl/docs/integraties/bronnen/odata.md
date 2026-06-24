---
title: OData
sidebar_label: OData
description: OData koppelen aan Yres — verbindingseisen.
---

# OData

**Categorie:** OData

Generieke OData-koppeling voor elke OData-feed (v2/v4). Yres benadert de service via HTTP; de
authenticatie is **Anonymous** (publieke feed) of **Basic** (gebruikersnaam + wachtwoord). Optioneel
voeg je extra HTTP-headers toe (bijvoorbeeld een API-key-header).

## Verwachte input

Je vult deze velden in de wizard **Bron toevoegen** in (formulier `getFormAddSourceOdata`). Naast de
gedeelde velden (bronnaam, type, integration runtime, credentials gelijk voor alle omgevingen?,
vervaldatum credentials, tags) verwacht Yres voor OData:

| Veld (label) | Toelichting |
|---|---|
| **Url** | De service-root van de OData-feed (vaak eindigend op `/odata`). Yres voegt automatisch een afsluitende `/` toe. |
| **Pagination type** | Vast op **`BodyUrl`** (alleen-lezen): paginering verloopt via de OData-`nextLink`. |
| **Body url** | JSON-pad naar de volgende-pagina-link. Standaard `$['@odata.nextLink']`. |
| **Authentication type** | Keuze **`Anonymous`** of **`Basic`**. Bij **Basic** verschijnen extra velden **Username** en **Password**. |
| **Username** + **Password** | Alleen bij Basic: de gebruikersnaam en het wachtwoord die je van de aanbieder van de OData-service hebt gekregen. |
| **HTTP headers** (optioneel) | Eén of meer header/waarde-paren. Suggesties uit de keuzelijst: `Authorization`, `APIKey`, `X-API-KEY`. Gebruik dit voor API's die een extra header (bijvoorbeeld een API-key) verlangen. |

- **Authenticatie:** Anonymous of Basic (gebruikersnaam + wachtwoord). Aanvullende headers worden als
  extra authenticatie-headers meegestuurd.
- **Integration runtime:** standaard **`AutoResolveIntegrationRuntime`** (cloud) voor publiek
  bereikbare OData-services. Staat de feed achter een firewall of on-premises, kies dan een
  **self-hosted integration runtime**.
- **Geheimen in Key Vault:** Yres slaat zelf geen geheimen op. De backend (`ODataSource`) schrijft de
  ingevoerde waarden naar de **Azure Key Vault** van de klant: de URL als `adf-{bronnaam}-http-url` en
  bij Basic de credentials als `adf-{bronnaam}-basic-http-username` en
  `adf-{bronnaam}-basic-http-password`. De linked service verwijst naar deze secrets. Vanaf DWH-versie
  1.52 wordt de data-linked-service als `RestService` opgebouwd (daarvoor als `OData`); er wordt
  daarnaast een aparte metadata-linked-service `{bronnaam}_HTTP` aangemaakt.

:::info Te bevestigen
Voor een OData-feed met OAuth-authenticatie gebruik je niet deze bron maar
[**OData OAuth**](odata-oauth.md). Enkele helper-bronnen (CBS, Tweede Kamer, Topdesk, Microsoft Graph,
Dynamics 365) worden onder water ook als type `OData` opgeslagen, maar hebben hun eigen invulvelden;
documenteer die op hun eigen pagina.
:::

## Gegevens ophalen

Deze gegevens komen van de aanbieder van de OData-service; ze staan in de API-documentatie van die
aanbieder.

- **Url**: de service-root van de OData-feed (vaak eindigend op `/odata`). Voeg `/$metadata` toe aan de
  service-root om het datamodel (entiteiten en velden) te inspecteren.
- **Authentication type**: `Anonymous` of `Basic`, afhankelijk van wat de service vereist. Bij
  **Basic** vul je de gebruikersnaam en het wachtwoord in die je van de aanbieder hebt gekregen.
- **HTTP headers**: eventuele extra headers die de API verlangt (bijvoorbeeld een API-key-header).
  Welke headers nodig zijn, staat in de documentatie van de aanbieder.

Zie voor uitleg over OData-services de officiële documentatie: [OData — Getting Started / Basic Tutorial](https://www.odata.org/getting-started/basic-tutorial/).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
