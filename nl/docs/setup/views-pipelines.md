---
sidebar_position: 4
title: Views, pipelines & triggers
description: Stap-voor-stap een persisted view aanmaken en materialiseren, pipelines handmatig draaien, triggers plannen en een master pipeline opzetten.
---

# Views, pipelines & triggers

Deze pagina is een **takenwalkthrough**: je leert hoe je een persisted view aanmaakt en materialiseert, hoe je pipelines handmatig draait, hoe je triggers plant en hoe je losse stappen tot een **master pipeline** aan elkaar knoopt.

:::tip Volledige schermreferentie
Wil je de complete velduitleg per scherm? Die staat in de frontend-referentie:
[Data Engineering → View persistence](../frontend/data-engineering.md#view-persistence) en
[Load Management](../frontend/load-management.md) (Run pipelines, Triggers, Master pipelines).
Deze pagina vat samen *hoe* je het doet; die pagina's beschrijven *elk veld* van het scherm.
:::

## Een persisted view aanmaken en materialiseren

Een **persisted (gematerialiseerde) view** slaat de uitkomst van een databaseview op in een echte tabel, zodat rapporten direct uit een tabel lezen in plaats van telkens een (mogelijk trage) view opnieuw uit te rekenen.

**Voorwaarde:** er moet eerst een **view** in de database bestaan. Yres materialiseert die view; het maakt hem niet zelf aan. Maak de view bijvoorbeeld aan met [SQL Server Management Studio (SSMS)](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) — denk aan een view `DM.Vw760` in de `IRIS_DWH`-database.

Je beheert persisted views in de webapp onder **Data engineering → View persistence** (`/dataengineering/viewpersistence`). Het scherm leest uit de view **`Loadmanagement.vwViewPersistence`**.

![View persistence-scherm met links de iconenbalk en sub-links, in het hoofdvenster de persistentietabel (bron-view naar doeltabel, Level, Delta, datums, Active) en daaronder het Create persisted view-formulier.](/img/screens/dataengineering-viewpersistence.png)

*Het View persistence-scherm: de persistentietabel met daaronder het aanmaakformulier (Create persisted view).*

(1) **Run materialize view (all)** — knop rechtsboven; draait de **Materialize View**-pipeline voor élke rij in de tabel.
(2) **Persistentietabel** — één rij per persisted view met `SourceSchemaName`, `SourceViewName`, `DestinationSchemaName`, `DestinationTableName`, `Level`, `Delta`, `LastPersistDate` en `Active`.
(3) **Run materialize view (per rij)** — rij-actie die de `Materialize View`-pipelineparameters Schema/Table invult en de ad-hoc-runner opent.
(4) **Create persisted view-formulier** — kies hier de bron-view en de doel-schema/-tabel.
(5) **Level + load type** — bepaalt de laadvolgorde en of de view volledig (`Full`) of incrementeel (`Delta`) wordt bijgewerkt.

### Stappen

1. Open **Data engineering → View persistence**. Klik op **+ Add persisted view** (of bewerk een bestaande rij).
2. Kies de **bron**: `SourceSchemaName` + `SourceViewName`. Je kiest uit DWH-views die nog niet gepersisteerd zijn; de view verschijnt onder zijn schema-naam in de **Create persisted view**-dialoog.
3. Kies de **bestemming**: `DestinationSchemaName` + `DestinationTableName` (beide alfanumeriek, max. 128 tekens) — de tabel waarin het resultaat wordt opgeslagen.
4. Stel het **Level** in (geheel getal ≥ 0). Het Level bepaalt de **volgorde** van materialiseren: hangt view B af van view A, geef A dan een lager Level dan B, zodat A eerst klaar is. Voor onafhankelijke views maakt het Level niet uit.
5. Kies het **load type**:
   - **Full** — de hele view wordt elke run opnieuw naar de doeltabel gematerialiseerd.
   - **Delta** — alleen gewijzigde records. Kies dan het **source delta object type** (`View (V)` of `Table (T)`), het bijbehorende schema/de naam, en de **DeltaColumn** die de wijzigingen volgt.
6. Bewaar. Het scherm registreert de view-naar-tabel-configuratie via `MaintainPersistView`.
7. **Materialiseer** direct met **Run materialize view** (per rij, callout 3) of **Run materialize view (all)** (callout 1).

:::note Onder de motorkap
Het daadwerkelijke materialiseren gebeurt door de stored procedure **`[LoadManagement].[spMaterializeViews]`**, aangeroepen door de **Materialize View**-pipeline. Diezelfde stap (**Materialize Views**) draait ook automatisch aan het einde van de standaard laad-workflow, zodat persisted views actueel blijven na elke load. De `Delta`-modus leunt op dezelfde change-tracking als de rest van Yres — zie [Historie & SCD2](../concepten/historie-scd2.md).
:::

## Pipelines handmatig draaien

Pipelines start je in **Load Management → Run pipelines** (`/loadmanagement/runPipelines`). Links staat de pipeline-lijst, rechts de runs van de geselecteerde pipeline met filters op periode en status.

**Stappen:**

1. Open **Load Management → Run pipelines** en selecteer links een pipeline.
2. Klik **Start pipeline**. Heeft de pipeline parameters, dan leest de knop **Set parameters to start** en opent er een formulier.
3. Vul de parameters in en bevestig. De run verschijnt in de runs-tabel.

Twee veelgebruikte gevallen:

- **Refresh All Metadata** — selecteer de metadata-pipeline links en klik **Start pipeline**. Dit ververst de bron-metadata (schema's, tabellen, kolommen) voordat je tabellen toevoegt.
- **Dynamic Workflow YRES** — dit is de dynamische laad-workflow. Vul in: **Source**, **Source schema** en **Source table**, en kies optioneel een **Running tier** (de tier waarop geladen wordt) en een **Revert-to tier** (de tier waarnaar Yres na afloop terugschaalt). Op oudere Yres-versies heet deze pipeline nog `Dynamic Workflow IRIS`; de app herkent beide namen.

:::note
Het daadwerkelijke laden gebeurt in Azure Data Factory: de pipeline kopieert de bron naar `STAGE` en roept vervolgens `[LoadManagement].[spLoadDWH]` aan; de voortgang wordt gelogd via `[Monitoring].[spWriteLoadStatus]`. Een lopende run kun je stoppen via het stop-icoon. Zie [Gegevensstroom](../concepten/gegevensstroom.md) voor de volledige flow.
:::

## Triggers plannen

Met een **trigger** laat je een pipeline automatisch draaien op een vast interval. Je beheert triggers in **Load Management → Triggers** (`/loadmanagement/triggers`).

**Stappen:**

1. Open **Triggers** en selecteer links de pipeline waarvoor je een trigger wilt.
2. Klik **Create**.
3. Vul in:
   - **Name** (verplicht).
   - **Every / interval** (een getal) en **Frequency**: `Minute(s)`, `Hour(s)`, `Day(s)`, `Week(s)` of `Month(s)`.
   - Bij **Week(s)**: een **Day of the week**. Bij **Month(s)**: een **Day of the month** (1–31). Bij Day/Week/Month: een **Time**.
4. Heeft de pipeline parameters (zoals de Dynamic Workflow met Source/Schema/Table), vul die dan in de tweede stap in.
5. Klik **Submit**. De trigger wordt in ADF aangemaakt en meteen gestart; je kunt hem later starten, stoppen of verwijderen vanuit de triggers-tabel.

:::info Tijdzone
De interface toont de hint *"Timezone UTC(+1) will be used"*, maar de trigger gebruikt in werkelijkheid de **tijdzone van de ingelogde gebruiker** (uit je gebruikersinstellingen), niet een vaste UTC+1. Houd hier rekening mee bij het inplannen.
:::

## Een master pipeline opzetten

Met **master pipelines** knoop je bestaande Yres-bouwstenen aan elkaar tot één flow met conditionele logica — bijvoorbeeld delta's door de week en een volledige reload in het weekend, of een Power BI-refresh die alleen na een geslaagde load draait. Je werkt in een visuele editor (op basis van [reactflow](https://reactflow.dev/)) onder **Load Management → Design master pipeline**.

![Design master pipeline-scherm: links het node-palet, in het midden het reactflow-canvas met verbonden nodes en hun success/failure/completion-uitgangen, plus Save- en Publish-knoppen.](/img/screens/loadmanagement-masterpipelines.png)

*Het Design master pipeline-scherm: sleep node-types op het canvas, verbind hun uitgangen en publiceer de flow naar ADF.*

(1) **Node-palet** links — sleep een node-type op het canvas.
(2) **Canvas** (reactflow) — verbind nodes, selecteer ze om te configureren, verwijder met **Backspace**.
(3) **Drie uitgangen** rechts op elke node: **On success** (groen), **On failure** (rood) en **On completion** (blauw) — hiermee bouw je de conditionele logica.
(4) **Ingang** links op een node — hier komen verbindingen binnen.
(5) **Kleurlegenda** van de drie uitgangen.
(6) **Save** (concept) en **Publish** (naar ADF; alleen actief ná een Save).

**Stappen:**

1. Open **Load Management → Design master pipeline** en maak een nieuwe flow aan.
2. Sleep node-types vanuit het palet (callout 1) op het canvas. Beschikbare nodes zijn onder meer **Load sources**, **Alternative load**, **Wait**, **Change service tier**, **Run pipeline**, **Persist view** en **Refresh PowerBI**.
3. **Verbind** de nodes door vanaf een uitgang rechts op een node naar de ingang links van een andere node te slepen. Kies bewust **On success** (groen), **On failure** (rood) of **On completion** (blauw) om je logica te bepalen.
4. Selecteer een node om hem te configureren (bijvoorbeeld bij **Load sources** de source/schema/table).
5. Klik **Save** om het concept te bewaren.
6. Klik **Publish** om de flow als ADF-pipeline te genereren. De gepubliceerde pipeline verschijnt na enkele minuten in de Data Factory (map `MasterPipelines`) en in **Run pipelines**.

:::caution Geen vrije ADF-designer
Een master pipeline laat je **bestaande Yres-bouwstenen** (loads, wachten, tier-wissels, view-materialisatie, Power BI-refresh) aan elkaar knopen met succes-/faal-/voltooid-logica. Je tekent géén losse copy-activiteiten of datatransformaties: je configureert nodes en hun verbindingen, en Yres **genereert** daaruit de onderliggende ADF-pipeline. De volledige lijst node-types en hun aandachtspunten staat in [Load Management → Master pipelines](../frontend/load-management.md#master-pipelines).
:::

## Verder lezen

- [Data Engineering](../frontend/data-engineering.md) — volledige velduitleg van View persistence en Object history.
- [Load Management](../frontend/load-management.md) — Run pipelines, Triggers, Monitoring en Master pipelines per scherm.
- [Gegevensstroom](../concepten/gegevensstroom.md) — waar de **Materialize Views**-stap en de Dynamic Workflow in de totale laad-workflow vallen.
- [Historie & SCD2](../concepten/historie-scd2.md) — achtergrond bij de `Delta`-modus van persisted views.
