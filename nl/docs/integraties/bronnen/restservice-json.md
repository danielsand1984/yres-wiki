---
title: JSON naar tabellen
sidebar_label: JSON naar tabellen
description: Hoe Yres een JSON-respons uit een REST-API omzet naar databasekolommen — standaardgedrag, ondersteuning, sturing en voorbeelden.
---

# JSON naar tabellen

Deze pagina hoort bij de [REST API-koppeling](restservice.md) en legt uit wat er met de
**JSON-respons** van een API gebeurt: hoe Yres die omzet naar rijen en kolommen, wat er ondersteund
wordt, en hoe je dat kunt bijsturen.

## In het kort

- Yres laat ADF **niet** kolom-voor-kolom mappen. De volledige respons wordt als één stuk tekst
  opgehaald en **server-side in SQL Server ontleed** met `OPENJSON`. Dit is *schema-on-read*: de
  tabelstructuur volgt uit de JSON die binnenkomt, niet uit een vooraf vastgelegd schema.
- Je hoeft geen veldmapping te maken. Yres **maakt en breidt de STAGE-tabel automatisch uit** op basis
  van de velden in de respons.
- De enige knop die je meestal nodig hebt is de **collection**: het pad naar de lijst met records in de
  respons. Standaard staat die op **`AUTO`** en raadt Yres het pad zelf.

## De verwerking, stap voor stap

1. De **Copy-activity** in de dynamische REST-pipeline haalt de JSON op en schrijft de **hele
   response-body ongewijzigd** weg als tekst (de translator mapt `$` → één kolom `Json`,
   `mapComplexValuesToString`). ADF interpreteert de structuur dus niet zelf.
2. De sink roept de stored procedure **`LoadManagement.spFillTable_Json`** aan met drie dingen: de
   ruwe JSON, de **collection** en de doeltabel (STAGE-schema + tabelnaam).
3. `spFillTable_Json` doet twee dingen om de JSON robuust te maken:
   - **Array-reparatie.** Levert de API een kale array zonder omhulsel (iets wat ADF soms opbreekt),
     dan wordt die opnieuw als `[ … ]` ingepakt zodat hij geldig blijft.
   - **Collection-normalisatie.** Staat de collection niet op `AUTO` en begint hij niet met `$`, dan
     wordt er `$.` voorgezet (`data` wordt dus `$.data`).
4. Vervolgens ontleedt **`spJsonToTable`** de records met `OPENJSON`, leidt per veld het datatype af,
   en genereert dynamisch een `SELECT … FROM OPENJSON(…) WITH (…)` die een **platte tabel** oplevert.
   - Bestaat de doeltabel nog niet, dan wordt die **aangemaakt** (met `SELECT … INTO`).
   - Bestaat hij al, dan worden **ontbrekende kolommen toegevoegd** (`ALTER TABLE … ADD`) en de rijen
     ingevoegd. Kolommen worden nooit verwijderd.

De platte STAGE-tabel gaat daarna de gewone laadmotor in (STAGE → HIS/SCD2), net als bij elke andere
bron. Zie [De laadmotor](../../concepten/load-types.md).

## De collection: het pad naar je records

De **collection** is een JSON-pad naar de **array met records** in de respons. Het is een instelling
**per tabel** (in het "Tabel toevoegen"-scherm van een REST-bron staat het veld *collection*, standaard
`AUTO`).

### AUTO (standaard)

Bij `AUTO` zoekt Yres zelf de meest waarschijnlijke records-array met de functie
`fxGetJsonCollections`. Die kijkt of ergens in de respons (tot 10 niveaus diep) een array van objecten
staat en **rangschikt kandidaten op de naam van het omhulsel**. Veelvoorkomende namen krijgen voorrang,
in deze volgorde:

> `result` → `results` → `data` → `value` → `values` → `records` → `entries` → `rows` → `list` →
> `elements` → `objects` → `nodes` → `children` → `resources` → `entities` → `events` → `logs` /
> `messages` → `entity` → `documents`

Staan er meerdere kandidaten, dan wint de bekendste naam; bij gelijke stand het ondiepste pad. Is de
**root zelf een array** (`[ { … }, { … } ]`), dan wordt de collection `$`.

### Zelf een pad opgeven

Raadt `AUTO` verkeerd — bijvoorbeeld omdat de API een ongebruikelijke wrappernaam of meerdere arrays
gebruikt — dan vul je het pad handmatig in. Dat mag als:

- een **kale naam**: `data`
- een **genest pad** met punten: `result.items`
- een **volledig JSONPath**: `$.data.records`

## Wat Yres met de waarden doet

### Datatypes

Yres leidt per kolom een SQL-datatype af uit de JSON-waarden:

| JSON-waarde | Kolomtype in de tabel |
|---|---|
| tekst (`"…"`) | `NVARCHAR(MAX)` |
| geheel getal | `INT` |
| kommagetal / wetenschappelijke notatie | `DECIMAL(38,15)` |
| `true` / `false` | `BIT` |
| genest object `{ … }` | platgeslagen naar **puntkolommen** (zie hieronder) |
| array `[ … ]` | bewaard als **JSON-tekst** in één kolom (`NVARCHAR(MAX)`) |
| `null` | geen eigen type; valt onder de rest |

Een paar aandachtspunten:

- Alleen **echte** JSON-getallen worden numeriek. Een getal tussen aanhalingstekens (`"123"`) is voor
  JSON een string en blijft dus tekst.
- Yres kiest **één type per kolom** op basis van alle waarden in de respons. Bevat hetzelfde veld sterk
  wisselende typen (nu eens een getal, dan weer tekst), dan kan dat tot conversiefouten leiden. Leg het
  type in dat geval vast (zie [Sturen op het resultaat](#sturen-op-het-resultaat)).

### Geneste objecten → puntkolommen

Bevatten de records geneste objecten, dan **slaat Yres die plat** tot losse kolommen, tot **10 niveaus
diep**. De kolomnaam wordt het pad met punten ertussen. Een record als:

```json
{ "id": 1, "address": { "city": "Utrecht", "zip": "3500" } }
```

levert de kolommen `id`, `address.city` en `address.zip` op.

### Arrays binnen een record → JSON-tekst

Een array-waarde *binnen* een record wordt **niet** verder platgeslagen; die blijft als JSON-tekst in
één kolom staan. Een record met `"tags": ["a","b"]` krijgt dus een kolom `tags` met de waarde
`["a","b"]`. Verdere ontleding daarvan doe je desgewenst later in een SQL-view.

### Schema dat meegroeit

Verschijnt er bij een volgende run een **nieuw veld** in de respons, dan voegt Yres daar automatisch een
kolom voor toe (`ALTER TABLE … ADD`). Bestaande kolommen blijven staan. Zo blijft de tabel meelopen met
de API zonder dat je iets hoeft aan te passen.

### Grenzen

- Per opgehaald **JSON-document** worden maximaal **10.000 records** uit de collection verwerkt. Levert
  een endpoint in één respons meer op, gebruik dan een **paginatievorm** (zie
  [REST API › Paginatie](restservice.md#paginatie)); elke pagina wordt dan apart ontleed.
- Waarden worden bij het inlezen tot **4000 tekens** meegenomen voor de typebepaling.

## Sturen op het resultaat

| Wil je … | Doe dan … |
|---|---|
| de juiste records-array kiezen | zet **collection** op het pad (`data`, `result.items`, `$.data.records`) i.p.v. `AUTO` |
| de doeltabel-/schemanaam bepalen | vul **schema** en **table** (overwrite-velden) in bij de tabel |
| grote resultaten betrouwbaar laden | kies een **paginatietype** zodat elke pagina apart wordt verwerkt |
| een afgeleid kolomtype overrulen | leg het datatype vast in `LoadManagement.OverwriteDataType` (geavanceerd; per bron/schema/tabel/kolom) |

## Voorbeeldsituaties

### 1. Vlakke lijst onder een omhulsel

```json
{ "status": "ok", "data": [ { "id": 1, "name": "Alpha" }, { "id": 2, "name": "Beta" } ] }
```

`AUTO` herkent `data` als records-array. Resultaat: een tabel met kolommen `id` en `name`, twee rijen.
Je hoeft niets in te stellen.

### 2. De root is zelf een array

```json
[ { "id": 1, "name": "Alpha" }, { "id": 2, "name": "Beta" } ]
```

`AUTO` kiest collection `$`. Zelfde tabel als in voorbeeld 1. (Zou ADF de buitenste `[ ]` hebben
verloren, dan herstelt de array-reparatie dat.)

### 3. Ongebruikelijke of diep geneste wrapper

```json
{ "response": { "result": { "items": [ { "id": 1 }, { "id": 2 } ] } } }
```

`items` staat niet in de voorkeurslijst en zit diep. Zet **collection** handmatig op `response.result.items`
(of `$.response.result.items`). Resultaat: een tabel met kolom `id`, twee rijen.

### 4. Records met geneste objecten

```json
{ "data": [
  { "id": 1, "customer": { "name": "Alpha", "country": { "code": "NL" } } }
] }
```

Collection `data` (of `AUTO`). Yres slaat de nesting plat tot de kolommen `id`, `customer.name` en
`customer.country.code`.

### 5. Records met een array-veld

```json
{ "data": [ { "id": 1, "tags": [ "vip", "eu" ] } ] }
```

Kolommen `id` en `tags`, waarbij `tags` de tekst `["vip","eu"]` bevat. Wil je die uitsplitsen, doe dat
in een SQL-view of transformatie ná het laden.

### 6. Een nieuw veld verschijnt later

Levert dezelfde bron later `{ "id": 3, "name": "Gamma", "email": "g@x.nl" }`, dan voegt Yres bij die run
automatisch een kolom `email` toe; de bestaande rijen houden `NULL` voor dat veld. Geen handmatige
schemawijziging nodig.

---

**Zie ook:** [REST API-koppeling](restservice.md) · [De laadmotor](../../concepten/load-types.md) ·
[SQL-objecten: functies](../../referentie/sql/functions.md) ·
[SQL-objecten: stored procedures](../../referentie/sql/stored-procedures.md)
