---
slug: /glossary
sidebar_position: 4
title: Begrippenlijst
description: Yres-terminologie — van load engine en SCD2-historie tot DTAP, control plane en data plane.
---

# Begrippenlijst

Deze begrippenlijst verklaart de kernbegrippen van Yres. Technische identifiers (schema-, tabel-,
procedure- en kolomnamen) staan exact zoals ze in de code voorkomen — die bevatten vaak nog `IRIS`,
omdat het product vroeger **IRIS** heette. In lopende tekst gebruiken we de productnaam **Yres**.

:::tip Verdieping
De load engine, SCD2-historie en de zeven load types worden uitgebreid behandeld in
[Yres uitgelegd](./yres-uitgelegd.md) en [Load types](./load-types.md).
:::

## Product en organisatie

| Term | Betekenis |
|---|---|
| **Yres** | Het Azure-data-platform (datawarehouse-automatisering). Voorheen **IRIS**. |
| **IRIS** | Oude productnaam van Yres. Komt nog voor in resource-namen (`IRIS_DWH`, `kv-iris-…`), interne URL's en code-identifiers. |
| **Plainwater** | Het bedrijf achter Yres; ontwikkelt en host de control plane. |
| **Organisatie** | Afgeschermde ruimte waarin een klant Yres gebruikt; bevat één of meer environments. De eerste environment is altijd `dev`. |
| **Environment (omgeving)** | Geïsoleerde versie van een organisatie. Elke environment heeft een eigen ADF-factory en een eigen `IRIS_DWH`-database. Eerste environment is altijd `dev`; afhankelijk van de licentie ook `test`, `acceptance`, `prod`. |
| **DTAP** | Development, Test, Acceptance, Production — het patroon van gescheiden omgevingen waarlangs changes worden gepromoot. De `Change`-schema's in `IRIS_DWH` ondersteunen dit changemanagement. |
| **Project** | Categoriseert werk binnen een omgeving; bevat changes en heeft een due date. Alleen beschikbaar bij organisaties met meerdere environments. |
| **Change** | Set bewerkingen aan het datawarehouse, te releasen en te installeren naar andere omgevingen (DTAP). |
| **Scripted object** | Custom SQL-object (tabel, stored procedure, function) dat niet door Yres is gegenereerd, beheerd onder een change. |

## De twee planes

| Term | Betekenis |
|---|---|
| **Control plane** | De multi-tenant SaaS-webapp van Plainwater (één deployment voor alle klanten). Beheert organisaties, gebruikers, environments en facturatie in een PostgreSQL-database. **Bevat nooit klantdata** — het provisioneert en bestuurt elke data plane via de Azure Management-, ADF-, Key Vault- en Azure DevOps-API's en een directe SQL-verbinding. |
| **Data plane** | Eén ADF-factory + één `IRIS_DWH` Azure SQL-database **per organisatie × environment**, draaiend binnen de **eigen Azure-tenant van de klant**. Hier verplaatst de data daadwerkelijk. Dit is waar de load engine leeft. |

:::info Te bevestigen
Eigenaar-input: of er naast "draaien in de eigen Azure-tenant van de klant" ook een door Yres
gehoste optie bestaat. De productdocumentatie benadrukt juist dat alles 100% in de eigen
Azure-omgeving van de klant draait (geen vendor lock-in).
:::

## Bronnen en metadata

| Term | Betekenis |
|---|---|
| **Data source** | Gekoppelde bron waaruit data geladen wordt (database, applicatie, OData/REST, file server). Wordt aangemaakt via de wizard "Create source". |
| **SourceType** | Het brontype dat het laadgedrag bepaalt (bv. `MSSQL_ADF`, `DB2`, `POSTGRESQL`, `MYSQL`, `ODATA`, `SALESFORCE`, `SAP_BDC`). `fxExtractor` genereert per `sourceType` het juiste extract-commando en de delta-WHERE-clause. |
| **ADF** | Azure Data Factory — de orkestratielaag. Yres genereert hier de pipelines naartoe; ADF kopieert bytes van bron naar `STAGE` en roept daarna SQL aan. ADF bevat geen laadlogica. |
| **Integration Runtime (IR)** | Compute van ADF die de bron bereikt. Standaard `AutoResolveIntegrationRuntime` (cloud) voor cloud-bereikbare bronnen; een self-hosted IR (`pwccIntegrationRuntimeLinked`) voor on-prem/firewalled databases en file servers. |
| **Dictionary** | Opgeslagen bron-metadata (tabellen, kolommen, datatypes, keys, relaties) in `LoadManagement.Dictionary`. Wordt gevuld door "Refresh metadata" en is vereist vóór het toevoegen van tabellen. **File- en REST-bronnen slaan deze stap over.** |
| **`vwExtractor`** | De contract-view `[LoadManagement].[vwExtractor]` die ADF leest om te bepalen wát geladen moet worden. Het is een dunne wrapper: `SELECT * FROM [LoadManagement].[fxExtractor](NULL, NULL)`. |
| **`fxExtractor`** | De table-valued function `[LoadManagement].[fxExtractor](@LoadFilter, @LoadType)` waarin **alle** extractor-logica zit. Elke teruggegeven rij = één te laden tabel, met alle parameters die ADF stroomafwaarts doorgeeft (load type, `DeltaScript`, doelschema's, file-/parsing-opties, paginering). |

## Lagen in het datawarehouse

| Term | Betekenis |
|---|---|
| **STAGE** | Stagingschema waar ADF de ruwe bron-extract in landt (schemanaam via setting `SchemaStage`, standaard `STAGE`). Hier worden de framework-kolommen `ETL_Date`, `KeyHash` en `RowHash` berekend. |
| **HIS** | History-laag met de volledige SCD2-historie (schemanaam via setting `SchemaHIS`). De HIS-schemanaam staat **niet** hard gecodeerd; op verifieerbare omgevingen resolvet `SchemaHIS` naar `ODS`. |
| **ODS** | Operational Data Store. Tevens de standaardwaarde van `SchemaHIS` — de HIS-laag landt in de praktijk in het `ODS`-schema. |
| **Expose** | De reporting-/exposelaag (`Exposed`, `Expose`, gebruikersschema's). Bevat de rapportagegerichte views/tabellen plus RBAC, opgebouwd door `spMaterializeViews`. |
| **Data Lake** | Optionele Parquet-landing in Azure Data Lake Gen2. ADF kopieert `STAGE` naar Parquet (met `RowHash`/`KeyHash`/`EtlDate`), gepartitioneerd op Source/Schema/Target/Year/Month. |

:::note STAGE → HIS → Expose
De vaste dataspine is: bron → ADF Copy → `STAGE` → `spLoadDWH` → `spHIS_InsertAndUpdate` →
`HIS` (SCD2) → `spMaterializeViews` → Expose. ADF verplaatst alleen bytes; alle laadlogica zit in SQL.
:::

## SCD2-historie en hashing

| Term | Betekenis |
|---|---|
| **SCD2** | Slowly Changing Dimension type 2 — het historisatiemodel van de HIS-laag. Bij een wijziging blijft de oude versie als gesloten rij bewaard en wordt een nieuwe huidige versie ingevoegd. |
| **`KeyHash`** | `varbinary(66)`-hash (`HASHBYTES('SHA2_512', …)`) over de **key-kolommen**, als persisted computed column op STAGE. De match-join is `STAGE.Keyhash = HIS.Keyhash AND HIS.isCurrent = 1`. |
| **`RowHash`** | `varbinary(66)`-hash (`HASHBYTES('SHA2_512', …)`) over de **rowhash-gemarkeerde kolommen**. Wijzigingsdetectie is `STAGE.Rowhash <> HIS.Rowhash`. Een kolom met `Rowhash = 0` is uitgesloten van wijzigingsdetectie. |
| **`ETL_Date`** | Laadtimestamp van de rij; één `ETL_Date` per run, gezet bij de start van de bron-pipeline. |
| **`ETL_EndDate`** | Einddatum van een rij-versie. Voor de huidige (open) versie is dit de sentinel **`2999-01-01 00:00:00`**. Bij sluiten van een rij wordt `ETL_EndDate` op de `ETL_Date` van de nieuwe versie gezet. |
| **`isCurrent`** | `bit`-vlag: `1` = huidige versie, `0` = gesloten/historisch. Altijd `1` of `0`, nooit `NULL`. Er is precies één huidige rij per key. |
| **`Delta`** | `nvarchar(1)`-vlag op de HIS-rij: `'N'` = nieuw, `'D'` = gewijzigd. |
| **`<stripped>_RowId`** | IDENTITY-surrogaatkolom per HIS-tabel. De naam is de doeltabelnaam, lowercased met niet-alfanumerieke tekens verwijderd, plus `_RowId` (bv. `AX_dbo_Cust` → `axdbocust_RowId`). |
| **Surrogate key** | Optionele door Yres gegenereerde integer-sleutel voor de natural key, opgeslagen in `[LoadManagement].[SurrogateKeys]`. Gestuurd door `fxGetSurrogate(@Target)` en de setting `DefaultSurrogate`. |
| **Delta (watermark)** | De wijzigingskolom-waarde die DELTA/DELTAIMAGE/ADDITIONAL als watermerk bijhouden. Na de load wordt `UsedTables.LatestRecord = MAX(<DeltaColumn>)` bijgewerkt, zodat de volgende run alleen nieuwere records ophaalt. |

## Load engine

| Term | Betekenis |
|---|---|
| **Load type** | Bepaalt wat er met de bestaande HIS-data gebeurt. Er zijn **zeven** types: FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL. Ingesteld per tabel in `LoadManagement.UsedTables.LoadType`, per run overschrijfbaar. Zie [Load types](./load-types.md). |
| **`spLoadDWH`** | Het instappunt dat ADF aanroept nadat STAGE is gevuld. Een dunne pass-through die direct `spHIS_InsertAndUpdate` aanroept (de oude `spUpdateETL_EndDate`-aanroep is uitgecommentarieerd; end-dating gebeurt nu binnen `spHIS_InsertAndUpdate`). |
| **`spHIS_InsertAndUpdate`** | De SCD2-merge-engine die STAGE → HIS verwerkt. Behandelt zes load types expliciet (`DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL`); `FULL` is het impliciete standaardpad. |
| **`spMaterializeViews`** | Bouwt na de load de gematerialiseerde/persisted views in de Expose-laag bij. |
| **Persisted view** | Opgeslagen resultaat van een view-query; herladen op volgorde van `level`. |
| **Master pipeline** | Vanuit de frontend geconfigureerde ADF-pipeline met conditionele flow (on success / failure / completion). Beschikbaar vanaf v1.53. |
| **Dynamic Workflow YRES** | De generieke load-pipeline die op metadata draait (parameters: Source, Schema, Table, LoadType). Op oudere versies heet deze nog `Dynamic Workflow IRIS`. |

## Monitoring en logging

| Term | Betekenis |
|---|---|
| **`spWriteLoadStatus`** | De centrale load-status-logger (`[Monitoring].[spWriteLoadStatus]`). Schrijft `LS_Pipeline` (bij start van workflow/load), altijd `LS_Trans`, en zet `LoadLog`-status op RUNNING/SUCCEEDED/FAILED. |
| **`LoadLog`** | `[LoadManagement].[LoadLog]` — één duurzame rij per tabel-load met de status (`LoadStatus`), start-/eindtijd, foutmelding en een JSON-snapshot van de config. Vormt de join-ruggengraat van `vwMonitor`. |
| **`LS_Pipeline` / `LS_Trans`** | `[Monitoring].[LS_Pipeline]` = één rij per pipeline-/workflow-run; `[Monitoring].[LS_Trans]` = één rij per stap (de fijnmazige timeline). |
| **`vwLoads`** | De canonieke per-pipeline load-timeline `[Monitoring].[vwLoads]` (start + runtime per stap, rijtellingen, status). |
| **`vwMonitor`** | Bredere monitor-view `[Monitoring].[vwMonitor]` die ook materialized views en Power BI-refreshes meeneemt. |

:::warning Geen `vwLoadMonitor`
De view `vwLoadMonitor` bestaat **niet** in de live database. Gebruik `vwLoads` (pipeline-timeline)
of `vwMonitor` (breder). Zie de [SQL-referentie](../referentie/sql-interaction.md).
:::

## Instellingen, beveiliging en infrastructuur

| Term | Betekenis |
|---|---|
| **Setting** | Configuratiewaarde in `[Config].[Settings]`, gelezen via `[Config].[fxGetSetting](@SettingName)`. Bepaalt schema-namen, opslagtype, paginering, scaling, enzovoort. |
| **`SchemaHIS` / `SchemaStage`** | Settings die de HIS- en STAGE-schemanamen bepalen (standaard `ODS` resp. `STAGE`), resolved per tabel door `Config.fxGetSchemaName`. |
| **`DefaultStore`** | Setting voor row- (lezen/schrijven) of column-oriented (queries) opslag van STAGE. Standaard `ROW`. |
| **Service tier** | De Azure SQL-database-tier (settings `DefaultServiceTier`/`HighServiceTier`). Yres kan automatisch op- en afschalen rond een load. |
| **Surrogate key** | Zie [SCD2-historie en hashing](#scd2-historie-en-hashing). |
| **SSO** | Single Sign-On via Azure; per gebruiker afdwingbaar. |
| **RBAC** | Role-based access control; rollen volgens CRUD per permissietype. De database-rol `Yres_dbreader` wordt door `spGenerateDbreader` opgebouwd. |
| **Key Vault** | Azure Key Vault waar alle credentials liggen. De frontend bewaart nooit secrets; bron-credentials gaan naar de Key Vault van de klant (`adf-{sourceName}-…`) en de linked service verwijst ernaar. |
