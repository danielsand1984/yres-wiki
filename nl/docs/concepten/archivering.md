---
sidebar_position: 4
title: Archivering
description: Hoe Yres oudere historie naar Parquet in de Data Lake wegschrijft via vwArchivingExtractor en de Dynamic Archiving Workflow YRES.
---

# Archivering

**Archivering** schrijft oudere rijen uit het history-schema (`HIS`/`ODS`) weg naar **Parquet-bestanden in de Azure Data Lake**. Zo houd je de actieve datawarehouse-database kleiner en goedkoper, terwijl de oudere historie bewaard blijft als kolomgeoriënteerde bestanden die je later nog kunt bevragen.

:::note Wat archivering wél en niet doet
Archivering **kopieert** rijen die ouder zijn dan een ingestelde grensdatum naar de Data Lake. In de huidige `Dynamic Archiving Workflow YRES` worden die rijen **niet** automatisch uit `HIS`/`ODS` verwijderd — de workflow bevat alleen een Copy-stap naar Parquet, geen delete-stap op het history-schema. Archivering is dus in de eerste plaats een **uitplaats-/back-up-mechanisme** naar de Data Lake, niet een purge.
:::

## Wanneer draait archivering?

Archivering is een **aparte workflow** (`Dynamic Archiving Workflow YRES`), los van de normale load. Hij draait wanneer je hem expliciet start:

- via een **trigger** (schema) die op deze pipeline staat, of
- via een **handmatige run** met parameters (`Source`, `Schema`, `Table`).

Het is dus **geen onderdeel van elke load**: een reguliere load (`Dynamic Workflow YRES`) raakt de Data Lake-archieven niet. Archivering is een geplande, terugkerende opschoonactie die je los inricht.

## Hoe het werkt (op hoofdlijnen)

```
Trigger / handmatige run  (Source, Schema, Table, RunningTier, RevertToTier)
  → WLS Start workflow                 → [Monitoring].[spWriteLoadStatus]  (Process = 'Archiving Workflow')
  → (optioneel) Set DB Tier            → schaal de database tijdelijk op
  → Get tables (Lookup)                → SELECT … FROM [LoadManagement].[vwExtractor]
                                          WHERE [ArchivingScript] IS NOT NULL
  → ForEach "Load data" (parallel, batchCount 3), per tabel:
        WLS Start DL Archiving load    → spWriteLoadStatus  (Process = 'Archiving')
        Copy data                      → run [ArchivingScript] (een SELECT uit HIS)
                                          → Parquet in de Data Lake (AzureDataLakeStorage_MAIN)
        WLS End DL load                → spWriteLoadStatus
  → (optioneel) Set DB Tier Back       → schaal de database terug
  → WLS End Workflow                   → spWriteLoadStatus
```

De kern: de **SQL-database bepaalt wat gearchiveerd wordt** (via een view), en ADF voert alleen de Copy-opdracht naar de Data Lake uit. Net als bij een gewone load is ADF een generieke uitvoerder; de logica zit in SQL.

### Het archiveer-script komt uit een view

Welke rijen voor archivering in aanmerking komen, wordt berekend in **`[LoadManagement].[vwArchivingExtractor]`**. Die view bouwt per tabel een **`ArchivingDeltaScript`**: een `SELECT * FROM <HIS-schema>.<Target> WHERE …` met een filter op de grensdatum.

- Voor **DELTA**-tabellen filtert het script op de **deltakolom**: `WHERE [DeltaColumn] < [ArchivingDate]` (met een datatype-afhankelijke cast naar `date`/`datetime`/`datetime2`/etc.).
- Voor de overige tabellen filtert het op de laaddatum: `WHERE ETL_DATE < [ArchivingDate]`.

Het uiteindelijke script wordt aan ADF aangeboden via de kolom **`[ArchivingScript]`** op de contractview `[LoadManagement].[vwExtractor]`. De archiveer-workflow haalt alleen de tabellen op waarvoor dit script gevuld is (`WHERE [ArchivingScript] IS NOT NULL`); tabellen zonder grensdatum doen niet mee.

## De grensdatum bepalen

Per tabel wordt de grensdatum (`ArchivingDate`) als volgt bepaald (zie `vwArchivingExtractor`):

1. **Per-tabel override** — de kolom `LoadManagement.UsedTables.ArchivingClause`. Staat hier een waarde, dan telt die.
2. **Standaardinstellingen** — anders geldt: als het load type van de tabel voorkomt in de instelling **`DefaultArchivingLoadtypes`** (een komma-gescheiden lijst), dan wordt de grensdatum **`DefaultArchivingDate`** gebruikt.
3. **Geen archivering** — voldoet de tabel aan geen van beide, dan blijft `ArchivingDate` leeg en wordt de tabel overgeslagen.

Zo activeer je archivering breed met twee instellingen (welke load types, vanaf welke datum), terwijl je per tabel kunt afwijken via `ArchivingClause`.

### De instellingen

| Instelling | Wat het regelt | Type |
|---|---|---|
| **`DefaultArchivingDate`** | De grensdatum: rijen ouder dan deze datum komen in aanmerking voor archivering. | Code-instelling in `[Config].[Settings]` |
| **`DefaultArchivingLoadtypes`** | Komma-gescheiden lijst van load types waarvoor de standaard-grensdatum geldt. | Code-instelling in `[Config].[Settings]` |

Beide instellingen worden in de datawarehouse-code **gelezen** (door `vwArchivingExtractor`), maar staan niet in de standaard-seed (`Script.PostDeployment.sql`) en niet in de gebruikershandleiding. Ze worden naar verwachting door de webapp (control plane) gevuld.

:::info Te bevestigen
Wie en wanneer `DefaultArchivingDate` en `DefaultArchivingLoadtypes` worden ingevuld is niet vast te stellen uit de datawarehouse-repository: de waarden worden in de database *gelezen* maar daar niet *geseed*. Vermoedelijk gebeurt dat vanuit de webapp bij provisioning of configuratie. Bevestig de exacte herkomst en het beheerproces voordat je klanten instrueert deze instellingen zelf aan te passen.
:::

## Wat er in de Data Lake landt

De `Copy data`-stap schrijft het resultaat van het `ArchivingScript` weg als **Parquet** naar de dataset `AzureDataLakeStorage_MAIN`, gepartitioneerd op:

```
<Source> / <TargetSchema> / <Target> / <jaar> / <maand>
```

Het jaar en de maand komen uit het moment van de archiveer-run (`utcnow()`). De geëxporteerde rijen behouden de SCD2-framework­kolommen (`KeyHash`, `RowHash`, `ETL_Date`), zodat de Parquet-historie dezelfde structuur heeft als de bron in `HIS`.

## Parameters van de workflow

`Dynamic Archiving Workflow YRES` accepteert dezelfde scope- en tier-parameters als de gewone load:

| Parameter | Standaard | Betekenis |
|---|---|---|
| `Source` | `ALL` | Beperk tot één bronsysteem (of `ALL` voor alle, of `AUTO` voor de tabellen die aan déze trigger gekoppeld zijn). |
| `Schema` | `ALL` | Beperk tot één bronschema. |
| `Table` | `ALL` | Beperk tot één tabel. |
| `RunningTier` | `Current` | Schaal de database tijdelijk naar deze tier tijdens de run (`Current` = niet schalen). |
| `RevertToTier` | `Previous` | Tier waarnaar na afloop wordt teruggeschaald. |

De `ForEach` over de tabellen draait parallel met `batchCount: 3`; de pipeline zelf heeft `concurrency: 1` (er draait nooit meer dan één archiveer-workflow tegelijk).

## Monitoring

Elke stap logt via **`[Monitoring].[spWriteLoadStatus]`**, net als een gewone load — maar met `Process = 'Archiving Workflow'` (op workflow-niveau) en `Process = 'Archiving'` (per tabel). Je vindt de runs dus terug in de monitoring-views (`vwLoads`, `vwMonitor`) en op het monitoring-scherm in de webapp. Mislukt een tabel, dan schrijft de workflow `Status = FAILED` weg met de foutcontext.

## Verschil met de load types

Archivering staat **los van** de [load types](./load-types.md). Een load type bepaalt wat er bij het laden met de history-tabel gebeurt; archivering bepaalt wat er met *oude* rijen uit die history-tabel gebeurt (wegschrijven naar de Data Lake). Let in het bijzonder op:

- **OVERWRITE** wist de history bij élke load (truncate, geen historie) — daar valt dus weinig te archiveren.
- **FULL**, **DELTA**, **IMAGE**, **RELOAD** en de andere types bouwen wél SCD2-historie op; juist die tabellen profiteren van archivering om de database klein te houden.

Zie ook [Load types](./load-types.md), de [begrippenlijst](./glossary.md) en [Views & pipelines](../setup/views-pipelines.md).
