---
title: JSON to tables
sidebar_label: JSON to tables
description: How Yres turns a JSON response from a REST API into database columns — default behaviour, support, steering and examples.
---

# JSON to tables

This page accompanies the [REST API connection](restservice.md) and explains what happens to the
**JSON response** of an API: how Yres turns it into rows and columns, what is supported, and how you
can steer it.

## In short

- Yres does **not** let ADF map column by column. The full response is fetched as a single piece of
  text and **parsed server-side in SQL Server** with `OPENJSON`. This is *schema-on-read*: the table
  structure follows from the JSON that arrives, not from a predefined schema.
- You do not create a field mapping. Yres **creates and extends the STAGE table automatically** based
  on the fields in the response.
- The only knob you usually need is the **collection**: the path to the list of records in the
  response. By default it is **`AUTO`** and Yres guesses the path itself.

## The processing, step by step

1. The **Copy activity** in the dynamic REST pipeline fetches the JSON and writes the **entire
   response body unchanged** as text (the translator maps `$` → a single column `Json`,
   `mapComplexValuesToString`). ADF does not interpret the structure itself.
2. The sink calls the stored procedure **`LoadManagement.spFillTable_Json`** with three things: the raw
   JSON, the **collection** and the target table (STAGE schema + table name).
3. `spFillTable_Json` does two things to make the JSON robust:
   - **Array repair.** If the API delivers a bare array without a wrapper (something ADF sometimes
     breaks), it is re-wrapped as `[ … ]` so it stays valid.
   - **Collection normalisation.** If the collection is not `AUTO` and does not start with `$`, a `$.`
     is prepended (`data` therefore becomes `$.data`).
4. Then **`spJsonToTable`** parses the records with `OPENJSON`, infers a data type per field, and
   dynamically generates a `SELECT … FROM OPENJSON(…) WITH (…)` that produces a **flat table**.
   - If the target table does not exist yet, it is **created** (with `SELECT … INTO`).
   - If it already exists, **missing columns are added** (`ALTER TABLE … ADD`) and the rows are
     inserted. Columns are never dropped.

The flat STAGE table then enters the normal load engine (STAGE → HIS/SCD2), just like any other
source. See [Load types](../../concepten/load-types.md).

## The collection: the path to your records

The **collection** is a JSON path to the **array of records** in the response. It is a **per-table**
setting (in the "Add table" screen of a REST source there is a *collection* field, defaulting to
`AUTO`).

### AUTO (default)

With `AUTO`, Yres finds the most likely records array itself using the function
`fxGetJsonCollections`. It checks whether an array of objects sits anywhere in the response (up to 10
levels deep) and **ranks candidates by the name of the wrapper**. Common names get priority, in this
order:

> `result` → `results` → `data` → `value` → `values` → `records` → `entries` → `rows` → `list` →
> `elements` → `objects` → `nodes` → `children` → `resources` → `entities` → `events` → `logs` /
> `messages` → `entity` → `documents`

If there are several candidates, the best-known name wins; on a tie, the shallowest path. If the
**root itself is an array** (`[ { … }, { … } ]`), the collection becomes `$`.

### Supplying a path yourself

If `AUTO` guesses wrong — for example because the API uses an unusual wrapper name or multiple arrays
— you fill in the path manually. That may be:

- a **bare name**: `data`
- a **nested path** with dots: `result.items`
- a **full JSONPath**: `$.data.records`

## What Yres does with the values

### Data types

Yres infers a SQL data type per column from the JSON values:

| JSON value | Column type in the table |
|---|---|
| text (`"…"`) | `NVARCHAR(MAX)` |
| whole number | `INT` |
| decimal / scientific notation | `DECIMAL(38,15)` |
| `true` / `false` | `BIT` |
| nested object `{ … }` | flattened into **dotted columns** (see below) |
| array `[ … ]` | kept as **JSON text** in a single column (`NVARCHAR(MAX)`) |
| `null` | no type of its own; falls under the rest |

A few points to note:

- Only **real** JSON numbers become numeric. A number in quotes (`"123"`) is a string to JSON and
  therefore stays text.
- Yres picks **one type per column** based on all values in the response. If the same field contains
  strongly varying types (a number one time, text the next), that can cause conversion errors. In that
  case, pin the type (see [Steering the data type](#steering-the-result)).

### Nested objects → dotted columns

If the records contain nested objects, Yres **flattens** them into separate columns, up to **10 levels
deep**. The column name becomes the path with dots between the parts. A record like:

```json
{ "id": 1, "address": { "city": "Utrecht", "zip": "3500" } }
```

yields the columns `id`, `address.city` and `address.zip`.

### Arrays within a record → JSON text

An array value *within* a record is **not** flattened further; it stays as JSON text in a single
column. A record with `"tags": ["a","b"]` therefore gets a column `tags` with the value `["a","b"]`.
You can split that out later in a SQL view if needed.

### A schema that grows with you

If a **new field** appears in the response on a later run, Yres automatically adds a column for it
(`ALTER TABLE … ADD`). Existing columns stay. This keeps the table in step with the API without you
having to change anything.

### Limits

- Per fetched **JSON document**, Yres inspects the **first 10,000 records** of the collection to
  determine the columns and data types; **all records are then loaded**. A field that first appears
  after those initial 10,000 records does not get a column in that run — those values are lost for
  that document. If an endpoint returns many records per response, use a **pagination type** (see
  [REST API › Pagination](restservice.md#pagination)); each page is then parsed separately and in
  full.
- Values are read up to **4,000 characters** for type inference.

## Steering the result

| If you want to … | Then … |
|---|---|
| choose the right records array | set **collection** to the path (`data`, `result.items`, `$.data.records`) instead of `AUTO` |
| determine the target table/schema name | fill in **schema** and **table** (overwrite fields) on the table |
| load large results reliably | choose a **pagination type** so each page is processed separately |
| override an inferred column type | pin the data type in `LoadManagement.OverwriteDataType` (advanced; per source/schema/table/column) |

## Example situations

### 1. A flat list under a wrapper

```json
{ "status": "ok", "data": [ { "id": 1, "name": "Alpha" }, { "id": 2, "name": "Beta" } ] }
```

`AUTO` recognises `data` as the records array. Result: a table with columns `id` and `name`, two rows.
You need to configure nothing.

### 2. The root is an array itself

```json
[ { "id": 1, "name": "Alpha" }, { "id": 2, "name": "Beta" } ]
```

`AUTO` picks collection `$`. Same table as in example 1. (Had ADF lost the outer `[ ]`, the array
repair would fix it.)

### 3. Unusual or deeply nested wrapper

```json
{ "response": { "result": { "items": [ { "id": 1 }, { "id": 2 } ] } } }
```

`items` is not in the preference list and sits deep. Set **collection** manually to
`response.result.items` (or `$.response.result.items`). Result: a table with column `id`, two rows.

### 4. Records with nested objects

```json
{ "data": [
  { "id": 1, "customer": { "name": "Alpha", "country": { "code": "NL" } } }
] }
```

Collection `data` (or `AUTO`). Yres flattens the nesting into the columns `id`, `customer.name` and
`customer.country.code`.

### 5. Records with an array field

```json
{ "data": [ { "id": 1, "tags": [ "vip", "eu" ] } ] }
```

Columns `id` and `tags`, where `tags` contains the text `["vip","eu"]`. To split it out, do that in a
SQL view or transformation after loading.

### 6. A new field appears later

If the same source later returns `{ "id": 3, "name": "Gamma", "email": "g@x.nl" }`, Yres automatically
adds a column `email` on that run; existing rows keep `NULL` for that field. No manual schema change
needed.

---

**See also:** [REST API connection](restservice.md) · [Load types](../../concepten/load-types.md) ·
[SQL objects: functions](../../referentie/sql/functions.md) ·
[SQL objects: stored procedures](../../referentie/sql/stored-procedures.md)
