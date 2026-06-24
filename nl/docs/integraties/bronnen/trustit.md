---
title: TrustIT
sidebar_label: TrustIT
description: TrustIT koppelen aan Yres — verbindingseisen.
---

# TrustIT

**Categorie:** REST · Dedicated ADF-connector

TrustIT is een administratie-/boekhoudplatform. Yres koppelt eraan via de **REST-API** van TrustIT en haalt de gegevens per administratie en per dag op. Voor TrustIT bestaat een eigen ADF-connector — de linked service `TrustIT` (`RestService`), de dataset `TrustIT_DATASET` (`RestResource`) en de pijplijn **`Dynamic Pipeline YRES - TrustIT`** (in de ADF-map `PW - Yres/Sources/Trustit`).

:::info Te bevestigen
TrustIT heeft (versie 1.55) **geen keuze-item in de wizard "Bron toevoegen"** (`CreateSource.tsx`) — anders dan de meeste bronnen is het op dit moment dus **geen self-service selecteerbare bron**, maar een toegewijde/voorbeeld-connector die in samenwerking met Yres wordt geconfigureerd. De velden hieronder zijn afgeleid uit de ADF-linked-service, -dataset en -pijplijn; bevestig met Yres of TrustIT voor jouw omgeving als selecteerbare bron beschikbaar is en welk invoerformulier dan geldt.
:::

## Verwachte input

Yres bouwt de TrustIT-verbinding op de REST-API. De volgende waarden zijn vereist; bij een self-service-formulier zouden ze als velden worden gevraagd, anders worden ze door Yres ingericht. Daarnaast gelden de gedeelde bronvelden uit stap 1 (**bronnaam**, **type**, **integration runtime**, **credentials gelijk voor alle omgevingen?**, **vervaldatum credentials**, **tags**).

| Waarde | Toelichting |
|---|---|
| **Source name** | Naam van de bron (uniek per organisatie, 2–45 tekens, begint met een letter). Wordt de naam van de ADF linked service en de prefix van de Key Vault-secrets (`adf-{naam}-…`). |
| **URL** | De basis-URL (`url`) van de TrustIT REST-API. Opgeslagen als `adf-{naam}-http-url` (in de meegeleverde template `adf-TrustIT-http-url`). |
| **Gebruikersnaam** | De gebruikersnaam voor de Basic-authenticatie. Opgeslagen als `adf-{naam}-basic-http-username` (template `adf-TrustIT-basic-http-username`). |
| **Wachtwoord** | Het wachtwoord voor de Basic-authenticatie. Opgeslagen als `adf-{naam}-basic-http-password` (template `adf-TrustIT-basic-http-password`). |
| **API-key** | De TrustIT API-sleutel die als HTTP-header `trustit-api-key` wordt meegestuurd. Opgeslagen als `adf-{naam}-authHeader-trustit-api-key` (template `adf-TrustIT-authHeader-trustit-api-key`). |

**Authenticatie:** **Basic** (gebruikersnaam + wachtwoord), aangevuld met een **API-sleutel als HTTP-header** `trustit-api-key`. In de linked service staat `type: RestService`, `authenticationType: Basic`, met `enableServerCertificateValidation: true`. Alle vier de waarden (URL, gebruikersnaam, wachtwoord en de API-key-header) verwijzen naar secrets in de Azure Key Vault; Yres slaat ze nooit in de frontend op.

**Integration runtime:** standaard de cloud-IR **`AutoResolveIntegrationRuntime`** — de TrustIT REST-API is publiek bereikbaar. Een self-hosted IR is alleen nodig wanneer je het uitgaande verkeer via je eigen netwerk wilt routeren.

## Vereisten

- **API-credentials bij TrustIT.** Vraag bij TrustIT (of je TrustIT-beheerder) de **API-URL**, een **gebruikersnaam/wachtwoord** voor Basic-authenticatie en een **API-sleutel** (`trustit-api-key`) aan. Deze waarden heb je nodig voordat je de bron in Yres toevoegt.
- **Key Vault-secrets.** Yres schrijft de vier waarden naar de Azure Key Vault van je eigen omgeving en haalt ze vandaaruit op in de linked service. De secrets volgen de naamgeving `adf-{bronnaam}-…`:
  - `adf-{naam}-http-url`
  - `adf-{naam}-basic-http-username`
  - `adf-{naam}-basic-http-password`
  - `adf-{naam}-authHeader-trustit-api-key`

:::info Te bevestigen
De gebruikersnaam/wachtwoord en API-sleutel erven de rechten van het TrustIT-account/de integratie waaronder ze zijn aangemaakt. Zorg dat dat account leesrechten heeft op de administraties en gegevens die je wilt ontsluiten. Vraag bij TrustIT na of de API-sleutel en/of het wachtwoord een verloopdatum kennen; vul die desgewenst in bij **vervaldatum credentials**.
:::

## Gegevens ophalen

De TrustIT-connector haalt gegevens **per administratie en per dag** op. De pijplijn **`Dynamic Pipeline YRES - TrustIT`** stuurt per dag een **`POST`**-aanroep naar het gekozen endpoint met een JSON-body in de vorm:

```json
{
    "administrationCodes": ["DSG_1"],
    "dateFrom": "<datum>T00:00:00.000Z",
    "dateTo": "<datum>T23:59:59.999Z"
}
```

waarbij `<datum>` per dag wordt ingevuld. Het te bevragen endpoint volgt uit de `Endpoint`-parameter van de dataset (`TrustIT_DATASET`, `RestResource`), die als relatieve URL achter de basis-URL wordt geplakt (voorbeeldwaarde `countries`).

:::note
De `administrationCodes` in de voorbeeld-body (`["DSG_1"]`) is **seed-/voorbeelddata** in de gepubliceerde pijplijn, geen klantwaarde — net als de overige voorbeeldwaarden in de connector. De feitelijke administratiecode(s) worden per omgeving ingericht.
:::

**Load-/delta-gedrag:** TrustIT laadt **dagsgewijs incrementeel**. De activiteit *GetMissing Days* bepaalt op basis van `ODS.CALENDAR` en de eerder geslaagde laadmomenten (`Loads30Days`) welke dagen nog ontbreken, en de pijplijn doorloopt die dagen één voor één (sequentieel, met een wachttijd tussen pagina's). Elke dag wordt via een eigen `dateFrom`/`dateTo`-venster opgehaald. Houd hier rekening mee bij het instellen van het laadtype en het inplannen van triggers; de praktische historische diepte wordt begrensd door de kalender (`ODS.CALENDAR`) en de bewaarde laadgeschiedenis.

:::info Te bevestigen
De officiële, publiek raadpleegbare API-documentatie van TrustIT is niet binnen het Yres-codebestand vastgelegd. Vraag de actuele API-referentie (endpoints, datavelden, authenticatie) op bij TrustIT.
:::

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
