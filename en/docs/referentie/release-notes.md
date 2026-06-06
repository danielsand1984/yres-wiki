---
sidebar_position: 3
title: Release notes
description: Version history of Yres DWH.
---

# Release notes

Version history of Yres DWH. Older versions may no longer be supported.

## v1.55 — September 2025
- **Data & loading:** choose which columns count when comparing rows (changed records).
- **Connectivity:** Integration Runtimes now managed from the frontend (better for rebuild/upgrade); existing IRs importable.
- **UI:** action buttons in datasource menus moved to a ⫶ menu; REST sources choose default values for centrally managed settings (KeepStage, Row/Column store); REST sources named after their target; File/REST require Project + change beforehand in the wizard.
- **Lifecycle:** **environment comparison** (compare SQL definitions between environments), full diff view; org-level setting to exclude specific ADF objects when publishing.
- **Pipelines:** main pipelines copyable to a new version.
- **Security:** backend URLs based on UUIDs; extra property for subdomains per organization; client & secrets for Azure access manageable by admins.

## v1.54 — July 2025
- Deactivate tables (temporarily out of loads); start loads from the datasource menu; persist view directly from the menu.
- Refresh metadata for 80+ sources; PAT tokens in OneStream.
- Monitor: filter option, extra time selections (1/4/8 hours), paging, materialized views.
- **Naming overwrites** between dev/test/prod; iterative process for complex dependencies.
- Persist View from main pipeline; parallelism for loads; alternative load fully available; announcements for org admins.

## v1.53 — May 2025
- **Delta Image** load mode; extended paging in REST (RFC 5988, offset, looped, body-result URL); scalable processing (100M+ records); PowerBI model refresh in loads.
- New sources: **OneStream**, **SAP Business Data Cloud**, **Simplicate**; OpenAPI support for REST; **custom database deployment** (your own Azure database).
- Central environment display top-left; new monitoring dashboard (table size in MB, row counts); resizable sidebar; deep links work.
- **Master Pipeline** feature (conditional flows); garbage collection pipeline; trigger ADF pipelines from the frontend.
- All timestamps in **UTC**; simplified installation via email link.

## v1.52 — January 2025
- SSO required per user; database object viewer (definitions, comparison over time, dependencies); **licensing** added (existing customers automatically received a full license).
- oData: JSON objects + gZip compression (needed for SAP); better DB scaling across multiple workstreams; new data types in table keys (XML, TEXT, NTEXT, IMAGE, GEOGRAPHY, GEOMETRY, HIERARCHYID).
- ⚠️ **Reminder breaking change:** `[Monitoring].[LoadMonitor]` → `[Monitoring].[Monitor]`.

## v1.51 — September 2024
- ⚠️ **Breaking change:** `[Monitoring].[LoadMonitor]` replaced by `[Monitoring].[Monitor]` (co-exist until v1.52).
- New homepage with monitors; new datasource picker; multiple Azure Blob sources; **generic REST APIs** as source (any JSON API; auth: anonymous/header/basic/oAuth; GET only); **Salesforce** and **SAP Analytics Cloud** as source; oAuth for oData; role `[Yres_dbreader]`; two delta columns for SQL sources (except MySQL).

## v1.50 — August 2024
- Default support for **surrogate keys** (system-wide and per table); table settings in the web frontend (Columnstore, inMemory, load filters, delta offsets, page limits, package sizes); **single environment** (prod only); full logging in UTC; new data engineering menu.

## v1.49 — June 2024
- New top menu; better insight into active jobs; push notifications for completed jobs; strict database management (no unrequested changes to settings/logs/objects).

## v1.48 — April 2024 · v1.47 — January 2024
- See the original documentation for details.
