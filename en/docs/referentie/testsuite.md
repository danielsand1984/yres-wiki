---
sidebar_position: 6
title: Test suite (DWH)
description: The bundled regression test suite for the Yres database — part of the DACPAC since v1.56; when to run it, how to start it with Test.spRunAll, how to read the results, and why it is safe on production.
---

# Test suite (DWH)

The Yres data-plane database (`IRIS_DWH`) ships with a **regression test suite** that exercises the complete SQL framework: every in-scope object (stored procedures, functions, views and triggers) has exactly one test procedure. Since v1.56 that single procedure exercises multiple scenarios: per object type it walks a fixed matrix — alongside the happy path also empty input, `NULL`, edge cases, invalid input, missing dependencies and multiple rows at once. In total that amounts to roughly **1665 checks across 194 objects**.

From **v1.56** the suite belongs to the database itself: it sits in the DACPAC as the **`[Test]`** schema and is therefore **installed with every Yres version**. There is nothing to install — any environment on the current version already holds every `Test.*` object. Nothing runs **automatically** either: the suite only acts when you call one of its procedures yourself.

This page describes how to **use** the suite.

## What you use it for

- **After a deploy or upgrade** — confirming that all database objects still behave as expected after a DACPAC publish (the primary use case).
- **During troubleshooting** — a full run points straight at the object that misbehaves, including the expected vs. actual value per assertion.
- **As a periodic health exercise** — the suite is idempotent (running it twice in a row yields the same green result twice) and keeps per-run history, so trends are queryable.

:::tip Complementary to the health checks
The test suite is behaviour-oriented ("does this object do what it should?") and thereby complements the configuration-oriented [health checks](../frontend/admin.md) (`Maintenance.vwYresChecks`), which verify the *setup*. For day-to-day monitoring the health checks suffice; you run the test suite around changes.
:::

## Safe on production

The suite is designed to run on **any** Yres environment — development, acceptance and production alike — without touching data or operations:

- **Everything is namespaced.** All test fixtures are `ZZTEST*` objects and rows. The tests never read or write customer data, real metadata rows, or real settings.
- **No environment mutations.** The suite never changes settings, service tiers or security principals (other than `ZZTEST*` fixtures). Procedures that would are only checked statically (signature and definition) or executed in dry-run mode, with an explicit SKIP for the rest.
- **Environment-adaptive.** Tests read the live gates (such as `AllowSettingsUpdates` and the licence) and assert the behaviour that matches *this* environment — they never flip a gate to force a code path.
- **Cleanup is proven, not promised.** Every run starts with a preflight that sweeps residue of any previously crashed run, and ends with a global sweep plus a residue check reported per category as PASS/FAIL rows in the result.

:::info What can remain on a locked-down system
Where `AllowSettingsUpdates = 0`, the audit logs (`Config.EventLog`, `Config.ProcessLog`) are append-only. The only trace of a run is then a handful of audit rows marked `ZZTEST`/`ZZTESTFN` — deleting audit trails on production would itself be a risk, so these deliberately do not count as residue.
:::

## Running it

You run the suite from SSMS, Azure Data Studio or any other SQL client:

```sql
DECLARE @id int;
EXEC Test.spRunAll @Round = 'ticket-123', @FailIfBusy = 1, @RunId = @id OUTPUT;
```

`spRunAll` walks the whole cycle: preflight → tests → cleanup + residue check. Its parameters:

| Parameter | Meaning |
|---|---|
| `@Round` | Your own label for the run (for example a ticket number), retrievable in the history. Leave it empty and the run gets an automatic timestamped label. |
| `@Schema` | Run only the tests of one schema (for example `LoadManagement`). Empty = all schemas. |
| `@FailIfBusy` | **Recommended on production:** `1` aborts when loads are running. At `0` (the default) the busy check is advisory only — a SKIP row in the result. |
| `@RunId` | OUTPUT: the run number by which you retrieve the result later. |

For a single schema there is a shorter wrapper:

```sql
EXEC Test.spRunSuite @Schema = 'LoadManagement', @Round = 'ticket-123';
```

The account used needs read/write access on the framework schemas plus DDL rights on `STAGE`, the HIS schema and `Test`.

In addition there is a self-contained **load-engine suite** (`Test.spRunLoadEngineTests`) that walks all load types (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL) against a synthetic source and verifies the [SCD2 outcome](../concepten/historie-scd2.md):

```sql
EXEC Test.spRunLoadEngineTests @Round = 'ticket-123';
```

## Reading the results

- **Console/direct output:** one line per assertion (PASS/FAIL/SKIP with expected and actual value), a per-object summary, the coverage summary and a closing `ALL PASSED` or `FAILURES` banner.
- **Persistent** (every run is kept, history is queryable):

| Object | Contents |
|---|---|
| `Test.RunLog` | One row per run: counts, duration, round label. |
| `Test.RunResult` | One row per assertion: PASS/FAIL/SKIP with expected vs. actual value. |
| `Test.vwRunSummary` | One row per run with totals and final status. |
| `Test.vwCoverageSummary` | Tested vs. in-scope objects per schema — the target is **100%** everywhere. |
| `Test.CoverageExclusion` | What is deliberately out of coverage scope, with the reason. |

- **SKIP rows always carry a reason** — for example a licence gate, a deliberately non-executed unsafe action, or the busy advisory. A SKIP is documented behaviour, not a missed test.

Coverage is measured over **Yres-owned** objects. Out of scope are therefore the bundled third-party
diagnostic packages (the `Maintenance` schema with the sp\_Blitz family, `sp_WhoIsActive` and
AdaptiveIndexDefrag) and everything generated per customer (the `Exposed` schema and your own
`Custom…` schemas). Those exclusions are listed with their reason in `Test.CoverageExclusion` and are
re-applied on every deploy.

:::tip Check the licence first
The tests around `fxExtractor`/`vwExtractor` skip themselves (SKIP) when the licence filters the test fixture out of the extraction overview. If you see unexpectedly many SKIPs in `LoadManagement`, check the licence first.
:::

## When has the suite passed?

The criterion is **not** "everything green" but **"no unexplained failure"**.

Every failed check (`Outcome = 'FAIL'`) that describes a known, registered defect carries a reference
to it in its description (`Label`, recognisable by `KNOWN BUG:`). That row turns green by itself once
the defect is fixed — until then it is part of the expected outcome. A failure **without** such a
reference is the signal that matters: that is a regression.

This query shows you exactly that: the unexplained failures of the latest run.

```sql
SELECT ObjSchema, ObjName, Label, Got, Expected
FROM Test.RunResult
WHERE RunId = (SELECT MAX(RunId) FROM Test.RunLog)
  AND Outcome = 'FAIL'
  AND (Label IS NULL OR Label NOT LIKE '%KNOWN BUG%');
```

If this returns a row, that is an issue that needs attention. An empty result set means the suite has
passed, even if there are (expected) FAIL rows among the individual results.

### Skipped checks carry a structured reason

Besides the free-text reason in `SkipReason`, `Test.RunResult` has a `SkipCategory` column that
sorts every SKIP into one of five fixed categories:

| Category | Meaning |
|---|---|
| `NOT_APPLICABLE` | Does not exist on any environment — for example a check on a column that can never be empty by definition. |
| `ENVIRONMENT` | Depends on this particular environment and runs automatically elsewhere — for example a check that requires a case-sensitive collation. |
| `WOULD_MUTATE` | Would change the running environment (service tier, security roles, clearing every staging table) and is therefore never executed automatically. |
| `SUITE_CONSTRAINT` | Blocked by a rule of the test suite itself, not by the environment. |
| `KNOWN_BUG` | A side effect of a known, registered defect. |

`Test.vwRunSummary` totals the SKIPs per category for you, so you can see at a glance *why* a run
executed fewer checks than are in scope — without reading every `SkipReason` individually.

:::warning A percentage is not a meaningful number
Never compare a "percentage complete" between environments: which checks get skipped differs per
environment (licence, service tier, configured gates), so the percentage differs per installation and
is therefore not comparable. The number that does carry meaning is **the number of checks executed
compared to the previous run** on the same environment. If that drops without explanation, a check has
dropped out — and that is exactly what you want to be able to see.
:::

## Removing it

The test results and the framework live in their own `Test` schema, which deliberately persists after a run so the history stays queryable. If a run was interrupted, `EXEC Test.spCleanupAll;` sweeps the leftover fixtures.

:::note The `Test` schema belongs to the database
Because the suite has been part of the DACPAC since v1.56, the `Test` schema simply returns with the
next version update if you drop it by hand. It costs virtually nothing as long as you start no runs:
without a run, `Test.RunLog` and `Test.RunResult` stay empty.
:::
