---
title: Local files (CSV, Excel)
sidebar_label: Local files (CSV, Excel)
description: Connect local files (CSV, Excel) to Yres — via Azure Blob Storage or File Server.
---

# Local files (CSV, Excel)

**Category:** File

There is **no separate "Local files" source type** in Yres. CSV and Excel files that
reside on your own machine or a network share are connected through one of these two
routes:

## Route A — upload to Azure Blob Storage (recommended)

Add an **[Azure Blob Storage](azure-blob-storage.md)** source and upload your files
to it with the **Upload File** button when adding files to the source. The files then
reside in the blob container and are read from the cloud — **no self-hosted
Integration Runtime is needed**.

This is the simplest route for files you deliver once or manually.

## Route B — File Server source with a local path

If the files stay on the machine or share (for example because another process drops
them there), use a **[File Server](file-server.md)** source with the local path or
UNC path. This route requires:

- a **self-hosted Integration Runtime** on (or with access to) the machine holding
  the files;
- **host + username + password** of an account with read access to the path.

:::tip Local path on the IR machine itself
If the path points at the Integration Runtime's own host, the IR denies it by
default (error *"Access to serverName is denied, resolved IP address is ::1,
network type is OnPremise"*). In that case, run this once on that machine:

```powershell
cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
.\dmgcmd.exe -EnableLocalMachineAccess
```

See also the [troubleshooting page](../../troubleshooting.md) (topic *"Unable to
load local files"*).
:::

> **Note:** both routes are **file sources**. For file sources the metadata step
> (`GetMetaData`) is skipped; you define the files and the parse options (CSV/Excel)
> directly when adding the files to the source.

---

**See also:** [Azure Blob Storage](azure-blob-storage.md) · [File Server](file-server.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
