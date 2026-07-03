---
sidebar_position: 3
title: Features
description: Wat het Yres-platform doet — zes kernfuncties, van bronnen koppelen tot monitoring en veilig uitrollen.
---

# Features

> Een dataplatform dat je kunt begrijpen en beheren. Yres zet losse databronnen om in een gestandaardiseerd dataplatform in Azure. Alle essentiële functionaliteit voor data-inname, monitoring en beheer is standaard aanwezig — zonder dat je een regel code hoeft te schrijven.

Yres draait volledig in je **eigen Azure-omgeving**. Het platform leest metadata om te bepalen wat er geladen moet worden, kopieert elke bron naar een staging-laag en bouwt daar automatisch een historisch datawarehouse (SCD2) bovenop. Hieronder staan de zes kernfuncties, elk gekoppeld aan een concrete capability van het platform.

## 1. Sluit al je databronnen aan zonder maatwerk

Koppel systemen zoals SAP, Salesforce, AFAS, Exact Online, databases (SQL Server, Azure SQL, MySQL, PostgreSQL, Oracle, DB2, Snowflake), OData- en REST-bronnen en bestandsbronnen rechtstreeks aan je dataplatform. Een nieuwe bron voeg je toe via een **wizard**: je vult bronnaam, type, integration runtime en credentials in, en Yres genereert zelf de bijbehorende Linked Service en pipelines in Azure Data Factory.

Er is **geen handgeschreven script of maatwerk-pipeline** nodig. Onder de motorkap is een bron toevoegen niets meer dan het wegschrijven van metadata-rijen; ADF voert die metadata generiek uit. Credentials komen nooit in de frontend terecht — ze worden opgeslagen in jouw **Azure Key Vault**.

Zie de [integratiecatalogus](../integraties/catalogus.md) voor alle ondersteunde bronnen en de [databron koppelen](../setup/databron-koppelen.md)-handleiding.

## 2. Automatiseer datastromen en voorkom dubbele records

Van ruwe brondata tot een gestructureerd datawarehouse: alles verloopt automatisch en gecontroleerd. Pipelines en triggers zorgen voor consistente datastromen zonder handmatig werk.

Het hart van de automatisering is de **laadengine**: per tabel kies je een **laadtype** dat bepaalt hoe nieuwe data wordt samengevoegd met de bestaande historie. Yres detecteert wijzigingen met hashes (`KeyHash` op de sleutelkolommen, `RowHash` op de te volgen kolommen), zodat er **geen dubbele records** ontstaan en alleen echte wijzigingen een nieuwe versie krijgen.

| Laadtype | Wat het doet | Historie |
|---|---|---|
| **FULL** | Upsert: nieuwe rijen toevoegen, gewijzigde rijen versioneren, de rest met rust laten | Behouden (SCD2) |
| **DELTA** | Alleen gewijzigde records sinds het watermerk | Behouden |
| **DELTAIMAGE** | DELTA + sluit ontbrekende sleutels binnen het deltavenster | Behouden |
| **IMAGE** | Volledige snapshot: upsert + sluit álle ontbrekende sleutels (soft-delete) | Behouden |
| **OVERWRITE** | TRUNCATE van de historietabel, daarna alle staging-rijen opnieuw inladen | **Geen** (truncate) |
| **RELOAD** | Sluit alle huidige rijen, daarna alle staging-rijen opnieuw inladen | Behouden (oude generatie gesloten) |
| **ADDITIONAL** | Puur toevoegen — geen sleutelmatch, duplicaten toegestaan | Behouden |

:::tip Let op de twee veelgemaakte verwarringen
**FULL behoudt SCD2-historie** — het is een geschiedenis-bewarende upsert, geen volledige vervanging. Alleen **OVERWRITE** verwijdert historie (truncate). **RELOAD** behoudt de historie wel: het sluit de oude generatie (zet `isCurrent=0`) en voegt daarna opnieuw in. OVERWRITE en RELOAD zijn dus geen synoniemen.
:::

Lees meer in [Laadtypes](../concepten/load-types.md) en [SCD2 & historie](../concepten/historie-scd2.md).

## 3. Plan en monitor elke load

Loads draaien op het moment dat jij wilt. Je start ze handmatig of laat ze automatisch lopen via **triggers** (een schema in de tijdzone van de ingelogde gebruiker). In het Monitoring-scherm zie je per doeltabel de laatste status, de pipeline-runs en de afzonderlijke stappen — succesvol, mislukt of nog bezig.

![Monitoring-scherm van Yres met links de targets-boom (bron / schema / tabel) en rechts de pipeline-runs met statussen, laadtype en aantallen, plus een uitklappend stappen-overzicht](/img/screens/loadmanagement-monitoring.png)

*Het Monitoring-scherm: per doeltabel de laadstatus, de runs en hun stappen — met de mogelijkheid om een tabel te resetten of een run terug te draaien.*

1. **Targets-boom** — bron / schema / tabel, met een statusrollup per bron (succeeded / running / failed).
2. **Geselecteerde target** plus een samenvatting van grootte en aantal records.
3. **Reset table** — zet de tabel terug naar een schone staat (met bevestiging).
4. **Runs-grid** — Status, DateTime, Load type, Runtime en de aantallen Copied / New / Delta per run.
5. **Per-run-acties** — het info-icoon opent het stappen-overzicht, het klok-icoon draait de run terug (rollback).
6. **Stappen** — Step / DateTime / Status / Log / Rows; bij een mislukte run verschijnt de foutmelding met een directe link naar ADF.

Achter de schermen logt elke load via `[Monitoring].[spWriteLoadStatus]` naar `LS_Pipeline` (één rij per run) en `LS_Trans` (één rij per stap). De overzichten lees je terug via de views `vwLoads` (tijdlijn per pipeline) en `vwMonitor` (breder, inclusief materialized views en Power BI-refresh).

Zie [Load Management](../frontend/load-management.md) en [Monitoring & logging](../referentie/monitoring-logging.md).

## 4. Zie direct de impact van wijzigingen

Volledig inzicht in je dataplatform: welke datastromen er zijn, hoe ze met elkaar verbonden zijn en wat er gebeurt als je iets aanpast. Logging, monitoring en impactanalyse helpen je problemen snel te vinden en op te lossen.

:::note Lineage op objectniveau
Yres biedt visuele lineage op **objectniveau** (tables, views, procedures, functions, materialized views) met impactanalyse. **Column-level lineage is momenteel niet beschikbaar.**
:::

## 5. Voer wijzigingen veilig door — met rollback en herstel

Yres ondersteunt de volledige lifecycle van je dataplatform, van development tot productie (DTAP). Wijzigingen test je eerst op een dev-omgeving, je rolt ze gecontroleerd uit naar test en productie, en je kunt terugkeren naar een eerdere staat wanneer dat nodig is.

- **Changes & DTAP** — structuurwijzigingen worden gebundeld in een *change*, vrijgegeven (released) en daarna geïmporteerd of geïnstalleerd in de volgende omgeving. Bij *install* publiceert Yres ook de bijbehorende ADF-pipelines naar de doelfactory.
- **Rollback per load** — een mislukte of ongewenste load draai je per tabel terug vanuit het Monitoring-scherm; de SCD2-historie maakt dit mogelijk.
- **Reset** — een doeltabel terugzetten naar een schone staat.

:::note Changes-systeem vereist meerdere omgevingen
Projects & Changes zijn alleen beschikbaar voor organisaties met meer dan één omgeving. Een **Essentials**-licentie heeft één omgeving en gebruikt deze functionaliteit niet.
:::

Voor managed wijzigingen blijft data behouden. Let op: een volledige **Rebuild** naar fabrieksinstellingen overschrijft niet-Yres-configuratie — gebruik die functie bewust.

Zie [Changes & releases](../frontend/projecten-changes.md) en [Rollback & reset](../concepten/rollback-reset.md).

## 6. Laat Azure voor je werken zonder het zelf te beheren

Azure-resources worden automatisch ingericht, geschaald en onderhouden binnen je eigen omgeving — je bent geen tijd kwijt aan complexe infrastructuur of handmatige configuratie. Bij de installatie maakt Yres zelf de Data Factory, Azure SQL-database, Key Vault en (optioneel) Storage aan.

**Automatisch schalen** bespaart kosten: via de instelling `AutomaticDatabaseScaling` (met `DefaultServiceTier` en `HighServiceTier`) schaalt de database op tijdens zware verwerking en daarna weer terug. Zo betaal je alleen voor extra capaciteit wanneer je die echt nodig hebt.

:::note Feature-toewijzing per tier
Yres dwingt feature-gating nu **niet actief af**; de tier-indeling is de bedoelde opzet en is via de **licentie** afdwingbaar. De **web application firewall** zit in alle tiers; **site-to-site VPN** is mogelijk tegen een **meerprijs**, afhankelijk van de exacte wensen.
:::

## 7. Houd controle over toegang en gebruik

Beheer centraal wie toegang heeft tot welke data. Met **Azure SSO** en rolgebaseerde rechten (**RBAC**) sluit alles aan op je bestaande security- en IT-omgeving. SSO kan per gebruiker worden afgedwongen, en je werkt met standaardrollen plus eigen CRUD-rollen.

Omdat alles in jouw eigen Azure-tenant draait, verlaat je data je omgeving niet. Yres heeft nooit directe toegang tot je bronnen, en alle processen blijven werken — ook als je Yres niet meer zou gebruiken. Geen vendor lock-in.

---

## Wat je krijgt met elk pakket

- **Jouw data, jouw omgeving** — het platform draait standaard volledig in je eigen Azure-tenant.
- **Snelle onboarding** — een typische installatie duurt ongeveer 20 minuten, afhankelijk van het aantal omgevingen.
- **Professionele werkwijze** — gescheiden dev-, test- en productie-omgevingen (vanaf Advanced; Essentials heeft één omgeving).

Zie [Prijzen](../prijzen.md) voor wat per pakket is inbegrepen.
