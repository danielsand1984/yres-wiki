---
title: Architectuur
sidebar_label: ''
sidebar_position: 1
slug: /architectuur
description: Hoe Yres technisch in elkaar zit — Azure, ADF, DTAP en lineage.
---

# Architectuur (high-level)

> Deze pagina beschrijft de architectuur op hoofdlijnen. Voor de diepere Azure-details (resources, toegangsniveaus, setups, naming, firewall) zie [Azure-architectuur](./azure-architectuur.md).

## Stack

| Laag | Technologie |
| --- | --- |
| Bronnen | Exact, AFAS, SAP, Salesforce, databases, REST API's [en meer](https://oogopdata.nl/nl/wiki/integraties/catalogus). |
| Orkestratie | Azure Data Factory (ADF) — gegenereerd en beheerd door Yres |
| Opslag | Azure SQL, Azure Data Lake |
| Rapportage | Power BI |
| Identiteit | Azure SSO + rolgebaseerde rechten (RBAC) |
| Lokale netwerken | Integration Runtime (IR) |

## Hosting

Standaard draait Yres volledig binnen de **eigen Azure tenant** van de klant — data, infrastructuur en kosten blijven van de klant. Hosting _door Yres_ is een expliciete optie.

## Pipelines

Yres genereert ADF-pipelines en beheert deze volledig. Bestaande handmatige ADF-pipelines kunnen naast Yres blijven draaien in dezelfde Azure-omgeving.

## Lifecycle / DTAP

Yres ondersteunt de volledige lifecycle van development tot productie, met volledige CI/CD-integratie via Azure DevOps en environment management (DTAP: Development, Test, Acceptance, Production). Wijzigingen test je vooraf, rol je veilig uit en herstel je wanneer nodig zonder dataverlies.

## Lineage & impactanalyse

Visuele lineage op **objectniveau** (tables, views, procedures, functions, materialized views) met impact analysis. Column-level lineage is momenteel niet beschikbaar.

## Bestaande databases

Yres ondersteunt het gebruik van bestaande Azure-databases. Een migratie van een ander platform bespreken we in een architectuursessie.

## Verder lezen

- [Azure-architectuur](./azure-architectuur.md) — resources, toegangsniveaus, setups, naming, firewall, scaling
- [Installatie](../setup/installatie.md) — stap voor stap inrichten
- [SQL Interaction](../referentie/sql-interaction.md) — stored procedures, functions en views
