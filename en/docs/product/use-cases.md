---
sidebar_position: 2
title: Use cases
description: The four problems Yres solves for data teams, plus a real-world example of before and after Yres.
---

# Use cases

> **Why teams choose Yres.** The four pain points we encounter most often with data teams — and a real-world example that shows what changes when you solve them with Yres.

## 1. Unreliable dashboards

Reports lag behind or are inaccurate, and a lot of time goes into checking and correcting them.

**With Yres:** data is loaded automatically and stays consistent. The load engine keeps full SCD2 history per table (via `KeyHash`/`RowHash` and `IsCurrent`), so changes are written cleanly as a new version instead of overwriting existing records.

## 2. Fragile pipelines

Scripts break and no one knows exactly what happens when something changes.

**With Yres:** fixed structures and transparent dependencies. You describe *what* you want to load as metadata; Yres generates the corresponding ADF pipelines and linked services. Object-level lineage (tables, views, procedures, functions, materialized views) makes it clear what a change affects.

## 3. Too much manual work

Every new data source costs time and custom work.

**With Yres:** connect new sources via wizards, without rebuilding. At its core, adding a source means writing metadata rows — Yres translates those into the ADF pipelines that do the work.

## 4. Dependent on a single person

Knowledge sits with one engineer or consultant.

**With Yres:** a transparent and transferable data platform. The configuration lives in the web app and in the database, not in the heads of individual engineers.

---

## Real-world example: before and after Yres

> The example below is **illustrative and hypothetical** — a mid-sized retail company, not an existing customer. It comes from the Yres training material and gives a recognizable picture of what changes.

### Before Yres

A mid-sized retail company had its data scattered across systems:

- **sales** in one database;
- **marketing campaigns** in another;
- **inventory** in spreadsheets.

The consequences:

- IT spent **days** every month manually merging and cleaning the data.
- Managers had to wait for reports and worked with outdated information.
- The company paid for **large VMs** to run the processing — even during quiet periods.

### After Yres

Within a few days, all sources were connected:

- sales, marketing, and inventory were **updated automatically** and ready for dashboards;
- managers gained near **real-time** insight and could adjust campaigns immediately or replenish inventory right away;
- thanks to database scaling, the company paid for extra capacity **only during heavy processing**;
- Yres's architecture handles large volumes **without large, expensive VMs**.

### The result

| Aspect | Before Yres | After Yres |
|---|---|---|
| Reporting time | days | minutes |
| Decision-making | waiting on reports | faster, on current data |
| Monthly Azure costs | high (constant large VMs) | lower (scale on usage) |
| Additional technical staff | needed | not needed |

So reporting time dropped **from days to minutes**, decision-making became faster, and the monthly Azure bill went down — *"all without adding technical staff."*

:::tip Why this works
The cost savings come from **automatic database scaling** (settings `AutomaticDatabaseScaling`, `DefaultServiceTier`, `HighServiceTier`): the database scales up during a heavy load run and back down afterward. Throughout, Yres runs **entirely within your own Azure environment**.
:::

---

## Recognizable from practice

The following scenarios are illustrative and show how Yres helps in a range of situations:

- A **manufacturing company** migrated from an on-premise data warehouse to Azure and had to redesign its entire connection structure. Previously every application was connected differently; with Yres this is standardized.
- A **housing association** struggled with reports that didn't work well and a long "time to repair." With Yres: faster troubleshooting, shorter resolution time, and always up-to-date data.
