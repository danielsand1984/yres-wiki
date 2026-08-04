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

De vijf stappen die een wijziging doorloopt — **alle acties voer je uit via het acties-menu (☰) van de change** op het **Changes**-scherm; de kolom *Waar* geeft aan vanaf welke omgeving de actie loopt:

| Stap | Wat | Waar | Achterliggend |
|---|---|---|---|
| 1 | **Change aanmaken** onder een project en er werk in boeken | Create change · dev | — |
| 2 | **release change** — change vergrendelen en vrijgeven om te installeren | ☰ → submenu **dev** · open change | `[Change].[spRelease]` |
| 3 | **Install change** — de change de eerste keer importeren én installeren op de doelomgeving, inclusief ADF-publish | ☰ → submenu **prd** · gereleasede change | endpoint `/changes/install-and-import`: `[Change].[spImport]` + `[Change].[spInstall]` + `publish-datafactory` |
| 4 | **Reimport / Reinstall change** — daarna: opnieuw importeren (alleen DWH) óf opnieuw installeren (zonder import) | ☰ → submenu **prd** · geïnstalleerde change | `[Change].[spImport]` resp. `[Change].[spInstall]` + `publish-datafactory` |
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

Een **change** categoriseert bewerkingen aan het datawarehouse en is de eenheid die je later releaset en installeert. Changes horen altijd bij een project. Alle data-plane-edits in dev worden onder een change geboekt (zie het toevoegen van tabellen in [Data sources](./data-sources.md)), zodat ze samen door de omgevingen reizen. Het **Changes**-scherm is dé plek waar alles rond changes gebeurt: je filtert, bekijkt de changes-tabel en voert **alle acties — releasen, (re)importeren en (re)installeren — uit via het acties-menu (☰)** van een change. Welke acties beschikbaar zijn, hangt af van de status van de change.

![Het Changes-scherm: bovenaan de filters (project, "Only show open projects", "Where environment…" en "Has status"), daaronder de changes-tabel met per omgeving een statusoverzicht, de NextStep-suggestie, een dependencies-link en het acties-menu (☰) per rij, plus de knop Create change.](/img/screens/changes.png)

De genummerde elementen in de schermafbeelding:

1. **Filters** — een **Project**-keuzemenu, een **"Only show open projects"**-checkbox en de filters **"Where environment…"** en **"Has status"** om de tabel te beperken tot changes in een bepaalde omgeving of met een bepaalde status.
2. **Create change** — opent het aanmaakformulier (alleen bij een Open project en met de juiste rechten).
3. **Changes-tabel** — kolommen **Name**, **Description**, **DueDate**, **ReleasedDate**, **Status overview**, **NextStep**, **Dependencies** en **Actions** (zie hieronder).
4. **Status overview** — per omgeving een voortgangsindicator: **groen** wanneer die stap op de omgeving is uitgevoerd, **grijs** zolang nog niet.
5. **NextStep** — de voorgestelde vervolgactie voor de change, bijvoorbeeld *"Release on dev"* of *"Install on prd"*.
6. **Dependencies** — een **"N dependencies"**-link die de **dependency-graph** opent (welke changes deze change nodig heeft, en hun status).
7. **Actions (☰)** — het acties-menu per rij; hierin zitten **Update**, **Delete**, een **submenu per omgeving** (release / install / reimport / reinstall), **View dependencies** en **Logs** (zie [Releasen](#een-change-releasen) en [Installeren](#een-change-installeren)).

### De kolommen van de changes-tabel

| Kolom | Wat het toont |
|---|---|
| **Name** / **Description** | Naam en omschrijving van de change. |
| **DueDate** | Streefdatum (≤ de DueDate van het bovenliggende project). |
| **ReleasedDate** | Wanneer de change is gereleased (leeg zolang de change open is). |
| **Status overview** | Per omgeving een voortgangsindicator — **groen** = stap uitgevoerd op die omgeving, **grijs** = nog niet. |
| **NextStep** | De voorgestelde vervolgactie, bijv. *"Release on dev"* of *"Install on prd"*. |
| **Dependencies** | Een **"N dependencies"**-link die de dependency-graph opent. |
| **Actions** | Het acties-menu (☰) per change — zie [het acties-menu](#het-acties-menu). |

### Een change aanmaken

1. Open de sub-link **Changes** en kies bovenaan een **project**.
2. Klik op **Create change** (alleen zichtbaar bij een Open project en met de juiste rechten).
3. Geef de change een **Name**, **Description** en **DueDate** en bevestig.

:::note Regel voor de due date
De **DueDate** van een change moet **op of vóór** de DueDate van het bovenliggende project liggen.
:::

## Scripted Objects

Custom SQL-objecten die niet door Yres zijn gegenereerd — je eigen tabellen, views, stored procedures en functions — beheer je vanuit **Database objects**: de database-objectboom onder **Data Engineering**. Daar blader je door je DWH-objecten en **voeg je een eigen object — of een bestaand database-object — rechtstreeks vanuit de explorer toe aan een change**. Daarnaast bestaat er een apart **Scripted objects**-scherm (`/loadmanagement/scriptedObjects`, via de sidebar-link onder **Projects**); in beide gevallen reizen scripted/custom objecten via de change mee bij het releasen en installeren naar test en prod.

- Open onder **Data Engineering** het **Database objects**-scherm en rechtsklik een object om het — met of zonder dependencies, en eventueel met content — aan een change toe te voegen. Zie [Objecten aan een change toevoegen](./data-engineering.md#objecten-aan-een-change-toevoegen).
- Bij een **custom tabel** kies je of de inhoud van de tabel meegaat (achterliggend: `[Change].[spCopyTableContent]`).

## Het acties-menu (☰) {#het-acties-menu}

Releasen, installeren, (re)importeren en (re)installeren doe je via het **acties-menu (☰)** dat elke change-rij in de tabel heeft. Daarnaast staan in de Projects-sidebar ook de aparte schermen **Release change** (`/changes/release`) en **Install change** (`/changes/install`); het acties-menu bundelt dezelfde acties per change-rij. Welke items het menu toont, hangt af van de status van de change en van de omgeving.

![Het acties-menu (☰) van een change, geopend: bovenaan Update en Delete, daaronder een submenu per omgeving (dev ▸ en prd ▸) met release / reimport / reinstall, en onderaan View dependencies en Logs.](/img/screens/changes-release-install.png)

Het menu bevat:

- **Update** — de change bewerken (alleen zinvol zolang de change open is).
- **Delete** — de change verwijderen.
- **Een submenu per omgeving** (bijv. **dev ▸**, **prd ▸**):
  - Op **dev** biedt een **open** change **release change** aan — dit vergrendelt de change en geeft hem vrij om te installeren (achterliggend `[Change].[spRelease]`, met een dependency-check).
  - Op een **doelomgeving** (bijv. **prd**) biedt een **gereleasede** change eerst **Install change** aan — dit importeert én installeert de change en publiceert de ADF-factory (endpoint `/changes/install-and-import`). Pas nadat de change op die omgeving geïnstalleerd is, verschijnen **Reimport change** (alleen opnieuw importeren, `[Change].[spImport]`) en **Reinstall change** (opnieuw installeren zónder import: `[Change].[spInstall]` + de `publish-datafactory`-pipeline).
- **View dependencies** — opent de **dependency-graph**: welke changes deze change nodig heeft en hun status.
- **Logs** — opent het **stap-voor-stap import-/install-log** (zie [Logs](#logs)).

### Een change releasen

Releasen maakt een change beschikbaar om te installeren op een andere omgeving. Je doet dit via het acties-menu (☰) van de change, in het submenu van de **dev**-omgeving.

1. Open de sub-link **Changes** en filter eventueel op het **project** en de **omgeving**.
2. Controleer de inhoud (zie [Change-inhoud bekijken](#change-inhoud-bekijken) hieronder).
3. Open op de open change het **acties-menu (☰)**, ga naar **dev ▸** en kies **release change**; bevestig.

Wat er gebeurt:

- Na het releasen kan de change **niet meer bewerkt** worden — de change wordt vergrendeld en **ReleasedDate** wordt ingevuld.
- Yres voert eerst een **dependency-check** uit en **blokkeert** het releasen wanneer déze change zelf afhangt van changes die **nog niet gereleased** zijn; de foutmelding noemt de change(s) waarvan deze change afhangt.
- Achterliggend draait Yres `[Change].[spRelease]` voor de betreffende `ChangeId`.

### Een change installeren

Installeren brengt een **gereleasede** change naar de volgende omgeving (bv. dev → test, of test → prod). Ook dit doe je via het acties-menu (☰), nu in het submenu van de **doelomgeving** (bijv. **prd ▸**).

1. Open de sub-link **Changes** en zorg dat de change **gereleased** is (zie de kolom **Status overview** en de **NextStep**-suggestie, bijv. *"Install on prd"*).
2. Open op de change het **acties-menu (☰)** en ga naar het submenu van de **doelomgeving** (bijv. **prd ▸**).
3. Kies de actie die bij de situatie past:
   - **Install change** — de eerste keer op deze omgeving. Importeert de change- en projectdata (inclusief dependencies en content), **installeert** de change met `[Change].[spInstall]` **en publiceert de ADF-factory** door de Azure DevOps-pipeline `publish-datafactory` te draaien, zodat nieuwe data-source-pipelines mee landen in de doelfactory (endpoint `/changes/install-and-import`).
   - **Reimport change** — pas zichtbaar nadat de change op deze omgeving geïnstalleerd is. Roept alleen `[Change].[spImport]` aan: haalt de change- en projectdata opnieuw op. Dit is **alleen DWH** en publiceert de ADF-factory **niet**.
   - **Reinstall change** — eveneens pas zichtbaar ná installatie. Installeert opnieuw met `[Change].[spInstall]` en publiceert de ADF-factory, maar doet **géén** import.
4. Volg de voortgang in de **Logs** (zie hieronder) en in het **Status overview** van de change.

:::note Versies moeten overeenkomen
De eerste **Install change** (import-and-install) controleert eerst of de **DWH-versies** van bron- en doelomgeving overeenkomen. Verschillen ze, dan krijg je *"Environment versions do not match, please update"* en moet je eerst de omgeving bijwerken via [Update environments](./admin.md). **Reimport** en **Reinstall** voeren deze versiecheck niet uit.
:::

### Dependencies bekijken (dependency-graph)

Vanuit de kolom **Dependencies** (de **"N dependencies"**-link) of via **View dependencies** in het acties-menu open je de **dependency-graph**. Die toont welke changes deze change nodig heeft en wat hun status is, zodat je vóór een release of install ziet of de afhankelijke changes al op de doelomgeving staan.

### Logs

**Logs** in het acties-menu opent een **stap-voor-stap tijdlijn** van het import-/install-proces, elk met een status en de origin. De stappen lopen in deze volgorde:

1. **INIT**
2. **ADD CHANGES**
3. **ADD PROJECT**
4. **ADD CHANGE CONTENT**
5. **ADD CHANGE DEPENDENCIES**
6. **END OF PROCESS**

### Change-inhoud bekijken

Selecteer een change om het **content-paneel** te openen; daarin zie je de objecten van de change als **boomstructuur** (**source → schema → table → properties**). Per object lees je eigenschappen zoals **LoadType**, **DeltaColumn** en **ifExists**. Met de toggle **"View as table"** wissel je tussen:

- **Als boom** — een uitklapbare structuur per bron (**source → schema → table**); handig bij veel objecten.
- **View as table** — per object de details in een tabel: het **LoadType**, de **DeltaColumn** bij een delta-load en het **ifExists**-gedrag wanneer het object al bestaat.

:::tip Dependencies meenemen (sinds v1.53)
Sinds **v1.53** kun je bij het toevoegen aan een change kiezen om **dependencies en/of content** mee te nemen, en kun je bestaande database-objecten direct vanuit de object-tree in een change opnemen.
:::

:::info Acties-menu (☰) én aparte schermen
Releasen, installeren, (re)importeren en (re)installeren voer je uit via het **acties-menu (☰)** van de change op het **Changes**-scherm: op **dev** biedt een open change **release change**, op een doelomgeving biedt een gereleasede change **Install change** en — ná installatie — **Reimport change** en **Reinstall change**. Daarnaast staan in de Projects-sidebar ook de aparte schermen *Release change* (`/changes/release`) en *Install change* (`/changes/install`).
:::
