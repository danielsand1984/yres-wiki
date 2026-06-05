---
sidebar_position: 6
title: Data Engineering
description: Database-objecten en view-persistentie.
---

# Data Engineering

Beheer database-objecten en view-persistentie direct vanuit de frontend.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## View Persistence
Beheer **persisted views**: het resultaat van een view-query opslaan, zodat je tabelresultaten ziet zonder de (trage) query opnieuw te draaien.

![Een persisted view aanmaken: source, destination schema/table en level.](/img/screens/dataengineering-viewpersistence.png)

In het create-formulier definieer je:
- de **source** en **doeltabel**;
- het **object- en load type**;
- het **level** — bepaalt de laadvolgorde. Hangt view B af van view A, geef A `level 0` en B `level 1`; zo wordt A eerst geladen en blijft de data actueel.

Het aanmaakformulier vraagt o.a.: **DestinationSchemaName**, **DestinationTableName** en **Level** (plus source, object type en load type).

## Database Objects
Bekijk alle database-objecten (door een gebruiker óf door Yres gemaakt), met:
- huidige **definitie** en **versiehistorie** (vergelijk via de dropdowns; knop linksonder vergelijkt huidige vs. vorige definitie);
- **dependencies** (link-icoon): objecten waar dit object van afhangt én die ervan afhangen. Klik een object aan om gelinkte objecten te markeren in grote dependency-trees.

### Objecten aan een change toevoegen
Rechtsklik op een object in de tree voor een contextmenu: toevoegen aan een change **met of zonder dependencies**, **met content**, of een object **verwijderen met een change**.

## Object history

Naast view-persistentie en database-objecten heeft de app een **Object history**-scherm (`/dataengineering/objecthistory`) met de versiehistorie van objecten.

![Object history: de objectboom met versievergelijking.](/img/screens/dataengineering-objecthistory.png)
