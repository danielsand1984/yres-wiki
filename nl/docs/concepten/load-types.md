---
sidebar_position: 2
title: Load types
description: Alle laadtypes in Yres en wat ze met de doeltabel doen.
---

# Load types

Een **load type** bepaalt wat er met de bestaande data in de doeltabel gebeurt bij een load. Je stelt het per tabel in (en kunt het per run overschrijven met een *alternative load*).

| Load type | Wat het doet | Historie? |
|---|---|---|
| **FULL** | Vervangt bestaande records door nieuwe. | Nee |
| **DELTA** | Vergelijkt oude en nieuwe data en voegt alleen **gewijzigde** records toe. | Ja (via staging) |
| **OVERWRITE** | Verwijdert álle bestaande records en voegt alle nieuwe toe. | Nee |
| **RELOAD** | Zoals FULL, maar met geoptimaliseerde updates die ongewijzigde data **niet** vervangen. | Behoudt ongewijzigd |
| **IMAGE** | Vervangt/herlaadt niet, maar bewaart een **record van oudere data**. | Ja |
| **ADDITIONAL** | Voegt nieuwe records toe **zonder** bestaande te vervangen. | Ja (alleen toevoegen) |
| **Delta Image** *(v1.53+)* | Herlaadt selectief een **periode** (bv. vorig jaar), verwijdert verouderde records uit die periode en behoudt overige historie. | Ja (per periode) |

## Welke load type wanneer?

- **FULL / OVERWRITE** — kleine of volledig te verversen tabellen; geen historie nodig.
- **DELTA** — grote tabellen met een betrouwbare wijzigingskolom; alleen wijzigingen verwerken.
- **RELOAD** — volledige set herladen maar onnodige writes (en dus kosten/tijd) vermijden.
- **IMAGE** — wanneer je historische snapshots wilt bewaren.
- **ADDITIONAL** — append-only bronnen (logs, events).
- **Delta Image** — periodiek een afgebakende periode opnieuw laden (bv. boekjaar-correcties).

## Gerelateerde instellingen

- **Key columns** — identificeren records uniek wanneer kolomposities kunnen wijzigen. Voor SQL-bronnen (behalve MySQL) zijn twee delta-kolommen mogelijk (komma-gescheiden in `LoadManagement.UsedTables.deltaColumn`, zelfde datatype — hoogste waarde telt).
- **Staging (`DefaultKeepStage`)** — bij delta-loads een staging-tabel die na verwerking getruncate of bewaard wordt.
- **Surrogate keys (`DefaultSurrogate`)** — automatisch gegenereerde sleutels op de natural key (opgeslagen in `[LoadManagement].[SurrogateKeys]`).
- **Pagination (`UsePagination` / `PageSize`)** — grote datasets (100M+ records) in pagina's verwerken.

Zie ook [Databron koppelen & laden](../setup/databron-koppelen.md) en de [begrippenlijst](./glossary.md).
