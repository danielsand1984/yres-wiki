---
title: File Server
sidebar_label: File Server
description: Connect a File Server to Yres — connection requirements.
---

# File Server

**Category:** File

Files from a (local) file server or network share, reached via a **self-hosted Integration Runtime**.

## Expected input

In the **Add source** wizard you first fill in the standard fields (source name, type, integration runtime, credentials the same for all environments?, credentials expiry date, tags) and then the File Server form.

**Connection fields (File Server form):**

| Field | Explanation |
|---|---|
| **Host / File path on integration runtime** | The UNC path to the share or the path on the machine where the IR runs. Example (placeholder in the form): `\\SERVERNAME\SharedFolder`. |
| **User name** | A Windows / file-share account with read permissions on that path, usually in the form `DOMAIN\user`. |
| **Password** | The password for that account. |

- **Authentication:** Windows username + password (Basic). The source name becomes the name of the linked service; the password is never kept by the frontend.
- **Integration runtime:** a **self-hosted Integration Runtime is required**. A File Server is read via a UNC / file path, which is not reachable from the cloud. `AutoResolveIntegrationRuntime` (cloud) does not work here. The chosen IR is set in the linked service by the backend (`withConnectVia`); the `FileServer.json` template references `pwccIntegrationRuntimeLinked`.

## Prerequisites

- **Self-hosted Integration Runtime installed** on a machine within the network where the files reside, and published so that it appears in the IR dropdown. Without this IR, the source cannot be connected.
- **A Windows / file-share account** with read permissions on the specified path, valid from the machine where the IR runs.
- **Network access** from the IR machine to the share (firewall/SMB).

:::info To be confirmed
The Key Vault secret for the password follows the naming pattern `adf-{sourcename}-connectionstring`. The actual writing and naming of secrets happens in the (out-of-scope) webapp/backend; verify the exact secret name in the customer's Key Vault if needed.
:::

## Retrieving the details

The self-hosted IR is an agent you install on a machine within the network where the files reside. Yres reaches the files via that agent.

- **Host / file path** — the UNC path to the share (`\\server\share\folder`) or a local path if the IR runs on that machine. To be determined together with your system/network administrator.
- **User name** — an account with read permissions on that folder, usually `DOMAIN\user`.
- **Password** — the password for that account.

Make sure the specified account actually has read access to the path from the machine where the Integration Runtime is installed.

> **Note:** a File Server is a **file source**. For file sources the metadata step (`GetMetaData`) is skipped; you define the files and the parsing directly when adding the tables/files.

> Official documentation: [Copy data from/to a file system (Azure Data Factory)](https://learn.microsoft.com/en-us/azure/data-factory/connector-file-system)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
