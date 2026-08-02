---
sidebar_position: 5
title: License & limits
description: How the Yres license works — the tiers (Essentials/Advanced/Ultimate), the LicenseKey field in the database and the fxCheckLicense/fxCheckSystem functions that enforce source, table and size limits.
---

# License & limits

A Yres license determines **what** you may run in an environment: how many sources, how many tables, which source types, and how large the HIS tables may grow. These limits are not enforced in the webapp but **in the database itself** — the data plane enforces them, so they keep applying even when you work directly through a SQL endpoint.

This page explains two things:

1. The **commercial tiers** (Essentials, Advanced, Ultimate) and how a license is issued.
2. The **technical enforcement** in `IRIS_DWH`: the `LicenseKey` field and the functions `Config.fxCheckLicense` and `Config.fxCheckSystem`.


## The tiers

The license structure has been verified from the official Yres course (Learning p.39). A license is always tied to a **number of sources** (source systems) and a **number of environments**:

| Yres version | Sources (source systems) | Environments |
|---|---|---|
| **Essentials** | 2 sources | 1 environment |
| **Advanced** | 5 sources | 2 environments |
| **Ultimate** | Unlimited | Unlimited |

A few consequences that follow directly from this:

- The first environment is always called **dev**. With **Essentials** that is also the only environment — so "at least dev + prod" does **not** apply to Essentials. For higher tiers Yres recommends 2 to 4 environments.
- "Sources" counts the number of **active source systems** (`LoadManagement.SourceSystems` with `active = 1`), not the number of tables. Tables themselves are metadata rows and are — depending on your license — limited separately (see [Where the limits are enforced](#where-the-limits-are-enforced)).

## How a license is issued

A Yres installation always starts with an **invitation link** from Plainwater. That link:

- is **tied to a single Microsoft account**;
- is **single-use** — once the installation is complete, the link expires;
- is configured for the **purchased version** and grants access to the number of environments that belongs to that license.

You may open and reopen the link as often as needed **until the installation is finished**; after that it is no longer valid.

As of release v1.52 the license is **stored in the database**, so that Yres can cap usage. Existing customers were automatically granted a full license with that release.

:::tip Relation to installation
The license is set up during installation. See the installation/onboarding pages for the steps around the invitation link, the App Registration and choosing environments.
:::

## Where the license technically lives: `Config.Settings.LicenseKey`

The license itself is a single row in the settings table:

```sql
SELECT [Value] FROM Config.Settings WHERE Setting = 'LicenseKey';
```

The value is **not readable text** but an encrypted JSON blob. Yres decrypts it with `DECRYPTBYPASSPHRASE`, where the passphrase is built partly from the **server name** (`@@SERVERNAME`). This binds a license **to exactly this installation** and means a key cannot simply be copied to another server.

If you want to view the (decrypted) contents without touching the limits, use the read-only helper function:

```sql
SELECT * FROM Config.fxViewLicense();
```

This returns the license as key/value pairs. The most important keys:

| Key | Meaning |
|---|---|
| `INSTALLATION` | `HASHBYTES('SHA2_512', server + database)` — binds the license to this exact installation. |
| `ENDDATE` | Expiry date; after this date the license is no longer valid. |
| `TYPE` | `RESTRICTIVE` (limit blocks) or `MONITORING` (limit is only reported). Unknown/empty → treated as `RESTRICTIVE`. |
| `FLEXIBILITY` | Headroom in **percent** above a limit (e.g. limit of 100 tables + 10% = 110 allowed before the system cuts off). |
| `SOURCES` | Max. number of active sources. |
| `#SOURCETYPES` | Max. number of **unique** source types. |
| `SOURCETYPES` | The permitted source types (pipe-separated list, e.g. `MSSQL\|AZSQL\|OData`). |
| `TABLES` | Max. number of Yres-managed tables (`LoadManagement.UsedTables` with `active = 1`). |
| `DBSIZE_HIS` | Max. total size (MB) of all Yres-managed HIS tables combined. |
| `MAXSIZE_HIS` | Max. size (MB) of a single HIS table. |
| `SURROGATE` | `0` = surrogate keys not allowed under this license. |

:::info Code still says "IRIS"
The product is called **Yres**, but the health-check view that shows the license status still has `vwIrisChecks.sql` as its source file. The created object is **`[Maintenance].[vwYresChecks]`** — use that object name.
:::

## The control functions

### `Config.fxCheckLicense` — the enforcer

```sql
Config.fxCheckLicense(@feature, @value, @check = 'SYSTEM', @checkvalue)
```

`fxCheckLicense` decrypts `LicenseKey`, first checks the **validity** and then the requested **limit**:

1. **Validity** (always, regardless of `@feature`):
   - is the key valid at all (does it contain an `INSTALLATION` value)?
   - is the license intended for **this** installation (the `INSTALLATION` hash must match `SHA2_512` of server + database)?
   - has the `ENDDATE` not yet passed?
2. **Limit** for the supplied `@feature` (`SOURCES`, `#SOURCETYPES`, `SOURCETYPES`, `TABLES`, `DBSIZE_HIS`, `MAXSIZE_HIS`, `SURROGATE`). With `@feature = NULL`, **all** limits are checked.

What happens on an overrun depends on the license `TYPE`:

- **`RESTRICTIVE`** → the function returns an **error** directly (e.g. *"The number of sources has reached its limit of 5"*). The calling procedure aborts the action.
- **`MONITORING`** → the overrun is **reported** but does not block.

The `FLEXIBILITY` headroom is applied **only** during the system check (`@check = 'SYSTEM'`); with an explicit `'CHECK'` (such as the health checks) the headroom is 0, so that you see the actual license boundaries.

### `Config.fxCheckSystem` — the anti-tamper control

```sql
Config.fxCheckSystem(@value)
```

`fxCheckSystem` returns a `SHA2_512` hash over **server name + database name + `@value`**. This is the counterpart that makes the enforcement **tamper-resistant**:

- When everything is in order, `fxCheckLicense` does **not** return "OK" but **the same hash** as `fxCheckSystem` (a value that also changes every minute).
- A caller concludes "license OK" **only** when `fxCheckSystem(@value) = fxCheckLicense(@feature, …, @value)`.

This means a customer cannot replace `fxCheckLicense` with their own version that always returns "true": without the correct, per-minute-rotating hash the result never matches. Because the hash can flip on a minute boundary, callers check against the hash of **this** minute and the **previous** minute.

:::note Extra lock on the function
A database trigger (`dtrEventLog`) watches changes to the `fxCheckLicense` object. Attempts to rewrite the license check are therefore also recorded in the audit log.
:::

## Where the limits are enforced

The license check is built into the places where you add or load something:

| Action | Procedure / object | Checked features |
|---|---|---|
| Add a source | `LoadManagement.spMaintainSource` | `SOURCES`, `SOURCETYPES` |
| Add a table | `LoadManagement.spMaintainTable` | `TABLES` |
| Add a file-source table | `LoadManagement.spMaintainFiles` | `TABLES` |
| Determine what gets loaded | `LoadManagement.fxExtractor` (behind `vwExtractor`) | `DBSIZE_HIS`, `MAXSIZE_HIS` |
| Health checks | `[Maintenance].[vwYresChecks]`, group `6 License` | all of the above + `#SOURCETYPES`, `SURROGATE`, `INSTALLATION` |

Two consequences worth knowing:

- **Over the limit → no extraction.** `fxExtractor` is the view (`vwExtractor`) that ADF reads to know **what** it should load. Tables or databases that exceed the `DBSIZE_HIS`/`MAXSIZE_HIS` boundary are **filtered out of the result** by this gate and therefore no longer loaded. Existing data stays in place but grows no further.
- **Adding is refused.** With a `RESTRICTIVE` license, `spMaintainSource`/`spMaintainTable` returns an error as soon as you reach the source or table limit, and the source or table is not created.

## Checking the license

The fastest way to see the status is the **health checks** in the webapp (or the view directly in SQL). The license checks are in group `6 License` of `[Maintenance].[vwYresChecks]`:

| Check | Topic |
|---|---|
| `6.01` | System — is the license valid and intended for this installation? |
| `6.02` | Number of tables within the limit. |
| `6.03` | Number of sources within the limit. |
| `6.04` | All existing sources are permitted source types. |
| `6.05` | Number of unique source types within the limit. |
| `6.06` | Use of surrogate keys allowed. |
| `6.07` | Total DB size (Yres-managed HIS tables only) within the limit. |
| `6.08` | Maximum size of a single HIS table within the limit. |

Checking it yourself step by step via SQL:

1. **View the license contents** (decrypted, read-only):
   ```sql
   SELECT * FROM Config.fxViewLicense();
   ```
2. **Check a specific limit** — compare the result with `fxCheckSystem`; if they are equal, you are within the license:
   ```sql
   SELECT
     Config.fxCheckSystem('check')                                   AS systemHash,
     Config.fxCheckLicense('SOURCES', NULL, 'CHECK', 'check')        AS licenseResult;
   -- equal = OK; differing text = warning/overrun
   ```
3. **View all license checks at once** via the health-check view:
   ```sql
   SELECT * FROM [Maintenance].[vwYresChecks] WHERE [Group] = '6 License';
   ```

If you get an error (e.g. that the number of sources or the DB size has reached the limit), contact your Yres support partner. For surrogate keys that no longer fall under your license, check `6.06` even provides a cleanup script.

## In summary

- A Yres license caps **sources, source types, tables and HIS size** per environment — enforced in the **database**, not only in the webapp.
- The license is stored encrypted in `Config.Settings.LicenseKey`, bound to **this** server/database.
- `Config.fxCheckLicense` checks the limits; `Config.fxCheckSystem` makes that check **tamper-resistant** via a per-minute-rotating hash.
- The three tiers (Essentials/Advanced/Ultimate) determine the number of sources and environments; **prices and per-tier feature gating are commercial agreements** ([Pricing](../prijzen.md)).

See also: [SQL Interaction](./sql-interaction.md) for the full object catalog and [Webapp screens](./webapp-schermen.md) for the routes where you touch these functions via the UI.
