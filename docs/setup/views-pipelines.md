---
sidebar_position: 4
title: Views, pipelines & triggers
description: Persisted views genereren en pipelines automatiseren.
---

# Views, pipelines & triggers

## Persisted views genereren
Een persisted view vereist eerst een **view** in de database. Voorbeeld: een view `DM.Vw760` in de `sqldb-Yres-dev`-database, gemaakt via SSML/SSMS.

1. Maak de view (via [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) o.i.d.).
2. De view verschijnt onder de opgegeven source-schema-naam in de **Create persisted view**-dialoog.
3. Geef doel-schema en -tabel op, plus level, source delta object type en load type.

Zie ook [View Persistence](../frontend/data-engineering.md).

## Pipelines & triggers opzetten
In het [Load Management-paneel](../frontend/load-management.md) draai je pipelines handmatig, stel je triggers in en monitor je runs.

- **Refresh All Metadata** draai je via **Start Pipeline** na selectie links.
- Voor de **Dynamic Workflow Yres**-pipeline stel je in: source, source-schema, source-table, de draaiende tier en de tier om naar terug te keren.
- **Triggers** automatiseren pipelines op vaste intervallen (bv. wekelijks).

:::tip Master pipelines
Voor complexere flows met conditionele stappen (on success/failure/completion) gebruik je [Master Pipelines](../frontend/load-management.md) — bv. delta's door de week en een volledige reload in het weekend, of een conditionele PowerBI-refresh.
:::
