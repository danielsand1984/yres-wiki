---
sidebar_position: 3
title: Databron koppelen & laden
description: Stap voor stap een bron koppelen (incl. publiceren naar ADF), metadata verversen, tabellen toevoegen met de wizard en een load configureren.
---

# Databron koppelen & laden

Een bron toevoegen in Yres is geen kwestie van een pipeline schrijven: je vult een **wizard** in, en Yres genereert op de achtergrond de bijbehorende Azure Data Factory (ADF) linked service en pipelines. Deze pagina loopt door de vier stappen die je daarna doorloopt:

1. **Een bron koppelen** — de *Create source*-wizard (incl. het wachten op publicatie naar ADF).
2. **Metadata verversen** — de `GetMetaData`-pipeline draaien zodat Yres de schema's, tabellen en kolommen kent.
3. **Tabellen toevoegen** — met de *Add table*-wizard kiezen welke brontabellen geladen worden.
4. **Een load configureren** — load type, sleutelkolommen en deltakolommen instellen.

:::info Welke bronnen en welke gegevens heb je nodig?
Yres ondersteunt onder andere SQL Server, Azure SQL, Oracle, DB2, PostgreSQL, MySQL, Snowflake, SharePoint, Power BI, AFAS, Exact Online, Salesforce, SAP en generieke **OData**/**REST**-services. De exacte verbindingsvelden, authenticatie en eventuele integration runtime verschillen per type — zie [databron-vereisten](../referentie/databron-vereisten.md).
:::

## 1. Een bron koppelen

Een bron maak je altijd aan in de **dev**-omgeving; via de [Changes](../frontend/projecten-changes.md)-flow promoveer je hem later naar test/prod. De *Create source*-knop verschijnt daarom alleen op dev.

![De Create source-wizard in Yres, stap 1 van 2, met velden voor source name, type, integration runtime, credentials en tags](/img/screens/source-create-wizard.png)

*Stap 1 van de Create source-wizard: definieer eerst de bron (naam, type, runtime), daarna voer je per omgeving de inloggegevens in.*

(1) **Source name** — uniek per organisatie, begint met een letter, alfanumeriek, 2–45 tekens. Deze naam wordt ook de naam van de ADF linked service en de Key Vault-secretgroep `adf-{naam}-…`.
(2) **type** — de bronkiezer (databases, apps, generieke protocollen). Je keuze bepaalt welke inlogvelden je in stap 2 te zien krijgt.
(3) **integration runtime** — standaard `AutoResolveIntegrationRuntime` (de cloud-runtime). Kies een **self-hosted IR** voor on-premises of afgeschermde bronnen (verplicht voor File Server en lokale bestanden).
(4) **Credentials identical for all environments?** — `Yes` voer je de inloggegevens één keer in en hergebruikt ze voor prod; `No` voegt een invulstap per omgeving toe. Voor **Exact Online** staat dit vast op `No` (een aparte app per omgeving).
(5) **Stap 2 (Credentials)** — de bron-specifieke velden (bijvoorbeeld host, database name, port, user name, password voor SQL-bronnen), per omgeving.
(6) **Next** — gaat naar de inloggegevens; de laatste stap verstuurt de aanvraag (`POST /data-source`).

### Stappen

1. Open een bron in de sectie **Data sources** en klik op **Create source** (alleen zichtbaar op dev).
2. Vul stap 1 in: **Source name**, **type**, **integration runtime**, **Credentials identical for all environments?**, optioneel een verloopdatum (**credentials expire?**) en **Tags**.
3. Klik **Next** en vul de inloggegevens in — één formulier als de credentials identiek zijn, anders één per omgeving.
4. Klik **Submit**. Yres slaat **geen** wachtwoorden of secrets op in de eigen database; die gaan rechtstreeks naar de **Azure Key Vault** van de klant. De linked service verwijst alleen naar die secrets.

### Wachten op publicatie naar ADF

Na **Submit** verschijnt een voortgangsmelding in plaats van een direct resultaat. Dat komt doordat het aanmaken van een bron **asynchroon** verloopt: de backend draait een taakketen `CreateDataSourceInADF → SetDataSourceCredentials → CreateDataSourceInDataWarehouse`. De eerste stap voegt de linked service én de pipeline **`GetMetaData - <bron>`** toe aan de factory, maar het publiceren naar ADF kost even tijd.

:::warning Even geduld na het aanmaken
Zolang de publicatie loopt, toont de **Used tables**-pagina de melding *"source not published"* — de `GetMetaData - <bron>`-pipeline bestaat dan nog niet. Wacht tot de voortgangsmelding klaar is voordat je metadata ververst of tabellen toevoegt. Mislukt een stap, dan rolt Yres de hele bron automatisch terug (uit de DWH, uit ADF en uit de eigen database).
:::

## 2. Metadata verversen

Voordat je tabellen kunt toevoegen, moet Yres weten welke schema's, tabellen en kolommen de bron heeft. Dat doet de pipeline **`GetMetaData - <bron>`**: hij leest de metadata uit en vult de woordenboektabellen (`LoadManagement.Dictionary` / `LoadManagement.vwInitialDictionary`), die de *Add table*-wizard daarna uitleest.

### Stappen

1. Open de bron en ga naar **Used tables**. Een kaart toont de laatste run en status van `GetMetaData - <bron>`; via het link-icoon spring je naar de ADF-monitoring.
2. Klik op **Refresh metadata**.
3. Bevestig in het dialoogvenster (`"Run GetMetaData - <bron>"`). De run start; ververs de pagina als de status nog op *In progress* staat.

:::info Bestands- en REST-bronnen slaan dit over
Voor **bestandsbronnen** (zoals File Server of lokale bestanden) en **REST API**-bronnen is er geen metadata-verversing. Die leiden naar een eigen flow (Used files / Used REST service) in plaats van de tabel-wizard.
:::

## 3. Tabellen toevoegen (de *Add table*-wizard)

Op **Data sources › (bron) › Used tables** zie je welke brontabellen al geladen worden (gelezen uit `LoadManagement.vwUsedTables`). Per rij kun je kolommen bekijken, een ad-hoc load draaien en — vanaf v1.54 — een tabel **activeren/deactiveren** zonder de definitie of historie te verwijderen.

![De Used tables-pagina in Yres met een metadata-pipelinekaart en een tabel met gebruikte brontabellen, load types en doeltabellen](/img/screens/source-usedtables.png)

*De Used tables-pagina: bovenaan de metadata-pipelinekaart, daaronder de geladen tabellen met hun load type, deltakolom en doeltabel.*

(1) **Metadata-pipelinekaart** — laatste run, status en ADF-link van `GetMetaData - <bron>`.
(2) **Actieknoppen** — *Refresh metadata* herscant de bron; *Load data (all)* draait `Dynamic Workflow YRES` voor alle tabellen.
(3) **Kaarttitel** — de bronnaam met de bijbehorende tag-chips.
(4) **Tabellenraster** — uit `LoadManagement.vwUsedTables`: SourceSchema, SourceTable, LoadType, DeltaColumn, LatestRecord en TargetTable.
(5) **Rij-acties** — kolominfo, data laden, activeren/deactiveren en (indien van toepassing) een waarschuwing dat de bron-metadata is afgeweken.
(6) **Gedeactiveerde tabel** — rijen met `active = 0` worden grijs weergegeven en bij een load overgeslagen.

:::tip Eerst een open Change
Op dev blokkeert de pagina het bewerken van tabellen als er **geen open Change** is, en linkt dan naar [Projecten & Changes](../frontend/projecten-changes.md). Bij een organisatie met één omgeving vervalt deze stap; de wijziging wordt dan automatisch onder `ChangeId 1` geboekt.
:::

### De zeven wizard-stappen

Klik op **Add table** om een nieuwe brontabel toe te voegen. De wizard loopt in vaste volgorde door zeven stappen:

`Project → Schema/table → Columns → Load type → Key column → Options → Overwrite`

![De Add table-wizard in Yres op de stap Columns, met een stappenbalk en een kolommentabel met RowHash-selectievakjes en TargetType-overrides](/img/screens/source-usedtable-wizard.png)

*De Add table-wizard, geopend op de stap Columns. Load type en sleutelkolommen volgen in de stappen erna.*

(1) **Stappenbalk** — de zeven stappen; je staat nu op *Columns*.
(2) **Geselecteerde brontabel** — de schema/tabel die je in stap 2 koos.
(3) **Kolommen aanvinken** — kies welke kolommen je wilt laden (minimaal één); "select all" vinkt alles aan.
(4) **RowHash-kolom** — kolommen met RowHash aangevinkt tellen mee in de SCD2-wijzigingsdetectie (v1.54+). Gereserveerde namen (`keyhash`, `rowhash`, `etl_date`, `etl_enddate`, `iscurrent`, `delta`) zijn geblokkeerd.
(5) **TargetType overschrijven** — pas per kolom het doeltype of de grootte aan (bijvoorbeeld `varchar(100)`, `decimal(18,2)`).
(6) **Back / Next** — navigeer door de stappen; *Next* leidt naar *Load type*, *Key column*, *Options* en *Overwrite*.

Stap voor stap:

1. **Project en change** — kies een open Project en Change (vervalt bij één omgeving). Bij verwijderen toont de wizard alleen deze stap.
2. **Schema / tabel / dataplatform** — kies schema en tabel uit de nog niet gebruikte tabellen, plus minstens één **DataPlatform**: *Data Warehouse* en/of *Azure Datalake*. Bij bewerken zijn schema en tabel alleen-lezen.
3. **Columns** — vink kolommen aan, stel per kolom de **RowHash**-deelname in (v1.54+) en overschrijf eventueel het **TargetType**.
4. **Load type & deltakolommen** — zie [een load configureren](#4-een-load-configureren).
5. **Key column** — zie [een load configureren](#4-een-load-configureren).
6. **Options** — extra opties afhankelijk van service-tier en brontype (bijvoorbeeld geheugen-geoptimaliseerde tabellen, package size, delta-overlap). Zijn er geen, dan kun je de stap overslaan.
7. **Overwrite** — optioneel de fysieke STAGE/HIS-doelnamen overschrijven. Een live preview toont het resultaat, bijvoorbeeld `[STAGE].[BRON_SCHEMA_TABEL]` en `[ODS].[…]`.

#### De wizard in beeld

![Add table-wizard: kies het Project en de Change waaronder de wijziging wordt geboekt.](/img/screens/source-usedtable-wizard-step2.png)
*Project & Change — alles wat je toevoegt wordt onder de gekozen Change geboekt (vervalt bij één omgeving).*

![Add table-wizard: kies schema, tabel en het dataplatform.](/img/screens/source-usedtable-wizard-step3.png)
*Schema, tabel & dataplatform — Data Warehouse en/of Azure Datalake.*

![Add table-wizard: load type DELTA met een deltakolom.](/img/screens/source-usedtable-wizard-step5.png)
*Load type — bij een DELTA-type kies je de deltakolom voor incrementeel laden.*

![Add table-wizard: de sleutelkolom voorspeld of handmatig gekozen.](/img/screens/source-usedtable-wizard-step6.png)
*Key column — laat Yres de sleutel voorspellen (predict) of kies handmatig (manual).*

![Add table-wizard, laatste stap: de fysieke STAGE- en HIS-doelnamen met de knop Create.](/img/screens/source-usedtable-wizard-step7.png)
*Overwrite — controleer of overschrijf de STAGE/HIS-doelnamen en klik **Create** om de tabel te registreren.*

:::note Toevoegen ≠ laden
Het toevoegen van een tabel registreert hem in `LoadManagement`, boekt een wijziging onder de gekozen Change en maakt de fysieke **STAGE**- en **HIS**-tabellen aan. **Er wordt nog geen data geladen** — dat doe je daarna via een [load](../frontend/load-management.md) of een trigger.
:::

## 4. Een load configureren

Tijdens de stappen *Load type*, *Key column* en *Options* van de wizard leg je vast hoe de tabel geladen wordt.

### Load type

Yres kent **zeven** load types die bepalen wat er met de bestaande historie in de **HIS**-tabel gebeurt. Ze worden per tabel vastgelegd in `LoadManagement.UsedTables.LoadType` en zijn per run te overschrijven.

:::tip Load types op één plek
De volledige uitleg van alle zeven load types — wat ze met de historie doen, wanneer je welke kiest, en de veelgemaakte verwarring tussen **OVERWRITE** (historie weg) en **RELOAD** (historie behouden) — staat op de pagina **[Load types](../concepten/load-types.md)**. Dat is de enige canonieke bron; deze pagina dupliceert die tabel bewust niet.
:::

Kort: de velden **Delta column** en **Additional delta column** verschijnen alleen wanneer het load type met `DELTA` begint of `ADDITIONAL` is. De deltakolom komt uit de in stap 3 geselecteerde kolommen (`LoadManagement.Dictionary`). Voor brontype `SAP_BDC` wordt de deltakolom vast op `ETL_DATE` gezet.

### Sleutelkolommen (key columns)

Sleutelkolommen identificeren een rij uniek en bepalen de `KeyHash` — daarmee weet de engine welke STAGE-rij hoort bij welke HIS-rij. Je hebt drie modi:

- **Predict** — Yres voorspelt de sleutel en toont het voorstel (alleen-lezen).
- **Manual** — je vinkt zelf de sleutelkolommen aan; minimaal één is verplicht. Standaard worden alleen NOT NULL-kolommen getoond; met "Show nullable columns" zie je ook nullable kolommen.
- **No key** — **alleen beschikbaar voor `OVERWRITE` en `ADDITIONAL`**. Deze twee types matchen niet op een sleutel, dus daar mag (en moet) je zonder sleutel laden.

### Deltakolommen

Voor incrementele loads (load type begint met `DELTA`) gebruikt Yres een **deltakolom**: een oplopende wijzigingskolom waarmee alleen nieuwe of veranderde records worden opgehaald. Voor **SQL-bronnen worden twee deltakolommen ondersteund** — komma-gescheiden in `LoadManagement.UsedTables.deltaColumn`, met hetzelfde datatype; de hoogste waarde telt.

:::warning MySQL: slechts één deltakolom
Twee deltakolommen worden ondersteund voor alle SQL-gebaseerde bronnen **behalve MySQL**. Voor een MySQL-bron kun je dus maar **één** deltakolom opgeven.
:::

## Wat er server-side gebeurt

Wanneer je de wizard afrondt, stuurt Yres de hele configuratie in één keer naar de backend, die de taakketen `"Add table <tabel>"` start: de tabel wordt geregistreerd in `LoadManagement`, een wijziging wordt onder de gekozen Change geboekt en de fysieke STAGE/HIS-tabellen worden uit het woordenboek aangemaakt. Tijdens een latere load kopieert ADF de bron naar **STAGE** en roept dan de SCD2-merge-engine aan (`LoadManagement.spLoadDWH` → `spHIS_InsertAndUpdate`), die het ingestelde load type toepast.

## Gerelateerde pagina's

- [Load types](../concepten/load-types.md) — de zeven load types in detail (incl. OVERWRITE vs. RELOAD).
- [Historie & SCD2](../concepten/historie-scd2.md) — hoe `KeyHash`/`RowHash`, `ETL_Date`/`ETL_EndDate` en `IsCurrent` werken.
- [Gegevensstroom](../concepten/gegevensstroom.md) — hoe één load van trigger tot gehistoriseerde data loopt.
- [Databron-vereisten](../referentie/databron-vereisten.md) — verbindingsvelden en authenticatie per brontype.
- [Views, pipelines & triggers](./views-pipelines.md) — loads handmatig draaien en automatiseren.
