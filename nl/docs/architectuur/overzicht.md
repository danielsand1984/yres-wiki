---
slug: /architectuur
sidebar_position: 1
title: Architectuur
description: Hoe Yres technisch in elkaar zit — twee planes, Azure-stack, de vwExtractor → STAGE → HIS-gegevensstroom, DTAP en lineage.
---

# Architectuur (high-level)

> Deze pagina beschrijft de architectuur op hoofdlijnen. Voor de diepere Azure-details (resources, toegangsniveaus, setups, naming, firewall) zie [Azure-architectuur](./azure-architectuur.md). De volledige load-stroom staat in [Gegevensstroom](../concepten/gegevensstroom.md) en het historiemodel in [Historie & SCD2](../concepten/historie-scd2.md).

## De twee planes

Yres bestaat uit **twee planes die nooit data delen**. Dit onderscheid is de kern van de architectuur:

| | Control plane | Data plane |
|---|---|---|
| **Wat** | De multi-tenant SaaS-webapp (één deployment voor alle klanten) | Eén ADF-factory + één Azure SQL-database (`IRIS_DWH`) **per klant-organisatie × omgeving** |
| **Waar** | Centraal gehost door Yres | **Binnen de eigen Azure tenant** van de klant |
| **Bevat** | Organisaties, gebruikers, omgevingen en facturatie in een PostgreSQL-database. **Nooit klantdata.** | Hier beweegt de data daadwerkelijk: bron → ADF → Azure SQL → optioneel Data Lake → Power BI |

De control plane **provisiont en bestuurt** elke data plane via de Azure Management API, de ADF API, de Key Vault API, de Azure DevOps API en een directe SQL-verbinding. De webapp leest of bewaart zelf nooit klantdata — die blijft volledig in de Azure-omgeving van de klant.

## Stack (data plane)

| Laag | Technologie |
|---|---|
| Bronnen | Exact, AFAS, SAP, Salesforce, databases, REST API's en tientallen andere connectoren |
| Orkestratie | Azure Data Factory (ADF) — door Yres gegenereerd en beheerd |
| Opslag (warehouse) | Azure SQL (`IRIS_DWH`) — bevat zowel de data als de load-engine |
| Opslag (optioneel) | Azure Data Lake Gen2 — Parquet-bestanden |
| Secrets | Azure Key Vault — alle bron- en databasecredentials |
| CI/CD | Azure DevOps — Git + deployment voor zowel ADF als de database |
| Rapportage | Power BI |
| Identiteit | Azure SSO + rolgebaseerde rechten (RBAC) |
| Lokale netwerken | Integration Runtime (IR) |

## Hosting

Standaard draait Yres volledig binnen de **eigen Azure tenant** van de klant — data, infrastructuur en kosten blijven van de klant. Dat is een bewuste keuze: geen vendor lock-in en volledige controle over je eigen data.


## Het kernidee: metadata stuurt, ADF voert uit

Niets over de specifieke tabellen van een klant is hardcoded in ADF of SQL. Het datawarehouse publiceert via één view — **`[LoadManagement].[vwExtractor]`** — precies welke tabellen geladen moeten worden en met welke parameters. ADF leest die view, kopieert per tabel de bytes naar het `STAGE`-schema en roept vervolgens terug in SQL om de set-based SCD2-merge naar historie uit te voeren.

Gevolg: **een bron toevoegen betekent metadata-rijen invoegen, niet een nieuwe pipeline schrijven.** De load-logica zit volledig in SQL; ADF verplaatst alleen bytes.

> **Let op (verduidelijking):** Yres is geen visuele pipeline-designer met drag-and-drop. Je **configureert bronnen, tabellen en laadtypes in wizards**, waarna Yres de ADF-pipelines **automatisch genereert**.

## De gegevensstroom van één load

Onder elke load loopt dezelfde rode draad. Op hoofdlijnen:

1. **Trigger / handmatige run / webapp-aanroep** start de orchestrator-pipeline (`Dynamic Workflow YRES`).
2. **Start workflow** logt de start via `[Monitoring].[spWriteLoadStatus]`.
3. **Get tables** leest `vwExtractor` (achterliggende logica zit in de functie `[LoadManagement].[fxExtractor]`) en bepaalt welke tabellen geladen worden.
4. Per tabel (parallel) kopieert ADF de bron via **Copy** naar **`STAGE.<Target>`**.
5. **Load DWH** roept `[LoadManagement].[spLoadDWH]` aan, die doorschakelt naar `[LoadManagement].[spHIS_InsertAndUpdate]` — de SCD2-merge van `STAGE` naar **`HIS`** (standaard het schema `ODS`).
6. Optioneel landen de **mutaties van deze run** als **Parquet change feed** in de Data Lake.
7. `STAGE` wordt opgeschoond (tenzij `keepStage=1`) en de status wordt afgesloten via `spWriteLoadStatus`.

De drie lagen waar data doorheen stroomt:

| Laag | Schema | Inhoud |
|---|---|---|
| **STAGE** | `STAGE` | Ruwe landing van de bronextract + `ETL_Date` + berekende `Keyhash`/`Rowhash` |
| **HIS** | standaard `ODS` | Volledige SCD2-historie (business-kolommen + framework-kolommen) |
| **Expose / rapportage** | `Exposed`, gebruikersschema's | Rapportage-views/-tabellen + toegangsbeheer (RBAC) |

> De volledige stap-voor-stap-uitleg, inclusief monitoring en logging, staat in [Gegevensstroom](../concepten/gegevensstroom.md). Hoe Yres historie bijhoudt (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `isCurrent`, `Delta`) lees je in [Historie & SCD2](../concepten/historie-scd2.md).

## Data Lake (medallion / Parquet)

Naast het Azure SQL-warehouse kan Yres elke load **optioneel** ook naar Azure Data Lake Gen2 wegschrijven, als **append-only change feed**: per run één Parquet-bestand met alleen de gemuteerde rijen, elk gemarkeerd als insert, update of delete, gepartitioneerd op bron/schema/tabel/jaar/maand. Dit is een aparte, parallelle landing voor analytics- en lakehouse-scenario's (medallion-aanpak). → [Lake feed](../concepten/lake-feed.md)

:::note Twee aparte sporen
De lake-uitvoer staat **los van** de SCD2-historie-engine in de database. Het warehouse is de bron van waarheid voor historie; de feed is daarvan afgeleide, append-only data. Yres houdt daarvoor per lake-tabel een slanke administratie bij (schema `LAKE`) die alleen hashes en datums bevat — geen businessdata.
:::

## Pipelines

Yres genereert ADF-pipelines en beheert deze volledig. Bestaande handmatige ADF-pipelines kunnen naast Yres blijven draaien in dezelfde Azure-omgeving.

## Lifecycle / DTAP

Yres ondersteunt de volledige lifecycle van development tot productie, met CI/CD-integratie via Azure DevOps en environment management (DTAP: Development, Test, Acceptance, Production). Wijzigingen test je vooraf, rol je veilig uit en herstel je wanneer nodig zonder dataverlies. De eerste omgeving is altijd **development**; afhankelijk van je licentie kun je meerdere omgevingen inrichten.

## Lineage & impactanalyse

Visuele lineage op **objectniveau** (tables, views, procedures, functions, materialized views) met impactanalyse. Column-level lineage is momenteel niet beschikbaar.

## Bestaande databases

Yres ondersteunt het gebruik van bestaande Azure-databases. Een migratie van een ander platform bespreken we in een architectuursessie.

## Verder lezen

- [Azure-architectuur](./azure-architectuur.md) — resources, toegangsniveaus, setups, naming, firewall, scaling
- [Gegevensstroom](../concepten/gegevensstroom.md) — hoe één load van trigger tot gehistoriseerde data loopt
- [Historie & SCD2](../concepten/historie-scd2.md) — surrogaatsleutels, `ETL_Date`, `isCurrent`, hash-gebaseerde wijzigingsdetectie
- [Load types](../concepten/load-types.md) — de zeven laadtypes en wat ze met de historietabel doen
- [Installatie](../setup/installatie.md) — stap voor stap inrichten
- [SQL Interaction](../referentie/sql-interaction.md) — stored procedures, functions en views
