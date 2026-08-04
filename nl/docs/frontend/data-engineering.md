---
sidebar_position: 6
title: Data Engineering
description: View-persistentie (Level/Delta) en Database objects (objectboom, SQL-definitie, versievergelijking en de Add-to-change-acties) beheren vanuit de Yres-webapp.
---

# Data Engineering

De sectie **Data engineering** (icoonbalk, sleutel `general.dataEngineering`) heeft precies twee sub-links waarmee je database-objecten beheert zonder rechtstreeks in de database te werken:

- **View persistence** (`/dataengineering/viewpersistence`) — views materialiseren naar tabellen.
- **Database objects** (`/dataengineering/objecthistory`) — de objectviewer: de objectboom, de huidige SQL-definitie, versievergelijking en het rechtsklik-menu om objecten aan een change toe te voegen.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## View persistence

Een **persisted (gematerialiseerde) view** slaat het resultaat van een view-query op in een echte tabel. Zo lezen rapporten direct uit een tabel in plaats van een (mogelijk trage) view telkens opnieuw uit te rekenen. Het scherm leest uit de view **`Loadmanagement.vwViewPersistence`** en laat je de configuratie beheren en de **Materialize View**-pipeline starten.

![View persistence-scherm: een tabel met persisted views (bron-view naar doeltabel, Level, Delta, datums) en een formulier om een nieuwe persisted view aan te maken.](/img/screens/dataengineering-viewpersistence.png)

*Het View persistence-scherm: links de sectie-iconenbalk, daarnaast de sub-links, en in het hoofdvenster de persistentietabel met daaronder het aanmaakformulier.*

(1) **Run materialize view (all)** — knop rechtsboven (`runMaterializeViewAll`). Verschijnt zodra de **Materialize View**-pipeline bestaat en draait deze voor élke rij in de tabel.
(2) **Persistentietabel** — één rij per persisted view, met onder andere `SourceSchemaName`, `SourceViewName`, `DestinationSchemaName`, `DestinationTableName`, `Level`, `Delta`, `LastPersistDate`, `LastETLDate` en `Active`.
(3) **Run materialize view (per rij)** — rij-actie die de `Materialize View`-pipelineparameters Schema/Table invult en de ad-hoc-runner opent.
(4) **Maintain-persist-view-formulier** — aanmaken/bewerken/verwijderen van een persisted view (CRUD via `MaintainPersistView`).
(5) **Level + load type** — bepaalt de laadvolgorde en of de view volledig (Full) of incrementeel (Delta) wordt bijgewerkt.

### Een persisted view aanmaken

1. Klik op **+ Add persisted view** (of bewerk een bestaande rij).
2. Kies de **source**: `SourceSchemaName` + `SourceViewName` — de view die je wilt materialiseren.
3. Kies de **bestemming**: `DestinationSchemaName` + `DestinationTableName` — de tabel waarin het resultaat wordt opgeslagen.
4. Stel het **Level** in (zie hieronder).
5. Kies het **load type** (`Full` of `Delta`); bij `Delta` geef je het bron-object en de `DeltaColumn` op.
6. Bewaar. Materialiseer daarna direct met **Run materialize view** (per rij of voor alle rijen).

### Level — de laadvolgorde

`Level` bepaalt de **volgorde** waarin persisted views worden gematerialiseerd. Dat is belangrijk wanneer de ene view van de andere afhangt:

- Hangt view **B** af van view **A**, geef dan **A `Level 0`** en **B `Level 1`**.
- A wordt dan eerst gematerialiseerd, zodat B een actuele bron heeft.

Views met een lager level worden eerst verwerkt. Voor onafhankelijke views maakt het level niet uit.

### Full vs. Delta

In de kolom `Delta` van de tabel (en bij het load type in het formulier) staat hoe de view wordt bijgewerkt:

| Modus | Wat er gebeurt |
|---|---|
| **Full** | De hele view wordt elke run opnieuw gematerialiseerd naar de doeltabel. |
| **Delta** | Alleen gewijzigde records worden bijgewerkt, gevolgd via een bron-object (view/tabel) en een `DeltaColumn`. |

:::note Onder de motorkap
De configuratie wordt opgeslagen via `MaintainPersistView`; het daadwerkelijke materialiseren gebeurt door de stored procedure **`[LoadManagement].[spMaterializeViews]`**, die door de **Materialize View**-pipeline wordt aangeroepen. Dezelfde stap zit als **Materialize Views** ook aan het eind van de standaard laad-workflow, zodat persisted views automatisch actueel blijven na een load.
:::

## Database objects

De sub-link **Database objects** (`/dataengineering/objecthistory`) is de **objectviewer**: een boomstructuur met alle database-objecten — door een gebruiker én door Yres gemaakt — waarmee je per object de **huidige SQL-definitie** bekijkt, **versies vergelijkt** en via een **rechtsklik-menu** objecten aan een change toevoegt.

Dit scherm is dé plek voor je **scripted/custom objecten** (je eigen tabellen, views, stored procedures en functions). Je bladert er door je DWH-objecten en voegt een eigen object — of een bestaand database-object — via het rechtsklik-menu (**Add to change**) rechtstreeks aan een change toe. Daarnaast bestaat er een apart **Scripted objects**-scherm (`/loadmanagement/scriptedObjects`, via de sidebar-link onder **Projects**); het rechtsklik-menu hier in Database objects is de snelste route om een object aan een change toe te voegen.

![Database objects-scherm: links de objectboom (schema → objecttype-map → object), in het midden het broncodepaneel met de huidige SQL-definitie (syntax highlighting), bovenaan de "No comparison"/"Compare versions"-dropdown en een rechtsklik-contextmenu met cascademenu's voor Add to change.](/img/screens/dataengineering-objecthistory.png)

*Het Database objects-scherm: de objectboom links (schema → objecttype → object), het broncodepaneel met de huidige definitie in het midden, de vergelijkingsdropdown bovenaan en het rechtsklik-contextmenu met de Add-to-change-cascade.*

(1) **Objectboom** — drie niveaus: **schema → objecttype-map → object**. Bijvoorbeeld `dbo → SCALAR_FUNCTION → fxToReadableSize`, of `ODS → TABLE → AzureSQL_dbo_attractions`. Klik een object aan om zijn definitie te laden.
(2) **Broncodepaneel** — toont de **huidige SQL-definitie** van het geselecteerde object, met syntax highlighting.
(3) **"No comparison" / "Compare versions"-dropdown** (+ layout-toggles) — bovenaan; standaard "No comparison". Kies **Compare versions** voor een diff; bij organisaties met meerdere omgevingen is er een derde optie, **Compare environments**, die de definitie tussen omgevingen vergelijkt.
(4) **Versie-diff** — bij **Compare versions** verschijnt een rood/groen-verschil tussen de huidige versie en een vorige `ALTER` (toegevoegde/verwijderde kolommen, indexen, enzovoort).
(5) **Rechtsklik-contextmenu** — rechtsklik op een object voor de change- en dependency-acties (zie [Objecten aan een change toevoegen](#objecten-aan-een-change-toevoegen)).

### Versies vergelijken

1. Selecteer een object in de boom; het broncodepaneel toont de huidige SQL-definitie.
2. Zet de dropdown bovenaan van **No comparison** naar **Compare versions**.
3. Lees het rood/groen-verschil af tussen de huidige versie en de vorige `ALTER`: toegevoegde regels staan groen, verwijderde regels rood (bijvoorbeeld toegevoegde of verwijderde kolommen of indexen).
4. Met de layout-toggles wissel je hoe het broncode- en diff-paneel worden weergegeven.

### Objecten aan een change toevoegen

Het **rechtsklik-menu** op een object in de boom is de manier waarop je scripted/custom objecten — je eigen tabellen, views, stored procedures en functions — én bestaande database-objecten aan een change toevoegt. Rechtsklik een object en kies een van de volgende acties (de eerste drie hebben cascademenu's):

- **Add to change ▸** — kies een **project** ▸ kies een **change** (of **New change…** / **Create project…**). Het object wordt aan die change toegevoegd.
- **Add to change with dependencies ▸** — hetzelfde project → change-pad, maar neemt ook de **afhankelijkheden** van het object mee.
- **Delete with change ▸** — plant de **verwijdering** van het object als onderdeel van een change.
- **View dependencies** — opent een **dependency-graaf** (React Flow) van waar het object van afhangt én wat ervan afhangt, bijvoorbeeld `[dbo].[UNQUOTENAME]` → `[LoadManagement].[fxExtractor]` → `vwExtractor` / `spPrepareWorkload`.
- **View change history** — opent een **modal** met de changes die dit object hebben geraakt (kolommen Change · Status overview · CreationDate · plus een link om naar de change te navigeren).

:::note Changes & DTAP
Het toevoegen aan een change hoort bij het [Projects → Changes](projecten-changes.md)-proces, waarmee wijzigingen gecontroleerd door je DTAP-omgevingen worden gepromoveerd. Dit menu is bedoeld voor omgevingen met meerdere environments.
:::

## Verder lezen

- [Historie & SCD2](../concepten/historie-scd2.md) — hoe Yres historie bijhoudt (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `IsCurrent`, `Delta`); achtergrond bij de `Delta`-modus van persisted views.
- [Load management](load-management.md) — hier start je losse pipelines, waaronder **Persist View** (de Materialize Views-pipeline).
- [Gegevensstroom](../concepten/gegevensstroom.md) — waar de **Materialize Views**-stap in de totale laad-workflow valt.
