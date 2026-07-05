---
title: Release notes
sidebar_position: 3
description: Version history of Yres DWH (v1.47 through v1.56), with breaking changes and new sources.
---

# Release notes

Version history of Yres DWH. Older versions may no longer be supported; they remain here for
reference. Each version lists the new features, improvements, and any breaking changes.

:::note Dates from the product documentation
The per-version dates below come from _Yres Documentation 1.55_ (release-notes section). Yres versions
order as decimal fractions — so **1.9 comes after 1.55, and 1.56 before it** — not as semver.
:::

## v1.56 — in testing

The biggest release so far: alongside the web app, the entire data platform (database + ADF) was
overhauled. Below are the highlights per theme; the linked wiki pages describe the details of each
topic.

### Upgrade & breaking changes

- **Upgrading is only possible from v1.50.** Older environments upgrade to 1.50 first.
- **IRIS → Yres, in the database and ADF too.** The upgrade renames the customization schema
  `CustomIris` to `CustomYres` (your own objects move along), columns `Iris*` to `Yres*` (such as
  `YresLastUpdated`), the database role to `Yres_MANAGED_USERS` and the version setting to
  `YRES_VERSION`. In ADF every pipeline is now named `… YRES` instead of `… IRIS`, the linked service
  `IrisDwh` became `YresDwh` and the data lake uses the container `datalake-yres`. **Your own reports,
  SQL or scripts that use the old names must be updated.**
- **Surrogate keys are rebuilt during the upgrade** under a new, collision-free key model (`intKey` as
  a running counter per table; `jsonKey` remains available for custom extensions).
  → [History & SCD2](../concepten/historie-scd2.md)
- **Deploy order:** the database upgrade always precedes the ADF publish — the new pipelines use
  procedures that older databases don't have yet.

### Web app

- **Branding:** IRIS is now **Yres** across the whole web app (emails, UI, translations); updating to 1.56 cleans up old triggers carrying the legacy brand name.
- **Projects & changes:** redesigned changes table with environment entries per change; an object's related changes are visible from the object viewer. → [Change process](../concepten/wijzigingsproces.md), [Projects & changes](../frontend/projecten-changes.md)
- **Multi-tenancy:** subdomain per organization, Azure SSO redirect to the correct organization, and the number of environments tied to the subscription. → [Admin](../frontend/admin.md)
- **Oracle & MySQL refreshed:** the linked services were updated to the latest connector versions — property-based instead of a connection string, MySQL with SSL. → [Oracle](../integraties/bronnen/oracle.md), [MySQL](../integraties/bronnen/mysql.md)
- **Sources & connectivity:** new REST service presets, refined REST pagination, and **Test connectivity** from the web app. → [Integrations](../integraties/overzicht.md)
- **Monitoring & health:** new health bar with DWH statistics; pipeline runs with filters. → [Monitoring & logging](./monitoring-logging.md)
- **Data engineering & object viewer:** git diff and syntax highlighting, richer mapping of scripted objects, and wizard improvements. → [Data engineering](../frontend/data-engineering.md)
- **Management & security:** admin secrets view, credential-expiry notifications, encryption of credentials and jobs, Azure Redis cache, and more robust Azure DevOps integration.

### Data platform — new

- **Workload administration:** workflows now plan their full workload up front
  (`LoadManagement.LoadLog`) and update it per load. The monitor therefore also shows **planned and
  skipped loads**, statuses come from the administration itself and runtimes are accurate. A new
  `ADFLoadMonitor` pipeline and a rebuilt garbage collection mirror the ADF run statuses back into the
  database, so a run that died no longer stays "RUNNING" forever.
  → [Monitoring & logging](./monitoring-logging.md)
- **Retention policy for the log tables:** configurable per table via `Monitoring.RetentionPolicy`
  (defaults 90–365 days); the weekly ADF pipeline `Maintenance Retention YRES` cleans up in batches with
  fixed integrity guarantees (the latest run per load and in-flight loads always survive) and a dry-run
  mode; the trigger deliberately ships disabled. Previously the log tables grew without bound.
  → [Retention of the log tables](./monitoring-logging.md#retention-of-the-log-tables)
- **Refreshing metadata is atomic:** all GetMetaData pipelines stage the metadata and swap it in in a
  single transaction — per part for sources with multiple services. A failed or concurrent refresh can
  no longer leave the column administration half empty.
  → [Refreshing metadata](../frontend/data-sources.md#refreshing-metadata-refresh-metadata), [Stored procedures](./sql/stored-procedures.md)
- **Delta loads extended:** two delta columns now work on all SQL/database sources plus Salesforce,
  SAP SAC and AFAS; Exact Online gained date deltas, the ADDITIONAL load type delta-append, AFAS
  datatype-aware filters and **Oracle** full delta support.
  → [Load types](../concepten/load-types.md), [Multiple delta columns](../concepten/load-types.md#multiple-delta-columns)
- **REST sources:** the request URL is now built inside the pipeline from the base URL in Key Vault plus
  the endpoint (including query-string merge). → [REST service](../integraties/bronnen/restservice.md)
- **Snowflake:** staging rewritten to a single Parquet file with a configurable staging container.
  → [Snowflake](../integraties/bronnen/snowflake.md)
- **Health checks:** the check view was split into modular groups and extended with ~24 new
  configuration-integrity checks. → [Admin → Health checks](../frontend/admin.md)
- **Change process hardened:** fourteen defects in release/import/install fixed, plus a readable release
  history per change (`Change.vwLogs`). → [Change process](../concepten/wijzigingsproces.md)
- **DB tier scaling:** next to the "Default" tier, a "High" tier is now configurable that workflows can
  scale up to during heavy loads.
- **Archiving:** per table, choose between `CLOSED` (closed SCD2 versions) and `BUSINESS` (data older than X years on a date column); the workflow copies to a dedicated `archive/` path in the Data Lake, verifies the row count and only then purges (double-gated, copy-only by default); archived data is blocked at load time so it cannot return; each table gets an automatic `_IncArchive` union view (live + archive); new health checks guard the configuration. Archiving cannot be configured from the web app yet; that support is coming soon. → [Archiving](../concepten/archivering.md)

### Data platform — stability & performance

- **Stability fixes:** a broad set of fixes in the load mechanism (type mappings, delta filters,
  pagination, monitoring statuses and error handling) and in the CI/CD mechanisms (change process,
  release/import/install and deployment). → [Monitoring & logging](./monitoring-logging.md),
  [Change process](../concepten/wijzigingsproces.md)
- **Performance improvements:** the SCD2 merge was rewritten on its hotspots and workflow planning no
  longer scales with the monitoring history or the number of tables — most noticeable on large
  environments.

## v1.55 — September 2025

- **Data & loading:** choose which columns count when comparing rows to determine changed records.
- **Sources & connectivity:** Yres now manages Integration Runtimes from the frontend (better for rebuild
  and upgrade to a newer version); existing IRs can be "imported" into the new setup.
- **UI:** action buttons in the datasource menus moved to a ⫶ menu to save space;
  REST sources now pick default values for centrally managed settings (such as `KeepStage` and
  row-/columnstore); REST sources are named after their target instead of the source endpoint;
  File and REST sources now require Project + change at the start of the wizard.
- **Lifecycle management:** **environment comparison** — compare SQL definitions between environments, with
  a full diff view (between versions or between environments); new organization-level setting to exclude
  specific ADF objects when publishing changes to ADF.
- **Automation & pipelines:** main pipelines can be copied to a new version.
- **Security:** backend URLs based on UUIDs (no predictable endpoints); new installations
  require an additional property in preparation for per-organization subdomains; the client & secrets that
  Yres uses to reach the organization's Azure tenant are manageable by admins.

## v1.54 — July 2025

- **Data & loading:** deactivate tables so they are temporarily kept out of loads; start loads directly
  from the datasource menu; persist view directly from the Persist View menu.
- **Sources & connectivity:** refresh metadata for 80+ sources; support for PAT tokens in
  OneStream.
- **Monitoring & UI:** filter option in the pipeline monitor; extra time selections (1/4/8 hours); paging in
  the monitored jobs; materialized views added to the monitor.
- **Projects & changes:** new iterative process for complex dependencies; **naming overwrites** between
  dev, test, and prod (for sources that have different object names per environment, e.g.
  `ERP_DEV.Customers` / `ERP_TST.Customers` / `ERP.Customers`).
- **Automation & pipelines:** persist view from the main pipeline; custom sources selectable when
  starting loads; parallelism configurable for loads; alternative load fully available.
- **Communication:** announcements now available for organization admins.

## v1.53 — May 2025

- **Data & loading:** **Delta Image** load mode (selectively reload specific periods, e.g. the previous
  year, removing outdated records while preserving history); extended paging in REST sources
  (RFC 5988, offset-based, looped page traversal, body-result-URL); scalable processing via paging
  (100M+ records); refresh PowerBI Models within loads.
- **New sources:** **OneStream**, **SAP Business Data Cloud** (`SAP_BDC`) and **Simplicate**;
  OpenAPI support for REST (`openapi.json` / `swagger.json`, endpoints visually selectable); **custom**
\*\*  database deployment\*\* (deploy onto your own existing Azure database instead of the standard embedded
  database).

  :::info SAP Business Data Cloud ≠ SAP Datasphere
  The source added in this release is **SAP Business Data Cloud** (backend source type `SAP_BDC`).
  This is a different SAP product than **SAP Datasphere**; in the ADF templates they are separate connectors.
  Treat them as related but distinct.
  :::

- **Monitoring & UI:** active environment (Development/Test/Production) prominently shown top-left; new
  monitoring dashboard with history, table sizes in MB and row counts; improved upgrade and
  rebuild monitoring; resizable sidebar; refresh button in the web app; deep links work (a shared link
  now opens the correct page).
- **Table & schema management:** revamped table-creation flow (data types configurable per field at
  creation time); add tags to sources above the tables; column-usage analysis (find unused columns and
  trace their usage).
- **Projects & changes:** include existing database objects from the object tree in changes; carry
  dependencies and/or content into changes; carry metadata from Dev to Prod by default; scripted objects
  visible in the change-content overview.
- **Automation & pipelines:** **Master Pipeline** feature (run actions sequentially/conditionally on
  success or failure of preceding steps, including conditional Power BI refresh); alternative load
  ("Run full, Image, Overwrite or Reload once" — e.g. deltas during the week and a full
  reload on the weekend); garbage-collection pipeline in ADF; trigger custom ADF pipelines from the frontend.
- **Communication:** admin messaging to all application users.
- **Installation & configuration:** simplified installation via an email link; Azure variables (ADF name,
  resource group, subscription) stored in `config.settings`.
- **Improvements:** all timestamps in **UTC** (displayed in your own time zone); clearer error messages;
  fix for IMAGE loads that could fail in the staging step and close all target records.

## v1.52 — January 2025

:::warning Breaking change (reminder)
The view `[Monitoring].[LoadMonitor]` was replaced by `[Monitoring].[Monitor]` in release **1.51**. Both
views continue to co-exist until version **1.53**, after which `[Monitoring].[LoadMonitor]` is removed.

> Note: this concerns the webapp-facing monitoring view. In the current `IRIS_DWH` database, load
> monitoring runs through the views `vwLoads` (pipeline timeline) and `vwMonitor` (broader). See
> [SQL interaction](sql-interaction.md).
> :::

- **Security & users:** SSO required per user (admins can enforce SSO, in the Users & Roles menu).
- **Database object viewer:** show all database objects (including objects not created by or with Yres);
  view definitions in SQL, compare definitions over time, and inspect dependencies.
- **Licensing:** a license is now added to the database so Yres can cap usage where applicable; existing
  customers automatically received a full license.
- **oData / SAP:** support for JSON objects in oData results and gZip compression in oData metadata
  (specifically needed for SAP loads).
- **Database scaling:** DB scaling better managed across multiple workstreams (prevents one workstream
  from scaling the server back down while another is still running).
- **New data types in table keys:** `XML`, `TEXT`, `NTEXT`, `IMAGE`, `GEOGRAPHY`, `GEOMETRY`, `HIERARCHYID`.
- **Also:** new health checks; redesigned Update Tables; new Feedback form (Bug report /
  Feature request / Feedback); "Panel" renamed to Users & Roles; upgrade of LinkedServices in ADF
  (MySQL, PostgreSQL, Snowflake, custom dispatcher); better support for sources without a key.

## v1.51 — September 2024

:::warning Breaking change
The view `[Monitoring].[LoadMonitor]` was replaced by `[Monitoring].[Monitor]`. Both views co-exist
until version **1.52**, after which `[Monitoring].[LoadMonitor]` is removed. _(The v1.52 reminder above_
_cites 1.53 as the removal version — the product documentation is not entirely consistent on this point.)_
:::

- **UI:** new homepage with monitors for jobs, errors, and loads; new datasource picker; resizable and
  improved modal windows.
- **New sources:** multiple **Azure Blob** sources at once; **generic REST APIs** (any API that returns
  JSON; headers per service; auth: anonymous, header, basic, oAuth; query parameters supported;
  GET endpoints only); **Salesforce**; **SAP Analytics Cloud** (SAC).
- **oData:** oAuth support (client credential + authorization code); mandatory `OrderBy` removed
  (for services that do not support OrderBy).
- **Security:** default publication of the role `[Yres_dbreader]` (read from the configured HIS schema,
  STAGE and system tables hidden); Key Vault API version 7.4.
- **Loading:** support for **two delta columns** for all SQL-based sources **except MySQL**
  (manually configurable via the `deltaColumn` field in `Loadmanagement.UsedTables`, comma-separated, both
  columns the same data type; the system takes the highest value).

## v1.50 — August 2024

- Default support for **surrogate keys** (system-wide and per table).
- Table settings in the web frontend: columnstore, inMemory, loadfilters, delta offsets, page limits, and
  package sizes (previously only via the SQL endpoint).
- **Single environment** (prod only) possible.
- Full logging in **UTC**, displayed in any time zone.
- New data-engineering menu; lists sorted alphabetically.

## v1.49 — June 2024

- New top menu; better insight into active jobs.
- Push notifications for completed jobs, wherever you are in the application.
- Strict database management: no unrequested changes to settings, logs, or objects.

## v1.48 — April 2024

- New top menu and notifications for completed jobs.
- Firewall specifically for the web frontend.
- Direct links to existing Azure resources; new role management.
- Active monitoring of source changes that affect the data platform.

## v1.47 — January 2024

- New audit log for webapp usage.
- PowerBI dashboard embeddable in Yres (for extended load monitoring).
- Users can be members of multiple organizations.
