---
sidebar_position: 2
title: Functions
description: Volledige referentie van alle 56 scalar- en table-valued functions in de IRIS_DWH-database, gegroepeerd per schema.
---

> Beheer doe je bij voorkeur via de webapp; deze objecten zijn voor het SQL-endpoint (SSMS / Azure Data Studio).

Deze pagina beschrijft alle **56 functions** in de data-plane database `IRIS_DWH`, gegroepeerd per schema.
Per function vind je de volledig gekwalificeerde naam, de signature (zoals in de `CREATE FUNCTION`-header
staat) en het doel. De namen en types zijn rechtstreeks overgenomen uit de broncode — code is leidend.

:::note Schema's
De functions verdelen zich over zeven schema's: **`LoadManagement`** (de laadmotor), **`Config`**
(instellingen, licentie, logging), **`Change`** (DTAP-changebeheer), **`Metadata`** (lineage),
**`dbo`** (tekst- en conversie-utilities), **`oData`** (OData-endpoint) en **`Expose`** (rapportage-RBAC).
:::

Zie ook: [Stored procedures](stored-procedures.md) en [Logs & views](logs-views.md).

---

## LoadManagement (laadmotor)

Het hart van de laadmotor. Deze functions bepalen *wat* er geladen wordt en hoe `STAGE` naar `HIS`
(SCD2) gemergd wordt.

### `[LoadManagement].[fxExtractor]` — table-valued

**Signature:**

```sql
(@LoadFilter NVARCHAR(MAX) = NULL, @LoadType NVARCHAR(MAX) = NULL) RETURNS TABLE
```

**Doel:** het hart van "wat moet er geladen worden". Per actieve brontabel bouwt deze function het
bronspecifieke extract-commando (de `DeltaScript` / OData `$select…$filter` / AFAS-query-string), de
doel-schema- en tabelnamen, bestands- en delimiter-metadata, package size en het archiveringsscript.
Het is de TVF achter de view `[LoadManagement].[vwExtractor]` (die niets anders doet dan
`SELECT * FROM [LoadManagement].[fxExtractor](NULL,NULL)`). ADF leest die view om te leren welke tabellen
geladen moeten worden. Elke geretourneerde rij = één te laden tabel.

**Output:** ~40 kolommen, waaronder `sourceType`, `isFile`, `Source`, `SourceSchema`, `SourceTable`,
`TechSchema`, `TechTable`, `DataPlatform`, `LoadType`, `DeltaColumn`, `LatestRecord`, `DeltaScript`,
`loadFilter`, `Pipeline`, `Trigger`, `fileLocation`, `fileName`, `TargetSource`, `TargetSchema`,
`TargetTable`, `Target`, `keepStage`, `TargetSchemaHIS`, `TargetSchemaSTAGE`, `CellRange`, `Sheet`,
`FileType`, `ColumnDelimiter`, `RowDelimiter`, `QuoteCharacter`, `FirstRowHeader`, `EscapeCharacter`,
`CompressionType`, `LatestRuntime`, `noKey`, `deltaOverlap`, `deltaOverlapUnit`, `PackageSize`,
`ArchivingScript`, `paginationType`, `paginationDetails`, `LoadStatus`.

:::caution Twee parameters, geen `@PackageSize`
`fxExtractor` heeft **exact twee parameters**: `@LoadFilter` en `@LoadType`. Er is **géén** derde parameter
`@PackageSize`. `PackageSize` is een **output-kolom** (`COALESCE(u.PackageSize, st.MaxPackageSize, 25000)`),
geen invoerparameter. Eveneens: de output-kolommen heten `LatestRecord` en `LatestRuntime` (niet
"LapageRecord" / "LapageRuntime").
:::

### `[LoadManagement].[fxGetActualTablename]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Doel:** geeft `UsedTables.ActualTableName` terug voor de combinatie source/schema/table. Wordt niets
gevonden, dan valt de function terug op `CustomYres.Extractor.[TARGET]`.

### `[LoadManagement].[fxGetDataType]`

**Signature:**

```sql
(@source NVARCHAR(256), @dataType NVARCHAR(256), @sourceLength INT, @sourcePrecision INT,
 @sourceScale INT, @schema NVARCHAR(256)='N/A', @table NVARCHAR(256)='N/A',
 @column NVARCHAR(256)='N/A') RETURNS NVARCHAR(256)
```

**Doel:** mapt het bron-datatype naar het volledige doel-kolomtype via `LoadManagement.TypeMapping` en
`LoadManagement.GlobalTypeMapping`. Houdt rekening met lengte, precisie en scale, en past eventuele
overrides toe.

### `[LoadManagement].[fxGetInitialDataType]`

**Signature:** dezelfde parameterset als `fxGetDataType` (`@source, @dataType, @sourceLength,
@sourcePrecision, @sourceScale, @schema, @table, @column`) `RETURNS NVARCHAR(256)`.

**Doel:** als `fxGetDataType`, maar bepaalt het volledige doel-kolomtype **zonder** kolom-overrides toe te
passen (de "initiële" mapping).

### `[LoadManagement].[fxGetKeyColumns]`

**Signature:**

```sql
(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024), @withType BIT=0,
 @enclosureChar NVARCHAR(1)='"', @seperatorChar NVARCHAR(1)=',') RETURNS NVARCHAR(MAX)
```

**Doel:** haalt de sleutelkolommen (key columns) van de tabel op uit `LoadManagement.vwDictionary`. Zijn er
geen gemarkeerd, dan vallen alle kolommen terug als sleutel. Met `@withType=1` wordt ook het datatype
meegegeven; `@enclosureChar`/`@seperatorChar` bepalen de opmaak van de geretourneerde lijst.

### `[LoadManagement].[fxGetRowColumns]`

**Signature:** identiek aan `fxGetKeyColumns` (`@Source, @Schema, @Table, @withType BIT=0,
@enclosureChar NVARCHAR(1)='"', @seperatorChar NVARCHAR(1)=','`) `RETURNS NVARCHAR(MAX)`.

**Doel:** haalt de row-kolommen (de kolommen die meedoen in change-detection) op uit
`LoadManagement.vwDictionary`, met dezelfde opmaakopties als hierboven.

### `[LoadManagement].[fxGetKeyHashColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Doel:** bouwt de concatenatie van sleutelkolommen waaruit de `KeyHash` (`HASHBYTES('SHA2_512', …)`) wordt
berekend. Zijn er geen sleutelkolommen, dan worden alle kolommen gebruikt.

### `[LoadManagement].[fxGetRowHashColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Doel:** bouwt de concatenatie van row-kolommen waaruit de `RowHash` wordt berekend. Kolommen met
`RowHash=0` worden uitgesloten van change-detection.

### `[LoadManagement].[fxGetOptimized]`

**Signature:** `(@Type NVARCHAR(50), @Table NVARCHAR(250), @Status NVARCHAR(50)='Intended') RETURNS NVARCHAR(20)`

**Doel:** bepaalt of een tabel memory-optimized is, op basis van `LoadManagement.UsedTables` of
`Config.Settings`. `@Type` is `'STAGE'` of `'HIS'`. `@Status` accepteert de letterlijke waarden
**`'Intended'`** (de geconfigureerde wens) of **`'Real'`** (de werkelijke status); `spHIS_InsertAndUpdate`
roept de function aan met `'Real'`.

### `[LoadManagement].[fxGetStoreType]`

**Signature:** `(@Table NVARCHAR(250), @Status NVARCHAR(50)='Intended') RETURNS NVARCHAR(20)`

**Doel:** bepaalt of een tabel row- of column-store gebruikt, op basis van `LoadManagement.UsedTables` of
`Config.Settings`. Dezelfde `'Intended'`/`'Real'`-logica als `fxGetOptimized`.

### `[LoadManagement].[fxGetSurrogate]`

**Signature:** `(@Table NVARCHAR(4000)) RETURNS INT`

**Doel:** geeft de surrogate-key-instelling van de tabel terug uit `LoadManagement.UsedTables` (voor de
`ActualTableName` met `Active=1`). Is die leeg/NULL, dan valt de function terug op de instelling
**`DefaultSurrogate`** in `Config.Settings`.

### `[LoadManagement].[fxGetOptimalPageSize]`

**Signature:** `(@object NVARCHAR(4000)) RETURNS INT`

**Doel:** berekent een optimale page size voor het pagineren van `STAGE` → `HIS`, op basis van de gemeten
KB-per-rij van het object en de beschikbare tempdb-ruimte. Wordt gebruikt wanneer de instelling `PageSize`
de waarde `OPTIMAL` heeft.

### `[LoadManagement].[fxGetDeltaValue]`

**Signature:** `(@target NVARCHAR(4000), @addCorrectQuotation BIT) RETURNS NVARCHAR(100)`

**Doel:** levert de huidige delta-watermark-waarde voor een doeltabel (de hoogste verwerkte delta-waarde),
optioneel met juiste quoting voor gebruik in dynamische SQL.

### `[LoadManagement].[fxPredictKeyColumns]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Doel:** voorspelt de sleutelkolommen voor een nieuwe tabel op basis van bestaande metadata in
`LoadManagement.Dictionary`. Worden er geen gevonden, dan vallen alle non-nullable kolommen terug als
voorspelde sleutel. Wordt gebruikt door de wizard "Tabel toevoegen" als suggestie.

### `[LoadManagement].[fxPredictTableName]`

**Signature:** `(@Source NVARCHAR(1024), @Schema NVARCHAR(1024), @Table NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Doel:** voorspelt de doel-tabelnaam op basis van source/schema/table, met inachtneming van eventuele
overrides in `LoadManagement.UsedTables`.

### `[LoadManagement].[fxGenerateAdfUrl]`

**Signature:** `(@runId NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Doel:** bouwt de volledige URL om een specifieke pipeline-run in de Azure Data Factory-portal te bekijken.
Wordt gebruikt door de monitoring-views om deep-links naar ADF-runs te tonen.

### `[LoadManagement].[fxCreateNetsuiteAuthHeader]`

**Signature:**

```sql
(@consumer_key VARCHAR(8000), @Consumer_secret VARCHAR(8000), @oAuth_Token VARCHAR(8000),
 @Token_secret VARCHAR(8000), @URL VARCHAR(8000), @Method VARCHAR(50)) RETURNS VARCHAR(8000)
```

**Doel:** bouwt de OAuth-1.0-`Authorization`-header (met HMAC-SHA256-signature, nonce en timestamp) voor
NetSuite-API-aanroepen.

---

## Config (instellingen, licentie, logging)

### `[Config].[fxGetSetting]`

**Signature:** `(@SettingName NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Doel:** haalt de waarde van een instelling op uit `Config.Settings`. Bevat speciale GodMode-logica: een
tweede lookup leest de `GodMode`-rij met een tijd-roterende `id`; begint de gevraagde instellingsnaam met
`Allow%` **en** resolvet GodMode naar `'1'`, dan geeft de function `'1'` terug (force-allow).

### `[Config].[fxGetSchemaName]`

**Signature:** `(@Target NVARCHAR(MAX), @Type NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Doel:** bepaalt de schemanaam voor een doel en type. Basisschema is `fxGetSetting('SchemaHIS')` of
`fxGetSetting('SchemaSTAGE')` (anders `'ERROR'`). Heeft de bijbehorende `UsedTables`-rij een niet-lege
`OverwriteSettingSchema`, dan wordt het resultaat `CONCAT_WS('_', basisSchema, OverwriteSettingSchema)`
(bijvoorbeeld `ODS_Finance`).

### `[Config].[fxAddTryCatch]`

**Signature:**

```sql
(@SQL NVARCHAR(MAX), @process UNIQUEIDENTIFIER, @spName NVARCHAR(MAX), @spStep NVARCHAR(MAX),
 @spCall NVARCHAR(MAX), @appUser NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)
```

**Doel:** wikkelt een SQL-script tussen twee `EXECUTE [Config].[spWriteMessage]`-aanroepen ("Preparing for
step" / na de stap) voor breadcrumb-logging. Wordt door `spHIS_InsertAndUpdate` gebruikt vlak voordat het
gegenereerde laad-SQL wordt uitgevoerd.

### `[Config].[fxCheckLicense]`

**Signature:**

```sql
(@feature NVARCHAR(1024), @value NVARCHAR(1024), @check NVARCHAR(50)='SYSTEM',
 @checkvalue NVARCHAR(1024)) RETURNS NVARCHAR(4000)
```

**Doel:** valideert de licentiesleutel (`Config.Settings.LicenseKey`) tegen een feature/limiet. Controleert
installatie-binding, einddatum en type, en geeft een issue-string terug (bijv. *"The provided license key is
not valid anymore"*) of een lege/oké-status. Dit is de technische afdwinging achter de licentie-tiers; zo
geven over-quota tabellen/databases in `fxExtractor` geen rijen terug.

### `[Config].[fxCheckSystem]`

**Signature:** `(@value NVARCHAR(1024)) RETURNS NVARCHAR(4000)`

**Doel:** controleert systeem-/installatiebeperkingen (gekoppeld aan `@@SERVERNAME`) als aanvulling op de
licentiecontrole.

### `[Config].[fxViewLicense]` — table-valued

**Signature:** `() RETURNS TABLE`

**Doel:** ontsleutelt de opgeslagen `LicenseKey` (via `DECRYPTBYPASSPHRASE` met servernaam-salt) en geeft de
licentie-inhoud terug als `[key]`/`[value]`-paren — handig om de actieve licentie te inspecteren.

### `[Config].[fxGetSession]`

**Signature:** `() RETURNS NVARCHAR(MAX)`

**Doel:** bevraagt `sys.dm_exec_connections` en `sys.dm_exec_sessions` en geeft de details van actieve
sessies terug als JSON.

### `[Config].[fxGetHmacSha256]`

**Signature:** `(@Key VARCHAR(MAX), @baseString VARCHAR(MAX)) RETURNS VARCHAR(MAX)`

**Doel:** berekent een HMAC-SHA256-signature in pure T-SQL (inclusief de inner/outer-padding). Gebruikt voor
het ondertekenen van uitgaande API-aanroepen.

### `[Config].[fxUrlEncode]`

**Signature:** `(@Input NVARCHAR(MAX)) RETURNS NVARCHAR(MAX)`

**Doel:** URL-encodeert een string (vervangt spaties en speciale tekens door hun `%XX`-equivalent) voor
gebruik in API-URL's en OAuth-signatures.

---

## Change (DTAP-changebeheer)

Functions die het changebeheer (Projects → Changes → Release/Install) ondersteunen.

### `[Change].[fxGetChangeIsOpen]`

**Signature:** `(@ChangeId INT) RETURNS INT`

**Doel:** bepaalt of een change (geïdentificeerd door `@ChangeId`) momenteel open is. Joint
`Change.Changes` met `Change.Status` en controleert dat de change van de juiste server/database afkomstig is.
Geeft `1` (open) of `0` (niet open) terug.

### `[Change].[fxGetLastestChangeIdFor]`

**Signature:** `(@objectType INT, @objectName NVARCHAR(1024)) RETURNS INT`

**Doel:** haalt de **laatste** change-ID op die een specifiek objecttype en -naam bevat, door
`Change.ChangeContent` te doorzoeken.

:::note Naamgeving
De function heet in de code letterlijk `fxGetLastestChangeIdFor` — met de typefout "Lastest" (de schrijfwijze
is bewust verbatim overgenomen). De eerdere wiki-spelling "fxGetLaspageChangeIdFor" is fout op twee punten:
het is *Latest*, niet "Lapage", en de code spelt het zelf als "Lastest".
:::

### `[Change].[fxGetLatestOpenChange]`

**Signature:** `(@ObjectType NVARCHAR(10), @ObjectName NVARCHAR(1024)) RETURNS INT`

**Doel:** combineert `fxGetLastestChangeIdFor` en `fxGetChangeIsOpen` om de laatste **open** change voor een
objecttype/-naam te vinden en terug te geven.

### `[Change].[fxPossibleChanges]` — table-valued

**Signature:** `(@ObjectType NVARCHAR(10), @ObjectName NVARCHAR(1024)) RETURNS TABLE`

**Doel:** geeft de mogelijke change-acties voor een object terug, rekening houdend met of er al een open
change bestaat (via `fxGetLastestChangeIdFor`/`fxGetChangeIsOpen`).

### `[Change].[fxMockDelete]` — table-valued

**Signature:** `(@ObjectName NVARCHAR(4000)) RETURNS TABLE`

**Doel:** simuleert wat er gebeurt bij het verwijderen van een object: bepaalt welke afhankelijke objecten
het object gebruiken (en de bijbehorende open change-ID), zodat de impact zichtbaar is vóór de delete wordt
doorgevoerd.

### `[Change].[fxGetReleasedJson]`

**Signature:** `(@ChangeID INT) RETURNS NVARCHAR(MAX)`

**Doel:** haalt de JSON-data op die bij een specifieke change-ID is opgeslagen in `Change.Changes`.

### `[Change].[fxGetTableDefinition]`

**Signature:**

```sql
(@ObjectName NVARCHAR(1024), @UseTransaction BIT=0, @GenerateFKs BIT=1, @GenerateIdentity BIT=1,
 @GenerateCollation BIT=0, @GenerateCreateTable BIT=1, @GenerateIndexes BIT=1, …) RETURNS NVARCHAR(MAX)
```

**Doel:** genereert een volledig SQL-script om een tabeldefinitie te herbouwen — kolommen, indexen,
constraints en optioneel de inhoud als JSON. De vlag-parameters bepalen of foreign keys, identity-kolommen,
collation, het `CREATE TABLE`-statement zelf en indexen worden meegenomen.

### `[Change].[fxGetTableTypeDefinition]`

**Signature:** `(@ObjectName NVARCHAR(1024)) RETURNS NVARCHAR(MAX)`

**Doel:** genereert het `CREATE TYPE … AS TABLE(...)`-script om een user-defined table type te herbouwen,
inclusief de kolommen en hun eigenschappen.

---

## Metadata (lineage en afhankelijkheden)

### `[Metadata].[fxGetViewSources]` — table-valued

**Signature:** `(@VIEW NVARCHAR(256)) RETURNS TABLE`

**Doel:** bepaalt de bronobjecten (tabellen of views) die een opgegeven view direct gebruikt, door de
view-definitie te parsen en systeemtabellen te bevragen.

### `[Metadata].[fxGetViewSourcesRecursive]` — table-valued

**Signature:** `(@VIEW NVARCHAR(256)) RETURNS TABLE`

**Doel:** als `fxGetViewSources`, maar **recursief**: ook de bronnen van de gevonden views worden uitgevouwen,
zodat je de complete lineage-keten ziet.

### `[Metadata].[fxGetDependencies]` — table-valued

**Signature:** `(@ObjectName VARCHAR(500)) RETURNS TABLE`

**Doel:** gebruikt een recursieve CTE om alle afhankelijke objecten (en de objecten daar weer onder) van een
stored procedure, view, function of tabel op te halen.

### `[Metadata].[fxGetReferencedObjects]` — table-valued

**Signature:** `(@sql NVARCHAR(MAX)) RETURNS TABLE`

**Doel:** een best-effort T-SQL-parser die objectnamen na `FROM`, `JOIN`, `APPLY`, `UPDATE`, `INTO`, `MERGE`
en `DELETE FROM` uit ad-hoc SQL-tekst haalt. Houd rekening met de beperkingen: objecten in dynamische SQL,
synoniemen en complexe geneste subqueries/CTE's worden niet altijd herkend (vereist SQL Server 2022+).

### `[Metadata].[fxGetObjectTree]`

**Signature:** `() RETURNS NVARCHAR(MAX)`

**Doel:** bouwt een overzichtsboom van alle database-objecten (naam, type, schema) en markeert per object of
het van oorsprong `Yres` of `custom` is.

### `[Metadata].[fxColumnUsage]` — table-valued

**Signature:** `(@SchemaName SYSNAME, @TableName SYSNAME) RETURNS TABLE`

**Doel:** geeft het kolomgebruik voor een opgegeven schema/tabel terug (welke kolommen waar gebruikt worden) —
nuttig voor impact-analyse.

---

## dbo (tekst- en conversie-utilities)

Algemene hulpfuncties voor string-manipulatie en type-conversie.

### `[dbo].[fxGeneratePassword]`

**Signature:** `(@Length INT = 16) RETURNS NVARCHAR(1024)`

**Doel:** genereert een willekeurig wachtwoord van de opgegeven lengte (tekens uit ASCII 48–122).

### `[dbo].[fxStripCharacters]`

**Signature:** `(@String NVARCHAR(MAX), @MatchExpression VARCHAR(255)) RETURNS NVARCHAR(MAX)`

**Doel:** verwijdert uit de invoerstring alle tekens die voldoen aan de opgegeven match-expressie.

### `[dbo].[fxRemoveNonAlphaCharacters]`

**Signature:** `(@Temp VARCHAR(1000)) RETURNS VARCHAR(1000)`

**Doel:** verwijdert alle niet-alfabetische tekens uit de invoerstring (houdt alleen `a–z` over). Er bestaat
in de repo een tweede, identieke definitie (`fxRemoveNonAlphaCharacters_1.sql`) van dezelfde function — beide
bevatten dezelfde logica.

### `[dbo].[fxToProper]`

**Signature:** `(@string NVARCHAR(4000)) RETURNS NVARCHAR(4000)`

**Doel:** zet een string om naar proper case (eerste letter hoofdletter, rest kleine letters).

### `[dbo].[fxToDecimal]`

**Signature:** `(@string NVARCHAR(1024), @decimals INT=0, @findNegative BIT=1) RETURNS DECIMAL(25,8)`

**Doel:** converteert een string naar een decimal en verwerkt verschillende formaten; met `@findNegative=1`
worden negatieve waarden herkend.

### `[dbo].[fxToReadableSize]`

**Signature:** `(@kb DECIMAL(38,10)) RETURNS NVARCHAR(50)`

**Doel:** formatteert een grootte in kilobytes naar een leesbare string (`KB`, `MB` of `GB`).

### `[dbo].[fxUNIXtoDateTime]`

**Signature:** `(@epochStringDate NVARCHAR(50)) RETURNS DATETIME2(0)`

**Doel:** converteert een UNIX-timestamp (epoch, als string) naar een SQL Server datetime-waarde.

### `[dbo].[fxUTC2CET]`

**Signature:** `(@UTC_DateTime DATETIME) RETURNS DATETIME`

**Doel:** converteert een UTC-datetime naar Central European Time (CET). Wordt onder meer door de
monitoring-views gebruikt om tijden in lokale tijd te tonen.

### `[dbo].[fxGetJsonCollection]`

**Signature:** `(@Json NVARCHAR(MAX)) RETURNS NVARCHAR(1024)`

**Doel:** bepaalt de (eerste/relevante) JSON-collectie binnen een JSON-string door
`dbo.fxGetJsonCollections` te bevragen.

### `[dbo].[fxGetJsonCollections]` — table-valued

**Signature:** `(@Json NVARCHAR(MAX)) RETURNS TABLE`

**Doel:** geeft alle collecties (arrays) binnen een JSON-string terug, met een rangschikking die bekende
sleutels als `RESULT`, `RESULTS`, `DATA` en `VALUE` prioriteert. Gebruikt bij het inlezen van REST-/OData-
responses.

### `[dbo].[UNQUOTENAME]`

**Signature:** `(@input SYSNAME, @quotechar NCHAR(1)=N'[') RETURNS NVARCHAR(4000)`

**Doel:** de tegenhanger van `QUOTENAME`: verwijdert de omsluitende quote-tekens (standaard `[ ]`) van een
identifier.

---

## oData (OData-endpoint)

Functions die het OData-rapportage-endpoint van de database voeden.

### `[oData].[fxBaseResponse]`

**Signature:** `(@BaseUrl NVARCHAR(3000)) RETURNS NVARCHAR(MAX)`

**Doel:** bouwt de basis-OData-respons-URL: voegt het metadata-endpoint toe en somt alle beschikbare tabellen
en views in de database op.

### `[oData].[fxMetadataResponse]`

**Signature:** `(@BaseUrl NVARCHAR(3000)) RETURNS NVARCHAR(MAX)`

**Doel:** genereert de OData-`$metadata`-respons, inclusief entity types en entity sets, en mapt SQL-types
naar de bijbehorende OData-EDM-types volgens de OData-standaard.

---

## Expose (rapportage-RBAC)

### `[Expose].[fxGenerateDefinitions]`

**Signature:**

```sql
(@Schema NVARCHAR(1024), @Name NVARCHAR(1024), @DataType NVARCHAR(256), …) RETURNS NVARCHAR(MAX)
```

**Doel:** genereert de definities voor rapportage-objecten in het `Exposed`-schema. `@DataType` duidt de
rapportage-rol van de kolom aan (`[None]`, `[FACT]`, `[DIM1]`, `[DIM2]`, `[DIM4]`); op basis van de
gekoppelde Yres-bron/-tabel en surrogate-key bouwt de function de objectdefinitie.

---

:::info Lapage → Latest
In oudere documentatie kwam het token **"Lapage"** voor (bijvoorbeeld `LapageRecord` of
`fxGetLapageOpenChange`). Dat is een OCR-fout: het juiste woord is **"Latest"**. In de live database komt
"Lapage" nergens voor. De correcte namen zijn `LatestRecord`, `LatestRuntime`, `fxGetLastestChangeIdFor`
(met de "Lastest"-typefout uit de code) en `fxGetLatestOpenChange`.
:::
