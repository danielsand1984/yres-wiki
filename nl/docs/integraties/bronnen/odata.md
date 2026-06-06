---
title: OData
sidebar_label: OData
description: OData koppelen aan Yres — verbindingseisen.
---

# OData

**Categorie:** OData

Generieke OData-koppeling. Basic-authenticatie vereist gebruikersnaam en wachtwoord.

## Verbindingseisen

- URL
- Authentication type
- HTTP headers

## Gegevens ophalen

Deze gegevens komen van de aanbieder van de OData-service; ze staan in de API-documentatie van die aanbieder.

- **URL**: de service-root van de OData-feed (vaak eindigend op `/odata`). Voeg `/$metadata` toe aan de service-root om het datamodel (entiteiten en velden) te inspecteren.
- **Authentication type**: anonymous, basic of header — afhankelijk van wat de service vereist. Bij **Basic** vul je de gebruikersnaam en het wachtwoord in die je van de aanbieder hebt gekregen.
- **HTTP headers**: eventuele extra headers die de API verlangt (bijvoorbeeld een API-key-header). Welke headers nodig zijn, staat in de documentatie van de aanbieder.

Zie voor uitleg over OData-services de officiële documentatie: [OData — Getting Started / Basic Tutorial](https://www.odata.org/getting-started/basic-tutorial/).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
