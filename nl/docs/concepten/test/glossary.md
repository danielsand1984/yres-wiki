---
slug: /glossary
sidebar_position: 3
title: Begrippenlijst
description: Yres-terminologie.
---

# Begrippenlijst

| Term | Betekenis |
|---|---|
| **Yres** | Het Azure data platform (datawarehouse-as-a-service). Voorheen **Iris**. |
| **Iris** | Oude productnaam van Yres. Komt nog voor in resource-namen, Confluence (`spaceKey=IRIS`) en interne URL's. |
| **Organisatie** | Afgeschermde ruimte waarin een klant Yres gebruikt; bevat standaard dev + prod. |
| **Environment (omgeving)** | Geïsoleerde versie van een organisatie. Minimaal `dev` en `prod`; optioneel `test`, `acceptance`, `quality`. |
| **Project** | Categoriseert werk binnen een omgeving; bevat changes en heeft een due date. |
| **Change** | Set bewerkingen aan het datawarehouse, te releasen en installeren naar andere omgevingen. |
| **Scripted object** | Custom SQL-object (tabel, SP, function) dat niet door Yres is gegenereerd, beheerd onder een change. |
| **Data source** | Gekoppelde bron waaruit data geladen wordt (database, app, OData/REST). |
| **ADF** | Azure Data Factory — orkestratielaag waar Yres pipelines naartoe genereert. |
| **Integration Runtime (IR)** | Compute van ADF; bereikt bronnen in lokale netwerken. Default `AutoResolveIntegrationRuntime`; self-hosted IR's mogelijk. |
| **Dictionary** | Opgeslagen bron-metadata (tabellen, velden, keys, relaties). Niet voor file- en REST-bronnen. |
| **Load type** | FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL, Delta Image. Zie [databron-koppelen](../../setup/databron-koppelen.md). |
| **HIS** | History-schema (naam via `SchemaHIS`). |
| **STAGE** | Staging-schema voor delta-loads (naam via `SchemaStage`). |
| **ODS** | Operational Data Store. |
| **Persisted view** | Opgeslagen resultaat van een view-query; geladen op `level`-volgorde. |
| **Master pipeline** | Vanuit de frontend ontworpen ADF-pipeline met conditionele flow (on success/failure/completion). |
| **Dynamic Workflow Yres** | De generieke load-pipeline (source/schema/table). |
| **Surrogate key** | Door Yres gegenereerde sleutel voor de natural key; opgeslagen in `[LoadManagement].[SurrogateKeys]`. |
| **Service tier** | Azure database-tier. < S3 geen Columnstore; < P1 geen in-memory. |
| **DefaultStore** | Row- (lezen/schrijven) of column-oriented (queries) opslag. |
| **SSO** | Single Sign-On via Azure; per gebruiker afdwingbaar. |
| **RBAC** | Role-based access control; rollen volgens CRUD per permissietype. |
| **DTAP** | Development, Test, Acceptance, Production. |
| **Plainwater** | Het bedrijf achter Yres. |
