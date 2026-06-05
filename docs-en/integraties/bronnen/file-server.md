---
title: File Server
sidebar_label: File Server
description: Connect File Server to Yres — connection requirements.
---

# File Server

**Category:** File

Files from a (local) file server, reached via an Integration Runtime.

## Connection requirements

- Host / file path on the integration runtime
- Username
- Password

## Where to find these

A file server is reached via a **self-hosted Integration Runtime (IR)**: an agent you install on a machine inside the network where the files live. This IR is required for on-premises / network file shares.

- **Host / file path** — the UNC path to the share or the path on the machine running the IR, e.g. `\\server\share\folder` or a local path if the IR sits on that machine. Determine this together with your system/network administrator.
- **Username** — a Windows/file-share account with read access to that folder, usually in the form `DOMAIN\user`.
- **Password** — the password for that account.

Make sure the supplied account actually has read access to the path from the machine on which the Integration Runtime is installed.

> Official documentation: [Copy data from/to a file system (Azure Data Factory)](https://learn.microsoft.com/en-us/azure/data-factory/connector-file-system)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
