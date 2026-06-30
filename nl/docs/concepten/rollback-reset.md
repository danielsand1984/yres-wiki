---
sidebar_position: 5
title: Rollback & reset
description: Hoe je in Yres een mislukte of foutieve load terugdraait (spRollback) of een tabel volledig leegmaakt (spReset) via de ADF-pipelines Rollback en Reset, en wat elk daarvan precies herstelt.
---

# Rollback & reset

Soms wil je een load **ongedaan maken**: de bron leverde dubbele records, er werd het verkeerde [load type](./load-types.md) gebruikt, of een verlopen credential leverde halve data. Yres biedt daarvoor twee herstelacties die allebei op **één tabel** werken:

- **Rollback** — draait een tabel terug naar de toestand op een gekozen **tijdstip**. Alles wat sinds dat moment is ingevoegd, gewijzigd of afgesloten, wordt teruggedraaid. De oudere historie blijft staan.
- **Reset** — maakt een tabel **volledig leeg** (truncate). Alle historie verdwijnt en de tabel begint weer bij nul.

Beide acties draaien als **SQL in het datawarehouse** (`[LoadManagement].[spRollback]` en `[LoadManagement].[spReset]`); ADF start ze alleen als pipeline. Net als bij een gewone load is ADF de generieke uitvoerder en zit de logica in SQL.

:::warning Rollback en reset verwijderen data
Beide procedures voeren `DELETE`/`TRUNCATE` uit op het history-schema (`HIS`/`ODS`). Een **reset** is onomkeerbaar: de hele tabelinhoud is weg. Een **rollback** verwijdert alle loads ná het gekozen tijdstip. Controleer altijd eerst de juiste tabel en datum. Beide procedures kennen een **dry-run** (`@Execute = 0`) waarmee je het te draaien script alleen láát afdrukken zonder iets te wijzigen — gebruik die om te valideren voordat je echt uitvoert.
:::

## Waar je het start

Rollback en reset worden in de webapp aangeboden vanuit het **monitoring-scherm** (Load management → Monitoring): per geladen tabel kun je een specifieke load selecteren en daarvandaan een rollback naar dat moment starten, of de tabel in zijn geheel resetten.

![Monitoring-scherm met per tabel de laadgeschiedenis en de acties rollback en reset](/img/screens/loadmanagement-monitoring.png)

*Het monitoring-scherm toont per tabel de laatste loads, hun status en duur. Vanaf hier start je een rollback (terug naar een gekozen moment) of een reset (tabel volledig leegmaken).*

(1) De tabellijst met per rij de laatste load, status en aantal rijen.
(2) Per load een tijdstip — dat tijdstip gebruik je als grens bij een rollback.
(3) De rollback-/reset-actie per tabel.

Achter de schermen start de webapp daarvoor een **ADF-pipeline** (`Rollback` of `Reset`); je ziet de voortgang terug in de **Job Monitor** rechtsboven, samen met de overige systeemtaken (loads, metadata-refreshes, view-persistence).

:::note
De beschreven *werking* van `spRollback`/`spReset` en de ADF-pipelines `Rollback`/`Reset` is geverifieerd tegen de code. De knoppen vind je in het **Monitoring**-scherm (zie de schermafbeeldingen in [Load management](../frontend/load-management.md)).
:::

## Rollback — terug naar een tijdstip

`[LoadManagement].[spRollback]` draait één tabel terug naar de toestand van een gekozen moment. Hij krijgt vier parameters:

| Parameter | Type | Betekenis |
|---|---|---|
| `@Execute` | `BIT` (standaard `0`) | `0` = alleen het script afdrukken (dry-run); `1` = daadwerkelijk uitvoeren. De ADF-pipeline zet deze altijd op `true`. |
| `@HIS_TABLE` | `NVARCHAR(1024)` | De doeltabel in het history-schema die je wilt terugdraaien. |
| `@DateTime` | `DATETIME2` | Het grenstijdstip. Alles wat ná dit moment is geladen, wordt teruggedraaid. |
| `@AppUser` | `NVARCHAR(4000)` (standaard `'Unknown'`) | De ingelogde gebruiker, voor de auditlog. |

### Wat een rollback precies doet

Op basis van het grenstijdstip `@DateTime` voert de procedure (samengevat) deze stappen uit op de tabel:

1. **Nieuwere loads verwijderen** — alle rijen met `ETL_Date > @DateTime` worden uit het history-schema verwijderd (`DELETE`). Dat zijn precies de records die ná het grenstijdstip zijn ingevoegd.
2. **Surrogaatsleutels opruimen** — als de tabel surrogaatsleutels gebruikt (`fxGetSurrogate` = 1), worden de na het grenstijdstip toegevoegde sleutels uit `LoadManagement.SurrogateKeys` verwijderd.
3. **Afgesloten versies heropenen** — versies die ná het grenstijdstip zijn afgesloten, worden weer als actueel gemarkeerd: `IsCurrent = 1` en `ETL_EndDate = '2999-01-01 00:00:00.000'` (de open-versie-sentinel) voor rijen met `ETL_EndDate > @DateTime AND IsCurrent <> 1`. Zo wordt een record dat een latere load had "afgesloten" weer de huidige rij.
4. **Watermerk terugzetten** — voor **DELTA**-tabellen wordt `LoadManagement.UsedTables.LatestRecord` opnieuw berekend als `MAX(<deltakolom>)` over wat er ná de rollback nog in de tabel staat. Daardoor pakt de volgende DELTA-load weer netjes vanaf het juiste punt op.

Het netto-effect: de tabel staat weer precies zoals na de laatste geldige load **vóór** het grenstijdstip. De historie van daarvóór blijft volledig bewaard.

:::note Rollback werkt op tijdstip, niet op load-id
De procedure neemt een **`@DateTime`** en draait alles weg dat na dat moment is geladen — inclusief alle loads die ná de geselecteerde load nog hebben gedraaid. Wil je één specifieke load ongedaan maken, dan kies je in de praktijk het tijdstip van *vlak vóór* die load.
:::

## Reset — tabel volledig leegmaken

`[LoadManagement].[spReset]` is rigoureuzer: hij **truncate**t de hele tabel. Er blijft geen historie over. Hij krijgt drie parameters:

| Parameter | Type | Betekenis |
|---|---|---|
| `@Execute` | `BIT` (standaard `0`) | `0` = alleen het script afdrukken (dry-run); `1` = uitvoeren. De ADF-pipeline zet deze op `true`. |
| `@HIS_TABLE` | `NVARCHAR(1024)` (standaard `NULL`) | De doeltabel die je wilt leegmaken. |
| `@AppUser` | `NVARCHAR(4000)` (standaard `'Unknown'`) | De ingelogde gebruiker, voor de auditlog. |

### Wat een reset precies doet

1. **Tabel truncaten** — `TRUNCATE TABLE <HIS-schema>.<Target>`. Alle rijen verdwijnen en de IDENTITY-teller (`<…>_RowId`) wordt opnieuw gezaaid.
2. **Watermerk wissen** — voor **DELTA**-tabellen wordt `LoadManagement.UsedTables.LatestRecord` op `NULL` gezet, zodat de eerstvolgende DELTA-load weer vanaf het begin alles ophaalt.

Een reset zet de tabel dus terug naar "fabrieksinstellingen": leeg, klaar om opnieuw vol te laden. De tabeldefinitie zelf (kolommen, load type, sleutels) blijft staan; alleen de *inhoud* gaat weg.

## Rollback vs. reset — wanneer wat

| | Rollback | Reset |
|---|---|---|
| **Doel** | Eén of meer foutieve loads ongedaan maken | Een tabel helemaal opnieuw beginnen |
| **Effect op data** | `DELETE` van rijen ná het grenstijdstip + heropenen van toen-afgesloten versies | `TRUNCATE` van de hele tabel |
| **Historie van daarvóór** | **blijft bewaard** | **verdwijnt volledig** |
| **Parameter die de scope bepaalt** | `@DateTime` (grenstijdstip) | geen — altijd de hele tabel |
| **DELTA-watermerk (`LatestRecord`)** | herberekend (`MAX` van wat overblijft) | op `NULL` |
| **Omkeerbaar?** | Nee (verwijderde nieuwere loads zijn weg, oudere historie blijft) | Nee (alles weg) |

Vuistregel:

- **Rollback** als één recente load fout ging en de oudere historie correct is — bijvoorbeeld een DELTA-load die door een bronfout dubbele records bracht.
- **Reset** als de tabel structureel vervuild is en je hem schoon opnieuw wilt opbouwen, of bij een eenmalige herinrichting.

## Hoe ADF het aanstuurt

De webapp draait beide acties via een dedicated **ADF-pipeline** (map `PW - Yres/TechnicalPipelines/Backgroundtasks`). Beide pipelines bevatten één `SqlServerStoredProcedure`-activiteit tegen de linked service `YresDwh`, met `Execute = true`.

**Pipeline `Rollback`** roept `[LoadManagement].[spRollback]` aan met parameters:

| Pipeline-parameter | Doorgegeven aan proc | Standaard |
|---|---|---|
| `Table` | `@HIS_TABLE` | `Unknown` |
| `DateTime` | `@DateTime` | `2999-12-31 23:59:59` |
| `AppUser` | `@AppUser` | `Unknown` |

**Pipeline `Reset`** roept `[LoadManagement].[spReset]` aan met parameters:

| Pipeline-parameter | Doorgegeven aan proc | Standaard |
|---|---|---|
| `Table` | `@HIS_TABLE` | `Unknown` |
| `AppUser` | `@AppUser` | `Unknown` |

Mislukt de SQL-activiteit, dan draait een tweede activiteit (`WLS … table Failed`) die de fout via **`[Monitoring].[spWriteLoadStatus]`** wegschrijft met `Process = 'Maintenance'` en `Status = 'FAILED'`. Zo verschijnt een mislukte rollback/reset gewoon tussen de andere meldingen in de monitoring.

## Auditing — `LoadManagement.DeletedLoads`

Elke rollback- en reset-actie wordt vastgelegd in de tabel **`[LoadManagement].[DeletedLoads]`**. Bij de start schrijft de procedure een rij met status `Initiating`; tijdens en na afloop werkt hij die rij bij (`Running` → `Succeeded`, of `Failed …` bij een fout, of `Deletion script printed` bij een dry-run). De tabel houdt onder meer bij:

| Kolom | Inhoud |
|---|---|
| `ProcessID` | Unieke id van de actie — koppelt aan de meldingen in `Config.ProcessLog`. |
| `TableName` | De geraakte tabel. |
| `DateFrom` | Het grenstijdstip (alleen gevuld bij rollback; bij reset `NULL`). |
| `AppUSer` | De gebruiker die de actie startte. |
| `DeletedRecords` | Aantal verwijderde rijen (bij rollback). |
| `DurationMS` | Doorlooptijd in milliseconden. |
| `Status` | De voortgang/uitkomst (`Initiating` / `Running` / `Succeeded` / `Failed …` / `Deletion script printed`). |

Daarnaast logt elke stap via `[Config].[spWriteMessage]`/`spWriteError`/`spWriteCrash` naar **`[Config].[ProcessLog]`**. Aan het einde geeft de procedure die proceslog ook als resultaat terug, zodat je direct ziet wat er gebeurd is. Alle herstelacties zijn dus volledig herleidbaar.

## Veelgestelde vragen

**Verandert een rollback of reset de tabeldefinitie?**
Nee. Kolommen, load type, sleutelkolommen en de tabel zelf blijven bestaan. Alleen de *gegevens* worden geraakt — bij rollback gedeeltelijk (alles ná het grenstijdstip), bij reset volledig.

**Kan ik meerdere tabellen tegelijk terugdraaien?**
De procedures werken per tabel (`@HIS_TABLE`). Wil je meerdere tabellen herstellen, dan draai je de actie per tabel.

**Wat gebeurt er met de Data Lake / archivering?**
Rollback en reset werken op het history-schema in de SQL-database. Reeds [gearchiveerde Parquet-bestanden](./archivering.md) in de Data Lake worden er niet door verwijderd.

## Zie ook

- [Load types](./load-types.md) — wat elk load type met de history-tabel doet (en waarom OVERWRITE wél en RELOAD níet de historie wist).
- [Historie & SCD2](./historie-scd2.md) — de framework­kolommen `ETL_Date`, `ETL_EndDate`, `IsCurrent` waar rollback op stuurt.
- [Archivering](./archivering.md) — oude historie wegschrijven naar de Data Lake.
- [Begrippenlijst](./glossary.md).
