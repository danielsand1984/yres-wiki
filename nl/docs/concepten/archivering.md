---
sidebar_position: 4
title: Archivering
description: Hoe Yres oudere historie geverifieerd naar Parquet in de Data Lake verplaatst — kopiëren, controleren, opschonen — en live + archief als één geheel toont.
---

# Archivering

**Archivering** verplaatst oudere rijen uit het history-schema (`HIS`/`ODS`) naar **Parquet-bestanden in de Azure Data Lake**. Zo blijft de actieve datawarehouse-database klein en goedkoop, terwijl de oudere historie bewaard blijft als kolomgeoriënteerde bestanden — en via een automatisch onderhouden **union-view** gewoon meequeryt met de live tabel.

Archivering werkt in drie stappen per tabel, binnen één run van de `Dynamic Archiving Workflow YRES`:

1. **Kopiëren** — de rijen die aan de archiveringsregel voldoen gaan als Parquet naar het `archive/`-pad in de Data Lake.
2. **Verifiëren & opschonen (purge)** — `[LoadManagement].[spArchivePurge]` telt de rijen die *nu* aan de regel voldoen en verwijdert ze **alleen bij een exacte match** met het aantal gekopieerde rijen. Wijkt de telling af (er is tussendoor geladen), dan wordt er **niets** verwijderd en kun je de run veilig opnieuw draaien.
3. **Union-view verversen** — `[LoadManagement].[spArchiveMaintainView]` genereert per tabel de view `[<HIS-schema>].[<Target>_IncArchive]` die de live tabel en de gearchiveerde Parquet-bestanden als één geheel toont.

:::tip Eerst proefdraaien, dan pas opschonen
De purge staat standaard **uit** (instelling `ArchivingPurgeEnabled = 0`). In die stand kopieert de workflow alleen naar de Data Lake en wordt er niets verwijderd — ideaal om de configuratie en de Parquet-uitvoer te controleren. Zet daarna `ArchivingPurgeEnabled` op `1` (én `AllowDeletesFromDB` op `1` — een dubbele beveiliging) om echt op te schonen.
:::

## Twee archiveringsmodi per tabel

Archivering is **opt-in per tabel** en kent twee modi, ingesteld op `LoadManagement.UsedTables` (via `spMaintainTable`):

| Modus | Wat wordt gearchiveerd | Typisch gebruik |
|---|---|---|
| **`CLOSED`** | Alleen **afgesloten SCD2-versies**: rijen met `isCurrent = 0` waarvan de `ETL_EndDate` ouder is dan de bewaartermijn. De actuele rij blijft altijd in de database. | Historie-opschoning zonder functioneel effect: de actuele stand blijft compleet. |
| **`BUSINESS`** | **Echte data** op basis van een **datumkolom in de dataset** (de `ArchivingColumn`), bv. facturen ouder dan 10 jaar — inclusief actuele rijen. | Wettelijke/functionele retentie: "alles ouder dan X jaar mag het datawarehouse uit". |

De configuratiekolommen:

| Kolom (`UsedTables`) | Betekenis |
|---|---|
| `ArchivingMode` | `NULL` = uit, `CLOSED` of `BUSINESS`. |
| `ArchivingColumn` | Alleen bij `BUSINESS`: de datasetkolom met de businessdatum (moet in de Dictionary bestaan). |
| `ArchivingRetention` + `ArchivingRetentionUnit` | De bewaartermijn: een aantal `YEAR` / `MONTH` / `DAY` (bv. `10` + `YEAR`). |
| `ArchivingClause` | Geavanceerd: een vrije WHERE-clausule die de modus **overstemt** — voor uitzonderingsgevallen zoals een Unix-timestampkolom. Bij `BUSINESS` mag zo'n clausule alleen datakolommen gebruiken (geen `ETL_*`/`isCurrent`). |

Uit die configuratie bouwt de function **`[LoadManagement].[fxArchivingPredicate]`** één archiveringsconditie, met de grensdatum als **vaste literal** — zodat de kopieer- en opschoonstap binnen één run gegarandeerd exact dezelfde regel gebruiken. Het resultaat verschijnt als **`ArchivingScript`** (`FROM <HIS-schema>.<Target> WHERE <conditie>`) op de contractview `[LoadManagement].[vwExtractor]`; de workflow pakt alleen tabellen waar dit script gevuld is.

:::note Gearchiveerde data komt niet terug (BUSINESS)
Bij `BUSINESS`-archivering kan een verwijderde rij nog in het bronsysteem bestaan. Daarom **blokkeert de laadmachine** (`spHIS_InsertAndUpdate`) bij deze modus alle binnenkomende rijen die in de "gearchiveerde ruimte" vallen (businessdatum ouder dan de grens): ze bereiken `HIS` nooit meer, ook niet via een FULL- of IMAGE-load. Het aantal geblokkeerde rijen wordt per load gelogd (`Blocked archived-space rows in page` in de monitoring). Tip: zet het `LoadFilter` van zo'n tabel gelijk aan de archiveringsgrens, dan haalt de bron-extractie die oude data ook niet meer op. `CLOSED` heeft deze blokkering niet nodig: de actuele rij blijft immers gewoon in de database staan.
:::

## Wanneer draait archivering?

Archivering is een **aparte workflow** (`Dynamic Archiving Workflow YRES`), los van de normale load. Hij draait wanneer je hem expliciet start — handmatig of via een eigen trigger — met dezelfde scope- en tierparameters als de gewone load:

| Parameter | Standaard | Betekenis |
|---|---|---|
| `Source` / `Schema` / `Table` | `ALL` | Beperk de run tot één bron, schema of tabel. |
| `RunningTier` | `Current` | Schaal de database tijdelijk op tijdens de run. |
| `RevertToTier` | `Previous` | Tier waarnaar na afloop wordt teruggeschaald. |

De `ForEach` over de tabellen draait parallel (`batchCount: 3`); de pipeline zelf heeft `concurrency: 1` — er draait nooit meer dan één archiveer-workflow tegelijk.

## Hoe het werkt (op hoofdlijnen)

```
Handmatige run / trigger  (Source, Schema, Table, RunningTier, RevertToTier)
  → (optioneel) Set DB Tier          → schaal de database tijdelijk op
  → Get tables (Lookup)              → SELECT … FROM [LoadManagement].[vwExtractor]
                                        WHERE [ArchivingScript] IS NOT NULL
  → ForEach per tabel (parallel):
        Copy data                    → 'SELECT * ' + ArchivingScript
                                        → Parquet op archive/… (AzureDataLakeStorage_ARCHIVE)
        Purge archived rows          → [LoadManagement].[spArchivePurge]
                                        telt opnieuw; verwijdert alleen bij exacte match,
                                        gefaseerd (batches), dubbel gegate door instellingen
        Maintain archive view        → [LoadManagement].[spArchiveMaintainView]
                                        ververst de <Target>_IncArchive-unionview
  → (optioneel) Set DB Tier Back     → schaal de database terug
```

Net als bij een gewone load is ADF de generieke uitvoerder en zit de logica in SQL: het `ArchivingScript` begint bewust met `FROM`, zodat er zowel een `SELECT *` (kopiëren) als een `DELETE` (opschonen) vóór geplakt kan worden — beide draaien daardoor op **exact dezelfde** rijenselectie.

## Wat er in de Data Lake landt

De Copy-stap schrijft het resultaat als **Parquet** naar een eigen archiefpad (dataset `AzureDataLakeStorage_ARCHIVE`), gescheiden van de gewone Data Lake-loads:

```
archive / <Source> / <TargetSchema> / <Target> / <jaar> / <maand> / <Target>-<timestamp>.parquet
```

De geëxporteerde rijen behouden alle SCD2-frameworkkolommen (`KeyHash`, `RowHash`, `ETL_Date`, `ETL_EndDate`, `isCurrent` en de `RowID`), zodat het archief dezelfde structuur heeft als de bron in `HIS`.

## Live + archief als één geheel: de `_IncArchive`-views

Na elke geslaagde kopie ververst `spArchiveMaintainView` per tabel de view **`[<HIS-schema>].[<Target>_IncArchive>`**: een `UNION ALL` van de live tabel en de gearchiveerde Parquet-bestanden, gelezen met **Azure SQL data virtualization** (`OPENROWSET` over een external data source op de Data Lake). Afnemers die ook de gearchiveerde historie nodig hebben, bevragen simpelweg deze view in plaats van de tabel.

- De view **dedupliceert** op de interne `RowID` met voorrang voor de live rij — een proefrun in copy-only-modus of een herstart kan dezelfde rijen immers twee keer in het archief zetten.
- De kolomlijst en datatypes worden bij elke archiveringsrun **opnieuw gegenereerd** uit de live tabel, dus kolomwijzigingen volgen vanzelf.
- View-onderhoud kan archivering **nooit blokkeren**: lukt het niet (bv. rechten nog niet ingericht), dan wordt dat gelogd en gaat de archivering gewoon door. De view verschijnt automatisch bij de eerstvolgende run nadat het probleem is opgelost.

:::caution Rechten voor de union-views
De views lezen het Data Lake rechtstreeks vanuit SQL. Daarvoor moet eenmalig per omgeving zijn ingericht: een **system-assigned managed identity op de logical SQL-server**, **Storage Blob Data Reader** voor die identity op de Data Lake-container, en de instelling **`ArchiveLakeLocation`** (`adls://<container>@<account>.dfs.core.windows.net`). Zolang dat niet gebeurd is, werkt archiveren zelf gewoon — alleen de views worden overgeslagen (met een melding in de monitoring). Data virtualization is een preview-feature van Azure SQL Database.
:::

## De instellingen

| Instelling (`[Config].[Settings]`) | Standaard | Wat het regelt |
|---|---|---|
| **`ArchivingPurgeEnabled`** | `0` (Nee) | Hoofdschakelaar van de opschoonstap. `0` = alleen kopiëren (proefdraaien), `1` = na geverifieerde kopie ook verwijderen uit `HIS`. |
| **`AllowDeletesFromDB`** | bestaand | Moet óók `1` zijn voordat de purge iets verwijdert (dubbele beveiliging). |
| **`ArchiveLakeLocation`** | leeg | `adls://…`-locatie van de Data Lake voor de union-views; wordt door provisioning gevuld. Leeg = views worden overgeslagen. |

De **[health checks](../referentie/monitoring-logging.md)** (`vwYresChecks`, groep 7) bewaken de configuratie: `BUSINESS` zonder datumkolom, een `ArchivingColumn` die niet in de Dictionary bestaat, een ontbrekende bewaartermijn, een clausule op `ETL_`-kolommen en een purge die aanstaat terwijl `AllowDeletesFromDB` uit staat, worden allemaal gesignaleerd.

:::note Vervallen: settings-gestuurde standaard-archivering
Oudere versies bevatten een alternatieve opzet (`vwArchivingExtractor` met de instellingen `DefaultArchivingDate`/`DefaultArchivingLoadtypes`) die automatisch alle DELTA-tabellen zou archiveren. Sinds v1.56 is archivering bewust een expliciete keuze per tabel; de deploy ruimt de oude view en instellingen zelf op.
:::

## Monitoring

Archiveringsruns verschijnen in de gewone monitoringschermen: de stappen per tabel loggen als `Process = 'load'` (zichtbaar in `vwLoads`/`vwMonitor`, met de HIS-tabel als target) en de workflowstappen als `Process = 'Workflow'` (zichtbaar in `vwWorkflow`). Daarnaast schrijven de archiveringsprocedures **detailstappen** met `Process = 'Archiving'`: de verificatietellingen (gekopieerd vs. nu aanwezig), het aantal verwijderde rijen, overgeslagen purges (schakelaar uit) en het view-onderhoud. Mislukt de verificatie, dan faalt de run zichtbaar met de reden in de log — en is opnieuw draaien altijd veilig, want er is dan niets verwijderd.

## Verschil met de load types

Archivering staat **los van** de [load types](./load-types.md). Een load type bepaalt wat er bij het *laden* met de history-tabel gebeurt; archivering bepaalt wat er met *oude* rijen gebeurt. Let in het bijzonder op:

- **OVERWRITE** wist de history bij elke load — daar valt weinig te archiveren.
- **FULL**, **DELTA**, **IMAGE**, **RELOAD** en de andere types bouwen wél SCD2-historie op; juist die tabellen profiteren van `CLOSED`-archivering.
- Tabellen uit **bestandsbronnen** doen (nog) niet mee met archivering.

Zie ook [Load types](./load-types.md), [Historie & SCD2](./historie-scd2.md), de [begrippenlijst](./glossary.md) en [Views & pipelines](../setup/views-pipelines.md).
