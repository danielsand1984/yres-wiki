---
sidebar_position: 4
title: Data Sources
description: Bronnen koppelen en beheren in Yres — catalogus, integration runtime, tags, typemapping en metadata verversen.
---

# Data Sources

> Data sources zijn het hart van Yres; zonder bronnen verplaatst het systeem geen data.

In het **Sources**-paneel koppel en beheer je je bronsystemen. Per bron leg je vast hoe Yres erbij komt (type, integration runtime, credentials), welke tabellen geladen worden en hoe brondatatypes vertaald worden naar het datawarehouse. Je tekent hier geen pipelines visueel: je configureert bronnen, tabellen en laadtypes in wizards en **Yres genereert vervolgens automatisch de bijbehorende ADF-pipelines**.

Voor de exacte verbindingseisen per brontype (host, poort, app-registratie, SAS-token, OAuth …) zie [databron-vereisten](../referentie/databron-vereisten.md). Voor de stap-voor-stap-flow van het koppelen zie [databron koppelen](../setup/databron-koppelen.md).

:::tip Alle schermen & routes
De volledige lijst schermen met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## De broncatalogus — `/sources`

De catalogus is de startpagina van het paneel: één tabel met al je geconfigureerde bronsystemen voor de actieve omgeving.

![Broncatalogus: een tabel met per bron de naam, het type, de integration runtime, het credential-verloop en een typemapping-knop, met bovenaan 'Add source' en 'Refresh metadata'.](/img/screens/source-catalog.svg)

*De broncatalogus toont per rij één gekoppelde bron. Belangrijkste elementen:*

- **Add source** — opent de **Create source**-wizard om een nieuw bronsysteem te koppelen.
- **Brontabel** — kolommen zoals `Name`, `Type`, `Integration runtime` en `Credential expiry`. Inactieve of nog-niet-geïnstalleerde bronnen worden grijs weergegeven.
- **Type mapping** — een aparte kolom/knop per bron. Deze verschijnt **alleen in de dev-omgeving** en linkt naar de per-bron typemapping (zie onder).
- **Connectivity test** — een blauw stekker-icoon per rij. Het verschijnt alleen voor geïnstalleerde bronnen die **geen** `RestService` zijn, en doet een snelle verbindingstest.
- **Credential-meldingen** — bij het openen krijg je een melding als credentials verlopen zijn (*"Credentials expired for …"*) of binnen een maand verlopen (*"Credentials almost expired for …"*). Werk de credentials dan bij via de bron.

### Groeperen in de sidebar

Onder de "Data sources"-link in de linker sidebar staat per bron een sublink plus een **Group**-combobox met drie standen:

| Group-stand | Effect |
|---|---|
| **None** | Platte lijst van alle bronnen. |
| **Data source type** | Groepeert de bronnen onder type-koppen (bv. alle `OData`-bronnen samen). |
| **Data source tags** | Groepeert onder de tags die je per bron hebt opgegeven. |

## Een bron koppelen (Create source)

Elke bron wordt aangemaakt via de **Create source**-wizard. Een aantal velden vraagt Yres voor *elk* brontype ("form 1"); daarna volgt een type-specifiek subformulier (zie [databron-vereisten](../referentie/databron-vereisten.md)).

### Gedeelde velden (alle bronnen)

| Veld | Toelichting |
|---|---|
| **Source name** | Verplicht, uniek per organisatie, 2–45 tekens, begint met een letter, alfanumeriek. Deze naam wordt de linked-service-naam in ADF én de Key Vault-secretgroep `adf-{naam}-…`. |
| **Type** | De bronkiezer; bepaalt welk subformulier verschijnt. |
| **Integration runtime** | Standaard `AutoResolveIntegrationRuntime`; verplicht. Zie hieronder. |
| **Credentials identical for all environments?** | `Yes` hergebruikt de dev-credentials voor prod. Voor **ExactOnline** geforceerd op `No` (aparte app per omgeving). |
| **Credentials expire?** | Optionele vervaldatum; wordt meegegeven aan het wachtwoord/secret in Key Vault en voedt de verloop-meldingen. |
| **Tags** | Optioneel, **komma-gescheiden** (bv. `sales, salesforce`). Gebruik tags om bronnen in de sidebar te groeperen. |

:::info Credentials nooit in de webapp
Het frontend bewaart **geen** secrets. Alle credential-velden gaan naar de **Azure Key Vault** van de klant (secretgroep `adf-{sourceName}-…`); de linked service verwijst er alleen naar.
:::

### Integration runtime: cloud of self-hosted

De integration runtime (IR) bepaalt vanaf welke machine ADF de bron benadert.

- **`AutoResolveIntegrationRuntime`** (cloud) — de standaard. Goed voor elke cloud-bereikbare SaaS-, HTTP-, OData- of REST-bron, en voor Azure SQL, Snowflake, SharePoint, Salesforce, SAC, SAP_BDC en Power BI.
- **Self-hosted IR** (bv. `pwccIntegrationRuntimeLinked`) — verplicht voor bronnen **achter een firewall of on-premises**: File Server, lokale bestanden, en elke on-prem/afgeschermde database (MySQL, DB2, SQL Server, Oracle, PostgreSQL, SAP HANA via ODBC). Lokale bestanden vereisen daarnaast eenmalig de `-EnableLocalMachineAccess`-vlag op de IR-host.

Eigen IR's die in ADF of via [gedeelde integration runtimes](./admin.md) zijn gepubliceerd, worden automatisch in de dropdown gedetecteerd.

### Brontypes

Yres ondersteunt **21 backend-brontypes** (`DataSourceType.php`): `MSSQL`, `AZSQL`, `DB2`, `MySql`, `PostgreSql`, `AFAS`, `Oracle`, `OData`, `ODataoAuth`, `FileServer`, `SharePoint`, `ExactOnline`, `Snowflake`, `RestService`, `Monday`, `AzureBlobStorage`, `Salesforce`, `SAC`, `SAP_BDC`, `Onestream`, `PowerBI`. `MSSQL` en `AZSQL` worden in het DWH het type `MSSQL_ADF`.

Daarnaast bevat de kiezer **presets**: bron-labels die intern op een generiek type uitkomen met vaste URL/auth, zodat je alleen een domein of token invult. Voorbeelden: `CBS`, `TweedeKamer`, `Topdesk`, `Graph`, `Dynamics_365` en `Intune_DWH` worden opgeslagen als `OData`; `Simplicate` en `BoardEPM` als `RestService`.

### Wat er gebeurt bij het toevoegen

Bij het opslaan vult Yres een aantal SQL-tabellen met basis-bron-informatie en start een keten van achtergrondtaken: `CreateDataSourceInADF` → `SetDataSourceCredentials` → `CreateDataSourceInDataWarehouse`. De eerste stap voegt de linked service plus de `GetMetaData - <bron>`-pipeline toe aan de ADF-factory. Dit publiceren naar ADF is **asynchroon**: tot het klaar is toont de detailpagina van de bron de melding *"source not published"*. Mislukt een stap, dan draait alles terug (de bron wordt uit DWH én ADF verwijderd).

## Metadata verversen (Refresh metadata)

Op de detailpagina van een database-bron staat bovenaan een **metadata-pipelinekaart** met de laatste run van `GetMetaData - <bron>` (laatste run, status, link naar ADF) en de knoppen **Refresh metadata** en **Load data (all)**.

![Used overview van een bron: een metadata-pipelinekaart met laatste run en status plus de knoppen 'Refresh metadata' en 'Load data (all)', daaronder de tabel met geconfigureerde used tables.](/img/screens/source-usedoverview.svg)

*De Used overview-pagina dispatcht op brontype: database-bronnen tonen Used tables, file-bronnen Used files en REST-bronnen Used REST service.*

**Refresh metadata** draait de `GetMetaData`-pipeline. Die leest schema's, tabellen en kolommen uit de bron en landt ze in de **dictionary** (`LoadManagement.Dictionary` / `LoadManagement.vwInitialDictionary`). De wizard om tabellen toe te voegen leest die dictionary, dus:

:::tip Eerst verversen, dan tabellen toevoegen
Een metadata-refresh **moet** gedraaid zijn voordat je tabellen kunt toevoegen. Ververs de metadata ook handmatig na het aanmaken van een bron, en opnieuw wanneer het bronschema wijzigt.
:::

**Uitzondering — file- en REST-bronnen slaan dit over.** Voor file-sources (bv. Azure Blob) en REST API-services bestaat er geen dictionary; je beheert de tabellen/bestanden direct (voor Azure Blob upload je bestanden zelfs rechtstreeks).

### Tabellen toevoegen

Na het verversen voeg je via de wizard tabellen toe. Daarbij kies je per tabel de kolommen, het [laadtype](../concepten/load-types.md) en de key-kolommen. Belangrijk: het toevoegen van een tabel maakt de fysieke STAGE/HIS-tabellen aan en boekt een wijziging — **er wordt nog geen data geladen**. Het daadwerkelijke laden start je via Load data of via een pipeline-run.

## Typemapping

Typemapping bepaalt hoe een brondatatype vertaald wordt naar een DWH-datatype (voor de STAGE-, HIS- en Expose-kolommen). Er zijn twee niveaus.

### Per-bron typemapping — `/sources/:sourceId/typemapping`

![Per-bron typemapping: een 'Generate Typemapping'-knop boven een SQL-editor op LoadManagement.TypeMapping, gefilterd op deze bron.](/img/screens/source-typemapping.svg)

*De per-bron typemapping is een bewerkbare SQL-grid op `LoadManagement.TypeMapping`, gefilterd op `WHERE SourceSystem = '<bron>'` — alleen de regels van déze bron.*

- Knop **Generate Typemapping** — leidt standaard-mappingregels af uit het bronschema (een gemonitorde achtergrondtaak). De generatie is **additief**: ze vult alleen ontbrekende type/kolom-combinaties aan en **overschrijft je eigen aanpassingen niet**.
- Onder de knop een bewerkbare SQL-grid; je kunt regels handmatig overrulen of terugvallen op de globale mapping.

:::note Alleen in dev
Het typemapping-tabblad/-kolom verschijnt **alleen in de dev-omgeving**. Mappings worden via het wijzigingenproces naar andere omgevingen gebracht.
:::

### Globale typemapping — `/admin/globaltypemapping`

De globale typemapping is de organisatiebrede standaard die voor **alle** bronnen en omgevingen geldt, tenzij een per-bron-regel hem overschrijft. Bereikbaar via Admin (of het tandwiel bij Sources).

![Globale typemapping: één SQL-editor op LoadManagement.GlobalTypeMapping zonder bronfilter — de org-brede standaard datatype-map.](/img/screens/admin-globaltypemapping.svg)

*De globale typemapping is dezelfde soort SQL-grid, maar dan op `LoadManagement.GlobalTypeMapping` en **zonder** bronfilter. Gebruik hem om datatypes/eigenschappen te unificeren die per bron verschillen, zodat views die meerdere brontypes combineren soepeler werken.*

## Acties per bron (afhankelijk van brontype)

Vanuit de detailpagina van een bron zijn per used table een aantal acties beschikbaar. Welke verschijnen, hangt af van het brontype:

| Actie | Beschikbaar voor | Doel |
|---|---|---|
| **Refresh metadata** | alle bronnen **behalve** file & RestService | Ververst de dictionary (`LoadManagement.Dictionary`). |
| **Compare metadata** | alle bronnen behalve file & RestService | Toont verschillen tussen het huidige bronschema en de dictionary (verschijnt als `MetadataComparison` afwijkt). |
| **Column info** | alle bronnen behalve file & RestService | Toont de kolommen met hun bron- en doel-datatypes (key-kolommen met 🔑). |
| **Load data** / **Load data (all)** | alle bronnen | Start een ad-hoc load voor één tabel of voor alle tabellen van de bron. |
| **Activate / deactivate** | alle bronnen (v≥1.54) | Bepaalt of de tabel meegaat in toekomstige loads. |
| **Connectivity test** | geïnstalleerde bronnen behalve RestService | Snelle verbindingstest vanuit de catalogus. |

:::note Wijziging vereist (dev)
In de dev-omgeving blokkeert de pagina het bewerken van tabellen als er **geen open wijziging** is; je krijgt dan een link naar [Projects/Changes](./projecten-changes.md). Maak eerst een wijziging aan.
:::
