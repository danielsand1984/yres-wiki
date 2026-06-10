---
title: Wat is Yres?
sidebar_label: ''
sidebar_position: 1
slug: /
description: Yres is het Azure data platform voor betrouwbare dashboards en reporting.
---

# Wat is Yres?

**Yres ontwerpt, bouwt en beheert je complete datawarehouse in Microsoft Azure**, zodat data­teams sneller kunnen leveren met minder onderhoud en complexiteit.

Yres zit _onder_ Power BI — niet ernaast of in plaats ervan. Het zorgt dat de data die je dashboards ophalen betrouwbaar, up-to-date en correct gestructureerd is.

## In één zin

> Het Azure data platform voor een betrouwbare en schaalbare data omgeving — gebouwd voor organisaties die werken met Azure en Power BI.

## Het kernidee

Dataplatformen groeien vaak uit tot complexe maatwerkstructuren die lastig te beheren zijn en afhankelijk worden van één engineer. Met Yres centraliseer en standaardiseer je databronnen, pipelines en beheer binnen **één Azure omgeving**. Zo werk je sneller met betrouwbare data, zonder onnodige complexiteit.

|  | Zonder Yres | Met Yres |
| --- | --- | --- |
| **Koppelingen** | Per applicatie anders ingericht, maatwerk | Gestandaardiseerd, off-the-shelf |
| **Beheer** | Kennis bij één engineer | Transparant en overdraagbaar |
| **Pipelines** | Fragiele scripts | Vaste structuren, vertaald naar ADF |
| **Hosting** | — | Eigen Azure tenant (standaard) of gehost door Yres |
| **Onboarding** | Lang implementatietraject | Complete omgeving binnen een uur |

## Voor wie

Organisaties die werken met **Microsoft Azure** en **Power BI** en grip willen op het beheer van hun databronnen, pipelines en datawarehouse — zonder handmatig werk of verborgen complexiteit.

## Naamswijziging: Iris → Yres

Het product heette vroeger **Iris** en heet nu **Yres**. Je komt in oudere Azure-resourcenamen nog "Iris" tegen — dat is hetzelfde product.

## Domeinen & endpoints

| Doel | URL |
| --- | --- |
| Marketingsite | https://oogopdata.nl |
| Webapp | https://www.yres.app |
| Feedback-mailbox | feedback@yres.app |

## Kernconcepten

Technisch bestaat Yres uit een set **Azure-resources en templates**. Bij installatie worden die aangemaakt en geconfigureerd volgens de Yres-templates; Yres krijgt toegang tot de Azure-tenant via een **App Registration** met de juiste rollen.

- **Organisatie** — de afgeschermde ruimte waarin een klant Yres gebruikt; standaard met een **dev**- en **prod**-omgeving.
- **Environment (omgeving)** — minimaal `dev` en `prod`; afhankelijk van licentie `test`/`acceptance`/`quality` ertussen.
- **Projecten & changes** — categoriseren werk en transporteren wijzigingen dev → prod.
- **Data sources** — het hart van Yres; bronnen waaruit geladen wordt.
- **Load Management** — pipelines (ADF), triggers, monitoring en persisted views.

Kernfeatures: **SSO** (Azure), **Log Management**, **Life Cycle Management** (dev → prod via changes), **flexibiliteit & schaalbaarheid** via Azure-resources.

## 

|  |
