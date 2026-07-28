---
sidebar_position: 3
title: Gegevensstroom
description: Hoe één load van trigger tot gehistoriseerde data loopt — vwExtractor stuurt, ADF verplaatst bytes, SQL doet de SCD2-merge.
---

# Gegevensstroom

Deze pagina beschrijft hoe Yres **één load** uitvoert: van het moment dat een pipeline start tot het moment dat de data gehistoriseerd in het datawarehouse staat. Het is de rode draad onder alle andere concepten — wie deze stroom begrijpt, begrijpt waarom een [load type](./load-types.md) doet wat het doet en waar [monitoring](../frontend/load-management.md) zijn cijfers vandaan haalt.

## Het kernidee: metadata stuurt, code is generiek

Niets over de tabellen van een specifieke klant is hardcoded in ADF of in SQL. De databank publiceert via één view **"hier is elke tabel die geladen moet worden, met al zijn parameters"**; ADF leest die view, waaiert uit, kopieert bytes naar de stagingtabel en roept SQL terug aan om de echte merge te doen.

> **Een bron toevoegen = metadata-rijen invoegen, geen pipeline schrijven.**

- De contract-view is **`[LoadManagement].[vwExtractor]`**. Die is een one-liner pass-through: `SELECT * FROM [LoadManagement].[fxExtractor](NULL,NULL)`.
- Alle logica zit dus in de table-valued functie **`[LoadManagement].[fxExtractor]`** (`(@LoadFilter, @LoadType)` — slechts twee parameters). Elke rij die `fxExtractor` teruggeeft is **één tabel om te laden**, met alle parameters die ADF stroomafwaarts doorgeeft: het load type, het kant-en-klare `DeltaScript`, de doel-schemanamen, file-/parse-opties en de paginatie-instellingen.

:::tip Onthoud
ADF is een **generieke executor**. De load-logica leeft volledig in SQL. ADF verplaatst alleen bytes naar `STAGE.<Target>` en roept dan een stored procedure aan.
:::

## De stroom in één oogopslag

De gezaghebbende orchestrator is de pipeline **`Dynamic Workflow YRES`** (op oudere versies heet die nog `Dynamic Workflow IRIS`). Hij krijgt parameters mee — `Source`, `Schema`, `Table`, `LoadType`, `RunningTier`, `RevertToTier` — en doorloopt de volgende stappen.

```text
 Trigger / handmatige run / web-app-aanroep
   params: Source, Schema, Table, LoadType, RunningTier, RevertToTier
        │
        ▼
 Dynamic Workflow YRES
   1. WLS Start workflow        →  [Monitoring].[spWriteLoadStatus]        (start loggen)
   2. (optioneel) DB opschalen  →  [Config].[spSetDatabaseServiceTier]     (alleen als een tier is meegegeven)
   3. Get tables (Lookup)       →  [LoadManagement].[spPrepareWorkload]
                                       └→ vwExtractor → fxExtractor         (welke tabellen + parameters?)
   4. ForEach "Load data"  (parallel, batchCount 5)  — per tabel:
        ├─ Orchestration - Hub  →  Orchestration - Switch 1 (switch op Source)
        │        └→ Dynamic Pipeline YRES - <Source>
        │              bron → Copy → STAGE.<Target>     (ADF verplaatst alleen bytes)
        ├─ Prepare lake load    →  [LoadManagement].[spLoadLake]        (optioneel: DataPlatform bevat DL)
        ├─ Load DWH             →  [LoadManagement].[spLoadDWH]
        │        └→ [LoadManagement].[spHIS_InsertAndUpdate]   (STAGE → HIS, SCD2-merge)
        ├─ Write lake feed      →  [LoadManagement].[spGetLakeFeed] → Copy → Parquet change feed
        │                          (parallel aan Load DWH; alleen als er mutaties zijn)
        ├─ STAGE truncaten      →  [LoadManagement].[spSTAGE_TruncateTable] (overgeslagen bij keepStage=1)
        └─ WLS End load         →  [Monitoring].[spWriteLoadStatus]         (status per stap)
   5. Materialize Views         →  [LoadManagement].[spMaterializeViews]
   6. (optioneel) DB terugschalen
   7. WLS End Workflow          →  [Monitoring].[spWriteLoadStatus]         (afsluiten + reconciliëren)
```

## Stap voor stap

1. **Start van de workflow.** `WLS Start workflow` roept **`[Monitoring].[spWriteLoadStatus]`** aan. Dat opent een rij in `Monitoring.LS_Pipeline` (één rij per run) en logt de eerste stap in `Monitoring.LS_Trans` (één rij per stap).
2. **Optioneel opschalen.** Als de run een hogere service tier meekrijgt, schaalt **`[Config].[spSetDatabaseServiceTier]`** de Azure SQL-database tijdelijk op voor zwaarder werk.
3. **Werklijst ophalen.** Een Lookup roept **`[LoadManagement].[spPrepareWorkload]`** aan, die via `vwExtractor` → `fxExtractor` de lijst van te laden tabellen teruggeeft. Elke rij draagt alle laadparameters.
4. **Per tabel laden (ForEach).** De `ForEach`-activiteit "Load data" draait **parallel** (`batchCount` 5). Per tabel gebeurt het volgende:
   - **Bron → STAGE.** `Orchestration - Hub` → `Orchestration - Switch 1` schakelt op de waarde van `Source` en start de juiste bronpipeline `Dynamic Pipeline YRES - <Source>`. Die voert één `Copy`-activiteit uit die de brondata **letterlijk kopieert** naar `STAGE.<Target>`, met een `ETL_Date`-kolom erbij. *ADF verplaatst hier alleen bytes.*
   - **STAGE → HIS.** `Load DWH` roept **`[LoadManagement].[spLoadDWH]`** aan, een dunne pass-through naar **`[LoadManagement].[spHIS_InsertAndUpdate]`**. Deze procedure doet de echte, set-based **SCD2-merge** van `STAGE` naar de history-laag (zie [SCD2 & hashing](#scd2-de-historie-laag) hieronder).
   - **Optioneel naar de Data Lake.** Staat de tabel ook op het Data-Lake-platform (`DataPlatform` bevat `DL`), dan bepaalt `Prepare lake load` vooraf welke rijen er in deze run muteren en schrijft `Write lake feed` die mutaties als **Parquet change feed** weg — parallel aan `Load DWH`, en alleen als er daadwerkelijk iets gewijzigd is. Zie [Lake feed](./lake-feed.md).
   - **STAGE opruimen.** **`[LoadManagement].[spSTAGE_TruncateTable]`** leegt de stagingtabel — **tenzij** `keepStage=1` voor die tabel staat, dan blijft STAGE bewaard.
   - **Status loggen.** `WLS End load` schrijft via `spWriteLoadStatus` de status (`RUNNING` / `SUCCEEDED` / `FAILED`) en de rij-aantallen per stap weg.
5. **Views materialiseren.** Na alle tabellen draait **`[LoadManagement].[spMaterializeViews]`** om persisted/reporting-views bij te werken.
6. **Optioneel terugschalen.** Als er was opgeschaald, zet `Set DB Tier Back` de database terug op de basistier.
7. **Afsluiten.** `WLS End Workflow` sluit de run af, reconcilieert eventuele achtergebleven statussen en schrijft de eindstatus weg.

:::info ADF verplaatst bytes, SQL doet de load
De enige plek waar Yres data daadwerkelijk *verplaatst* is de ADF `Copy`-activiteit (bron → `STAGE`, en optioneel de mutaties → Parquet). Alle **logica** — wat nieuw is, wat gewijzigd is, wat afgesloten moet worden, hoe historie wordt opgebouwd — zit in de SQL-procedure `spHIS_InsertAndUpdate`. Dat is de strakke scheiding tussen orkestratie en logica.
:::

## SCD2: de historie-laag

`spLoadDWH` is een **pure pass-through** naar `spHIS_InsertAndUpdate` (de oude aanroep van `spUpdateETL_EndDate` staat uitgecommentarieerd — het afsluiten van versies gebeurt nu binnen `spHIS_InsertAndUpdate` zelf). Wat de merge precies doet hangt af van het [load type](./load-types.md), maar het mechanisme is voor alle types hetzelfde **SCD2**-model (Slowly Changing Dimension type 2):

- Op `STAGE` staan twee **persisted computed columns**, `KeyHash` en `RowHash` (`varbinary(66)`, via `HASHBYTES('SHA2_512', …)`). `KeyHash` is berekend over de **sleutelkolommen**, `RowHash` over de **wijzigingsgevoelige kolommen**.
- De match-join is `STAGE.Keyhash = HIS.Keyhash AND HIS.isCurrent = 1`; een rij is **gewijzigd** als bovendien `STAGE.Rowhash <> HIS.Rowhash`. Een kolom met `Rowhash = 0` telt **niet** mee in de wijzigingsdetectie.
- Elke history-rij krijgt `ETL_Date` (laadtijdstip) en `ETL_EndDate`. Een open (actuele) versie heeft de sentinel **`'2999-01-01 00:00:00'`** en `IsCurrent = 1`. Wordt een rij gewijzigd, dan wordt de oude versie afgesloten (`IsCurrent = 0`, `ETL_EndDate` = het nieuwe `ETL_Date`) en komt er een nieuwe actuele versie bij.

:::caution FULL behoudt historie
**FULL** is een history-bewarende SCD2-upsert: nieuwe records worden ingevoegd, gewijzigde records krijgen een nieuwe versie (de oude wordt afgesloten), en records die in deze batch ontbreken blijven gewoon open staan. Alleen **OVERWRITE** wist historie (truncate van HIS); **RELOAD** sluit de oude generatie af maar **behoudt** die als historie. Zie [Load types](./load-types.md) voor de volledige tabel.
:::

## Varianten van de workflow

| Pipeline | Wanneer |
|---|---|
| **`Dynamic Workflow YRES`** | Standaard: ontdekt via `vwExtractor` welke tabellen te laden zijn en laadt ze in een `ForEach`-lus. |
| **`Direct Workflow YRES`** | Laadt één specifiek doel, zonder de ontdekkings-lus. |
| **`Dynamic Archiving Workflow YRES`** | [Archivering](./archivering.md): kopieert oude historie geverifieerd naar Parquet en schoont daarna op, gestuurd door het `ArchivingScript` op `vwExtractor`. |

:::note Code-eigenaardigheid
In `Orchestration - Switch 1` verwijst de `Oracle`-case naar de pipeline `Dynamic Pipeline YRES - MySql` — Oracle wordt dus via de MySql-ingestiepipeline afgehandeld.
:::

## Waar je de stroom terugziet

Elke ADF-stap roept `spWriteLoadStatus` aan, dat in drie tabellen logt:

- **`Monitoring.LS_Pipeline`** — één rij per run.
- **`Monitoring.LS_Trans`** — één rij per stap (status + rij-aantallen + log).
- **`LoadManagement.LoadLog`** — één duurzame rij per tabel-load (status, start/eind, config-snapshot).

Voor analyse zijn er **monitoring-views**: **`vwLoads`** (tijdlijn per pipeline) en **`vwMonitor`** (breder, inclusief view-materialisatie en Power BI-refresh). De systeemchecks staan in **`[Maintenance].[vwYresChecks]`** (de bronfile heet nog `vwIrisChecks.sql`).

In de frontend zie je dit terug op het scherm **Load management → Monitoring**:

![Yres Monitoring-scherm met targets-tree links, runs-grid in het midden en een steps-modal onderaan](/img/screens/loadmanagement-monitoring.png)

*Het Monitoring-scherm leest direct uit `Monitoring.LS_Trans`; bij een mislukte run verschijnen de foutmelding en een link naar de ADF-run boven het overzicht.*

1. **Targets-tree** — Source / Schema / Table met een status-rollup per niveau.
2. **Geselecteerd doel** met een samenvatting van grootte en aantal records.
3. **Reset table** — zet de tabel terug (met bevestiging).
4. **Runs-grid** — per run: Status, DateTime, Load type, Runtime, Copied, New en Delta.
5. **Per-run-acties** — het info-icoon opent de stappen-modal; het klok-icoon start een rollback.
6. **Stappen-modal** — Step / DateTime / Status / Log / Rows per stap binnen de run.

## Zie ook

- [Load types](./load-types.md) — wat elk type met de doeltabel doet.
- [Yres uitgelegd](./yres-uitgelegd.md) — het platform in gewone taal.
- [Begrippenlijst](./glossary.md) — terminologie (HIS, STAGE, ODS, Dictionary, …).
- [Databron koppelen & laden](../setup/databron-koppelen.md) — een bron toevoegen en laden.
