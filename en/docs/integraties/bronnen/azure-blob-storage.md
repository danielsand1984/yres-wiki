---
title: Azure Blob Storage
sidebar_label: Azure Blob Storage
description: Connect Azure Blob Storage to Yres — connection requirements.
---

# Azure Blob Storage

**Category:** Azure · File

File storage in Azure. Yres reads files (CSV, Excel, Parquet) directly from a blob container and adds them as a table to your data warehouse.

## Expected input

Azure Blob Storage uses **a single SAS token** for authentication — no username or password. In the "Add source" wizard you fill in three fields; from these, Yres automatically builds the full SAS URL `https://{account}.blob.core.windows.net/{container}?{sastoken}`.

### Fields

| Field | Explanation |
|---|---|
| **Account name** | The name of the Azure storage account. |
| **Container name** | The blob container within that account where your files reside. |
| **SAS Token** | The query string (the part after the `?`) that grants access to the container. |

> The **SAS url** field in the wizard is read-only and is assembled by Yres itself from the three fields above.

### Authentication

- **SAS token (Shared Access Signature).** Yres stores the full SAS URL as a single secret in the Azure Key Vault of your environment (naming pattern `adf-{sourcename}-connectionstring`). The associated linked service (`type: AzureBlobStorage`) references this secret via `sasUri`; the token is never kept in the frontend.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** Azure Blob Storage is publicly reachable over HTTPS, so the default cloud IR is sufficient. A self-hosted integration runtime is not needed here.

### Requirements

1. An existing **Azure storage account** with a **blob container** holding your source files.
2. A valid **SAS token** with at least the **Read** and **List** permissions on the container.
3. (Recommended) An **expiry date** on the SAS token. Also enter the expiry date in the wizard field *credentials expiry*, so that Yres can warn you in good time before the token expires.

## Setup

Create a **SAS token** via the storage account → **Security + networking** → **Shared access signature**.

### Retrieving the details

- **Account name** — the name of the storage account. In the [Azure Portal](https://portal.azure.com) → **Storage accounts** → pick (or create) the account; the name is shown at the top and on the **Overview** blade.
- **Container name** — a blob container within that account. Open the storage account → **Containers** blade; the name of the container holding your files is what you enter here. You can also create a new container here if needed.
- **SAS Token** — the query string that grants access. Create it via the storage account → **Security + networking** → **Shared access signature**: choose **Blob** as the allowed service, select the permissions you need (at least *Read* and *List*) and an expiry date, then click **Generate SAS and connection string**. A container-scoped SAS is also possible via **Container → Shared access tokens**. The token is the part after the question mark: `?sv=...&ss=...&sig=...`. Save it immediately — it is shown only once.

> Official documentation: [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

## Load types and files

Azure Blob Storage is a **file source**: the metadata step (`GetMetaData`) is **skipped** — there is no database dictionary. Yres reads the structure from the files themselves; you define the files and the parse options directly when adding them. You add a table per file (or file pattern) and choose the load type: **FULL**, **OVERWRITE** or **IMAGE** (in later maintenance also **RELOAD** and **ADDITIONAL**). **DELTA** and **DELTAIMAGE** do not exist for file tables.

:::note Source account ≠ internal storage
Internally, Yres uses a similar `AzureBlobFS`/SAS pattern for its own staging and Data Lake storage. The blob storage account you connect here is a **source account of your choosing** and is separate from that internal infrastructure. When in doubt, verify that you are specifying the correct account/container.
:::

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
