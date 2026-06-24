---
title: Azure Data Lake
sidebar_label: Azure Data Lake
description: Connect Azure Data Lake to Yres — connection requirements.
---

# Azure Data Lake

**Category:** Azure · File

Azure Data Lake Storage Gen2 is an Azure Storage account with **hierarchical namespace** enabled. Within Yres, the Data Lake mainly serves as **storage for (raw) data**: alongside the database, Yres can optionally also land loaded data as **Parquet** in the Data Lake. In doing so, Yres adds the framework columns `RowHash`, `KeyHash` and `EtlDate`, enabling a medallion architecture (bronze/silver/gold).

:::info To be confirmed
In the current code, the Data Lake is **not a separate, selectable source** in the "Add source" wizard: there is no input form for Azure Data Lake in `CreateSource.tsx`. What does exist is a fixed linked service (`AzureDataLakeStorage.json`, type `AzureBlobFS`) that Yres uses as its **own staging/output storage** — the destination where Yres optionally writes Parquet. Whether the Data Lake is also intended as a user-selectable *source* (like Azure Blob Storage), or is purely internal Yres infrastructure, is for the owner to confirm. Do not document this as a selectable source until this is clear.
:::

## Expected input

When the Data Lake is addressed as storage, Yres uses the same connection form as for Azure Blob Storage and SAP Business Data Cloud: an **`AzureBlobFS`** linked service with a **SAS URI** on the `dfs.core.windows.net` endpoint.

**Connection fields** (analogous to the SAS-based storage sources):

- **Storage account name** — the Azure Storage account with hierarchical namespace enabled.
- **Container / filesystem** — in ADLS Gen2 a container is also called a *filesystem*. You supply its name.
- **SAS token** — the token that grants access to the Data Lake.

**Authentication:** **SAS token** (no username/password). The full SAS URI is stored in **Azure Key Vault** and referenced by the linked service; the frontend never holds secrets.

**Integration runtime:** **cloud** — the default `AutoResolveIntegrationRuntime`. The `AzureBlobFS` template does not set `connectVia` and therefore runs on the cloud IR (just like Azure Blob Storage and SAP_BDC).

**Requirements:**

- An Azure Storage account with **hierarchical namespace** enabled (otherwise it is a regular Blob account, not Data Lake Gen2).
- A **SAS token** with at least read/list permissions on the container/filesystem.
- A Key Vault secret following the Yres naming convention `adf-{sourcename}-{suffix}` (the SAS URI comes from Key Vault at provisioning time, not from the frontend).

> Note: the values in the bundled `AzureDataLakeStorage.json` (account, host) are **example/seed data** for the dev factory, not customer-specific configuration. The *shape* of the linked service is what matters, not the hostnames.

## Where to find these

You retrieve the connection details from the same place as for Azure Blob Storage:

- **Storage account name** — in the [Azure Portal](https://portal.azure.com) → **Storage accounts** → the account with hierarchical namespace (visible under **Settings → Configuration → Hierarchical namespace: Enabled**).
- **Container / filesystem** — open the account → **Containers** blade; in ADLS Gen2 a container is also called a *filesystem*. Its name is what you supply.
- **SAS token** — create one via **Security + networking → Shared access signature** (Blob service + required permissions + expiry → **Generate SAS**). Save the token immediately: it is shown only once.

> Official documentation: [Introduction to Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)

---

**See also:** [Azure Blob Storage](azure-blob-storage.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
