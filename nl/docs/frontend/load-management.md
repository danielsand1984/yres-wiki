---
sidebar_position: 5
title: Load Management
description: Pipelines starten, plannen met triggers, loads monitoren en master pipelines ontwerpen.
---

# Load Management

In **Load Management** bestuur je het laden van data: pipelines handmatig starten, ze plannen met **triggers**, de uitvoering **monitoren** (inclusief terugrollen en resetten) en eigen flows bouwen met **master pipelines**.

De sectie heeft een eigen sub-sidebar met twee groepen: **Load management** (Run pipelines, Design master pipeline, Triggers, Integration runtimes) en **Database monitoring** (Monitoring, DWH processes, DWH queries).

:::tip Alle schermen & routes
De volledige lijst schermen met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## Run pipelines

**Route:** `/loadmanagement/runPipelines`

Start handmatig een pipeline: een tabel laden, metadata ophalen, een view materialiseren of een eigen ADF-/master-pipeline draaien. Links staat de pipeline-lijst (`PipelineList`), rechts de runs van de geselecteerde pipeline met filters op periode en status. Custom ADF-pipelines en master pipelines verschijnen ook in deze lijst.

![Run pipelines: links de pipeline-lijst, rechts de runs met filters en de knop om te starten.](/img/screens/run-pipelines.png)

*Het Run pipelines-scherm: kies links een pipeline, filter de runs op periode en status, en start de pipeline rechtsboven.*

(1) **Pipeline-lijst** links — selecteer de pipeline die je wilt draaien of inspecteren.
(2) **Datumfilter** (`runEnd`) — beperk de getoonde runs tot een periode.
(3) **Statusfilter** (No filter / Succeeded / InProgress / Failed / Cancelled). Voor de **Dynamic Workflow YRES**-pipeline verschijnen er drie extra cascaderende filters: **Source → Schema → Table**.
(4) **Runs-tabel** met per run de status, `runStart`, `runEnd` en de berekende `runtime` (`Xh Ym Zs`).
(5) **Acties per run** — link naar de ADF-monitoring, **fout bekijken** (rood `i`-icoon bij een foutmelding) en **pipeline stoppen** (bij InProgress/Queuing/Queued).
(6) **Start pipeline** — heeft de pipeline parameters, dan leest de knop **Set parameters to start** en opent een formulier waar je Source/Schema/Table en eventueel de service tier invult.

### Een pipeline handmatig starten

1. Selecteer links de pipeline (bijvoorbeeld **Dynamic Workflow YRES**).
2. Klik **Start pipeline** of **Set parameters to start**.
3. Vul, indien gevraagd, **Source / Schema / Table** in en kies optioneel een **Running tier** en **Revert-to tier**.
4. Bevestig. De run verschijnt in de runs-tabel; bij een fout open je de foutmelding via het rode `i`-icoon en spring je via de ADF-link door naar de Data Factory-monitoring.

:::note
Een lopende run kun je stoppen via het stop-icoon. Het daadwerkelijke laden gebeurt in Azure Data Factory: de pipeline kopieert de bron naar `STAGE` en roept vervolgens `[LoadManagement].[spLoadDWH]` aan; de voortgang wordt gelogd via `[Monitoring].[spWriteLoadStatus]`.
:::

## Triggers

**Route:** `/loadmanagement/triggers`

Plan een pipeline met een herhaalpatroon (een ADF schedule-trigger). Per geselecteerde pipeline zie je de bestaande triggers; je kunt ze starten, stoppen, verwijderen en aanmaken.

![Triggers: links de pipeline-lijst, rechts de triggers-tabel en het aanmaak-formulier.](/img/screens/loadmanagement-triggers.png)

*Het Triggers-scherm: kies een pipeline, bekijk de bestaande triggers en plan een nieuwe met **Create**.*

(1) **Pipeline-lijst** links — selecteer de pipeline waarvoor je triggers beheert.
(2) **Triggers-tabel** met kolommen `Name`, `status`, `frequency`, `on`, `time`, `timezone`.
(3) **Start ▶ / Stop ■** — schakel een trigger aan of uit.
(4) **Verwijderen** — wis een trigger.
(5) **Create** — opent de plan-wizard.
(6) **Info** — voor triggers met parameters (bijvoorbeeld de Dynamic Workflow met Source/Schema/Table).

### Een trigger aanmaken

1. Selecteer links een pipeline.
2. Klik **Create**.
3. Vul **Name**, **Every / interval** en **Frequency** in (`Minute(s)`, `Hour(s)`, `Day(s)`, `Week(s)`, `Month(s)`). Bij **Week(s)** kies je een **Day of the week**, bij **Month(s)** een **Day of the month** (1–31), en bij Day/Week/Month een **Time**.
4. Heeft de pipeline parameters, vul dan in de tweede stap Source/Schema/Table in.
5. Klik **Submit**.

:::info Tijdzone
De interface toont de hint *"Timezone UTC(+1) will be used"*, maar de trigger gebruikt in werkelijkheid de **tijdzone van de ingelogde gebruiker** (uit je gebruikersinstellingen), niet een vaste UTC+1.
:::

## Monitoring

**Route:** `/loadmanagement/monitoring`

Bewaak de laadstatus per doeltabel, drill door naar de losse runs en stappen, en rol terug of reset een tabel. De boom links volgt **source → schema → table**; elke tabel toont de laatste laaddatum en status. De **slechtste status bubbelt omhoog** (FAILED > RUNNING > SUCCESS) naar schema- en source-niveau, zodat mislukte loads in één oogopslag zichtbaar zijn.

![Monitoring: links de targets-boom met laadstatus, rechts de runs en het stappen-detail.](/img/screens/loadmanagement-monitoring.png)

*Het Monitoring-scherm: selecteer links een target en bekijk rechts de runs en hun stappen.*

(1) **Targets-boom** (Source / Schema / Table) met per tabel de laatste laaddatum en een status-rollup; de tooltip toont *"Failed: x | Running: y | Succeeded: z"*.
(2) **Target-header** met de geselecteerde tabel plus een **Size / Records**-regel (vanaf versie 1.53).
(3) **Reset table** — leegt de tabel na een bevestiging.
(4) **Runs-grid** met `Status`, `DateTime`, `Load type`, `Runtime`, `Copied`, `New`, `Delta`.
(5) **Acties per run** — het **info-icoon** opent de stappen-modal (rood bij FAILED) plus een ADF-link; het **klok-icoon** opent het terugrol-formulier.
(6) **Stappen-modal** met `Step`, `DateTime`, `Status`, `Log`, `Rows` uit `[Monitoring].[LS_Trans]`; bij een mislukte run staan de foutmelding en de ADF-link erboven.

### Terugrollen of resetten

- **Terugrollen** (klok-icoon op een run): zet de tabel terug naar de staat van vóór die load.
- **Reset table**: leegt de tabel volledig; bevestig in de waarschuwings-modal.

:::tip
De ruwe logregels achter dit scherm komen uit de monitoring-views `vwLoads` (tijdlijn per pipeline) en `vwMonitor` (breder, inclusief view-materialisatie en Power BI-refresh), en uit de tabellen `[Monitoring].[LS_Pipeline]` (1 regel per run) en `[Monitoring].[LS_Trans]` (1 regel per stap).
:::

## Master pipelines

**Route:** `/loadmanagement/masterPipelines` (een specifieke flow: `/loadmanagement/masterPipelines/:masterPipelineId`)

Met **master pipelines** bouw je een eigen flow door **nodes** te combineren in een visuele editor (op basis van [reactflow](https://reactflow.dev/)). Je tekent niet zelf de onderliggende ADF-activiteiten; je configureert nodes en hun verbindingen, en Yres **genereert** daaruit een ADF-pipeline (in de Data Factory-map `MasterPipelines`).

![Master pipelines: links het node-palet, in het midden het canvas met verbonden nodes en hun success/failure/completion-uitgangen.](/img/screens/loadmanagement-masterpipelines.svg)

*Het Design master pipeline-scherm: sleep node-types op het canvas, verbind hun uitgangen en publiceer de flow naar ADF.*

(1) **Node-palet** links — sleep een node-type op het canvas.
(2) **Canvas** (reactflow) — verbind nodes door vanaf een punt rechts op een node naar het punt links van een andere node te slepen; selecteer een node om hem te configureren; verwijder met **Backspace**.
(3) **Drie uitgangen** rechts op elke node: **On success** (groen), **On failure** (rood) en **On completion** (blauw). Zo bouw je logica-gestuurde flows (bijvoorbeeld: bij mislukken eerst wachten, anders doorgaan).
(4) **Ingang** links op een node — hier komen verbindingen binnen.
(5) **Kleurlegenda** van de drie uitgangen.
(6) **Save** bewaart de flow als concept; **Publish** (alleen actief ná een Save) zet de flow om naar een ADF-pipeline. De gepubliceerde pipeline is na enkele minuten zichtbaar in de Data Factory.

### Node-types

| Node | Doel | Aandachtspunten |
|---|---|---|
| **Load sources** | Voert de **Dynamic Workflow YRES**-pipeline uit voor een tabel. | Vereist source, schema en table. |
| **Alternative load** | Zoals Load sources, maar met een aanpasbaar load type. | Alleen **FULL**, **IMAGE**, **OVERWRITE**, **RELOAD** (dit is de UI-keuzeset voor een ad-hoc override, niet de volledige engine-set). |
| **Wait** | Wacht tot een bepaald tijdstip. | Houdt rekening met de tijdzone uit je gebruikersinstellingen. |
| **Change service tier** | Wijzigt de Azure SQL service tier voor de duur van de pipeline. | Onder `Standard_S3` geen Columnstore-index; onder `P1` geen in-memory tabellen. |
| **Run pipeline** | Voert een andere Yres-, custom- of master-pipeline uit. | — |
| **Refresh PowerBI** | Ververst een in Yres geconfigureerd Power BI-model. | Zie [Admin → PowerBI Models](./admin.md#powerbi-models). |
| **Persist view** | Voert de **Materialize View**-pipeline uit. | Vereist source, schema en table. |

> De lijst met node-types kan in de toekomst uitgebreid worden.

:::caution Wat is een master pipeline wél en niet
Een master pipeline laat je **bestaande Yres-bouwstenen** (loads, wachten, tier-wissels, view-materialisatie, Power BI-refresh) aan elkaar knopen met succes-/faal-/voltooid-logica. Het is **geen** vrije ADF-pipeline-designer: je ontwerpt geen losse copy-activiteiten of datatransformaties. Yres genereert de onderliggende ADF-pipeline op basis van je nodes.
:::

## Schermen & routes

| Scherm | Route |
|---|---|
| Run pipelines | `/loadmanagement/runPipelines` |
| Design master pipeline | `/loadmanagement/masterPipelines` |
| Triggers | `/loadmanagement/triggers` |
| Integration runtimes | `/loadmanagement/integration-runtimes` |
| Monitoring | `/loadmanagement/monitoring` |
| DWH processes | `/loadmanagement/datawarehouse-processes` |
| DWH queries | `/loadmanagement/datawarehouse-queries` |
| Scripted objects | `/loadmanagement/scriptedObjects` |

> Dit zijn de live, subdomein-gebonden paden uit de draaiende app. Oudere id-in-pad-routes (zoals `/loadmanagement/azuredatafactory`) zijn legacy en niet meer in gebruik.
