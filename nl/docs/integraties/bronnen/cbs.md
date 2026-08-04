---
title: Centraal Bureau voor de Statistiek (CBS)
sidebar_label: Centraal Bureau voor de Statistiek (CBS)
description: Centraal Bureau voor de Statistiek (CBS) koppelen aan Yres — verbindingseisen.
---

# Centraal Bureau voor de Statistiek (CBS)

**Categorie:** OData

Officiële Nederlandse statistieken (StatLine) via OData. CBS is in Yres een **preset** bovenop het
generieke OData-brontype: de OData-feed-URL en de authenticatie staan al vast, dus je vult alleen de
gewenste dataset in. Achter de schermen wordt de bron opgeslagen als type `OData`.

## Verwachte input

Bij het toevoegen van een CBS-bron doorloop je de **wizard "Bron toevoegen"**. Naast de algemene
velden die voor elke bron gelden, vraagt het CBS-formulier maar één bronspecifiek veld.

### Algemene velden (voor elke bron)

| Veld | Toelichting |
|---|---|
| **Bronnaam** (`source_name`) | Verplicht, uniek per organisatie, 2–45 tekens, begint met een letter (alfanumeriek). Wordt de naam van de linked service in ADF. Yres maakt één Key Vault-secret aan: **`adf-{bronnaam}-http-url`** (de feed-URL); credential-secrets zijn er niet, want CBS heeft geen inloggegevens. |
| **Type** | Kies **CBS** in de bronkiezer. |
| **Integration runtime** | Standaard **`AutoResolveIntegrationRuntime`** (cloud). Zie [Integration runtime](#integration-runtime). |
| **Credentials gelijk voor alle omgevingen?** | Voor CBS niet relevant — er zijn geen inloggegevens. |
| **Credentials verlopen?** | Niet van toepassing (geen credentials). |
| **Tags** | Optioneel, kommagescheiden. |

### Bronspecifiek veld

| Veld | Verplicht | Toelichting |
|---|---|---|
| **Dataset** | Ja | De tabel-/dataset-identifier van CBS (bijv. de tabelcode uit het CBS-dataportaal). |

De **basis-URL ligt vast en is alleen-lezen**: Yres zet je dataset achter
`https://opendata.cbs.nl/ODataFeed/odata/`. Je hoeft dus geen volledige URL te bouwen of in te voeren —
alleen de dataset-identifier.

De volgende instellingen worden **automatisch** ingevuld en zijn niet zichtbaar in het formulier:

- **Authenticatie:** `Anonymous` (open data, geen inloggegevens).
- **Paginatie:** `paginationType = BodyUrl` met `body_url = $['@odata.nextLink']` — Yres volgt
  automatisch de `@odata.nextLink`-vervolg-URL's om grote datasets volledig op te halen.

## Authenticatie

**Anoniem — geen credentials.** CBS StatLine is open data, dus er zijn geen gebruikersnaam,
wachtwoord, API-sleutel of token nodig. In Azure Key Vault wordt wél één secret aangemaakt —
**`adf-{bronnaam}-http-url`** met de feed-URL — maar geen credential-secrets.

## Integration runtime

**Cloud (`AutoResolveIntegrationRuntime`).** De CBS OData-feed is publiek bereikbaar via internet,
dus de standaard cloud-IR volstaat. Een self-hosted integration runtime is niet nodig.

## Vereisten

- Geen app-registratie, client secret of SAS-token nodig (het enige Key Vault-secret, de feed-URL, maakt Yres zelf aan).
- Je hebt alleen de **dataset-identifier** nodig van de gewenste CBS-tabel. Zoek deze op in het
  CBS-dataportaal ([opendata.cbs.nl](https://opendata.cbs.nl/)) of via de catalogusservice.

:::tip Feed vs. standaard-API
CBS biedt een **Feed-variant** (voor het ophalen van grote hoeveelheden data) naast de standaard
OpenData-API (beperkt tot 10.000 cellen per aanroep). Yres gebruikt de Feed-variant
(`/ODataFeed/odata/`), zodat ook grote tabellen volledig kunnen worden geladen.
:::

## Laadtypes en delta

CBS levert volledige tabellen via OData. In de praktijk gebruik je een laadtype dat de volledige set
verwerkt (bijvoorbeeld **FULL** of **IMAGE**). Let op: in Yres behoudt **FULL** de SCD2-historie
(nieuwe records erbij, gewijzigde records als nieuwe versie); alleen **OVERWRITE** verwijdert de
historie. Zie [Laadtypes](../../concepten/load-types.md) voor de volledige uitleg.

---

**Officiële documentatie:** [StatLine as open data](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data) · [Quick start guide](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data/quick-start-guide)

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
