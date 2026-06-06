---
sidebar_position: 3
title: Release notes
description: Versiehistorie van Yres DWH.
---

# Release notes

Versiehistorie van Yres DWH. Oudere versies kunnen niet meer ondersteund zijn.

## v1.55 — september 2025
- **Data & loading:** kolommen kiezen die meetellen bij het vergelijken van rijen (changed records).
- **Connectivity:** Integration Runtimes nu vanuit de frontend beheerd (beter bij rebuild/upgrade); bestaande IR's importeerbaar.
- **UI:** actieknoppen in datasource-menu's naar een ⫶-menu; REST-bronnen kiezen default-waarden voor centraal beheerde settings (KeepStage, Row/Column store); REST-bronnen genoemd naar hun target; File/REST vereisen Project + change vooraf in de wizard.
- **Lifecycle:** **environment comparison** (SQL-definities vergelijken tussen omgevingen), volledige diff-view; setting op org-niveau om specifieke ADF-objecten uit te sluiten bij publiceren.
- **Pipelines:** main pipelines kopieerbaar naar een nieuwe versie.
- **Security:** backend-URL's op basis van UUID's; extra property voor subdomeinen per organisatie; client & secrets voor Azure-toegang beheerbaar door admins.

## v1.54 — juli 2025
- Tabellen deactiveren (tijdelijk uit loads); loads starten vanuit het datasource-menu; persist view direct vanuit het menu.
- Refresh metadata voor 80+ bronnen; PAT-tokens in OneStream.
- Monitor: filteroptie, extra tijdselecties (1/4/8 uur), paging, materialized views.
- **Naming overwrites** tussen dev/test/prod; iteratief proces voor complexe dependencies.
- Persist View vanuit main pipeline; parallelism voor loads; alternative load volledig beschikbaar; announcements voor org-admins.

## v1.53 — mei 2025
- **Delta Image** load mode; uitgebreide paging in REST (RFC 5988, offset, looped, body-result URL); schaalbare verwerking (100M+ records); PowerBI-model refresh in loads.
- Nieuwe bronnen: **OneStream**, **SAP Business Data Cloud**, **Simplicate**; OpenAPI-support voor REST; **custom database deployment** (eigen Azure-database).
- Centrale environment-weergave linksboven; nieuw monitoring-dashboard (tabelgrootte in MB, rowcounts); resizable sidebar; deep links werken.
- **Master Pipeline**-feature (conditionele flows); garbage collection-pipeline; ADF-pipelines triggeren vanuit frontend.
- Alle timestamps in **UTC**; vereenvoudigde installatie via e-maillink.

## v1.52 — januari 2025
- SSO verplicht per gebruiker; database object viewer (definities, vergelijken over tijd, dependencies); **licensing** toegevoegd (bestaande klanten kregen automatisch volledige licentie).
- oData: JSON-objecten + gZip-compressie (nodig voor SAP); betere DB-scaling over meerdere workstreams; nieuwe datatypes in table keys (XML, TEXT, NTEXT, IMAGE, GEOGRAPHY, GEOMETRY, HIERARCHYID).
- ⚠️ **Reminder breaking change:** `[Monitoring].[LoadMonitor]` → `[Monitoring].[Monitor]`.

## v1.51 — september 2024
- ⚠️ **Breaking change:** `[Monitoring].[LoadMonitor]` vervangen door `[Monitoring].[Monitor]` (co-existeren tot v1.52).
- Nieuwe homepage met monitors; nieuwe datasource-picker; meerdere Azure Blob-bronnen; **generieke REST API's** als bron (elke JSON-API; auth: anonymous/header/basic/oAuth; alleen GET); **Salesforce** en **SAP Analytics Cloud** als bron; oAuth voor oData; rol `[Yres_dbreader]`; twee delta-kolommen voor SQL-bronnen (behalve MySQL).

## v1.50 — augustus 2024
- Standaard support voor **surrogate keys** (systeembreed en per tabel); table settings in de web-frontend (Columnstore, inMemory, loadfilters, delta-offsets, page limits, package sizes); **single environment** (alleen prod); volledige logging in UTC; nieuw data-engineering-menu.

## v1.49 — juni 2024
- Nieuw topmenu; beter inzicht in actieve jobs; push-berichten voor afgeronde jobs; strikt databasebeheer (geen ongevraagde wijzigingen in settings/logs/objecten).

## v1.48 — april 2024 · v1.47 — januari 2024
- Zie de originele documentatie voor details.
