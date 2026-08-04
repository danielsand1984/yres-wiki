---
sidebar_position: 1
title: Stored procedures
description: Referentie van de stored procedures in de IRIS_DWH-database, per schema, met parameters en doel.
---

> Beheer voer je bij voorkeur uit via de Yres-webapp. Deze objecten zijn de SQL-laag eronder; je raadpleegt of roept ze rechtstreeks aan via het SQL-endpoint (SSMS / Azure Data Studio).

Deze pagina beschrijft de stored procedures in de data-plane database **`IRIS_DWH`**. De namen zijn letterlijk uit de live repository overgenomen; in code heet het product nog op veel plaatsen **IRIS**. De inhoud is geregenereerd uit de broncode (de code is leidend boven oudere documentatie).

De database telt **112 stored procedures, 66 functions en 51 views** (geteld op de deploy-bron, augustus 2026 — het aantal groeit per release). Functions staan op [Functions](./functions.md); logtabellen en views op [Logs & views](./logs-views.md).

:::note Schema-overzicht
De procedures zijn verdeeld over de schema's `LoadManagement` (de laadmachine), `Config` (instellingen, logging, DB-tuning), `Change` (DTAP-wijzigingsbeheer), `Monitoring` (laadstatus-logging), `Maintenance` (onderhoud, health checks), `Expose` (rapportage-RBAC) en `dbo` (hulpprocedures).
:::

---

## LoadManagement — de laadmachine

Het schema `LoadManagement` bevat de kern van Yres: de procedures die `STAGE` naar `HIS` mergen (SCD2), de werklast voorbereiden en de metadata onderhouden.

### `[LoadManagement].[spLoadDWH]`

**Doel:** Het instappunt dat ADF aanroept zodra `STAGE` gevuld is. Het is een **dunne pass-through**: de procedure roept uitsluitend `[LoadManagement].[spHIS_InsertAndUpdate]` aan en geeft de vijf parameters één-op-één door.

**Parameters:**

- `@Target (NVARCHAR(MAX), default NULL)`: De doeltabel.
- `@Pipeline_ID (NVARCHAR(MAX), default 1)`: ID van de ADF-pipeline.
- `@Execute (BIT, default 0)`: `1` = uitvoeren, `0` = de gegenereerde SQL alleen printen.
- `@DeltaColumn (NVARCHAR(MAX), default '')`: De kolom voor delta-detectie (lege string als default, niet NULL).
- `@TableLoadType (NVARCHAR(MAX), default NULL)`: Het laadtype (bijv. `FULL`, `DELTA`).

:::note Geen aparte end-dating meer
`spLoadDWH` roept `[LoadManagement].[spUpdateETL_EndDate]` **niet** (meer) aan: die tweede aanroep is **uitgecommentarieerd** ("Update ETL Enddate not required anymore"). Het end-daten van rijen gebeurt nu binnen `spHIS_InsertAndUpdate` zelf, in het `@LatestRecord`-UPDATE-blok. `spLoadDWH` doet dus niets anders dan doorgeven aan `spHIS_InsertAndUpdate`.
:::

### `[LoadManagement].[spHIS_InsertAndUpdate]`

**Doel:** De SCD2-merge-engine — het hart van de laadlogica. Voor één doel resolveert de procedure bron/schema/tabel uit `UsedTables` (met fallback naar `CustomYres.Extractor`), leest `vwDictionary` voor de lees-/schrijf-/verwijderkolommen, berekent de KeyHash/RowHash-kolommen en **bouwt een grote dynamische SQL-string** die — afhankelijk van het laadtype — nieuwe rijen invoegt, gewijzigde/verdwenen rijen afsluit (`isCurrent=0`, `ETL_EndDate`), dedupliceert en in pagina's door `STAGE` heen werkt. Bij `@Execute=1` voert hij die SQL uit (omhuld door `Config.fxAddTryCatch`); anders print hij de SQL via `dbo.spLongPrint`.

**Parameters:** die van `spLoadDWH` (`@Target`, `@Pipeline_ID`, `@Execute`, `@DeltaColumn` (default lege string), `@TableLoadType`), plus `@LakeMode (BIT, default 0)`. Met `@LakeMode = 1` richt dezelfde merge zich op de slanke administratietabel van de [lake feed](../../concepten/lake-feed.md) in plaats van op het HIS-schema: er worden geen surrogate keys gegenereerd en alleen de deltakolommen worden meegenomen. Deze stand wordt uitsluitend door `spLoadLake` gezet.

**Laadtypes (zoals afgeleid uit de code, leidend):** de procedure vertakt expliciet op zes waarden van `@TableLoadType` — **`DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL`** — plus `FULL` als impliciet standaardpad (het niet-speciale pad).

| Laadtype | Gedrag in `spHIS_InsertAndUpdate` | Historie |
|---|---|---|
| `FULL` | Standaardpad: insert nieuw, versioneer gewijzigde rijen (sluit oud af), laat de rest open | **bewaard (SCD2)** |
| `DELTA` | Als FULL maar alleen gewijzigde records; werkt `UsedTables.LatestRecord = MAX(deltaColumn)` bij | bewaard |
| `DELTAIMAGE` | DELTA + sluit ontbrekende keys binnen het deltavenster | bewaard |
| `IMAGE` | Volledige snapshot: upsert + sluit **alle** ontbrekende keys (soft-delete) | bewaard |
| `OVERWRITE` | Truncate HIS eerst via `spHIS_TruncateTable`, daarna alle STAGE-rijen invoegen | **GEEN (truncate)** |
| `RELOAD` | Sluit eerst alle huidige rijen af, daarna alle STAGE-rijen invoegen | **bewaard (oude generatie afgesloten)** |
| `ADDITIONAL` | Puur toevoegen (append); werkt ook `LatestRecord` bij | bewaard |

:::danger OVERWRITE en RELOAD niet verwisselen
Alleen **`OVERWRITE` verwijdert historie** (truncate, RowId herstart). **`RELOAD` bewaart historie** (close-then-insert: de oude generatie wordt afgesloten, daarna komen de nieuwe rijen erbij). **`FULL` bewaart óók de volledige SCD2-historie** — alleen `OVERWRITE` truncate't.
:::

:::note Watermerk alleen na volledige merge
De `LatestRecord`-update (DELTA/DELTAIMAGE/ADDITIONAL) draait alleen wanneer de merge **volledig** is afgerond. Faalt een pagina definitief, dan blijft het watermerk staan en schrijft de procedure de monitoringregel `Delta watermark not advanced` naar `LS_Trans`; de eerstvolgende geslaagde run haalt het verschil opnieuw op en schuift het watermerk alsnog door.
:::

Aanvullend gedrag: paginatie is instellingsgestuurd (`Config.fxGetSetting('UsePagination')`, `'PageSize'` — met literal `OPTIMAL` → `fxGetOptimalPageSize` — en `'retryCount'`, default 3 in de proc). Bij `fxGetSurrogate(@Target)=1` worden surrogate keys in `LoadManagement.SurrogateKeys` ingevoegd. Bij een memory-optimized STAGE (`fxGetOptimized('STAGE',…,'Real')='1'`) draait eerst `spUpdateKeyAndRowHash`. Elke micro-stap schrijft een rij naar `[Monitoring].[LS_Trans]` (bijv. `New rows`, `Delta rows`, `Closed rows`, `Inserted into Target`).

### `[LoadManagement].[spLoadLake]`

**Doel:** Het lake-tegenhanger van `spLoadDWH`, aangeroepen door de ADF-stap **Prepare lake load** vlak vóór `Load DWH` (alleen als `DataPlatform` de waarde `DL` bevat). De procedure maakt zo nodig de slanke administratietabel voor het doel aan, zet een startmarkering in `[Monitoring].[LS_Trans]` (het ankerpunt waaraan de mutaties van déze run herkend worden) en delegeert daarna naar `spHIS_InsertAndUpdate` met `@LakeMode = 1`. Bij loadtype `ADDITIONAL` slaat hij de merge volledig over. Zie [Lake feed](../../concepten/lake-feed.md).

**Parameters:** `@Target`, `@Pipeline_ID`, `@TableLoadType` (leeg = uit `UsedTables`), `@DeltaColumn`, `@Execute` (default `1`).

### `[LoadManagement].[spGetLakeFeed]`

**Doel:** Levert de ADF-stap **Write lake feed** één rij met `FeedQuery` (de query die precies de mutaties van deze run selecteert) en `MutationCount`. Bij `MutationCount = 0` slaat ADF de kopieerstap over, zodat er geen leeg bestand in de Data Lake ontstaat. De query markeert elke rij als `I`, `U` of `D`; verwijderde sleutels komen als tombstone terug met lege businesskolommen.

**Parameters:** `@Target`, `@Pipeline_ID` (lokaliseert de startmarkering), `@TableLoadType`.

### `[LoadManagement].[spResetLakeIndex]`

**Doel:** Wist de slanke lake-administratie voor één tabel of — zonder argument — voor alle lake-tabellen. De eerstvolgende load verstuurt daarna de volledige actuele dataset opnieuw als `I`-rijen. Bedoeld voor herstel en backfill; de al geschreven Parquet-bestanden blijven ongemoeid.

**Parameters:** `@Target` (leeg = alle lake-tabellen).

### `[LoadManagement].[spMaintainLakeExternal]`

**Doel:** Genereert en onderhoudt de leesobjecten over de Parquet change feed voor DL-only-targets (`DataPlatform` bevat `DL` maar niet `DWH`): per schemageneratie een external table `[DL].[<Target>_Feed_g<N>]`, de union-view `[DL].[<Target>_Feed]` over alle generaties en een HIS-vormige view `[DL].[<Target>]`.

**Parameters:** `@Target`, `@PipelineID`, `@WorkflowID`, `@Scope` (`TABLE`/`VIEW`/`ALL`), `@Execute (BIT, 0 = dry-run: statements als result set)`.

### `[LoadManagement].[spPrepareWorkload]`

**Doel:** Bereidt de werklast voor door voor élke tabel die `fxExtractor` teruggeeft een regel in `[LoadManagement].[LoadLog]` te schrijven (de duurzame status per tabel-load). Door de master-pipeline aangeroepen (Lookup "Get tables") vóórdat `vwExtractor` verder wordt gelezen.

**PLANNED/SKIPPED-logica:** Per kandidaat-tabel checkt de procedure — via `fxExtractor`'s join met `vwLatestLoad`, beperkt tot `LoadStatus IN ('PLANNED','RUNNING')` — of er al een niet-afgeronde load voor diezelfde `Source`/`SourceSchema`/`SourceTable` bestaat. Zo ja: de nieuwe rij krijgt meteen `LoadStatus = 'SKIPPED'` (gelogd, niet uitgevoerd — bedoeld als non-concurrency-guard tegen overlappende triggers). Zo nee: de rij krijgt `LoadStatus = 'PLANNED'`. Tot slot bouwt de procedure dynamisch een `SELECT` op basis van de kolommen van `vwExtractor`, gefilterd op `WorkFlow = @Workflow AND LoadStatus = 'PLANNED'` — dat is de daadwerkelijke werklijst die (bij `@execute = 1`) wordt uitgevoerd en teruggegeven aan de ADF-`ForEach`. Zie [Monitoring & logging](../monitoring-logging.md) voor de volledige statuslevenscyclus.

**Parameters:** `@Source`, `@SourceSchema`, `@SourceTable`, `@TriggerName`, `@Pipeline`, `@Workflow`, `@LoadType`, `@Filter` (alle `NVARCHAR(1024)`), `@execute (INT, default 1 — op 0 wordt de opgebouwde SELECT alleen ge-print, niet uitgevoerd)`.

### `[LoadManagement].[spMaterializeViews]`

**Doel:** Materialiseert views naar tabellen op basis van de trigger-mapping in `[LoadManagement].[TriggerMapping]`. Logt voortgang via `[Monitoring].[spWriteLoadStatus]`.

**Parameters:** `@WorkFlow`, `@PipelineName`, `@Trigger`, `@ISource` ('AUTO' of 'ALL'), `@ISchema` ('ALL' mogelijk), `@IView` ('ALL' mogelijk) (alle `NVARCHAR(255)`), `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spMaterializeViewToTable]`

**Doel:** Materialiseert één specifieke view naar de bijbehorende tabel; ondersteunt full- en delta-loads. Geeft het aantal verwerkte rijen terug.

**Parameters:** `@SourceSchemaName (SYSNAME)`, `@SourceViewName (SYSNAME)`, `@execute (BIT)`, `@rows` (output, aantal verwerkte rijen).

### `[LoadManagement].[spHIS_TruncateTable]`

**Doel:** Truncate't of verwijdert alle records uit een history-tabel (`HIS`). Of er getruncate't of gedelete't wordt, hangt af van of de tabel memory-optimized is. Aangeroepen door `OVERWRITE`-loads.

**Parameters:** `@Target (NVARCHAR(MAX))`, `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spSTAGE_TruncateTable]`

**Doel:** Leegt één stagingtabel na een load (tenzij `keepStage=1`).

**Parameters:** `@Target (NVARCHAR(MAX), default NULL)`, `@Pipeline_ID (NVARCHAR(MAX), default 1)`, `@EXECUTE (BIT, default 1)`.

### `[LoadManagement].[spSTAGE_TruncateAll]`

**Doel:** Leegt alle stagingtabellen ineens.

**Parameters:** `@execute (BIT, default 0)`.

### `[LoadManagement].[spTruncate]`

**Doel:** Verwijdert (binnen een transactie) alle data uit een opgegeven doeltabel.

**Parameters:** `@Execute (BIT, default 1)`, `@Target (NVARCHAR(4000))`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spRollback]`

**Doel:** Rolt de delta van een HIS-tabel terug naar een specifiek tijdstip. Onderdeel van de "rollback per load"-functionaliteit.

**Parameters:** `@Execute (BIT, default 0)`, `@HIS_TABLE (NVARCHAR(1024))`, `@DateTime (DATETIME2)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spReset]`

**Doel:** Reset een HIS-tabel (of alle tabellen) naar de beginstaat van de delta-administratie.

**Parameters:** `@Execute (BIT, default 0)`, `@HIS_TABLE (NVARCHAR(1024), default NULL)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spUpdateETL_EndDate]`

**Doel:** Werkt de `ETL_EndDate` van afgesloten rijen bij. Bestaat nog als zelfstandige procedure maar wordt **niet langer aangeroepen door `spLoadDWH`** (zie de waarschuwing daar); het end-daten zit nu in `spHIS_InsertAndUpdate`.

### `[LoadManagement].[spUpdateLatestDelta]`

**Doel:** Werkt het "Latest record" (de delta-watermark) bij in alle deltatabellen, of in één opgegeven ODS-tabel.

**Parameters:** `@Execute (BIT, default 0)`, `@ODS_TABLE (NVARCHAR(1024), default NULL)`.

### `[LoadManagement].[spUpdateKeyAndRowHash]` / `[spUpdateKeyAndRowHash_ODS]`

**Doel:** (Her)berekent de `KeyHash`- en `RowHash`-kolommen voor STAGE (of de ODS-variant). Wordt vóór de merge gedraaid wanneer STAGE memory-optimized is.

**Parameters (`spUpdateKeyAndRowHash`):** `@Execute (BIT, default 0)`, `@Source (NVARCHAR(MAX))`, `@Schema (NVARCHAR(MAX))`, `@Table (NVARCHAR(MAX))`.

### `[LoadManagement].[spGetRowCount]`

**Doel:** Geeft het aantal rijen van een tabel terug, met de keuze tussen een exact aantal en een geschatte waarde.

**Parameters:**

- `@table (NVARCHAR(1024))`: De te tellen tabel.
- `@Exact (BIT, default NULL)`: **`NULL` (default) = geschatte grootte teruggeven**; `1` = exact tellen; `0` = alleen controleren of de tabel niet leeg is.
- `@Active (NCHAR(1), default 0)`: `1` = alleen records met `isCurrent = 1` tellen.

### `[LoadManagement].[spRegenerateSurrogateKeys]`

**Doel:** Bouwt de surrogate keys van één tabel volledig opnieuw op, doorgaans na brongegevenswijzigingen. De procedure valideert eerst dat de tabel in `UsedTables` staat, dat surrogaatsleutels voor de tabel aanstaan (`fxGetSurrogate` = 1) en dat er sleutelkolommen zijn; `OverwriteSource`/`OverwriteSchema`/`OverwriteTable` worden gehonoreerd. De rebuild is atomisch: `DELETE` + `INSERT` draaien in één transactie, dus bij een fout blijven de bestaande sleutels staan. `intKey`-waarden worden hierbij **opnieuw toegekend**; de `jsonKey` wordt met dezelfde alfabetische kolomvolgorde opgebouwd als tijdens het laden.

**Parameters:** `@Source`, `@SourceSchema`, `@SourceTable`, `@Execute (BIT, default 0 = dry-run: alleen het script printen)`, `@AppUser`.

### `[LoadManagement].[spCheckKeyAndRowHash]`

**Doel:** Controleert de integriteit van key- en row-hashes; vergelijkt staging- en history-data en rapporteert inconsistenties.

**Parameters:** `@EXECUTE (BIT, default 0)`, `@Source (NVARCHAR(MAX))`, `@Schema (NVARCHAR(MAX))`, `@Table (NVARCHAR(MAX))`, `@sampleSize (NVARCHAR(MAX), default 10)`.

### `[LoadManagement].[spGenerateTypeMapping]`

**Doel:** Genereert ontbrekende type-mappings voor bronsystemen en voegt ze toe aan `LoadManagement.TypeMapping` (additief — bestaande mappings blijven ongemoeid).

**Parameters:** `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[LoadManagement].[spGetColumnMapping]`

**Doel:** Bouwt een JSON-object met de kolom-mappings tussen bron en doel, gebruikt in het ETL-proces.

**Parameters:** `@tablename`, `@schemaname`, `@source` (`VARCHAR(256)`, optioneel), `@Target (NVARCHAR(MAX))`, `@Pipeline_ID (NVARCHAR(MAX), default 1)`.

### `[LoadManagement].[spFillDictionary_AFAS]` / `[spFillDictionary_oDATA]`

**Doel:** Importeren metadata van een AFAS- respectievelijk OData-bron (kolommen + datatypes). Sinds de hardening van juni 2026 schrijven ze naar de stagingtabel **`LoadManagement.Dictionary_Stage`**; een aparte swap-stap promoveert die rijen atomisch naar de live `Dictionary` (zie [Metadata-staging](#metadata-staging-stage-swap-en-finalize)).

**Parameters (AFAS):** `@input (ttDictionary_AFAS READONLY)`, `@source (NVARCHAR(1024))`, `@EXECUTE (BIT, default 1)`. **OData** voegt `@schema (NVARCHAR(1024), default 'API')` toe.

### `[LoadManagement].[spFillTable_Json]` / `[spFillTable_Monday]`

**Doel:** Vullen een doeltabel met data uit JSON respectievelijk Monday.com, waarbij de structuur naar tabelvorm wordt omgezet.

**Parameters (`spFillTable_Json`):** `@Collection (NVARCHAR(1024))`, `@jsonTable (ttTable_JsonAdf READONLY)`, `@targetSchema`, `@targetTable`. **`spFillTable_Monday`:** `@Table (ttTable_Monday READONLY)`.

### `[LoadManagement].[spFindTablesBehindSQL]`

**Doel:** Bepaalt welke tabellen een SQL-query gebruikt (dependency-analyse). Gebruikt onder water `[Config].[fxGetDependenciesSQL]`.

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### De `spMaintain*`-familie

Deze procedures schrijven de metadata waarmee de laadmachine werkt (in `LoadManagement.UsedTables`, `UsedColumns`, `SourceSystems`, `ViewPersistence`, enz.). Ze worden vanuit de webapp aangeroepen wanneer je bronnen, tabellen, bestanden of triggers beheert. Allemaal ondersteunen ze een `@action`-parameter (`ADD`, `UPDATE`, `DELETE`, soms `DEACTIVATE`).

| Procedure | Doel (kort) |
|---|---|
| `[LoadManagement].[spMaintainSource]` | Beheert databronnen in `SourceSystems` (`@action`, `@source`, `@sourceType`, `@AppUser`). |
| `[LoadManagement].[spMaintainTable]` | Beheert tabellen (`UsedTables`/`UsedColumns`); veel extra params (`@DataPlatform`, `@fieldList`, `@loadType`, …) — sinds v1.56 ook de archiveringsconfiguratie (`@ArchivingMode`, `@ArchivingColumn`, `@ArchivingRetention(+Unit)`, `@ArchivingClause`), met validatie tegen de Dictionary. |
| `[LoadManagement].[spMaintainFiles]` | Beheert bestandsbronnen voor import. |
| `[LoadManagement].[spMaintainRestService]` | Beheert REST-service-endpoints (`@service`, `@endpoint`, …). |
| `[LoadManagement].[spMaintainTrigger]` | Beheert triggers per bron/schema/tabel (`@action` = `ADD`/`DELETE`; `"all"`/`"ALL"` mogelijk). |
| `[LoadManagement].[spMaintainPersistView]` | Beheert view-persistentie in `ViewPersistence`. |
| `[LoadManagement].[spMaintainFilesInDictionary]` | Beheert bestand-metadata in `Dictionary`/`UsedColumns`. |
| `[LoadManagement].[spMaintainRestInDictionary]` | Beheert REST-metadata in de dictionary. |

### Archivering: verifieer en schoon op (v1.56)

Zie [Archivering](../../concepten/archivering.md) voor het volledige verhaal; dit zijn de twee procedures erachter.

#### `[LoadManagement].[spArchivePurge]`

**Doel:** de geverifieerde opschoonstap van archivering. De `Dynamic Archiving Workflow YRES` roept deze procedure per tabel aan ná een geslaagde Copy-naar-Parquet, met exact dezelfde archiveringsconditie (het `ArchivingScript`) en het aantal gekopieerde rijen. De procedure telt opnieuw hoeveel rijen aan de conditie voldoen en verwijdert **alleen bij een exacte match** — in batches, en gegate door de instelling `ArchivingPurgeEnabled` (schakelaar uit = nette copy-only-run, geen fout). De instelling `AllowDeletesFromDB` speelt hier bewust **geen** rol: die gaat over het droppen van database-objecten, niet over het verwijderen van data. Wijkt de telling af, dan wordt er niets verwijderd en faalt de stap zichtbaar via `spWriteLoadStatus`.

#### `[LoadManagement].[spArchiveMaintainView]`

**Doel:** ververst na elke geslaagde archiefkopie de per-tabel union-view `[<HIS-schema>].[<Target>_IncArchive]` (live tabel `UNION ALL` gearchiveerde Parquet via data virtualization / `OPENROWSET`, gededupliceerd op de `RowID` met voorrang voor live). Maakt de benodigde credential en external data source (`YresArchiveLake`, uit de instelling `ArchiveLakeLocation`) idempotent aan. Deze procedure mag archivering nooit blokkeren: elke fout wordt gelogd en geslikt (bv. zolang de Data Lake-rechten voor SQL nog niet zijn ingericht).

### Metadata-staging: stage, swap en finalize

De `GetMetaData - <bron>`-pipelines vernieuwen de bron-metadata: de kolommen (de **dictionary**) en — voor SAC — de **services**. Sinds de hardening van juni 2026 schrijven de fill-procedures (`spFillDictionary_oDATA`/`_AFAS`, `spFillServices_SAC`) niet meer rechtstreeks naar de live tabel, maar eerst naar een **stagingtabel** (`LoadManagement.Dictionary_Stage`, `Config.Services_Stage`). Pas na een geslaagde, niet-lege Copy wordt de live partitie **atomisch omgewisseld**. Voordelen: een mislukte of halve refresh laat de bestaande metadata intact (geen lege kolommen meer), en dezelfde refresh kan de live-tabel nooit half overschrijven.

| Procedure | Doel |
|---|---|
| `[LoadManagement].[spClearDictionaryStage]` | Leegt `Dictionary_Stage` voor een bron vóór de Copy. Params: `@Source`, `@SourceSchema (default NULL)`, `@SourceTable (default NULL)`. |
| `[LoadManagement].[spSwapDictionary]` | Vervangt na de Copy de live `Dictionary`-rijen van de bron atomisch (`XACT_ABORT` + `TRAN`) uit stage. **Zero-row-guard:** bij 0 gestagede rijen slaat de swap over en logt een `WARNING`; live blijft staan. Params: `@Source`, `@PipelineID (default NULL)`, `@SourceSchema (default NULL)`, `@SourceTable (default NULL)`. |
| `[LoadManagement].[spFinalizeDictionary]` | Sluit een per-part load af: verwijdert live rijen waarvan de `(SourceSchema, SourceTable)`-combinatie niet meer in stage staat (verdwenen onderdelen) en leegt daarna de stage-partitie. Param: `@Source`. |
| `[Config].[spClearServicesStage]` | Als `spClearDictionaryStage`, maar voor `Services_Stage` (SAC). Params: `@SourceSystem`, `@ServiceNamePrefix (default NULL)`. |
| `[Config].[spSwapServices]` | Wisselt de live `Config.Services`-rijen om uit stage; zelfde zero-row-guard en transactie. Params: `@SourceSystem`, `@PipelineID (default NULL)`, `@ServiceNamePrefix (default NULL)` (scope op namespace). |
| `[Config].[spFinalizeServices]` | Sluit een per-namespace SAC-load af: verwijdert verdwenen `ServiceName`-rijen en leegt stage. Param: `@SourceSystem`. |

:::note Hele bron vs. per onderdeel (per-part)
Roep je `spSwapDictionary`/`spSwapServices` **zonder** scope-parameters aan, dan wordt de hele bron in één keer omgewisseld én wordt stage geleegd. Geef je wél een `@SourceSchema`/`@SourceTable` (of `@ServiceNamePrefix`) mee, dan wordt **alleen die partitie** omgewisseld en blijft stage staan voor de afsluitende `Finalize`-stap. De zeven loop-georiënteerde GetMetaData-pipelines (ExactOnline, AFAS, SAC, NetSuite, Monday, SAP_BDC, Salesforce) gebruiken die per-part-variant: ze wisselen **per loop-iteratie** om, zodat één falende deel-extractie niet langer de hele metadata-refresh blokkeert — de geslaagde delen landen meteen in live. De swap-procedures **geven fouten door aan ADF**: anders dan de meeste DWH-procedures rollen ze de live-tabel terug en laten ze de pipeline falen.
:::

---

## Config — instellingen, logging en DB-tuning

### `[Config].[spAddFrameWorkColumns]`

**Doel:** Voegt de framework-kolommen (`ETL_Date`, `KeyHash`, `RowHash`) toe aan een stagingtabel.

**Parameters:** `@Execute (BIT, default 0)`, `@SelectedTable (NVARCHAR(MAX), default 'NoneSelected')`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[Config].[spCreateTablesFromDictionary]` / `[spUpdateTablesFromDictionary]` / `[spDeleteTablesFromDB]` / `[spCreateExternalTablesFromDictionary]`

**Doel:** Creëren, bijwerken, verwijderen of als external table genereren van DWH-tabellen op basis van de dictionary-metadata.

**Parameters (gedeeld):** `@Execute (BIT, default 0)`, `@SelectedSource`, `@SelectedSchema`, `@SelectedTable` (alle `NVARCHAR(MAX), default 'NoneSelected'`), `@AppUser`. `spUpdateTablesFromDictionary` voegt toe: `@Methods` (`ADD`/`REMOVE`/`UPDATE`), `@Stage (BIT)`, `@HIS (BIT)`.

### `[Config].[spCompareMetadata]`

**Doel:** Vergelijkt de actuele metadata met de opgeslagen metadata en vult `Config.MetadataComparison` met de verschillen (ontbrekende/verwijderde kolommen, type-mismatches). Geen parameters.

### `[Config].[spEnableColumnstore]`

**Doel:** Schakelt een columnstore-index in op bestaande tabellen voor snellere analytische queries.

**Parameters:** `@Execute (BIT)`, `@Schema (NVARCHAR(50), default 'BOTH')` (`HIS`, `STAGE` of `BOTH`), `@Table (NVARCHAR(1024))`.

### `[Config].[spEnableMemoryOptimization]`

**Doel:** Zet memory-optimization aan in de database (voegt een `MEMORY_OPTIMIZED_DATA`-filegroup toe).

**Parameters:** `@Execute (BIT, default 1)`.

### `[Config].[spApplyDbSettings]`

**Doel:** Past de database-instellingen toe die in `Config.Settings` staan (o.a. collatie/case-sensitivity).

**Parameters:** `@overwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Config].[spSetDatabaseParameter]`

**Doel:** Zet één database-parameter op een waarde.

**Parameters:** `@Execute (BIT, default 0)`, `@Parameter (NVARCHAR(256))`, `@Setting (NVARCHAR(256))`.

### `[Config].[spSetDatabaseServiceTier]`

**Doel:** Wijzigt de Azure SQL service tier (schaalt de database op/af). Aangeroepen in de master-pipeline rond een load.

**Parameters:** `@toTier (NVARCHAR(250), default 'Default')`, `@requestor (NVARCHAR(1024), default 'Unknown')`, `@AppUser (NVARCHAR(1024), default '')`, `@EXECUTE (BIT, default 1)`.

### `[Config].[spRenameTarget]`

**Doel:** Trekt de **fysieke** identiteit van één geregistreerd doel gelijk met de configuratie: wijkt de effectieve doelnaam (`Overwrite*`) of het doelschema af van de vastgelegde `UsedTables.Actual*`-stempel, dan hernoemt/verhuist de procedure de HIS- en STAGE-tabellen (en bij `DataPlatform = DL` de lake-boekhouding), inclusief de meeliftende referenties zoals `SurrogateKeys`, en werkt hij de `Actual*`-stempel bij. Atomisch: mislukt de hernoeming, dan blijft alles op de oude naam staan.

### `[Config].[spUpdateRefreshToken]`

**Doel:** Werkt de refresh- en access-tokens in de tokens-tabel bij (voor API-authenticatie).

**Parameters:** `@Source (NVARCHAR(4000))`, `@RefreshToken (NVARCHAR(4000))`, `@AccessToken (NVARCHAR(4000))`, `@ExpirationTime (INT, default 10)`.

### `[Config].[spFillServices_SAC]`

**Doel:** Importeert SAC (SAP Analytics Cloud)-providers in de **stagingtabel `Config.Services_Stage`**; een swap-stap promoveert ze naar de live `Config.Services` (zie [Metadata-staging](#metadata-staging-stage-swap-en-finalize)).

**Parameters:** `@input (ttServices_SAC READONLY)`, `@source (NVARCHAR(1024))`, `@Execute (BIT, default 1)`.

### `[Config].[spGetDependenciesSQL]`

**Doel:** Analyseert een `SELECT`-statement en bepaalt welke tabellen/views/objecten het gebruikt (maakt er tijdelijk een view van en leest de afhankelijkheden via `Metadata.fxGetDependencies`).

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### `[Config].[fxGetDependenciesSQL]`

**Doel:** Ondanks het `fx`-voorvoegsel een **stored procedure** (geen function). Zelfde werking als `spGetDependenciesSQL`; dit is de variant die `[LoadManagement].[spFindTablesBehindSQL]` aanroept. Sinds juli 2026 weer onderdeel van de deploy (de procedure ontbrak eerder in de bron, waardoor `spFindTablesBehindSQL` niet werkte).

**Parameters:** `@SQL (NVARCHAR(MAX))`.

### `[Config].[spGenerateDbreader]`

**Doel:** (Her)bouwt de databaserol **`Yres_dbreader`**: dropt en hercreëert de rol, voegt hem toe aan `db_datareader`, en plaatst vervolgens `DENY`-statements op interne schema's/objecten plus `DENY INSERT/UPDATE/DELETE` op het HIS-schema (`Config.fxGetSetting('SchemaHIS')`). Bestaande rolleden worden opnieuw toegevoegd. **Geen parameters.**

### De `Config.spWrite*`-loggingfamilie

Alle hieronder schrijven naar `Config.ProcessLog`. De "message-klasse" schrijvers (`spWriteMessage`, `spWriteWarning`) delen een identiek **10-parameter-blok**.

#### `[Config].[spWriteMessage]` en `[Config].[spWriteWarning]`

**Doel:** Loggen respectievelijk een informatieboodschap en een waarschuwing. Het `returnCode`-niveau zit hard in de procedure, dus is géén parameter.

**Parameters (10, identiek voor beide):**

- `@processID (UNIQUEIDENTIFIER)`
- `@spName (NVARCHAR(4000))`
- `@spStep (NVARCHAR(4000))`
- `@spCall (NVARCHAR(MAX))`
- `@appUser (NVARCHAR(4000))`
- `@message1 (NVARCHAR(4000))`
- `@message2 (NVARCHAR(4000), default NULL)`
- `@message3 (NVARCHAR(4000), default NULL)`
- `@message4 (NVARCHAR(4000), default NULL)`
- `@dbRequest (NVARCHAR(MAX), default NULL)`

#### `[Config].[spWriteError]`

**Doel:** Logt een fout naar `Config.ProcessLog`.

**Parameters:** het 10-parameter-blok van `spWriteMessage` **plus** de foutvelden `@errorLine (INT, default NULL)`, `@errorMessage (NVARCHAR(4000), default NULL)`, `@errorNumber (INT, default NULL)`, **`@errorPrecedure (NVARCHAR(4000), default NULL)`**, `@errorSeverity (INT, default NULL)`, `@errorState (INT, default NULL)`.

:::note `errorPrecedure` is geen typefout in de wiki
De kolom/parameter heet zowel in de procedure als in de `ProcessLog`-tabel letterlijk `errorPrecedure` (sic). Laat de spelling zo staan.
:::

#### `[Config].[spWriteLog]`, `[spWriteFullLog]`, `[spWriteCrash]`, `[spWriteDump]`

**Doel:** Schrijven uitgebreidere logregels naar `Config.ProcessLog`. `spWriteLog` logt berichten/waarschuwingen/fouten met een expliciete `@ReturnCode`; `spWriteFullLog` bevat het volledige veldenpalet (incl. `@CallSource`, `@DbUser`, `@DbServer`, `@DbName`); `spWriteCrash` en `spWriteDump` leggen gedetailleerde fout-/dumpinformatie vast bij vastlopers. Ze delen de proces-/stap-/bericht-/foutvelden van `spWriteError`.

---

## Change — DTAP-wijzigingsbeheer

Het schema `Change` ondersteunt het overzetten van wijzigingen tussen omgevingen (dev → test → prod) via projecten en changes.

### `[Change].[spMaintainProject]`

**Doel:** Beheert projecten (toevoegen, bijwerken, verwijderen).

**Parameters:** `@Action (NVARCHAR(256), default 'ADD')`, `@Name (NVARCHAR(1024), default '')`, `@Description (NVARCHAR(MAX), default 'No description')`, `@DueDate (DATE, default NULL)`, `@Status (INT, default 1)`, `@AppUser (NVARCHAR(4000), default 'Unknown')`, `@Id (INT, default -1)`.

### `[Change].[spMaintain]`

**Doel:** Beheert changes (toevoegen, bijwerken, verwijderen) binnen het wijzigingsbeheer.

**Parameters:** dezelfde set als `spMaintainProject` (`@Action`, `@Name`, `@Description`, `@Project (INT, default NULL)`, `@DueDate`, `@Status`, `@AppUser`, `@Id`).

### `[Change].[spAddTable]`

**Doel:** Voegt een tabel met bijbehorende metadata (kolommen, keys, datatypes) toe aan een bestaande change; beheert dependencies en bewaakt dat er geen conflicterende actieve changes zijn.

**Parameters:** `@ChangeID (INT)`, `@Source (NVARCHAR(1024))`, `@Schema (NVARCHAR(1024))`, `@Table (NVARCHAR(1024))`, `@appUser (NVARCHAR(MAX), default 'Unknown')`, `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Change].[spAddScriptedObject]`

**Doel:** Voegt een scripted object (procedure, function, trigger, view, tabel) toe aan een change en houdt het object plus dependencies bij.

**Parameters:** `@ChangeID (INT)`, `@ObjectType (NVARCHAR(5))` (bijv. `'P'`, `'FN'`), `@ObjectName (NVARCHAR(4000))`, `@Delete (BIT, default 0)`, `@AddDependencies (BIT, default 1)`, `@IgnoreYresObjects (BIT, default 1)`, `@appuser (NVARCHAR(512))`, `@OverwriteProcessID (UNIQUEIDENTIFIER, default NULL)`.

### `[Change].[spCopyTableContent]`

**Doel:** Kopieert data van een bron- naar een doeltabel, met optionele kolom-mapping en -casting (handig bij vergelijkbare maar niet identieke structuren).

**Parameters:** `@SourceTable (NVARCHAR(256))`, `@TargetTable (NVARCHAR(256))`, `@Execute (BIT, default 0)`.

### `[Change].[spImport]`

**Doel:** Importeert changes die als JSON zijn aangeleverd in het wijzigingsbeheer (changes, projecten, content, dependencies).

**Parameters:** `@JSON (NVARCHAR(MAX))`, `@AppUser (NVARCHAR(4000), default 'Unknown')`.

### `[Change].[spInstall]`

**Doel:** Installeert een change in het doelsysteem, met de keuze tussen uitvoeren, SQL printen of een impactanalyse.

**Parameters:** `@ChangeID (NVARCHAR(1024))`, `@Execute (INT, default 2)` (**1** = uitvoeren, **0** = SQL printen, **2** = impactanalyse), `@AppUser (NVARCHAR(4000), default 'Unknown')`, `@OnlySources (BIT, default 0)` (**1** = alleen bronsystemen + type-mappings installeren, tabellen en scripted objects overslaan).

### `[Change].[spRelease]`

**Doel:** Geeft een change vrij (release): valideert dependencies, werkt de status bij en logt het releaseproces.

**Parameters:** `@ChangeId (INT)`, `@UseLatestVersion (BIT, default 1)` (of de meest recente versie van de objecten in de change wordt gebruikt), `@AppUser (NVARCHAR(1024))`.

:::note `spDeleteObject` is verwijderd
De vroegere procedure `[Change].[spDeleteObject]` bestaat niet meer: hij is verwijderd bij de hardening van het wijzigingsproces. De verwijderlogica loopt via `spAddScriptedObject` met `@Delete=1`.
:::

---

## Monitoring — laadstatus-logging

### `[Monitoring].[spWriteLoadStatus]`

**Doel:** De centrale laadstatus-logger. Op `@Step IN ('Start workflow','Start load')` schrijft hij een rij in `Monitoring.LS_Pipeline` en zet hij de bijbehorende `LoadManagement.LoadLog.LoadStatus` op `RUNNING`. **Elke** aanroep schrijft een rij in `Monitoring.LS_Trans`. Op `@Status IN ('Success','Succeeded')` wordt `LoadLog` → `SUCCEEDED`; op `('Failed','Fail','Error')` → `FAILED` (met `@Log` toegevoegd aan `LoadLog.Error`).

**Parameters (16):**

- `@PipelineID (NVARCHAR(255))`
- `@Process (NVARCHAR(255), default NULL)`
- `@Step (NVARCHAR(255), default NULL)`
- `@Status (NVARCHAR(255), default NULL)`
- `@Rows (BIGINT, default NULL)`
- `@WorkflowID (NVARCHAR(255), default NULL)`
- `@PipelineName (NVARCHAR(255), default NULL)`
- `@Started_by (NVARCHAR(255), default NULL)`
- `@Target (NVARCHAR(255), default NULL)`
- `@Source_system (NVARCHAR(255), default NULL)`
- `@Table (NVARCHAR(255), default NULL)`
- `@Schema (NVARCHAR(255), default NULL)`
- `@LoadType (NVARCHAR(255), default NULL)`
- **`@LatestRecord (NVARCHAR(255), default NULL)`**
- `@ETL_Date (DATETIME, default NULL)`
- `@Log (NVARCHAR(MAX), default 'No details provided')`

:::note Robuust ontwerp
Alle boekhoudkundige writes staan in een `TRY/CATCH` en zijn best-effort: een mislukte monitoring-write mag de load van de aanroeper nooit breken. De bewuste `RAISERROR` voor `@Status IN ('Failed','Fail','Error')` staat juist **buiten** de TRY, zodat echte laadfouten altijd in ADF zichtbaar worden. Bij `@PipelineID='UNKNOWN'` wordt het echte PipelineID uit `LS_Pipeline` (laatste 24 uur, op Target+LoadType) opgelost; bij `@WorkflowID IS NULL` wordt het via `SELECT TOP 1` afgeleid.
:::

### `[Monitoring].[spDeleteDuplicatesInAdfMonitor]`

**Doel:** Verwijdert dubbele records uit `Monitoring.AdfLoadMonitor` (de ADF-load haalt alle beschikbare monitoringrecords op; daarna blijft per `id` alleen de meest recente staan). Geen parameters.

### `[Monitoring].[spWhoIsActive]`

**Doel:** Toont de actuele actieve sessies/queries op de database (de bekende `sp_WhoIsActive`-diagnostiek). Voor ad-hoc troubleshooting.

---

## Maintenance — onderhoud en health checks

Dit schema bevat onderhoudsroutines en de health-check-implementatie. De health-check-resultaten zijn te raadplegen via de view `[Maintenance].[vwYresChecks]` (de bronfile heet nog `vwIrisChecks.sql`).

### `[Maintenance].[spApplyRetentionPolicy]` (v1.56)

**Doel:** Past het [retentiebeleid](../monitoring-logging.md#retentie-van-de-logtabellen) uit `[Monitoring].[RetentionPolicy]` toe op de logtabellen: verwijdert gebatcht alles ouder dan de bewaartermijn, met vaste integriteitsregels (de laatste run per tabel-load, `PLANNED`/`RUNNING`-loads en hun detailregels blijven altijd staan; alleen tabellen met een expliciete opschoonregel worden geraakt). Wordt gepland aangeroepen door de ADF-pipeline `Maintenance Retention YRES`.

**Parameters:** `@PipelineID (NVARCHAR(255))`, `@DryRun (BIT, default 0)` — 1 = alleen tellen wat verwijderd zou worden, `@BatchSize (INT, default 100000)`, `@Scope (NVARCHAR(255))` en `@OverrideRetentionDays (INT)` — test-/beheerscoping (een override zonder scope wordt geweigerd). Retourneert één samenvattingsrij per verwerkte tabel.

### `[Maintenance].[spImplementSolution]`

**Doel:** Past automatisch een door de health-check-view (`[Maintenance].[vwYresChecks]`) voorgestelde fix toe.

**Parameters:** `@SolutionID (NVARCHAR(512))`, `@AppUser (NVARCHAR(1024))`.

### `[Maintenance].[spDatabaseRestore]`

**Doel:** Voert een database-restore uit (onderdeel van back-up/restore-onderhoud).

### Onderhouds- en diagnostiekprocedures (third-party)

De volgende procedures zijn breed bekende SQL-Server-onderhouds- en diagnostiektools die in `IRIS_DWH` zijn meegeleverd. Je gebruikt ze read-only voor diagnose; ze worden door Yres niet vanuit de webapp aangestuurd.

| Procedure | Doel |
|---|---|
| `[Maintenance].[spAdaptiveIndexDefrag]` | Adaptieve index- en statistieken-defragmentatie. |
| `[Maintenance].[spBlitz]`, `spBlitzFirst`, `spBlitzCache`, `spBlitzIndex`, `spBlitzQueryStore`, `spBlitzWho`, `spBlitzBackups`, `spBlitzAnalysis` | De "Blitz"-diagnostiekfamilie: gezondheid, knelpunten, indexen, querystore, actieve sessies en back-upcontrole. |
| `[Maintenance].[spAllNightLog]`, `spAllNightLog_Setup` | Continue log-back-uproutine. |
| `[Maintenance].[spInEachDb]` | Voert een commando uit in elke database. |

---

## Expose — rapportagelaag en RBAC

Het schema `Expose` beheert de rapportageobjecten en de toegang daarop (gebruikers, rollen, rol-toewijzingen).

### `[Expose].[spMaintainObjects]`

**Doel:** Dropt en (her)creëert rapportageobjecten (views/tabellen) in de exposed laag, met het gewenste service-type en datamodel-vorm.

**Parameters:** `@Action (NVARCHAR(20))` (`ADD`/`UPDATE`/`DELETE`), `@Schema`, `@Name`, `@type` (`[View]`/`[Table]`), `@ServiceTypes` (`[ODATA]`/`[SQL]`), `@DataType` (`[None]`/`[FACT]`/`[DIM1]`/`[DIM2]`/`[DIM4]`), `@AppUser`, `@execute (INT, default 0)`.

### `[Expose].[spRebuildObjects]`

**Doel:** Herbouwt alle rapportageobjecten ineens.

**Parameters:** `@AppUser (NVARCHAR(4000))`, `@execute (INT, default 0)`.

### `[Expose].[spMaintainRoles]`

**Doel:** Beheert rapportagerollen (toevoegen, hernoemen, verwijderen).

**Parameters:** `@Action (NVARCHAR(20))`, `@Name (NVARCHAR(1024))`, `@NewName (NVARCHAR(1024), default NULL)` (alleen bij `UPDATE`), `@AppUser`.

### `[Expose].[spMaintainUsers]`

**Doel:** Beheert rapportagegebruikers.

**Parameters:** `@Action (NVARCHAR(20))`, `@NickName (NVARCHAR(1024), default '')`, `@UserID (NVARCHAR(1024))` (default een guid), `@Provider (NVARCHAR(1024))` (`[ENTRA]`/`[LOCAL]`), `@ServiceTypes (NVARCHAR(1024))` (`[ODATA]`/`[SQL]`), `@AppUser`.

### `[Expose].[spMaintainRoleAssignment]`

**Doel:** Voegt leden toe aan of verwijdert ze uit een rapportagerol.

**Parameters:** `@Action (NVARCHAR(20))` (`ADD`/`REMOVE`), `@member (NVARCHAR(1024))`, `@Role (NVARCHAR(1024))`, `@AppUser`.

### `[Expose].[spMaintainRoleContent]`

**Doel:** Koppelt een rapportagerol aan een exposed object in `Expose.RoleContent` én zet de bijbehorende `GRANT`/`REVOKE SELECT` op de views van dat object in het `[Exposed]`-schema — registratie en permissie in één transactie, zodat ze niet uit elkaar kunnen lopen (`@Action` = `ADD`/`DELETE`).

### `[Expose].[spApplyRoleContent]`

**Doel:** Idempotente reconciler van de rapportage-RBAC: brengt de `SELECT`-rechten op de `[Exposed]`-views exact in lijn met `Expose.RoleContent` (grant wat geregistreerd maar afwezig is, revoke wat niet meer geregistreerd is). Nodig omdat een rebuild van de exposure-laag (`DROP VIEW`) de rechten van een view weggooit; draait automatisch na `spMaintainObjects`/`spRebuildObjects` en is veilig los uit te voeren.

---

## dbo — hulpprocedures

Generieke hulpprocedures die de andere schema's gebruiken.

| Procedure | Doel | Belangrijkste parameters |
|---|---|---|
| `[dbo].[spLongPrint]` | Print lange strings in stukken (omzeilt de `PRINT`-lengtelimiet). | `@String (NVARCHAR(MAX))` |
| `[dbo].[spRunSQL]` | Voert een willekeurig SQL-statement dynamisch uit. | `@SQL (NVARCHAR(MAX))` |
| `[dbo].[spJsonToTable]` | Zet JSON om naar een relationele tabel. | `@Collection`, `@json (default '{}')`, `@targetSchema`, `@targetTable` |
| `[dbo].[spCopyDB]` | Maakt een kopie van een database, optioneel met drop en service-tier. | `@sourceDB`, `@targetDB`, `@targetTier (default 'GP_Gen5_2')`, `@dropIfExists (BIT, default 0)` |
| `[dbo].[spMSForEachTable]` / `[spMSForEachWorker]` | Voert een commando uit tegen elke tabel (batch-operatie); `@replacechar` wordt door de tabelnaam vervangen. | `@command1 (NVARCHAR(2000))`, `@replacechar (NCHAR(1), default '?')`, … |
| `[dbo].[spAdaptiveIndexDefrag_CurrentExecStats]` | Rapporteert de voortgang van de index-defragmentatie. | `@dbname (NVARCHAR(255), optioneel)` |
| `[dbo].[spAdaptiveIndexDefrag_Exceptions]` | Beheert uitzonderingen op de defragmentatie (db's, dagen, tabellen, indexen). | `@exceptionMask_DB`, `@exceptionMask_days`, `@exceptionMask_tables`, `@exceptionMask_indexes` |
| `[dbo].[spAdaptiveIndexDefrag_PurgeLogs]` | Ruimt oude defragmentatielogs op. | `@daystokeep (SMALLINT, default 90)` |

---

## Zie ook

- [Functions](./functions.md) — alle scalar- en table-valued functions (`fxExtractor`, `fxGetSetting`, `fxGetSchemaName`, …).
- [Logs & views](./logs-views.md) — de logtabellen (`LS_Pipeline`, `LS_Trans`, `LoadLog`, `ProcessLog`, `EventLog`) en monitoringviews (`vwLoads`, `vwMonitor`, `vwWorkflow`, `vwUsedTables`).
