---
sidebar_position: 6
title: Data Engineering
description: View-persistentie (Level/Delta) en object-historie (versievergelijking en dependency-trees) beheren vanuit de Yres-webapp.
---

# Data Engineering

De sectie **Data engineering** (icoonbalk, sleutel `general.dataEngineering`) bevat twee schermen waarmee je database-objecten beheert zonder rechtstreeks in de database te werken:

- **View persistence** (`/dataengineering/viewpersistence`) — views materialiseren naar tabellen.
- **Object history** (`/dataengineering/objecthistory`) — versiehistorie en afhankelijkheden van objecten bekijken.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## View persistence

Een **persisted (gematerialiseerde) view** slaat het resultaat van een view-query op in een echte tabel. Zo lezen rapporten direct uit een tabel in plaats van een (mogelijk trage) view telkens opnieuw uit te rekenen. Het scherm leest uit de view **`Loadmanagement.vwViewPersistence`** en laat je de configuratie beheren en de **Materialize View**-pipeline starten.

![View persistence-scherm: een tabel met persisted views (bron-view naar doeltabel, Level, Delta, datums) en een formulier om een nieuwe persisted view aan te maken.](/img/screens/dataengineering-viewpersistence.svg)

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

## Object history

Het scherm **Object history** (`/dataengineering/objecthistory`) toont alle database-objecten — door een gebruiker én door Yres gemaakt — met hun **definitie**, **versiehistorie** en **afhankelijkheden**. Je kunt versies vergelijken, dependency-trees verkennen en objecten toevoegen aan een change.

![Object history-scherm: links een schema- en objectboom met een rechtsklik-contextmenu, rechtsboven de versievergelijking met een diff van de objectdefinitie en rechtsonder een dependency-tree.](/img/screens/dataengineering-objecthistory.svg)

*Het Object history-scherm: de objectboom links, de versievergelijking met diff rechtsboven en de afhankelijkheidsgraaf rechtsonder.*

(1) **Comparison-dropdown** — bovenaan de objectboom; kies waarmee je vergelijkt (standaard "No comparison").
(2) **Schema-/objectboom** — alle schema's en objecten (bijvoorbeeld `CustomYres`, `dbo`, `Expose`, `ODS`, `STAGE`). Klik een object aan om zijn definitie en afhankelijkheden te laden.
(3) **Rechtsklik-contextmenu** — acties op een object (zie [Objecten aan een change toevoegen](#objecten-aan-een-change-toevoegen)).
(4) **Versievergelijking + diff** — twee dropdowns kiezen de versies; het hoofdvenster toont de definitie of een regel-voor-regel-verschil. De knop linksonder vergelijkt de huidige met de vorige definitie.
(5) **Dependency-tree** — de objecten waar dit object **van afhangt** én die **ervan afhangen**; klik een knoop aan om gelinkte objecten te markeren (handig in grote bomen).

### Versies vergelijken

1. Selecteer een object in de boom.
2. Kies in de dropdowns de **huidige** versie en de versie waarmee je wilt **vergelijken**.
3. Lees het verschil af in het hoofdvenster (toegevoegde en verwijderde regels worden gemarkeerd).
4. Of klik de knop linksonder om snel **huidige vs. vorige** definitie te vergelijken.

### Objecten aan een change toevoegen

Rechtsklik op een object in de boom voor het contextmenu. Van daaruit kun je het object:

- **toevoegen aan een change met dependencies** — neemt ook de objecten mee waarvan dit object afhangt;
- **toevoegen aan een change zonder dependencies** — alleen het object zelf;
- **toevoegen met content** — inclusief de objectinhoud;
- **verwijderen met een change** — boek de verwijdering in een change.

:::note Changes & DTAP
Het toevoegen aan een change hoort bij het [Projects → Changes → Publish](projecten-changes.md)-proces, waarmee wijzigingen gecontroleerd door je DTAP-omgevingen worden gepromoveerd. Dit menu is bedoeld voor omgevingen met meerdere environments.
:::

## Verder lezen

- [Historie & SCD2](../concepten/historie-scd2.md) — hoe Yres historie bijhoudt (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `IsCurrent`, `Delta`); achtergrond bij de `Delta`-modus van persisted views.
- [Load management](load-management.md) — hier start je losse pipelines, waaronder **Persist View** (de Materialize Views-pipeline).
- [Gegevensstroom](../concepten/gegevensstroom.md) — waar de **Materialize Views**-stap in de totale laad-workflow valt.
