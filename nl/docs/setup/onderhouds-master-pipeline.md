---
sidebar_position: 5
title: Onderhoud plannen met een master pipeline
description: Bundel de periodieke onderhoudstaken — garbage collection, logretentie, archivering en index-onderhoud — in één master pipeline met één trigger.
---

# Onderhoud plannen met een master pipeline

Naast het laden van data kent een Yres-omgeving een handvol **periodieke onderhoudstaken**: de monitor synchroniseren met de werkelijke ADF-runstatussen, oude logregels opruimen, historie archiveren en indexen defragmenteren. Yres levert die taken als losse technische pipelines mee. Je kunt ze stuk voor stuk met een eigen trigger inplannen, maar overzichtelijker is één **onderhouds-master pipeline** die ze in de juiste volgorde na elkaar draait — met één wekelijkse trigger en één run in de historie.

Deze pagina laat zien welke bouwstenen er zijn, in welke volgorde je ze zet en hoe je het geheel inplant. De algemene walkthrough van de master pipeline-editor staat in [Views, pipelines & triggers](./views-pipelines.md#een-master-pipeline-opzetten); hier passen we hem toe op onderhoud.

## De periodieke taken

| Pipeline | Wat hij doet | Parameters (standaard) |
|---|---|---|
| `GarbageCollection` | Haalt de recente pipeline-runs van de factory op via de Azure Management API en schrijft ze naar `[Monitoring].[AdfLoadMonitor]`, zodat blijven-hangen `RUNNING`-statussen in de monitor worden gecorrigeerd. | geen |
| `Maintenance Retention YRES` | Past het retentiebeleid uit `[Monitoring].[RetentionPolicy]` toe: verwijdert gebatcht logregels ouder dan de bewaartermijn, via `[Maintenance].[spApplyRetentionPolicy]`. Zie [Retentie van de logtabellen](../referentie/monitoring-logging.md#retentie-van-de-logtabellen). | `DryRun` (`false`), `BatchSize` (`100000`) |
| `Dynamic Archiving Workflow YRES` | Kopieert oude historie geverifieerd naar Parquet in het archief en schoont `HIS` daarna op — zie [Archivering](../concepten/archivering.md). Draait alleen iets voor tabellen waar archivering geconfigureerd is. | `Source`/`Schema`/`Table` (`ALL`), `RunningTier` (`Current`), `RevertToTier` (`Previous`) |
| `AdaptiveIndexDefragmentation` | Defragmenteert of herbouwt indexen binnen een tijdslimiet via `[Maintenance].[spAdaptiveIndexDefrag]`, en draait daarna `[Config].[spCompareMetadata]` om verschillen tussen dictionary en database te signaleren. | o.a. `timeLimit` (`480` min), `minFragmentation` (`5`), `rebuildThreshold` (`30`), `minPageCount` (`8`) |

Alle vier loggen hun voortgang en fouten via `[Monitoring].[spWriteLoadStatus]`, dus elke stap is achteraf terug te zien in **Load Management → Monitoring**.

## Welke volgorde?

Een volgorde die in de praktijk goed werkt:

1. **`GarbageCollection`** eerst — zo start het onderhoud met een monitor die klopt, en zijn hangende `RUNNING`-statussen alvast gecorrigeerd voordat de retentie gaat opruimen.
2. **`Maintenance Retention YRES`** — ruimt de logtabellen op volgens het retentiebeleid.
3. **`Dynamic Archiving Workflow YRES`** — verplaatst oude historie naar het archief en schoont `HIS` op.
4. **`AdaptiveIndexDefragmentation`** als laatste — retentie en archivering verwijderen veel rijen; het index-onderhoud ruimt de fragmentatie die daardoor ontstaat direct weer op.

Plan het geheel **buiten de laadvensters** (bijvoorbeeld zondagnacht): het index-onderhoud en de opschoonstappen concurreren anders met lopende loads om dezelfde tabellen.

## Stappen

1. Open **Load Management → Design master pipeline** en maak een nieuwe flow aan.
2. Sleep vier **Run pipeline**-nodes op het canvas en kies per node de pipeline uit de tabel hierboven (een Run pipeline-node kan elke Yres-, custom- of master-pipeline starten).
3. **Verbind** de nodes in de volgorde van hierboven. Kies de uitgang bewust:
   - **On success** (groen) waar een stap alleen zinvol is als de vorige slaagde;
   - **On completion** (blauw) waar het onderhoud gewoon door moet, ook als een eerdere stap faalde — voor deze vier taken is dat meestal de beste keus, omdat ze inhoudelijk onafhankelijk zijn en een gefaalde stap tóch als `FAILED` in de monitoring belandt.
4. Vul per node de **parameters** in (of houd de standaardwaarden aan).
5. Klik **Save** en daarna **Publish**. De gegenereerde pipeline verschijnt na enkele minuten in de Data Factory (map `MasterPipelines`) en in **Run pipelines**.
6. **Test** de master pipeline één keer handmatig via **Run pipelines** en controleer de stappen in **Monitoring**.
7. Maak onder **Load Management → Triggers** een **wekelijkse trigger** op de master pipeline aan, bijvoorbeeld elke zondag om 03:00 — zie [Triggers plannen](./views-pipelines.md#triggers-plannen) (let op de tijdzone-opmerking daar).

:::warning Niet dubbel plannen
Voor de logretentie levert Yres ook een eigen wekelijkse trigger **`Retention`** mee (zondag 03:00, uitgeleverd in gestopte staat). Neem je `Maintenance Retention YRES` op in je onderhouds-master pipeline, laat die `Retention`-trigger dan **uit** staan — anders draait de opschoning dubbel.
:::

:::note Aandachtspunten
- **Eerst simuleren:** draai `Maintenance Retention YRES` vóór de eerste echte run één keer los met `DryRun = true`. Je ziet dan per tabel hoeveel rijen verwijderd zóuden worden, zonder dat er iets weggaat.
- **Archivering draait nooit dubbel:** de archiveringsworkflow staat op `concurrency: 1` — start je master pipeline terwijl er al een archiveringsrun loopt, dan wacht die stap.
- **Tijdslimiet index-onderhoud:** `timeLimit` (standaard 480 minuten) is een bovengrens, geen verwachte duur; de procedure stopt netjes zodra de limiet nadert. Verklein hem als je onderhoudsvenster korter is.
- **Tier-parameters:** de archiveringsworkflow kan de database tijdens de run tijdelijk opschalen (`RunningTier`/`RevertToTier`) — handig als het archiveren op de normale tier te lang duurt.
:::

## Alternatief: een eigen ADF-pipeline

Werk je liever rechtstreeks in Azure Data Factory, dan kun je dezelfde keten ook bouwen als eigen pipeline met **Execute Pipeline**-activiteiten en er een ADF-trigger op zetten. Zet zo'n handgemaakte pipeline in de map **`custom pipelines`** — die map is gereserveerd voor eigen werk en blijft naast de door Yres beheerde pipelines bestaan. De pipeline verschijnt daarna gewoon in **Run pipelines** in de webapp.

## Verder lezen

- [Views, pipelines & triggers](./views-pipelines.md) — de algemene walkthrough voor master pipelines en triggers.
- [Load Management → Master pipelines](../frontend/load-management.md#master-pipelines) — alle node-types en hun aandachtspunten.
- [Archivering](../concepten/archivering.md) — wat de archiveringsworkflow precies doet en hoe je hem configureert.
- [Monitoring & logging → Retentie van de logtabellen](../referentie/monitoring-logging.md#retentie-van-de-logtabellen) — het retentiebeleid en de beschermregels.
