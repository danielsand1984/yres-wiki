---
sidebar_position: 11
title: FAQ
description: Veelgestelde vragen over Yres — positionering, techniek, koppelingen, security en implementatie.
---

# Veelgestelde vragen

## Over Yres

**Is Yres ook geschikt als we al Power BI gebruiken?**
Ja. Yres zit *onder* Power BI, niet naast of in plaats ervan. Het zorgt dat de data die Power BI ophaalt betrouwbaar, up-to-date en correct gestructureerd is. Yres beheert de PowerBI-modellen per omgeving en kan ze meenemen in de master pipeline-refresh.

**Kunnen we Yres uitproberen voordat we beslissen?**
We bieden geen zelfbediening-trial, maar wel een persoonlijke demo waarin we jouw situatie als vertrekpunt nemen.

**Wat is het verschil met TimeXtender of AnalyticsCreator?**
Yres onderscheidt zich door native Nederlandse ERP-koppelingen (Exact, AFAS), preset NL databronnen (zoals CBS, Tweede Kamer en Simplicate), een wizard-gestuurde no-code aanpak die automatisch ADF-pipelines genereert, en geautomatiseerde health checks. Elke tool heeft eigen sterktes — neem contact op voor een eerlijke vergelijking.

## Technisch

**Hoe ontwerp ik mijn data-pipelines in Yres?**
Je *ontwerpt* geen copy-pipelines met de hand. Je configureert je bronnen, tabellen en laadtypes in wizards (de "Create source"- en used-table-wizards), en Yres **genereert** op basis van die metadata automatisch de bijbehorende ADF-pipelines en linked services. Voor de **orkestratie** is er wél een drag-and-drop **master-pipeline-designer**, waarin je met bouwstenen de volgorde en samenstelling van een master pipeline bepaalt; een designer voor individuele copy-activiteiten is er niet — die kracht zit in de metadata-gedreven generatie.

**Kan ik Yres combineren met bestaande ADF-pipelines?**
Ja. Yres genereert en beheert zijn eigen ADF-pipelines en linked services volledig. Bestaande handmatige ADF-pipelines kunnen naast Yres blijven draaien in dezelfde Azure-omgeving.

**Ondersteunen jullie CI/CD?**
Ja. Yres gebruikt **Azure DevOps** voor versiebeheer en uitrol over **DTAP** (Development → Test → Acceptance → Production). Er zijn twee deploymentsporen: het datawarehouse (`IRIS_DWH`, Azure SQL) wordt uitgerold met **SSDT/DACPAC**, en de ADF-factory via een Git-geïntegreerde publish naar de `adf_publish`-branch en daarna naar de doelfactory. Structuurwijzigingen tussen al draaiende omgevingen lopen via het runtime-changemanagement (de schermen **Changes › Release › Install**). Zie [CI/CD & DTAP](./architectuur/cicd-dtap.md) voor het volledige model.

**Bieden jullie column-level lineage?**
Yres biedt lineage op **objectniveau** (tabellen, views, procedures, functies en gematerialiseerde views) met impactanalyse. **Column-level lineage is momenteel niet beschikbaar.**

**Wat als ik wil overstappen van een ander platform?**
Yres ondersteunt het gebruik van bestaande Azure-databases. Een migratie bespreken we in een architectuursessie.

## Koppelingen

**Welke bronnen worden ondersteund?**
Databases, ERP-systemen (Exact, AFAS, SAP, Dynamics 365), API's en cloudapplicaties. Zie de [integratiecatalogus](./integraties/catalogus.md).

**Staat onze bron er niet bij?**
Via database-, OData- en REST-integraties ondersteunen we veel meer dan we tonen. Staat jouw applicatie er nog niet bij en is het een standaardapplicatie? Dan helpen we je doorgaans kosteloos met het koppelen en voegen we de applicatie toe aan een volgende release. Neem contact op.

## Security & Compliance

**Draaien onze data en pipelines op jullie infrastructuur?**
Nee. Yres draait **volledig binnen jouw eigen Azure tenant**; je data verlaat jouw omgeving niet. Yres heeft nooit directe toegang tot je bronnen, en alle processen blijven werken — ook als je Yres niet langer gebruikt (geen vendor lock-in).


**Hoe zit het met toegang?**
Azure SSO en rolgebaseerde rechten (RBAC), aansluitend op je bestaande security-omgeving. SSO kan per gebruiker worden afgedwongen.

:::note Beveiliging & compliance
Yres is **ISO 27001-gecertificeerd**. De **webapp-data** (alleen instellingen en inrichting — nooit klantdata of credentials) staat in **Azure West Europe**. Je **eigen data blijft in je eigen Azure-omgeving**: je kiest zelf de regio/het datacenter door de resource group daar aan te maken, en Yres volgt de instellingen van die group. Een **verwerkersovereenkomst is niet nodig**, omdat Yres nooit klantdata in de webapp toont of opslaat — alleen de configuratiegegevens in PostgreSQL, en nooit credentials.
:::

## Implementatie

**Hoe snel zijn we live?**
Een complete Yres-omgeving is doorgaans snel operationeel: een typische installatie duurt ongeveer 20 minuten, afhankelijk van het aantal omgevingen.


**Kunnen we later opschalen?**
Ja, op elk moment, zonder dat je omgeving offline gaat. Het toevoegen van bronnen, tabellen of omgevingen gebeurt binnen je bestaande licentiegrenzen.

