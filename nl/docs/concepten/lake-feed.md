---
sidebar_position: 5
title: Lake feed (change feed)
description: Hoe Yres elke load als append-only Parquet change feed in de Data Lake landt — met I/U/D-markering per rij, zodat je er zowel de actuele stand als de volledige historie uit afleidt.
---

# Lake feed (change feed)

Naast het laden naar de SQL-database kan Yres elke tabel **ook** naar de Azure Data Lake schrijven. Vanaf
**v1.56** gebeurt dat als een **append-only change feed**: per laadrun landt er één Parquet-bestand met
**alleen de mutaties van die run**, waarbij elke rij een markering `I` (insert), `U` (update) of `D`
(delete) draagt.

Daarmee is de Data Lake niet langer een reeks losse momentopnames, maar een volwaardige mutatiestroom:
je leidt er zowel de **actuele stand** als de **volledige historie** uit af, en je kunt hem rechtstreeks
als invoer voor een `MERGE` naar een Delta-tabel gebruiken.

:::note De database blijft de bron van waarheid
De feed is **afgeleide** data. De SCD2-historie in Azure SQL (`STAGE` → `HIS`) blijft leidend; de lake
is een parallelle landing voor analytics-, data-science- en lakehouse-scenario's.
:::

## Wat er verandert ten opzichte van vroeger

Vóór v1.56 kopieerde de stap `Load DL` simpelweg de volledige inhoud van de stagingtabel naar de Data
Lake. Elke run schreef dus opnieuw álles weg — ook ongewijzigde rijen — en verwijderingen waren
onzichtbaar: de rij verdween gewoon uit de volgende dump.

| | Vroeger (STAGE-dump) | Nu (change feed) |
|---|---|---|
| Inhoud per run | de volledige stagingtabel | alleen de mutaties van die run |
| Run zonder wijzigingen | schreef toch een bestand | schrijft **geen** bestand |
| Ongewijzigde rijen | werden elke run opnieuw geschreven | worden nooit verstuurd |
| Verwijderde rijen | onzichtbaar | expliciete `D`-rij (tombstone) |
| Historie | alleen de laatst gedumpte stand | volledig af te leiden uit alle bestanden |
| Groei | schaalt met herlaadvolume | schaalt met mutatievolume |
| Pad | `<Bron>/<Schema>/<jaar>/<maand>` | `lake/<Bron>/<Schema>/<Tabel>/Year=…/Month=…` |
| Bestandsnaam | `<Tabel>-<tijdstip>` (zonder extensie) | `<Tabel>-g<Generatie>-<PipelineRunId>.parquet` |
| Herstart van een run | leverde een extra bestand op | overschrijft het eigen bestand (binnen dezelfde generatie) |

:::caution Wat dit betekent voor bestaande afnemers
De feed schrijft naar een **nieuw pad**. De bestanden die eerder onder `<Bron>/<Schema>/<jaar>/<maand>`
zijn geland, blijven ongemoeid staan — er wordt niets gemigreerd of opgeruimd. Rapporten of notebooks die
op het oude pad wezen én op een volledige momentopname per bestand rekenden, moeten worden aangepast:
een feedbestand bevat immers alleen de mutaties. Gebruik daarvoor het [leespatroon](#de-feed-lezen)
hieronder.
:::

## Wat er in de Data Lake landt

```
datalake-yres
└── lake/<Bron>/<Schema>/<Tabel>/Year=<jjjj>/Month=<mm>/<Tabel>-g<Generatie>-<PipelineRunId>.parquet
```

- **Eén bestand per laadrun per tabel.** Runs zonder mutaties schrijven niets.
- **`Year=` / `Month=`** zijn hive-style partitiemappen, zodat elke query-engine op periode kan snoeien.
- De bestandsnaam draagt het **generatienummer** (`g<Generatie>`, bijgehouden in
  `LoadManagement.LakeFeedGeneration`) en het **ADF pipeline run-id**: draai je dezelfde run opnieuw
  binnen dezelfde generatie, dan overschrijft hij zijn eigen bestand. Dubbele rijen door een herstart
  zijn dus uitgesloten.

Naast de gewone databkolommen en `ETL_Date` draagt elke rij vier framework-kolommen:

| Kolom | Betekenis |
|---|---|
| `KeyHash` | SHA2_512-hash over de sleutelkolommen — de stabiele identiteit van de rij. |
| `RowHash` | SHA2_512-hash over de gevolgde kolommen van déze versie. |
| `YresAction` | `I` = nieuwe sleutel, `U` = nieuwe versie van een bestaande sleutel, `D` = sleutel verwijderd. |
| `YresDateStart` | Het moment waarop deze versie actueel werd; bij een `D`-rij het moment van verwijderen. |

:::info `D`-rijen dragen geen data
Een tombstone bevat de hashes en `YresDateStart`, maar de businesskolommen zijn leeg (`NULL`). Hij zegt
"deze sleutel bestaat niet meer", niet "deze sleutel had deze waarden".
:::

`D`-rijen verschijnen alleen bij de laadtypen die verwijderingen kunnen detecteren — **IMAGE**,
**DELTAIMAGE**, **OVERWRITE** en **RELOAD**. Zie [Load types](./load-types.md). Het loadtype
**ADDITIONAL** kent geen mutatiebegrip: dat levert elke run de volledige stagingtabel als `I`-rijen aan
(pure append).

## Aanzetten

De feed hangt aan de bestaande kolom **`DataPlatform`** op de tabelconfiguratie
(`[LoadManagement].[UsedTables]`):

| Waarde | Gevolg |
|---|---|
| `DWH` | alleen de SQL-database (standaard) |
| `DL` | alleen de lake feed |
| `DWH,DL` | allebei |

Bij een **DL-only-tabel** (`DL` zonder `DWH`) maakt Yres bewust géén history-tabel in de database aan —
de data leeft volledig in de Data Lake. Bevragen vanuit SQL kan toch: Yres onderhoudt daarvoor
automatisch leesobjecten in het `[DL]`-schema (zie [hieronder](#dl-schema)).

Zet je `DL` weer uit, dan blijven de al geschreven Parquet-bestanden staan; een health check wijst je op
de achtergebleven administratie in de database (zie [Bewaking](#bewaking)).

:::caution Deploy-volgorde
De ADF-pipelines roepen procedures aan die met de database meekomen. Werk daarom **altijd eerst de
database bij (DACPAC) en publiceer daarna pas de ADF-factory**. Andersom faalt de lake-tak.
:::

## Hoe Yres de mutaties bepaalt

Om te weten wát er in een run veranderd is, houdt Yres per lake-tabel een **slanke administratie** bij in
het schema `[LAKE]` (instelbaar met de setting `SchemaLAKE`). Die tabel bevat **geen businessdata** —
alleen de hashes, de datums en de eventuele deltakolom.

```
Bron ──Copy──► STAGE.<Tabel>
                   │
                   ├─ Prepare lake load  →  [LoadManagement].[spLoadLake]
                   │      └→ spHIS_InsertAndUpdate @LakeMode = 1   (SCD2-merge op de slanke [LAKE]-tabel)
                   │
                   ├─ Load DWH           →  [LoadManagement].[spLoadDWH]   (de gewone SCD2-merge naar HIS)
                   │
                   ├─ Lookup lake feed   →  [LoadManagement].[spGetLakeFeed]
                   │      └→ mutatiequery + aantal mutaties
                   │
                   └─ Write lake feed    →  Copy → Parquet in de Data Lake  (alleen als er mutaties zijn)
                          └→ Maintain lake view  →  [LoadManagement].[spMaintainLakeExternal] (Scope=VIEW)
```

Het is dus **dezelfde, bewezen SCD2-merge** die de historie in de database opbouwt, hier toegepast op een
administratietabel zonder inhoud. Wat de merge als nieuw of gewijzigd markeert, is precies wat de feed
verstuurt; wat hij afsluit zonder tegenhanger in de staging, wordt een `D`-rij. Levert een run nul
mutaties op, dan slaat ADF de kopieerstap over en ontstaat er geen leeg bestand. Na een geslaagde kopie
werkt de stap **Maintain lake view** (`spMaintainLakeExternal` met scope `VIEW`) de external view over de
feed-bestanden bij.

De stap **Write lake feed** loopt **parallel aan Load DWH**, niet erna: de lake-uitvoer vertraagt het
laden van het datawarehouse dus niet.

## De feed lezen {#de-feed-lezen}

De actuele stand haal je uit de feed door per sleutel de laatste versie te nemen en tombstones weg te
laten. Dit patroon werkt in elke engine:

```sql
WITH ranked AS (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY KeyHash ORDER BY YresDateStart DESC) AS rn
    FROM <feed>
)
SELECT * FROM ranked WHERE rn = 1 AND YresAction <> 'D';
```

De **volledige historie** is simpelweg álle rijen; de einddatum van een versie leid je af met
`LEAD(YresDateStart) OVER (PARTITION BY KeyHash ORDER BY YresDateStart)`.

| Platform | Hoe je leest |
|---|---|
| **Microsoft Fabric** | `OPENROWSET(BULK '…/lake/<Bron>/<Schema>/<Tabel>/**', FORMAT='parquet')` in een Warehouse — geen Spark nodig. Voor Direct Lake vouw je de feed met Spark naar een Delta-tabel. |
| **Databricks** | `read_files(…, format => 'parquet')`, of met Auto Loader incrementeel vouwen naar Delta: `MERGE` op `KeyHash`, `D`-rijen als delete. |
| **Azure SQL Database** | Voor **DL-only-tabellen** bouwt Yres dit zelf: kant-en-klare views in het `[DL]`-schema (zie [hieronder](#dl-schema)). Handmatig kan het ook, via data virtualization (`OPENROWSET` over een external data source). Vereist een managed identity op de SQL-server met **Storage Blob Data Reader** — dezelfde inrichting als de [archief-unionviews](./archivering.md). |

:::caution Azure SQL: data virtualization is preview
Lezen vanuit Azure SQL werkt, maar is een preview-feature van Azure SQL Database. Let daarbij op: gebruik
altijd een **external data source** (een kale URL in `BULK` eist alsnog een credential), gebruik het
`adls://`-schema (niet `https://`), en geef kolomtypen expliciet op. Wijst het pad naar een map **zonder**
bestanden, dan volgt een foutmelding in plaats van een lege resultaatset.
:::

## DL-only-tabellen bevragen vanuit SQL: het `[DL]`-schema {#dl-schema}

Voor DL-only-tabellen genereert en onderhoudt **`[LoadManagement].[spMaintainLakeExternal]`** automatisch
drie soorten leesobjecten in het `[DL]`-schema (instelbaar met de setting `SchemaDL`):

| Object | Wat het is |
|---|---|
| `[DL].[<Tabel>_Feed_g<N>]` | **External table per schemageneratie** — leest de Parquet-bestanden van die generatie rechtstreeks uit de Data Lake. |
| `[DL].[<Tabel>_Feed]` | **Union-view over alle generaties** — de complete, ruwe change feed als één tabel. |
| `[DL].[<Tabel>]` | **HIS-vormige view** — leidt uit de feed de vertrouwde SCD2-vorm af (`ETL_Date`, `ETL_EndDate`, `isCurrent`), zodat je een DL-only-tabel precies zo bevraagt als een gewone history-tabel. |

Wijzigt het bronschema (een nieuwe generatie), dan komen de objecten automatisch mee: de externe tabellen
worden per generatie bijgehouden tijdens de load en de views ververst na elke geslaagde kopie — er is
geen handwerk nodig.

Eenmalige inrichting per omgeving: de instellingen **`SchemaDL`** en **`LakeLocation`**
(`adls://<container>@<account>.dfs.core.windows.net`), een **managed identity op de SQL-server** met
**Storage Blob Data Reader** op de Data Lake, en database compatibility level **130 of hoger** — de
[health checks](#bewaking) wijzen je erop als er iets ontbreekt. Data virtualization is een
preview-feature van Azure SQL Database.

## Opnieuw opbouwen

Raakt de administratie uit de pas — bijvoorbeeld na handmatig ingrijpen of doordat er even geen feed
geschreven werd — dan wis je hem voor één tabel of voor alles:

```sql
EXEC [LoadManagement].[spResetLakeIndex] @Target = 'Bron_Schema_Tabel';  -- leeg = alle lake-tabellen
```

De eerstvolgende load verstuurt dan de complete actuele dataset opnieuw als `I`-rijen. Consumenten die de
actuele stand via het patroon hierboven bepalen, merken daar niets van; een Delta-fold merget de verse
rijen gewoon overheen.

## Bewaking {#bewaking}

Een reeks [health checks](../frontend/admin.md) bewaakt de feed en de leesobjecten:

| Check | Signaleert |
|---|---|
| **2.12** | Een tabel staat op `DL` en heeft succesvolle loads, maar er is geen administratie in het `[LAKE]`-schema — er wordt voor die tabel dus geen feed geproduceerd. Meestal draait de ADF-factory nog een oudere versie. |
| **2.13** | Er staat nog een `[LAKE]`-administratietabel voor een tabel die niet meer op `DL` staat. De check levert een opruimscript; de Parquet-bestanden blijven ongemoeid. |
| **2.14** | Een DL-only-tabel is geladen, maar mist (een deel van) zijn leesobjecten in het `[DL]`-schema — de feed is dan niet volledig vanuit SQL te bevragen. |
| **2.15** | Er staan nog `[DL]`-leesobjecten voor een tabel die geen actieve DL-only-tabel meer is. De check levert een opruimscript; de Parquet-bestanden blijven ongemoeid. |
| **2.16** | Er zijn actieve DL-only-tabellen, maar `SchemaDL` of `LakeLocation` is nog niet geconfigureerd. |
| **2.17** | Het database compatibility level is lager dan 130, terwijl external tables/`OPENROWSET` dat vereisen. Inclusief kant-en-klaar herstelscript. |
| **2.18** | Recente meldingen dat het onderhoud van de leesobjecten is mislukt of overgeslagen — met de details in de monitoring. |

## Groei

De feed groeit mee met het **aantal mutaties**, niet met het aantal herladingen: een tabel die dagelijks
volledig herladen wordt maar nauwelijks wijzigt, levert nauwelijks bestanden op. Bij hoge mutatievolumes
is het gebruikelijk de feed aan consumentzijde periodiek te vouwen naar een Delta-tabel of een snapshot;
Yres comprimeert de feed zelf niet.

## Zie ook

- [Gegevensstroom](./gegevensstroom.md) — waar de lake-stappen in de laadflow zitten.
- [Historie & SCD2](./historie-scd2.md) — het merge-mechanisme waar de feed op gebaseerd is.
- [Archivering](./archivering.md) — de andere Parquet-uitvoer, voor oude historie.
- [Azure Data Lake](../integraties/bronnen/azure-data-lake.md) — de opslag zelf.
