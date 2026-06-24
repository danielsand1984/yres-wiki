---
title: Local files (CSV, Excel)
sidebar_label: Local files (CSV, Excel)
description: Connect local files (CSV, Excel) to Yres — connection requirements.
---

# Local files (CSV, Excel)

**Category:** File

CSV and Excel files that reside on a local machine or network share. Local files are read via a **self-hosted Integration Runtime** on the machine where the files are located. No credentials are required.

## Expected input

Local files require **no connection details** (no host, username, or password). In the **Add source** wizard you fill in the standard fields (source name, type, integration runtime, credentials the same for all environments?, credentials expiry, tags). After that, you point to the files yourself.

**Connection fields:**

| Field | Explanation |
|---|---|
| _(none)_ | Local files require no additional connection or credential details. You upload the files directly, or have them read via the self-hosted IR on the machine where they reside. |

- **Authentication:** none (no username/password, no token, no SAS).
- **Integration runtime:** a **self-hosted Integration Runtime is required**. Local paths are not reachable from the cloud, so `AutoResolveIntegrationRuntime` (cloud) does not work here. In the IR dropdown, select the published self-hosted IR running on the machine that holds the files.

## Prerequisites

- **Self-hosted Integration Runtime installed** on the Windows machine where the files reside, and published so that it appears in the IR dropdown. Without this IR you cannot connect local files.
- **`-EnableLocalMachineAccess`** (only needed when the IR runs under a service account): by default, the Integration Runtime denies access to local paths on its own host. When loading local files, ADF then returns an error such as *"Access to serverName is denied, resolved IP address is ::1, network type is OnPremise"*. Run the following once on the Windows server running the IR software, in CMD or PowerShell:

  ```powershell
  cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
  .\dmgcmd.exe -EnableLocalMachineAccess
  ```

  See also the [troubleshooting page](../../troubleshooting.md) (topic *"Unable to load local files"*).
- **Read access** to the folder containing the files from the account under which the IR runs.

## Retrieving the data

The self-hosted IR is an agent you install on the machine where the files reside; Yres accesses the files through that agent. You do not need to enter any credentials — you point to the files and set the parse options (CSV/Excel) when adding the files to the source.

> **Note:** local files form a **file source**. For file sources the metadata step (`GetMetaData`) is skipped; you define the files and the parsing directly when adding the files, rather than via a metadata refresh.

> Official documentation: [Create a self-hosted Integration Runtime](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
