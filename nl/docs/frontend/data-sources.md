---
sidebar_position: 4
title: Data Sources
description: Bronnen toevoegen en beheren — het hart van Yres.
---

# Data Sources

> Data sources zijn het hart van Yres; zonder bronnen functioneert het niet.

Het paneel laat je bronnen toevoegen/beheren, typemapping genereren en metadata verversen. Voor de exacte verbindingseisen per brontype: zie [databron-vereisten](../referentie/databron-vereisten.md).

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

![Data sources: per bron de naam, het type, de integration runtime, credential-verloop en de typemapping-knop.](/img/screens/source-catalog.png)

## Sources — overzicht

Per bron beheer je naam, type en credential-vervaldatum. Twee opties die aandacht verdienen:

- **Integration runtimes** — kies de IR per bron; standaard is `AutoResolveIntegrationRuntime`. Custom IR's (in ADF of via [Shared integration runtimes](./admin.md)) worden automatisch gedetecteerd.
- **Tags** — komma-gescheiden (bv. `sales, salesforce`); gebruik ze om bronnen in de sidebar te groeperen op type én tag.

### Global typemapping
Via het blauwe tandwiel: unificeer datatypes/eigenschappen die per bron verschillen, voor een soepelere ervaring bij views die brontypes combineren.

## Wat gebeurt er bij het toevoegen van een bron

- Een aantal SQL-tabellen wordt gevuld met info over de bron (naam, type, basis-connectie-info).
- Elke bron **behalve file-sources en REST services** wordt opgeslagen in een **dictionary** met bron-metadata (tabellen, velden, keys en relaties).

## Tabellen toevoegen

Na het aanmaken van de bron en het verversen van metadata voeg je tabellen / data-integraties toe. De wizard biedt typemapping en load types per tabel. Voor file-sources (zoals Azure Blob) upload je bestanden direct.

:::tip
Ververs de bron-metadata handmatig na het aanmaken voor optimale compatibiliteit.
:::

## Acties (afhankelijk van het brontype)

| Actie | Beschikbaar voor | Doel |
|---|---|---|
| **Compare metadata** | alle bronnen behalve file & RestService | Toont metadata-verschillen; vergelijk in HIS- en STAGE-tabellen. |
| **Column info** | alle bronnen behalve file & RestService | Toont kolommen met bron- en doel-datatypes. |
| **Activate / deactivate** | alle bronnen | Bepaalt of de tabel meegaat in toekomstige loads. |
