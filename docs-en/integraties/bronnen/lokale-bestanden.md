---
title: Lokale bestanden (CSV, Excel)
sidebar_label: Lokale bestanden (CSV, Excel)
description: Connect Lokale bestanden (CSV, Excel) to Yres — connection requirements.
---

# Lokale bestanden (CSV, Excel)

**Category:** File

CSV and Excel files. Local files are loaded via an Integration Runtime (see troubleshooting for `-EnableLocalMachineAccess`).

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

No credentials needed. You upload CSV or Excel files directly, or they are read via a **self-hosted Integration Runtime** on the machine that holds the files. If the IR runs under a service account, set `-EnableLocalMachineAccess` once to allow access to local paths (see the troubleshooting page).

> Official documentation: [Create a self-hosted Integration Runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
