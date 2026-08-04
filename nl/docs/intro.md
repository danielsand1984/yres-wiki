---
slug: /
sidebar_position: 1
title: Wat is Yres?
description: Yres is het Azure data platform dat je datawarehouse automatiseert voor betrouwbare dashboards en reporting.
---

# Wat is Yres?

**Yres ontwerpt, bouwt en beheert je complete datawarehouse in Microsoft Azure**, zodat data­teams sneller kunnen leveren met minder onderhoud en complexiteit.

Yres draait volledig in **jouw eigen Azure-tenant** en zit *onder* Power BI — niet ernaast of in plaats ervan. Het zorgt dat de data die je dashboards ophalen betrouwbaar, up-to-date en correct gestructureerd is.

> Wil je meteen begrijpen hoe data door Yres stroomt? Lees [Gegevensstroom](./concepten/gegevensstroom.md) (de rode draad: van bron naar gehistoriseerde data) en het [Architectuuroverzicht](./architectuur/overzicht.md) (welke Azure-resources Yres gebruikt).

## In één zin

> Yres is een cloud-platform dat al je data verbindt, automatisch up-to-date houdt en bruikbaar maakt — zonder technische kennis. Het draait volledig in je eigen Azure-omgeving, bespaart kosten door slim te schalen en geeft je volledige controle over je data zonder vendor lock-in.

## Het kernidee

Dataplatformen groeien vaak uit tot complexe maatwerkstructuren die lastig te beheren zijn en afhankelijk worden van één engineer. Met Yres centraliseer en standaardiseer je databronnen, pipelines en beheer binnen **één Azure-omgeving**. Zo werk je sneller met betrouwbare data, zonder onnodige complexiteit.

Het sleutelprincipe: je voegt geen pipeline toe, je voegt **metadata** toe. Je configureert bronnen, tabellen en laadtypes in wizards, en Yres **genereert** daaruit automatisch de Azure Data Factory (ADF) pipelines. Niemand schrijft handmatig een pipeline.

| | Zonder Yres | Met Yres |
|---|---|---|
| **Koppelingen** | Per applicatie anders ingericht, maatwerk | Gestandaardiseerd, off-the-shelf |
| **Beheer** | Kennis bij één engineer | Transparant en overdraagbaar |
| **Pipelines** | Fragiele scripts | Wizards configureren bronnen/tabellen/laadtypes; Yres genereert de ADF-pipelines |
| **Rapportage** | Data uit verschillende plekken, vaak verouderd | Eén betrouwbare bron, gehistoriseerd (SCD2) |
| **Onboarding** | Lang implementatietraject | Typische installatie in ~20 minuten |

## Voor wie

Organisaties die werken met **Microsoft Azure** en **Power BI** en grip willen op het beheer van hun databronnen, pipelines en datawarehouse — zonder handmatig werk of verborgen complexiteit. Yres is no-code: je hebt geen data-engineering-kennis nodig om bronnen te koppelen en te laden.

## Naamswijziging: Iris → Yres

Het product heette vroeger **Iris** en heet nu **Yres**. Je komt in oudere bronnen, Azure-resourcenamen, Confluence-spaces (`spaceKey=IRIS`) en interne identifiers nog "Iris" tegen — dat is hetzelfde product. In de code zie je dat terug in namen als `IRIS_DWH`, `Dynamic Workflow IRIS`, `IRIS_VERSION` en Key Vault-namen `kv-iris-…`. Die identifiers blijven ongewijzigd; in de wiki spreken we van **Yres**.

## Contact & feedback

- **Feedback:** mail **feedback@yres.app** — de in-app feedbackformulieren (Bug report / Feature request / Feedback) komen op hetzelfde adres uit, met antwoord op je eigen account-adres.
- **Algemene info & contact:** **info@yres.app**.
- **Demo aanvragen:** via de [marketingsite](https://oogopdata.nl).

De **webapp draait op een eigen subdomein per organisatie**; er is dus geen vast webapp-adres dat hier hoort.

## Kernconcepten

Technisch bestaat Yres uit een set **Azure-resources en templates**. Bij installatie worden die aangemaakt en geconfigureerd volgens de Yres-templates; Yres krijgt toegang tot de Azure-tenant via een **App Registration** met de juiste rollen. Alles draait binnen jouw eigen Azure-tenant — Yres heeft nooit directe toegang tot je bronnen, en alle processen blijven werken ook als je Yres niet meer gebruikt.

- **Organisatie** — de afgeschermde ruimte waarin een klant Yres gebruikt. Een organisatie krijgt een unieke, vrij te kiezen naam (zonder niet-alfanumerieke tekens); daarnaast genereert Yres een secundaire naam voor resource- en DevOps-namen.
- **Environment (omgeving)** — een DTAP-omgeving binnen de organisatie. De **eerste omgeving is altijd `dev`** (vast in resourcenamen, bijv. `sqlsrv-xxx-dwh-dev`). Afhankelijk van je licentie voeg je extra omgevingen toe zoals `test`/`acceptance`/`quality`/`prod`.
- **Projecten & changes** — categoriseren werk en transporteren wijzigingen door de DTAP-keten (bijv. dev → prod). Alleen beschikbaar bij organisaties met meerdere omgevingen.
- **Data sources** — het hart van Yres; de bronnen waaruit geladen wordt.
- **Load Management** — pipelines (ADF), triggers, monitoring en persisted views.

:::note Aantal omgevingen hangt af van je licentie
De **Essentials**-licentie geeft **1 omgeving** (dus alleen `dev`). **Advanced** geeft er 2, **Ultimate** maximaal **6** (afgedwongen door de webapp). De aanbeveling in de cursus is om met **2 tot 4 omgevingen** te werken. "Minimaal dev én prod" geldt dus niet voor elke licentie — Essentials werkt met één omgeving. Zie [Prijzen](./prijzen.md).
:::

Kernfeatures: **SSO** (Azure), **Log Management**, **Life Cycle Management** (wijzigingen via projecten & changes door de DTAP-keten), en **flexibiliteit & schaalbaarheid** door gebruik te maken van Azure-resources (waaronder automatisch schalen van de database).

## Hoe deze wiki is opgebouwd

| Sectie | Inhoud |
|---|---|
| **Product** | Propositie, use-cases, features, hoe het werkt |
| **Concepten** | Yres uitgelegd, [gegevensstroom](./concepten/gegevensstroom.md), [load types](./concepten/load-types.md), [historie & SCD2](./concepten/historie-scd2.md), begrippenlijst |
| **Architectuur** | [Azure-resources, toegang en setups](./architectuur/overzicht.md) |
| **Gebruik (frontend)** | Wat elk paneel in de webapp doet |
| **Setup & installatie** | Yres installeren in een Azure-tenant |
| **Integraties** | Bronnen + verbindingseisen per bron |
| **Referentie** | SQL-interaction, release notes |
| **Prijzen · FAQ · Troubleshooting** | Overig |
