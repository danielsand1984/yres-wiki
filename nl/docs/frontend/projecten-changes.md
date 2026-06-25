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

De vijf stappen die een wijziging doorloopt — **alle acties voer je uit vanuit de change zelf** op het **Changes**-scherm; de kolom *Waar* geeft aan vanaf welke omgeving de actie loopt:

| Stap | Wat | Waar | Achterliggend |
|---|---|---|---|
| 1 | **Change aanmaken** onder een project en er werk in boeken | vanuit de change · dev | — |
| 2 | **Release** — change vergrendelen en vrijgeven om te installeren | vanuit de open change · dev | `[Change].[spRelease]` |
| 3 | **Import** — change-JSON ophalen in de doelomgeving (alleen DWH) | vanuit de gereleasede change · env-hop naar test/prod | `[Change].[spImport]` |
| 4 | **Install** — change installeren én de ADF-factory publiceren | vanuit de gereleasede change · env-hop naar test/prod | `[Change].[spInstall]` + `publish-datafactory` |
| 5 | **publish-datafactory** — nieuwe pipelines landen in de doelfactory | doelomgeving (test/prod) | Azure DevOps-pipeline |

## Projects

Een **project** groepeert changes binnen een omgeving en geeft het werk een naam, een beschrijving en een einddatum.

![Het Projects-scherm: een tabel met projecten en hun status, de knop om een project aan te maken, en de waarschuwing dat de sectie alleen bij meerdere omgevingen beschikbaar is.](/img/screens/projects.png)

De cijfers (1)–(6) in de schermafbeelding verwijzen naar:

1. **Sub-links** van de sectie — *Projects* en *Changes*.
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

Een **change** categoriseert bewerkingen aan het datawarehouse en is de eenheid die je later releaset en installeert. Changes horen altijd bij een project. Alle data-plane-edits in dev worden onder een change geboekt (zie het toevoegen van tabellen in [Data sources](./data-sources.md)), zodat ze samen door de omgevingen reizen. **Alle acties — aanmaken, releasen, importeren en installeren — voer je vanuit de change zelf uit op dit scherm**; welke knoppen verschijnen hangt af van de status van de change.

![Het Changes-scherm: de project- en change-selectie bovenaan, de changes-tabel met statussen, de knop om een change aan te maken en de contextuele acties op de change zelf — een open change toont Release, een gereleasede change toont Import en Install met de omgeving-hop.](/img/screens/changes.png)

De cijfers (1)–(6) in de schermafbeelding:

1. **Project/Change-selectie (ProjectSelection)** — kies eerst een **project**; het tweede keuzemenu filtert optioneel op een specifieke change.
2. **Create change** — verschijnt **alleen wanneer het gekozen project de status Open heeft**.
3. **Changes-tabel** — kolommen **Name**, **Description**, **Project**, **DueDate**, **Creator**, **Status**, **ReleasedDate** en **ReleasedBy**.
4. **Status** — *Open* of *released* (zelfde statusvertaling als bij projecten); de status bepaalt welke acties de change toont.
5. **Open change** — toont de actie **Release** (en is nog te bewerken); een gereleasede change verliest zijn bewerk-acties en toont in plaats daarvan **Import** en **Install** met de omgeving-hop.
6. **Contextuele change-acties** — vanuit de change zelf; **Release** roept `[Change].[spRelease]` aan, **Import** en **Install** verschijnen op een gereleasede change (zie [Releasen](#een-change-releasen) en [Installeren](#een-change-installeren)).

### Een change aanmaken

1. Open de sub-link **Changes** en kies bovenaan een **project**.
2. Klik op **Create change** (alleen zichtbaar bij een Open project en met de juiste rechten).
3. Geef de change een **Name**, **Description** en **DueDate** en bevestig.

:::note Regel voor de due date
De **DueDate** van een change moet **op of vóór** de DueDate van het bovenliggende project liggen.
:::

## Scripted Objects

Custom SQL-objecten die niet door Yres zijn gegenereerd — je eigen tabellen, views, stored procedures en functions — beheer je vanuit de **Object Explorer**: de database-objectboom onder **Data Engineering**. Daar blader je door je DWH-objecten en **voeg je een eigen object — of een bestaand database-object — rechtstreeks vanuit de explorer toe aan een change**. Er is geen apart "Scripted objects"-scherm meer; scripted/custom objecten leven in de Object Explorer en reizen via de change mee bij het releasen en installeren naar test en prod.

- Open onder **Data Engineering** de **Object Explorer** en rechtsklik een object om het — met of zonder dependencies, en eventueel met content — aan een change toe te voegen. Zie [Objecten aan een change toevoegen](./data-engineering.md#objecten-aan-een-change-toevoegen).
- Bij een **custom tabel** kies je of de inhoud van de tabel meegaat (achterliggend: `[Change].[spCopyTableContent]`).

## Release Changes

Releasen maakt een change beschikbaar om te installeren op een andere omgeving. Je doet dit **vanuit de change zelf** op het **Changes**-scherm: zolang een change open staat, toont hij de actie **Release**.

### Een change releasen

1. Open de sub-link **Changes** en kies bovenaan het **project** en de **change** die je wilt vrijgeven.
2. Controleer de inhoud (zie *Change-inhoud bekijken* hieronder).
3. Klik op de open change op **Release** en bevestig.

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

Installeren brengt een **gereleasede** change naar de volgende omgeving (bv. dev → test, of test → prod). Ook dit doe je **vanuit de change zelf**: zodra een change gereleased is, toont hij op het **Changes**-scherm de acties **Import** en **Install** samen met de **omgeving-hop** (van → naar).

![Een gereleasede change met inline acties: de DTAP-flow van change tot publish-datafactory, de change-inhoud, de omgeving-hop en de knoppen Import change en Install change — allemaal vanuit de change zelf.](/img/screens/changes-release-install.png)

De cijfers (1)–(6) in de schermafbeelding:

1. **DTAP-flow** — Change (dev) → Release → Import → Install → `publish-datafactory`.
2. **Gereleasede change** — alleen een gereleasede change toont de installeer-acties.
3. **Omgeving-hop** — kies de omgeving **van** (bron) en **naar** (doel); de combinaties zijn opeenvolgende omgevingen.
4. **Import change** — alleen DWH; publiceert de ADF-factory niet.
5. **Install change** — DWH én ADF; publiceert ook de factory.
6. **Voortgang** — een monitor-toast toont de status; `publish-datafactory` draait in Azure DevOps en kan even duren.

### Een change installeren

1. Open de sub-link **Changes** en kies bovenaan het **project** en de **gereleasede** change.
2. Kies op de change de **omgeving-hop** (van → naar).
3. Kies een van de twee acties op de change:
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

:::info Alle acties vanuit de change
Releasen, importeren en installeren voer je allemaal uit **vanuit de change zelf** op het **Changes**-scherm: een open change toont **Release**, een gereleasede change toont **Import** en **Install** met de omgeving-hop. Er zijn geen aparte *Release change*- of *Install change*-schermen meer.
:::
