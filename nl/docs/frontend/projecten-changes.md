---
sidebar_position: 3
title: Projecten & Changes
description: Lifecycle management in Yres — werk bundelen in projecten en changes en die veilig van dev via test naar prod transporteren.
---

# Projecten & Changes

**Projects** en **Changes** vormen het **lifecycle management** van Yres: je bundelt al het werk aan het datawarehouse (tabellen toevoegen of bijwerken, scripted objects, view-persistence) in beheersbare eenheden en transporteert die wijzigingen vervolgens gecontroleerd van **dev** via **test** naar **prod**. Zo blijven je omgevingen gelijk lopen en breng je nooit half werk naar productie.

:::warning Alleen bij meerdere omgevingen
De hele sectie **Projects** (en daarmee Changes) is **verborgen en geblokkeerd voor organisaties met één omgeving**. De icoon-balk toont *Projects* dan niet, en de backend weigert het aanmaken van een project of change met de melding *"is not allowed for organizations with a single environment"*. Bij één omgeving is er geen dev → prod-transport nodig: wijzigingen worden direct toegepast en de wizard gebruikt intern automatisch `ChangeId 1`.
:::

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## De levenscyclus in het kort

De vijf stappen die een wijziging doorloopt:

| Stap | Wat | Omgeving | Achterliggend |
|---|---|---|---|
| 1 | **Change aanmaken** onder een project en er werk in boeken | dev | — |
| 2 | **Release** — change vergrendelen en vrijgeven om te installeren | dev | `[Change].[spRelease]` |
| 3 | **Import** — change-JSON ophalen in de doelomgeving (alleen DWH) | test/prod | `[Change].[spImport]` |
| 4 | **Install** — change installeren én de ADF-factory publiceren | test/prod | `[Change].[spInstall]` + `publish-datafactory` |
| 5 | **publish-datafactory** — nieuwe pipelines landen in de doelfactory | test/prod | Azure DevOps-pipeline |

## Projects

Een **project** groepeert changes binnen een omgeving en geeft het werk een naam, een beschrijving en een einddatum.

![Het Projects-scherm: een tabel met projecten en hun status, de knop om een project aan te maken, en de waarschuwing dat de sectie alleen bij meerdere omgevingen beschikbaar is.](/img/screens/projects.svg)

De cijfers (1)–(6) in de schermafbeelding verwijzen naar:

1. **Sub-links** van de sectie — *Projects*, *Changes*, *Scripted objects*, *Release change* en *Install change*.
2. **Create project** — opent het aanmaakformulier met de velden **Name**, **Description** en **DueDate**.
3. **Projectentabel** — kolommen **Name**, **Description**, **DueDate**, **Creator** en **Status**.
4. **Status** — de statuscode wordt naar tekst vertaald: *1 Open · 2 Closed · 3 released · 9 Deleted · 99 Discontinued*.
5. **Rij-acties** — bewerken en verwijderen.
6. **Single-environment-waarschuwing** — de sectie is verborgen en geblokkeerd bij één omgeving.

### Een project aanmaken

1. Open in de sectie **Projects** de sub-link **Projects**.
2. Klik op **Create project**.
3. Vul **Name**, **Description** en **DueDate** in en bevestig.

:::note Regels voor projecten
- Een project kan **niet verwijderd** worden zolang het **open changes** bevat.
- De **DueDate** van elke change onder het project moet **op of vóór** de DueDate van het project liggen.
:::

## Changes

Een **change** categoriseert bewerkingen aan het datawarehouse en is de eenheid die je later releaset en installeert. Changes horen altijd bij een project. Alle data-plane-edits in dev worden onder een change geboekt (zie het toevoegen van tabellen in [Data sources](./data-sources.md)), zodat ze samen door de omgevingen reizen.

![Het Changes-scherm: de project- en change-selectie bovenaan, de changes-tabel met statussen, de knop om een change aan te maken en de bevestigingsdialoog voor het releasen.](/img/screens/changes.svg)

De cijfers (1)–(6) in de schermafbeelding:

1. **Project/Change-selectie (ProjectSelection)** — kies eerst een **project**; het tweede keuzemenu filtert optioneel op een specifieke change.
2. **Create change** — verschijnt **alleen wanneer het gekozen project de status Open heeft**.
3. **Changes-tabel** — kolommen **Name**, **Description**, **Project**, **DueDate**, **Creator**, **Status**, **ReleasedDate** en **ReleasedBy**.
4. **Status** — *Open* of *released* (zelfde statusvertaling als bij projecten).
5. **Released change** — verliest zijn rij-acties; een gereleasede change is niet meer te bewerken.
6. **Release-bevestiging** — roept `[Change].[spRelease]` aan.

### Een change aanmaken

1. Open de sub-link **Changes** en kies bovenaan een **project**.
2. Klik op **Create change** (alleen zichtbaar bij een Open project en met de juiste rechten).
3. Geef de change een **Name**, **Description** en **DueDate** en bevestig.

:::note Regel voor de due date
De **DueDate** van een change moet **op of vóór** de DueDate van het bovenliggende project liggen.
:::

## Scripted Objects

Onder **Scripted objects** beheer je custom SQL-objecten die niet door Yres zijn gegenereerd — je eigen tabellen, stored procedures en functions. Ze worden onder een change toegevoegd en reizen dus mee bij het releasen en installeren naar test en prod.

- Voeg een object toe via de sub-link **Scripted objects**, of neem bestaande database-objecten direct vanuit de object-tree in een change op.
- Bij een **custom tabel** kies je met de optie **"With table content?"** of de inhoud van de tabel meegaat (achterliggend: `[Change].[spCopyTableContent]`).

## Release Changes

Releasen maakt een change beschikbaar om te installeren op een andere omgeving. Je doet dit op het scherm **Release change** (route `/changes/release`).

**Zo release je een change:**

1. Open in de sectie **Projects** de sub-link **Release change**.
2. Selecteer het **project** en de **change** die je wilt vrijgeven.
3. Controleer de inhoud (zie *Change-inhoud bekijken* hieronder) en bevestig het releasen.

Wat er gebeurt:

- Na het releasen kan de change **niet meer bewerkt** worden — de change wordt vergrendeld.
- Yres **blokkeert** het releasen als de change inhoud bevat waar een **andere change** van afhankelijk is; de foutmelding noemt de afhankelijke change(s).
- Achterliggend draait Yres `[Change].[spRelease]` voor de betreffende `ChangeId`.

### Change-inhoud bekijken

De inhoud van een change bekijk je op twee manieren:

- **Als diagram** — een boomstructuur per bron (**source → schema → table**) die je per node kunt uitklappen; handig bij veel objecten.
- **Als tabel** — per object de details: het **load type**, de **delta-kolom** bij een delta-load en het gedrag wanneer het object al bestaat.

:::tip Dependencies meenemen (sinds v1.53)
Sinds **v1.53** kun je bij het toevoegen aan een change kiezen om **dependencies en/of content** mee te nemen, en kun je bestaande database-objecten direct vanuit de object-tree in een change opnemen.
:::

## Install Changes

Installeren brengt een **gereleasede** change naar de volgende omgeving (bv. dev → test, of test → prod). Dit gebeurt op het scherm **Install change** (route `/changes/install`).

![Het Install change-scherm: de DTAP-flow van change tot publish-datafactory, de lijst met released changes, de omgeving-hop en de knoppen Import change en Install change.](/img/screens/changes-release-install.svg)

De cijfers (1)–(6) in de schermafbeelding:

1. **DTAP-flow** — Change (dev) → Release → Import → Install → `publish-datafactory`.
2. **Released changes** — alleen gereleasede changes zijn te installeren.
3. **Omgeving-hop** — kies de omgeving **van** (bron) en **naar** (doel); de combinaties zijn opeenvolgende omgevingen.
4. **Import change** — alleen DWH; publiceert de ADF-factory niet.
5. **Install change** — DWH én ADF; publiceert ook de factory.
6. **Voortgang** — een monitor-toast toont de status; `publish-datafactory` draait in Azure DevOps en kan even duren.

**Zo installeer je een change:**

1. Open in de sectie **Projects** de sub-link **Install change**.
2. Kies de **gereleasede** change en de **omgeving-hop** (van → naar) bovenaan.
3. Kies een van de twee acties:
   - **Import change** → roept `[Change].[spImport]` aan: haalt de change- en projectdata (inclusief dependencies en content) opnieuw op in de doelomgeving. Dit is **alleen DWH** en publiceert de ADF-factory **niet**.
   - **Install change** → importeert én **installeert** de change met `[Change].[spInstall]` (via de `InstallChange`-pipeline waar aanwezig) **en publiceert de ADF-factory** door de Azure DevOps-pipeline `publish-datafactory` te draaien, zodat nieuwe data-source-pipelines mee landen in de doelfactory.
4. Volg de voortgang in de monitor-toast.

:::note Versies moeten overeenkomen
Importeren en installeren controleren eerst of de **DWH-versies** van bron- en doelomgeving overeenkomen. Verschillen ze, dan krijg je *"Environment versions do not match, please update"* en moet je eerst de omgeving bijwerken via [Update environments](./admin.md).
:::

### Reïmporteren en reïnstalleren

Een al geïnstalleerde change kun je opnieuw verwerken:

- **Reimport** → roept `[Change].[spImport]` aan en haalt de change-/projectdata (inclusief dependencies en content) opnieuw op.
- **Reinstall** → roept `[Change].[spInstall]` aan en installeert de change opnieuw op de omgeving.

:::info Eén levend installatiescherm
In de huidige app loopt het installeren via **Release change** (`/changes/release`) en **Install change** (`/changes/install`). Een ouder, gecombineerd *Publish change*-scherm bestaat nog in de code, maar is **niet meer bereikbaar** (legacy) en wordt vervangen door deze twee schermen.
:::
