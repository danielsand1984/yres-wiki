---
sidebar_position: 2
title: Load types
description: De zeven laadtypes in Yres en precies wat ze met de historietabel (HIS) doen, plus hash-gebaseerde wijzigingsdetectie en sleutelkolommen.
---

# Load types

Een **load type** bepaalt wat er met de bestaande data in de historietabel (**HIS**) gebeurt wanneer een load draait. Je stelt het per tabel in via de wizard *Add table* en kunt het per run overschrijven (een *alternative load*).

Yres kent **zeven** load types. Ze worden per tabel vastgelegd in `LoadManagement.UsedTables.LoadType` en uitgevoerd door de SCD2-merge-procedure `[LoadManagement].[spHIS_InsertAndUpdate]` (aangeroepen via `[LoadManagement].[spLoadDWH]`). Deze pagina is de enige canonieke bron voor load types; andere pagina's (zoals [Databron koppelen & laden](../setup/databron-koppelen.md)) verwijzen hierheen.

:::tip Belangrijk om te onthouden
Bij Yres betekent een load **bijna nooit** dat oude data verloren gaat. Zes van de zeven load types **behouden historie** (SCD2). Alleen **OVERWRITE** gooit historie weg. Lees verder waarom — dit wordt vaak verkeerd begrepen.
:::

## De zeven load types in één oogopslag

In de tabel hieronder:

- **"match"** = de rij bestaat al in HIS (zelfde sleutel) én is de huidige versie (`KeyHash` gelijk en `IsCurrent = 1`).
- **"gewijzigd"** = een match waarbij de `RowHash` verschilt (een gevolgde kolom is veranderd).
- **"afsluiten"** = de bestaande rij blijft als historie staan maar wordt op niet-actueel gezet (`IsCurrent = 0`, `ETL_EndDate` krijgt het sluitmoment). De data blijft bewaard.
- **"missend"** = een sleutel die wél in HIS staat maar **niet** in de aangeleverde batch (STAGE) zit.

| Load type | Wat het doet | Historie? | Sleutels die ontbreken in de batch | Watermark? |
|---|---|---|---|---|
| **FULL** | Upsert: nieuwe rijen invoegen, gewijzigde rijen versioneren (oude versie afsluiten), de rest met rust laten. | **Ja (SCD2)** | **Blijven actueel** (niet afgesloten) | nee |
| **DELTA** | Als FULL, maar alleen voor aangeleverde (gewijzigde) records; in-batch ontdubbelen op `MAX(deltaColumn)` per sleutel. | **Ja** | Blijven actueel | **ja** (`MAX(DeltaColumn)`) |
| **DELTAIMAGE** | DELTA **plus** missende sleutels afsluiten *binnen het deltavenster* (`>=` watermark). | **Ja** | Afgesloten als ze binnen het venster vallen | **ja** |
| **IMAGE** | Volledige momentopname: upsert **plus** **alle** missende sleutels afsluiten (soft-delete). | **Ja** | **Allemaal afgesloten** | nee |
| **OVERWRITE** | **HIS wordt getruncate** en alle STAGE-rijen opnieuw ingevoegd. | **Nee — historie weg** (truncate, RowId begint opnieuw) | Weg | nee |
| **RELOAD** | **Alle huidige rijen afsluiten** (historie blijft bewaard) en daarna alle STAGE-rijen invoegen. | **Ja** (oude generatie afgesloten) | Afgesloten | nee |
| **ADDITIONAL** | Pure append — geen sleutelmatch, geen ontdubbeling; duplicaten zijn toegestaan. | **Ja** (alleen toevoegen) | Blijven actueel | **ja** |

:::warning OVERWRITE vs. RELOAD — niet verwisselen
Dit is de meest gemaakte fout. **OVERWRITE = geen historie** (de HIS-tabel wordt leeggegooid en de surrogaatsleutel `RowId` begint opnieuw). **RELOAD = historie behouden** (de oude generatie rijen wordt afgesloten, niet verwijderd). Eerdere documentatie had deze twee precies omgedraaid; deze pagina volgt de werkelijke engine-code en de regressietests in `DWH/tests/spRunLoadEngineTests.sql`.
:::

## Wat elk type precies doet

### FULL — history-bewuste upsert

FULL is het standaard, history-behoudende SCD2-upsert. Per sleutel:

- **Nieuw** (sleutel nog niet in HIS) → invoegen met `Delta = 'N'`, `IsCurrent = 1`.
- **Gewijzigd** (sleutel bestaat, `RowHash` verschilt) → nieuwe versie invoegen (`Delta = 'D'`, `IsCurrent = 1`) **en** de oude versie afsluiten (`IsCurrent = 0`, `ETL_EndDate` = nieuw `ETL_Date`).
- **Ongewijzigd** → niets doen.
- **Missend** (sleutel staat in HIS maar niet in de batch) → **blijft actueel**; FULL sluit ontbrekende sleutels **niet** af.

Gebruik FULL voor tabellen die je telkens volledig aanlevert maar waar verdwenen rijen *niet* als verwijderd moeten gelden.

### DELTA — alleen wijzigingen, met watermark

DELTA werkt als FULL, maar je levert alleen de gewijzigde records aan (op basis van een wijzigingskolom, de `DeltaColumn`). Voordat de merge draait, ontdubbelt de engine de batch op `MAX(deltaColumn)` per sleutel (de meest recente in-batch-versie wint). Na afloop verschuift het **watermark**: `LoadManagement.UsedTables.LatestRecord` wordt op `MAX(DeltaColumn)` gezet, zodat de volgende run vanaf daar verdergaat. Missende sleutels blijven actueel.

Gebruik DELTA voor grote tabellen met een betrouwbare, oplopende wijzigingskolom.

### DELTAIMAGE — DELTA die verwijderingen binnen het venster opvangt

DELTAIMAGE is DELTA **plus** het afsluiten van missende sleutels, maar alleen binnen het deltavenster (`deltaColumn >= ` het watermark, bepaald via `fxGetDeltaValue`). Rijen die ouder zijn dan het venster blijven onaangeroerd. Zo vang je verwijderingen op zonder de hele tabel opnieuw te scannen.

Gebruik DELTAIMAGE als je incrementeel laadt én verwijderingen binnen het recente venster wilt detecteren.

### IMAGE — volledige momentopname met soft-delete

IMAGE verwacht de **complete** dataset per run. Het doet een upsert (nieuw/gewijzigd zoals FULL) **en** sluit daarna **alle** missende sleutels af. Dat is een soft-delete: de rij blijft als historie staan op `IsCurrent = 0`.

Gebruik IMAGE als de bron telkens de volledige stand levert en verwijderingen zichtbaar moeten worden.

### OVERWRITE — vervangen zonder historie

OVERWRITE **truncate** eerst de HIS-tabel (via `spHIS_TruncateTable`) en voegt dan alle STAGE-rijen als nieuw in. Alle eerdere historie is **weg** en de IDENTITY-surrogaat `RowId` begint opnieuw bij 1.

Gebruik OVERWRITE alleen voor tabellen waar je écht geen historie hoeft te bewaren (bijvoorbeeld een lookup- of dimensietabel die je volledig wilt resetten).

### RELOAD — vervangen mét historie

RELOAD **sluit eerst alle huidige rijen af** (`IsCurrent = 0`, `ETL_EndDate` gezet) en voegt daarna de volledige STAGE-set als nieuwe generatie in. De oude generatie blijft als historie staan. Het verschil met OVERWRITE: RELOAD gooit niets weg.

Gebruik RELOAD als je de volledige set opnieuw wilt laden maar de vorige stand als historie wilt bewaren.

### ADDITIONAL — pure append

ADDITIONAL voegt elke STAGE-rij toe zonder sleutelmatch en zonder ontdubbeling. Dezelfde batch tweemaal laden levert duplicaten op (meerdere `IsCurrent = 1`-rijen per sleutel zijn toegestaan). Het watermark verschuift wel.

Gebruik ADDITIONAL voor append-only bronnen zoals logs of events.

## Welke load type wanneer?

- **FULL** — je levert de volledige tabel, maar verdwenen rijen mogen blijven bestaan; je wilt historie van wijzigingen.
- **DELTA** — grote tabellen met een betrouwbare wijzigingskolom; alleen wijzigingen verwerken.
- **DELTAIMAGE** — als DELTA, maar je wilt ook verwijderingen binnen het recente venster opvangen.
- **IMAGE** — bron levert telkens de volledige stand en verwijderingen moeten zichtbaar worden.
- **OVERWRITE** — kleine, volledig te resetten tabellen waarvoor je geen historie nodig hebt.
- **RELOAD** — volledige set opnieuw laden maar de vorige stand als historie bewaren.
- **ADDITIONAL** — append-only bronnen (logs, events).

:::info Per-run overschrijven
De engine ondersteunt alle zeven types. In de webapp biedt het overschrijven van het load type per run alleen **FULL, IMAGE, OVERWRITE en RELOAD** aan — dat is een UI-beperking, geen beperking van de engine.
:::

## Hoe Yres wijzigingen detecteert (hashing)

Yres bepaalt "nieuw / gewijzigd / ongewijzigd" niet kolom-voor-kolom, maar met twee SHA2_512-hashes die als **persisted computed columns op de STAGE-tabel** worden berekend:

- **`KeyHash`** (`varbinary(66)`) — een hash over de **sleutelkolommen**. Bepaalt *welke* rij in HIS hoort bij een STAGE-rij. De merge joint op `STAGE.KeyHash = HIS.KeyHash AND HIS.IsCurrent = 1`.
- **`RowHash`** (`varbinary(66)`) — een hash over de **gevolgde kolommen** (de kolommen met `Rowhash = 1`). Bepaalt *of* een rij is veranderd: een wijziging is `STAGE.RowHash <> HIS.RowHash`.

Een kolom met `Rowhash = 0` telt **niet** mee in wijzigingsdetectie: verandert alleen die kolom, dan ziet de engine de rij als ongewijzigd. Zo houd je technische of niet-relevante velden buiten de SCD2-versionering.

Naast de business-kolommen krijgt elke HIS-rij framework-kolommen: `<tabel>_RowId` (IDENTITY-surrogaat), `ETL_Date` (laadmoment), `ETL_EndDate` (sentinel `'2999-01-01 00:00:00'` zolang de rij actueel is), `KeyHash`, `RowHash`, `Delta` (`'N'` = nieuw, `'D'` = gewijzigd) en `IsCurrent` (1/0). De volledige SCD2-werking staat in [Historie & SCD2](./historie-scd2.md).

## De wizard *Add table*

Je configureert load type en sleutelkolommen in de meerstaps-wizard *Add table*, te bereiken via **Data sources › (bron) › Used tables**. Onderstaande afbeelding toont stap 3 (Columns); load type en sleutel volgen in stap 4 en 5.

![De wizard Add table in Yres, geopend op de stap Columns, met een stappenbalk en een kolommentabel met RowHash-selectievakjes](/img/screens/source-usedtable-wizard.svg)

*De wizard Add table loopt door zeven stappen — Project, Schema/table, Columns, Load type, Key column, Options en Overwrite — voordat de tabel wordt geregistreerd. Er wordt nog geen data geladen; de wizard maakt de STAGE- en HIS-tabellen aan en boekt een wijziging.*

1. **Stappenbalk** — de zeven stappen; je staat nu op *Columns*.
2. **Geselecteerde brontabel** — de bron-schema/tabel die je in stap 2 koos.
3. **Kolommen aanvinken** — vink aan welke kolommen je wilt laden (of gebruik "select all").
4. **RowHash-kolom** — kolommen met RowHash aangevinkt worden gevolgd voor SCD2-wijzigingsdetectie; gereserveerde namen (`rowhash`, `etl_date`, `etl_enddate`, `iscurrent`, `delta`, `keyhash`) zijn geblokkeerd.
5. **TargetType overschrijven** — pas per kolom het doeltype of de grootte aan.
6. **Back / Next** — navigeer door de stappen; *Next* leidt naar *Load type*, *Key column* en *Options*.

### Stap 4 — Load type & deltakolommen

In de stap **Load type** kies je een van de zeven types. De velden **Delta column** en **Additional delta column** verschijnen alleen wanneer het load type met `DELTA` begint of `ADDITIONAL` is. Aandachtspunten:

- De deltakolom komt uit de in stap 3 geselecteerde kolommen (`Loadmanagement.Dictionary`).
- Voor brontype `SAP_BDC` wordt de deltakolom vast op `ETL_DATE` gezet.
- Een **tweede** deltakolom is optioneel en moet hetzelfde datatype hebben als de eerste. Twee deltakolommen worden ondersteund voor SQL-bronnen, **behalve MySQL** (daar is slechts één deltakolom mogelijk).

### Stap 5 — Sleutelkolommen (key columns)

Sleutelkolommen identificeren een rij uniek en bepalen de `KeyHash`. Je hebt drie modi:

- **Predict** — Yres voorspelt de sleutel (read-only weergave van het voorstel).
- **Manual** — je vinkt zelf de sleutelkolommen aan; minimaal één is verplicht. Standaard worden alleen NOT NULL-kolommen getoond; met "Show nullable columns" zie je ook nullable kolommen.
- **No key** — alleen beschikbaar voor **OVERWRITE** en **ADDITIONAL** (deze types matchen niet op sleutel).

## Gerelateerde instellingen

- **Key columns** — identificeren records uniek; bepalen de `KeyHash`. Voor SQL-bronnen (behalve MySQL) zijn twee deltakolommen mogelijk (komma-gescheiden in `LoadManagement.UsedTables.deltaColumn`, zelfde datatype — de hoogste waarde telt).
- **Staging (`DefaultKeepStage`)** — of de STAGE-tabel na verwerking wordt getruncate of bewaard. De engine leest dit per tabel (`keepStage`), niet rechtstreeks uit de globale instelling.
- **Surrogate keys (`DefaultSurrogate`)** — automatisch gegenereerde sleutels, opgeslagen in `[LoadManagement].[SurrogateKeys]`. Per tabel te schakelen via `fxGetSurrogate(@Target)`.
- **Pagination (`UsePagination` / `PageSize`)** — grote datasets in pagina's verwerken bij de STAGE→HIS-merge.

Zie ook [Historie & SCD2](./historie-scd2.md), [Databron koppelen & laden](../setup/databron-koppelen.md) en de [begrippenlijst](./glossary.md).
