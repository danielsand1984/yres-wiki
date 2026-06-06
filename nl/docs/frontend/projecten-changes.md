---
sidebar_position: 3
title: Projecten & Changes
description: Lifecycle management — werk categoriseren en tussen omgevingen transporteren.
---

# Projecten & Changes

Projecten en changes vormen het **lifecycle management** van Yres: werk categoriseren en wijzigingen veilig van dev naar prod brengen.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## Changes
Een **change** categoriseert bewerkingen aan het datawarehouse (tabellen bijwerken, scripted objects toevoegen). Changes worden **released** en daarna **geïnstalleerd** op andere omgevingen, zodat omgevingen gelijk lopen.

![Changes-overzicht binnen een project.](/img/screens/changes.png)

- Een change heeft een **due date**, die op of vóór de due date van het bovenliggende project moet liggen.

## Project Overview
Een **project** groepeert changes binnen een omgeving. Heeft naam, beschrijving en due date.

![Een project aanmaken: Name, Description en DueDate.](/img/screens/projects.png)

- Een project kan **niet verwijderd** worden zolang het open changes bevat.

Het aanmaakformulier voor een project vraagt: **Name**, **Description** en **DueDate**.

## Scripted Objects
Beheer custom SQL-objecten die niet door Yres gegenereerd zijn (eigen tabellen, stored procedures, functions). Ze worden onder een change toegevoegd en kunnen dus mee-released/geïnstalleerd worden. Bij een custom tabel kies je met **"With table content?"** of de inhoud meegaat.

## Install Changes
Installeer changes naar een omgeving (bv. test → prod) via de dropdowns bovenaan.

- **Reimport** → roept `[Change].[spImport]` aan: haalt change-/projectdata opnieuw op, inclusief dependencies en content.
- **Reinstall** → roept `[Change].[spInstall]` aan: installeert de change op de omgeving.

## Release Changes
Maakt een change beschikbaar om te installeren.

1. Na het releasen kan een change **niet meer bewerkt** worden.
2. Yres blokkeert releasen als de change content bevat waar een andere change van afhankelijk is (foutmelding noemt de afhankelijke change(s)).

**Change content** bekijk je als **diagram** (boomstructuur source → schema → table per bron; handig bij veel objecten) of als **tabel** (per object: load type, delta-kolom bij delta-load, gedrag als het object al bestaat).

:::tip Dependencies meenemen
Sinds v1.53 kun je bij het toevoegen aan een change kiezen om **dependencies en/of content** mee te nemen, en bestaande database-objecten direct vanuit de object-tree in een change opnemen.
:::
