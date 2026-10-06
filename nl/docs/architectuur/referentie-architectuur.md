---
sidebar_position: 1.5
title: Referentiearchitectuur
description: De complete opzet van Yres op Azure op één plaat. Bronnen, control plane, Azure Data Factory, Azure SQL met SCD2-historie, Power BI of Fabric en DTAP, om te bekijken of op A3 af te drukken.
---

# Referentiearchitectuur

De complete opzet van Yres op Azure op één plaat. Je ziet welke bronnen hoe binnenkomen, wat er in de Yres-tenant draait en wat in de tenant van de klant, hoe een laadrun verloopt en hoe Power BI of Fabric de data afneemt. De plaat is bedoeld voor architecten, security-teams en iedereen die een installatie voorbereidt.

[![Referentiearchitectuur van Yres op Azure](/img/referentie-architectuur-nl.webp)](pathname:///referentie-architectuur/yres-azure-architectuur-nl.html)

**[Open de plaat op ware grootte](pathname:///referentie-architectuur/yres-azure-architectuur-nl.html)** · [English version](pathname:///referentie-architectuur/yres-azure-architectuur-en.html)

## Zo lees je de plaat

Van links naar rechts volgt de plaat de data.

1. **Bronnen en connectiviteit.** Cloudbronnen lopen via de Azure Integration Runtime. Bronnen in het eigen netwerk lopen via een self-hosted integration runtime die alleen uitgaand verkeer maakt (HTTPS, poort 443). Er hoeft geen poort open naar binnen.
2. **Control plane.** De Yres-webapp draait in de tenant van Yres. Daar richt je bronnen, tabellen en changes in. De webapp bestuurt de Azure-resources van de klant via een App Registration en bewaart zelf geen klantdata.
3. **Azure Data Factory.** Eén workflow laadt alles in vijf stappen: run registreren, metadata lezen, per tabel laden (maximaal vijf tegelijk), rapportageviews verversen en afsluiten. Welke bron, welke tabel en welke laadwijze bepaalt de metadata.
4. **Azure SQL.** Data komt binnen in STAGE en gaat met SCD2-historie naar de HIS-laag. Rapportages lezen uit Exposed. Optioneel schrijft Yres de mutaties per tabel als Parquet naar een Data Lake.
5. **Power BI of Fabric.** Semantische modellen lezen uit Exposed. Na de load start ADF de refresh via de Power BI REST API.

Onderaan staan de Azure-resources per omgeving, beveiliging en identiteit, monitoring en de DTAP-straat. Elke omgeving heeft een eigen Data Factory, SQL-database en Key Vault; de self-hosted IR wordt door de drie omgevingen gedeeld.

:::note
De bronnen op de plaat zijn voorbeelden. Alle koppelingen staan onder [Integraties](../integraties/overzicht.md). Resource-namen op de plaat zijn placeholders.
:::

## Afdrukken

De plaat is ontworpen voor A3 of A2 liggend. Open hem op ware grootte en druk af vanuit de browser: de plaat schaalt zichzelf naar één pagina en gebruikt bij afdrukken altijd de lichte kleuren.

## Verder lezen

- [Architectuur](./overzicht.md): de twee planes en de stack in tekst
- [Azure-architectuur](./azure-architectuur.md): resources, permissies, toegangsniveaus en netwerk
- [CI/CD & DTAP](./cicd-dtap.md): hoe wijzigingen van DEV naar PROD gaan
- [Load types](../concepten/load-types.md): de zeven laadwijzen
- [Installatie](../setup/installatie.md)
