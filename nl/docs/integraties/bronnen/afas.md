---
title: AFAS
sidebar_label: AFAS
description: AFAS koppelen aan Yres — verbindingseisen.
---

# AFAS

**Categorie:** Directe koppeling  ·  🏅 Official partner

Nederlands ERP-systeem. Official partner. Yres leest AFAS uit via de
**AFAS App connector** (de REST-services van AFAS Profit/InSite). In Azure Data
Factory wordt dit een `RestService` linked service.

## Verwachte input

Je legt de koppeling aan via de wizard **Bron toevoegen**. Naast de velden die voor
elke bron gelden (bronnaam, type, integration runtime, of de credentials voor alle
omgevingen gelijk zijn, eventuele vervaldatum van de credentials, tags) vraagt de
AFAS-bron de volgende velden:

| Veld | Toelichting |
|---|---|
| **URL** | De REST-basis-URL van je AFAS-omgeving. Moet eindigen op `…afas.online/profitrestservices`. Voorbeeld/placeholder: `https://12345.rest.afas.online/profitrestservices`, waarbij `12345` je AFAS-omgevingsnummer is. |
| **API token** | Het volledige tokenblob dat AFAS bij de App connector genereert: `<token><version>1</version><data>…</data></token>`. Plak de hele waarde, niet alleen het `data`-deel. |

**Authenticatie:** het API token wordt als **Authorization-header** meegestuurd
(RestService met auth headers — `hasAuthHeaders() = true`). Er is geen
gebruikersnaam/wachtwoord.

**Integration runtime:** **cloud** — `AutoResolveIntegrationRuntime`. AFAS Online is
publiek bereikbaar via HTTPS, dus een self-hosted integration runtime is niet nodig.

**Waar de credentials terechtkomen:** de frontend bewaart geen secrets. Het API token
gaat naar de **Azure Key Vault** van je eigen omgeving en wordt vanuit de linked
service opgehaald als secret **`adf-AFAS-connectionstring`** (het secret valt onder de
naamgroep `adf-{bronnaam}-…`). De linked service (`AFAS.json`) staat zelf op
`Anonymous` en zet het token via `authHeaders.Authorization` als verwijzing naar dat
Key Vault-secret.

## Voorbereiding (in AFAS Profit)

1. Maak een **App connector** aan via **Algemeen → Beheer → App connector**.
2. Voeg de **GetConnectors** toe die Yres mag uitlezen (elke GetConnector is een
   bron-"tabel" die je later als gebruikte tabel kunt selecteren).
3. Genereer het token. AFAS levert dit als XML-bestand; de inhoud is het
   `<token>…</token>`-blob dat je in het veld **API token** plakt.
4. Noteer je omgevingsnummer voor de **URL** (`https://<omgevingsnummer>.rest.afas.online/profitrestservices`).

:::note Authorization-header
De exacte vorm van de Authorization-header (bijvoorbeeld een prefix zoals
`AfasToken <token>`) en eventuele licentie-/abonnementsvereisten voor de App connector
worden door AFAS bepaald en niet door Yres. Yres stuurt de waarde die je opgeeft als
header mee; controleer de actuele AFAS-documentatie voor de precieze headeropmaak.
:::

## Load types & delta

AFAS-tabellen worden geladen via GetConnectors. De gebruikelijke load types
(FULL, DELTA, IMAGE, OVERWRITE, RELOAD, ADDITIONAL, DELTAIMAGE) zijn van toepassing;
delta laden vereist een geschikte deltakolom in de betreffende GetConnector. AFAS ondersteunt
net als de SQL-bronnen twee deltakolommen.

Officiële documentatie: [AFAS Profit — GetConnector / App connector](https://docs.afas.help/profit/en/get-connector).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
