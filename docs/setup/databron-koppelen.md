---
sidebar_position: 3
title: Databron koppelen & laden
description: Een bron toevoegen, metadata verversen, load types en key columns.
---

# Databron koppelen & laden

Yres ondersteunt o.a. Oracle, Azure, MySQL, SAP, Salesforce en generieke OData/REST. De verbindingseisen verschillen per type — zie [databron-vereisten](../referentie/databron-vereisten.md).

## Een bron koppelen
Voorbeeld (SQL Server): host, port, databasenaam, gebruikersnaam en wachtwoord. Na het aanmaken duurt het even voordat de bron naar **Azure Data Factory** is gepubliceerd.

## Metadata verversen
Klik **Refresh Metadata** bij een bron voor actuele data; via het link-icoon volg je de voortgang.

## Load types

| Load type | Beschrijving |
|---|---|
| **FULL** | Vervangt bestaande records door nieuwe. |
| **DELTA** | Vergelijkt oude en nieuwe data en voegt gewijzigde records toe. |
| **OVERWRITE** | Verwijdert bestaande records en voegt alle nieuwe toe. |
| **RELOAD** | Zoals FULL, maar met geoptimaliseerde updates die ongewijzigde data niet vervangen. |
| **IMAGE** | Vervangt/herlaadt niet, maar bewaart een record van oudere data. |
| **ADDITIONAL** | Voegt nieuwe records toe zonder bestaande te vervangen. |

> Sinds v1.53 bestaat ook **Delta Image**: herlaad selectief een periode (bv. vorig jaar) terwijl verouderde records worden verwijderd en historie behouden blijft.

## Key columns
Key columns identificeren kolommen uniek wanneer de kolompositie kan wijzigen. Geef ze op bij het toevoegen van een bron. (Voor SQL-bronnen behalve MySQL worden ook twee delta-kolommen ondersteund — komma-gescheiden in `LoadManagement.UsedTables.deltaColumn`, zelfde datatype, hoogste waarde telt.)
