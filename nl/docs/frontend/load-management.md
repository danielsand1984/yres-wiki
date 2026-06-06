---
sidebar_position: 5
title: Load Management
description: Pipelines, triggers, monitoring en master pipelines.
---

# Load Management

Beheer het laden van data via pipelines, hun triggers, monitoring en master pipelines.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

![Run Pipelines: kies links een pipeline, filter op periode/status en start 'm met **Start pipeline**.](/img/screens/run-pipelines.png)

## Run Pipelines
Start handmatig pipelines (een tabel laden, metadata ophalen). Custom ADF-pipelines verschijnen ook links in het menu. Filter op datumrange en status; de **Dynamic Yres Workflow** ondersteunt extra filters op source, schema en table.

## Triggers
Plan pipelines met een herhaalpatroon.

![Triggers: kies een pipeline en plan 'm met Create.](/img/screens/loadmanagement-triggers.png)

1. Selecteer links een pipeline.
2. Klik **Create**.
3. Vul het formulier in en klik **Submit**.

## Monitoring
Bekijk de load-historie per tabel, detail-logstappen, en rol terug of reset tabellen. De menutree links volgt **source → schema → table**; tabellen tonen laatste laaddatum en status. De **slechtste status bubbelt omhoog** naar schema- en source-niveau, zodat mislukte loads in één oogopslag zichtbaar zijn. Per run: detailstappen, foutmeldingen, link naar de ADF-pipeline, terugrollen (klok-icoon) of de tabel volledig resetten.

![Monitoring: targets per bron met hun laadstatus.](/img/screens/loadmanagement-monitoring.png)

## Master Pipelines
Ontwerp ADF-pipelines met custom flows vanuit de frontend (UI op basis van [reactflow](https://reactflow.dev/)).

**Basis:** sleep een node-type vanaf links op het grid; verbind nodes door een punt rechts naar het donkere punt links van een andere node te slepen; verwijder met Backspace. **Save** = concept; **Publish** (na save) zet de pipeline om naar ADF (map `MasterPipelines`).

De drie uitgangen rechts op een node zijn: **On success**, **On failure**, **On completion** — zo bouw je logica-gestuurde flows.

### Node types

| Node | Doel | Notes |
|---|---|---|
| **Load Sources** | Voert de Dynamic Workflow Yres-pipeline uit. | Vereist source, schema, table. |
| **Alternative load** | Zoals Load Sources, met aanpasbaar load type. | Alleen FULL, IMAGE, OVERWRITE, RELOAD. |
| **Wait** | Wacht tot een bepaald tijdstip. | Houdt rekening met de tijdzone uit user settings. |
| **Change ServiceTier** | Wijzigt de service tier voor de pipeline. | < S3 geen Columnstore-index; < P1 geen in-memory tabellen. |
| **Run Pipeline** | Voert andere Yres-/custom-/master-pipelines uit. | |
| **Refresh PowerBI** | Ververst een in Yres gemaakt PowerBI-model. | Zie [Admin → PowerBI Models](./admin.md). |
| **Persist View** | Voert de Materialize Views-pipeline uit. | Vereist source, schema, table. |

> De lijst met node-types kan in de toekomst uitgebreid worden.

## Schermen & routes

Load Management bestaat uit: Run pipelines (`/loadmanagement/runPipelines`), Triggers (`/loadmanagement/triggers`), Monitoring (`/loadmanagement/monitoring`), Master pipelines (`/loadmanagement/masterPipelines`), Integration runtimes (`/loadmanagement/integration-runtimes`), Scripted objects (`/loadmanagement/scriptedObjects`), Datawarehouse processes (`/loadmanagement/datawarehouse-processes`) en Datawarehouse queries (`/loadmanagement/datawarehouse-queries`).
