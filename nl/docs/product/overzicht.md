---
sidebar_position: 1
title: Productoverzicht
description: De propositie van Yres — van bron tot dashboard, volledig geautomatiseerd, in je eigen Azure-omgeving.
---

# Productoverzicht

## De propositie

**Het Azure data platform voor betrouwbare dashboards en reporting.** Yres bouwt en beheert je complete datawarehouse in Microsoft Azure, zodat data teams sneller kunnen leveren met minder onderhoud en complexiteit — zonder dat je een regel code hoeft te schrijven.

> *"Yres is a cloud-based platform that connects all your data, keeps it updated automatically, and makes it easy to use—without needing technical skills. It runs entirely in your own Azure environment, saves costs through smart scaling, and ensures full control of your data without vendor lock-in."*

## Van bron tot dashboard — volledig geautomatiseerd

De volledige keten loopt binnen één Azure-omgeving:

```
Bronnen            Configuratie    Orkestratie     Opslag                 Rapportage
(Exact, AFAS,  →   (wizards:    →  (Azure Data  →  (Azure SQL,        →   (Power BI)
 SQL, REST)         bronnen,        Factory)         Data Lake)
                    tabellen,
                    laadtypes)
```

1. **Bronnen** — Exact, AFAS, SQL, REST en meer
2. **Configuratie** — je legt bronnen, tabellen en laadtypes vast in wizards; je schrijft geen pipelines
3. **Orkestratie** — Yres genereert op basis daarvan automatisch de Azure Data Factory (ADF) pipelines
4. **Opslag** — Azure SQL en (optioneel) Data Lake
5. **Rapportage** — betrouwbare, actuele data voor Power BI

:::tip Geen visuele pipeline-designer, maar metadata-gestuurde generatie
Je tekent geen pipelines op een canvas. Je vult in *wat* er geladen moet worden (bron, tabellen, laadtype, sleutelkolommen) en Yres vertaalt dat naar de bijbehorende ADF-pipelines en linked services. Een bron toevoegen is dus metadata invoeren — geen maatwerk bouwen.
:::

## Het probleem dat Yres oplost

Dataplatformen groeien vaak uit tot complexe maatwerkstructuren die lastig te beheren zijn:

- Rapportages lopen achter of kloppen niet
- Scripts breken en niemand weet wat er gebeurt bij wijzigingen
- Elke nieuwe databron kost tijd en maatwerk
- Kennis zit bij één engineer of consultant

Met Yres centraliseer je databronnen, datastromen en beheer binnen één Azure-omgeving. Zo werk je sneller met betrouwbare data, zonder onnodige complexiteit.

## Eén platform dat je begrijpt, beheert en in eigen hand houdt

### Jouw data, jouw omgeving

Yres draait volledig binnen je **eigen Azure tenant**. Je houdt eigenaarschap over je data, infrastructuur en kosten. Yres heeft nooit directe toegang tot je bronnen, en alle processen blijven werken — ook als je Yres niet meer gebruikt. Geen vendor lock-in.

:::info Te bevestigen
De optie om de omgeving door Yres te laten hosten is een commerciële keuze die niet in de productdocumentatie staat; de documentatie benadrukt juist dat alles 100% in je eigen Azure tenant draait. Laat de eigenaar bevestigen of, en op welke voorwaarden, een door-Yres-gehoste variant wordt aangeboden.
:::

### Minder afhankelijk van losse scripts en specifieke kennis

Door databronnen, datastromen en beheer te standaardiseren blijft het platform begrijpelijk, overdraagbaar en beheersbaar voor het hele team — niet alleen voor één engineer.

### Gebouwd op bewezen Azure best practices

Yres gebruikt gestandaardiseerde Azure-structuren en bewezen architecturen, zodat data-omgevingen stabiel, schaalbaar en beheersbaar blijven. Slim schalen van de database bespaart kosten: je betaalt alleen extra capaciteit tijdens zware verwerking.

### Ontwikkeld om mee te groeien

Met Yres voeg je databronnen toe zonder extra beheerlast of technische schuld op te bouwen. Zo blijft het platform overzichtelijk terwijl je organisatie groeit.

## Snelle onboarding

Een complete Yres-omgeving is doorgaans **binnen een uur** operationeel — geen langdurig implementatietraject, geen externe consultants voor de inrichting. Een typische installatie neemt ongeveer **20 minuten** in beslag, afhankelijk van het aantal omgevingen.

:::info Te bevestigen
De richtlijn "een nieuwe bron sluit je aan in zo'n vijf minuten" staat niet in de officiële productdocumentatie. Laat de eigenaar dit cijfer bevestigen of vervangen voordat het extern wordt gepubliceerd.
:::
