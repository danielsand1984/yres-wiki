---
title: Tweede Kamer
sidebar_label: Tweede Kamer
description: Tweede Kamer koppelen aan Yres — verbindingseisen.
---

# Tweede Kamer

**Categorie:** OData

Open data van de Nederlandse Tweede Kamer via OData. Yres heeft hiervoor een kant-en-klare keuze in de bron-wizard: je kiest **Tweede Kamer** als brontype en hoeft zelf geen feed-URL samen te stellen. Onder water wordt de bron als generiek **OData**-brontype opgeslagen met een vaste, voorgedefinieerde feed-URL.

## Verwachte input

In de bron-wizard (stap 1) vul je de gedeelde velden in die voor elke bron gelden:

- **Bronnaam** — uniek, 2–45 tekens. Wordt de naam van de linked service en de prefix van de Key Vault-secrets (`adf-{bronnaam}-…`).
- **Type** — kies **Tweede Kamer**.
- **Integration runtime** — **`AutoResolveIntegrationRuntime`** (cloud). De Tweede Kamer-feed is publiek bereikbaar via internet, dus een self-hosted integration runtime is **niet** nodig.
- **Inloggegevens gelijk voor alle omgevingen?** / **vervaldatum inloggegevens** / **tags** — zoals bij elke bron.

Bronspecifieke verbindingsvelden zijn er **niet**: de feed-URL, het authenticatietype en de paginering staan vast en zijn niet door de gebruiker in te vullen.

| Eigenschap | Waarde | Door gebruiker in te vullen? |
|---|---|---|
| Feed-URL | `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/` | Nee — vast |
| Authenticatie | Anoniem (`authenticationType=Anonymous`) | Nee — vast |
| Paginering | `BodyUrl` (`body_url=$['@odata.nextLink']`) | Nee — vast |
| Opgeslagen brontype | `OData` | n.v.t. |

### Authenticatie

**Anoniem.** De data van de Tweede Kamer is **open data**: er zijn geen inloggegevens, API-sleutels of tokens nodig. Er worden dan ook geen Key Vault-secrets aangemaakt voor de verbinding zelf.

### Vereisten vooraf

Geen. Omdat er geen credentials zijn en de bron via de cloud-integration-runtime werkt, hoef je vooraf niets in Azure te registreren (geen app-registratie, geen client secret, geen SAS-token, geen Key Vault-secrets).

## Gegevens ophalen

De Tweede Kamer-feed levert data in JSON via OData v4. Via entiteiten, attributen en filters in de URL stel je je eigen query samen; Yres haalt de resultaten op en pagineert automatisch door op basis van `@odata.nextLink`.

1. Kies in de bron-wizard **Tweede Kamer** als brontype en geef de bron een naam.
2. Verwijs naar het [Open Data Portaal van de Tweede Kamer](https://opendata.tweedekamer.nl/) om te bepalen welke entiteiten en velden je wilt ophalen.

Zie de officiële documentatie: [OData API — Open Data Portaal](https://opendata.tweedekamer.nl/documentatie/odata-api).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
