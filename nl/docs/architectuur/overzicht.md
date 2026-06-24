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

:::info Te bevestigen
De wiki noemde eerder ook hosting *door Yres* als expliciete optie. Beide Yres-bronnen benadrukken juist consequent dat alles 100% in de eigen Azure tenant van de klant draait. Of een door Yres gehoste variant wordt aangeboden, en op welke voorwaarden, is een commerciële keuze die de eigenaar moet bevestigen voordat dit wordt gepubliceerd.
:::

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
6. Optioneel landt **Load DL** een kopie als **Parquet** in de Data Lake.
7. `STAGE` wordt opgeschoond (tenzij `keepStage=1`) en de status wordt afgesloten via `spWriteLoadStatus`.

De drie lagen waar data doorheen stroomt:

| Laag | Schema | Inhoud |
|---|---|---|
| **STAGE** | `STAGE` | Ruwe landing van de bronextract + `ETL_Date` + berekende `Keyhash`/`Rowhash` |
| **HIS** | standaard `ODS` | Volledige SCD2-historie (business-kolommen + framework-kolommen) |
| **Expose / rapportage** | `Exposed`, gebruikersschema's | Rapportage-views/-tabellen + toegangsbeheer (RBAC) |

> De volledige stap-voor-stap-uitleg, inclusief monitoring en logging, staat in [Gegevensstroom](../concepten/gegevensstroom.md). Hoe Yres historie bijhoudt (KeyHash/RowHash, `ETL_Date`/`ETL_EndDate`, `isCurrent`, `Delta`) lees je in [Historie & SCD2](../concepten/historie-scd2.md).

## Data Lake (medallion / Parquet)

Naast het Azure SQL-warehouse kan Yres elke load **optioneel** ook als **Parquet** wegschrijven naar Azure Data Lake Gen2, gepartitioneerd op bron/schema/tabel/jaar/maand. Dit is een aparte, parallelle landing voor analytics- en data-lake-scenario's (medallion-aanpak).

:::note Twee aparte sporen
De Data Lake-kopie staat **los van** de SCD2-historie-engine. De SCD2-historie wordt opgebouwd in Azure SQL (`STAGE` → `HIS`) door `spHIS_InsertAndUpdate`; de Parquet-landing is een separate ADF Copy van `STAGE` naar de Data Lake. Verwar de twee niet: het warehouse is de bron van waarheid voor historie, de Data Lake is een optionele extra landing.
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
