---
sidebar_position: 2
title: Historie & SCD2
description: Hoe Yres historie bijhoudt met SCD2 — surrogaatsleutels, ETL-datums, isCurrent, Delta en de KeyHash/RowHash-vergelijking.
---

# Historie & SCD2

Yres bewaart standaard de **volledige wijzigingshistorie** van je brondata volgens **Slowly Changing Dimensions type 2 (SCD2)**. In plaats van oude waarden te overschrijven, sluit Yres de oude versie van een rij af en voegt een nieuwe versie toe. Zo kun je elk historisch moment reconstrueren: "hoe zag deze klant er vorige maand uit?".

Deze pagina legt uit hoe het **HIS-laag**-model in elkaar zit: de framework-kolommen op elke historietabel, hoe wijzigingen worden gedetecteerd via hashes, en hoe `isCurrent` één actuele versie per record garandeert.

:::tip Verband met load types
SCD2 is de motor *onder* de [load types](./load-types.md). Het load type bepaalt **welke** rijen worden afgesloten of toegevoegd; SCD2 bepaalt **hoe** dat gebeurt. Lees deze pagina eerst om de load types correct te begrijpen.
:::

## De drie lagen in het kort

Een load doorloopt drie lagen in de Azure SQL-database (`IRIS_DWH`):

| Laag | Schema | Inhoud |
|---|---|---|
| **STAGE** | `STAGE` (instelbaar via `SchemaStage`) | De ruwe brondata van één load + `ETL_Date` + de berekende `Keyhash`/`Rowhash`. |
| **HIS / ODS** | de HIS-schemanaam (standaard `ODS`, instelbaar via `SchemaHIS`) | De volledige SCD2-historie: businesskolommen + de framework-kolommen hieronder. |
| **Exposed** | `Exposed` en gebruikersschema's | Rapportage-views/-tabellen bovenop HIS. |

ADF kopieert de bron alleen naar `STAGE`. De daadwerkelijke historisering — `STAGE → HIS` — gebeurt volledig in SQL via `[LoadManagement].[spHIS_InsertAndUpdate]` (aangeroepen door `[LoadManagement].[spLoadDWH]`).

:::info Schemanamen zijn niet hardcoded
De HIS-laag heet in de documentatie "HIS", maar de schemanaam komt uit de instelling `SchemaHIS` en staat standaard op **`ODS`**. Per tabel kan een afwijkend schema worden gebruikt (bijvoorbeeld `ODS_Finance`). Op productie kan de waarde per omgeving verschillen.
:::

## De framework-kolommen op elke HIS-tabel

Elke `HIS.<Target>`-tabel bevat naast de businesskolommen een vaste set framework-kolommen die SCD2 mogelijk maken:

| Kolom | Type | Betekenis |
|---|---|---|
| `<tabel>_RowID` | `IDENTITY` (geheel getal) | De **surrogaatsleutel** van de rijversie — een uniek, oplopend nummer. De naam is de doeltabelnaam met niet-alfanumerieke tekens verwijderd (de casing blijft behouden), plus `_RowID` (bijv. `AX_dbo_Cust` → `AXdboCust_RowID`). |
| `ETL_Date` | datum/tijd | Tijdstempel waarop deze rijversie geladen werd. Eén tijdstempel per load. |
| `ETL_EndDate` | datum/tijd | Tijdstip waarop deze versie werd afgesloten. Zolang een versie **actueel** is, staat hier de sentinelwaarde **`2999-01-01 00:00:00`** ("open einde"). |
| `KeyHash` | `varbinary(66)` | `HASHBYTES('SHA2_512', …)` over de **sleutelkolommen**. Identificeert *welk* record dit is. |
| `RowHash` | `varbinary(66)` | `HASHBYTES('SHA2_512', …)` over de **gemarkeerde wijzigingskolommen**. Identificeert *of de inhoud veranderd is*. |
| `Delta` | `nvarchar(1)` | `'N'` = nieuw record, `'D'` = gewijzigd record. |
| `IsCurrent` | `bit` | `1` = actuele versie, `0` = afgesloten (historische) versie. Altijd `1` of `0`, nooit `NULL`. |

Per sleutel is er op elk moment **precies één rij** met `IsCurrent = 1`.

## Hoe Yres een rij over de tijd bijhoudt

Stel je hebt een klant met `Id = 2` waarvan het kredietbedrag wijzigt:

1. **Eerste load** — de rij wordt ingevoegd met `Delta = 'N'`, `IsCurrent = 1` en `ETL_EndDate = 2999-01-01`. Open en actueel.
2. **Latere load, waarde gewijzigd** — Yres detecteert de wijziging (zie hieronder), voegt een **nieuwe versie** in (`Delta = 'D'`, `IsCurrent = 1`, nieuwe `ETL_Date`) en **sluit de oude versie af**: `IsCurrent = 0` en `ETL_EndDate` = de nieuwe `ETL_Date`.

Resultaat: twee rijen met dezelfde `KeyHash`, één afgesloten en één actueel. De volledige geschiedenis blijft opvraagbaar.

:::warning FULL betekent niet "geen historie"
Een veelgemaakte fout: denken dat het load type **FULL** historie weggooit. Dat klopt niet. **FULL bewaart de SCD2-historie** (het is een upsert die wijzigingen versioneert). Alleen **OVERWRITE** verwijdert historie (het *truncate't* de HIS-tabel en de `RowId` reseed't). **RELOAD** sluit de hele huidige generatie af en voegt opnieuw in — de historie blijft daarbij bewaard. Zie [load types](./load-types.md).
:::

## Wijzigingsdetectie: KeyHash en RowHash

Yres vergelijkt brondata niet kolom-voor-kolom, maar via twee SHA-512-hashes. Die worden berekend als **persisted computed columns op de STAGE-tabel** (toegevoegd door `Config.spAddFrameWorkColumns`):

```sql
ADD [Keyhash] AS (hashbytes('SHA2_512', concat(<sleutelkolommen>, ''))) PERSISTED;
ADD [Rowhash] AS (hashbytes('SHA2_512', concat(<wijzigingskolommen>, ''))) PERSISTED;
```

`spHIS_InsertAndUpdate` leest die voorberekende `STAGE.Keyhash`/`STAGE.Rowhash` en koppelt STAGE aan HIS:

- **Bestaat het record al?** Match op `STAGE.Keyhash = HIS.Keyhash AND HIS.isCurrent = 1`.
- **Is de inhoud gewijzigd?** Wijziging als `STAGE.Rowhash <> HIS.Rowhash`.

Daaruit volgt het gedrag per rij:

| Situatie | Actie |
|---|---|
| `KeyHash` niet gevonden in actuele HIS | **Nieuw record** — invoegen (`Delta = 'N'`). |
| `KeyHash` gevonden, `RowHash` verschilt | **Gewijzigd** — nieuwe versie invoegen (`'D'`) en oude versie afsluiten. |
| `KeyHash` gevonden, `RowHash` gelijk | **Ongewijzigd** — niets doen. |

### Welke kolommen tellen mee?

- **KeyHash** wordt opgebouwd uit de **sleutelkolommen**. Yres kiest die in volgorde: kolommen met `KeyColumn = 1`; anders alle `NOT NULL`-kolommen; anders álle kolommen (de "no-key"-situatie).
- **RowHash** wordt opgebouwd uit de kolommen met `Rowhash = 1` in `UsedColumns`. Een kolom met **`Rowhash = 0` wordt uitgesloten van wijzigingsdetectie**: verandert alléén die kolom, dan ziet Yres geen wijziging en wordt er geen nieuwe versie aangemaakt.

:::tip Praktisch gebruik van Rowhash = 0
Zet `Rowhash = 0` op kolommen die wél geladen mogen worden maar geen nieuwe historieversie mogen veroorzaken — bijvoorbeeld een vrij notitieveld of een technische tijdstempel die bij elke export verandert. Zo voorkom je een explosie aan historierijen door ruis.
:::

## Surrogaatsleutels

Naast de `<tabel>_RowId` (de surrogaatsleutel van elke rijversie) kan Yres een **stabiele surrogaatsleutel per natural key** aanmaken in `[LoadManagement].[SurrogateKeys]` (`intKey`, `hashKey`, `jsonKey`, `TableName`). Dit is optioneel en wordt aangestuurd door:

- de functie `[LoadManagement].[fxGetSurrogate](@Target)`, die standaard de instelling **`DefaultSurrogate`** volgt (standaard `0` = uit).

Staat dit aan, dan voegt de engine na de insert per nieuwe natural key een rij `(intKey, Keyhash, <sleutelkolommen als JSON>, @Target)` toe aan `SurrogateKeys`. De `intKey` is een **doorlopende teller per tabel** (verder tellend vanaf de hoogste bestaande sleutel), zodat sleutels ook na bijvoorbeeld een `OVERWRITE`-truncate botsingsvrij blijven doorlopen. De sleutelkolommen worden alfabetisch geordend zodat de `jsonKey` stabiel blijft; een punt in een kolomnaam wordt in de JSON-naam vervangen door `_` (de waarden blijven onaangetast). Dit is handig voor stervormige modellen waarin feittabellen naar een vaste integersleutel verwijzen; ook de `jsonKey` is een stabiel aanknopingspunt voor eigen uitbreidingen.

## Het Object history-scherm

In de frontend bekijk je de versiehistorie van database-objecten via **Data Engineering → Object history** (`/dataengineering/objecthistory`). Dit scherm toont de structuur van de database, niet de SCD2-rijhistorie zelf — gebruik het om te zien hoe een object (tabel, view, procedure) over changes heen is gewijzigd.

![Object history-scherm met bovenaan een vergelijkingskeuze en links de schemaboom van de database (CustomIris, CustomYres, dbo, Dim, ODS, STAGE); het rechterpaneel toont de objectdefinitie zodra je een object selecteert.](/img/screens/dataengineering-objecthistory.png)

*Object history toont per object de huidige definitie plus de versiehistorie; via de vergelijkingskeuze zet je twee versies naast elkaar.*

De onderdelen van het scherm:

1. **Vergelijkingskeuze** (boven, "No comparison") — kies een eerdere versie om huidige en gekozen definitie naast elkaar te zetten.
2. **Schemaboom** (links) — de schema's van de database (zoals `ODS`, `STAGE`, `dbo`, `Dim`). Vouw een schema uit om naar de objecten te navigeren.
3. **Definitiepaneel** (rechts) — toont de definitie van het geselecteerde object; leeg zolang er niets is geselecteerd.

:::tip Verwante schermen
Object history hoort bij de Data Engineering-sectie samen met **View Persistence** en **Database Objects**. Het volledige overzicht staat op de pagina [Data Engineering](../frontend/data-engineering.md).
:::

## Samenvatting

- Yres bewaart historie volgens **SCD2**: oude versies worden afgesloten, niet overschreven.
- Elke HIS-rij draagt `<tabel>_RowId`, `ETL_Date`, `ETL_EndDate` (open = `2999-01-01`), `KeyHash`, `RowHash`, `Delta` en `IsCurrent`.
- **`KeyHash`** (SHA-512 over sleutelkolommen) bepaalt *welk* record; **`RowHash`** (SHA-512 over wijzigingskolommen) bepaalt *of het veranderd is*. Beide zijn `varbinary(66)`, berekend op STAGE.
- De match-join is `KeyHash` + `isCurrent = 1`; een wijziging is een verschillende `RowHash`. `Rowhash = 0` sluit een kolom uit van wijzigingsdetectie.
- Per sleutel bestaat altijd precies één actuele versie (`IsCurrent = 1`).
- **FULL bewaart historie**; alleen **OVERWRITE** verwijdert die (truncate); **RELOAD** sluit-en-herlaadt met behoud van historie.

Zie ook: [Load types](./load-types.md) · [Begrippenlijst](./glossary.md) · [Data Engineering](../frontend/data-engineering.md).
