---
sidebar_position: 6
title: Test suite (DWH)
description: The bundled regression test suite for the Yres database — when to run it, how to start it with run-all-tests.ps1 or Test.spRunAll, how to read the results, and why it is safe on production.
---

# Test suite (DWH)

The Yres data-plane database (`IRIS_DWH`) ships with a **regression test suite** that exercises the complete SQL framework: every in-scope object (stored procedures, functions, views and triggers) has exactly one test. The suite lives in the DWH repository under **`DWH/tests/`** and is **not part of the DACPAC** — it is never deployed automatically. You install and run it deliberately, and you can remove it just as deliberately.

This page describes how to **use** the suite. Its internal design (fixtures, test tiers, assert framework) is documented inside the repository itself (`DWH/tests/README.md`).

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

### Via the bundled runner (recommended)

```powershell
cd DWH/tests
.\run-all-tests.ps1 -CredentialsFile 'C:\path\to\environment-creds.txt' -FailIfBusy
```

The runner installs (or refreshes) the framework and then runs all tests. Useful options:

| Option | Meaning |
|---|---|
| `-CredentialsFile` | Text file holding the server/database/user/password of the target environment. |
| `-FailIfBusy` | **Recommended on production:** aborts when loads are running (started in the last 4 hours). Without this switch the busy check is advisory only (a SKIP row in the result). |
| `-Suite framework` / `-Suite loadengine` | Run only the per-object suite or only the load-engine suite (default: both). |
| `-Schema <name>` | Run only the tests of one schema (e.g. `LoadManagement`). |
| `-Round '<label>'` | Your own label for the run (e.g. a ticket number), retrievable in the history. |

The account used needs read/write access on the framework schemas plus DDL rights on `STAGE`, the HIS schema and `Test`.

### Via SQL

Once the framework is installed, you can run straight from SSMS or Azure Data Studio:

```sql
DECLARE @id int;
EXEC Test.spRunAll   @Round = 'ticket-123', @RunId = @id OUTPUT;  -- everything: preflight → tests → cleanup + residue check
EXEC Test.spRunSuite @Schema = 'LoadManagement', @Round = 'ticket-123';  -- one schema
```

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

- **SKIP rows always carry a reason** — for example a licence gate, a deliberately non-executed unsafe action, or the busy advisory. A SKIP is documented behaviour, not a missed test.

:::tip Check the licence first
The tests around `fxExtractor`/`vwExtractor` skip themselves (SKIP) when the licence filters the test fixture out of the extraction overview. If you see unexpectedly many SKIPs in `LoadManagement`, check the licence first.
:::

## Removing it

The test results and the framework live in their own `Test` schema, which deliberately persists after a run so the history stays queryable. If you want to leave an environment without any trace, first run `EXEC Test.spCleanupAll;` (if a run was interrupted) and then drop all objects in the `Test` schema followed by the schema itself. The DWH repository ships a ready-made script for this in the runbook accompanying the suite.
