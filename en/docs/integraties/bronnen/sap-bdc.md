---
title: SAP Business Data Cloud
sidebar_label: SAP Business Data Cloud (SAP_BDC)
description: Connect SAP Business Data Cloud (SAP_BDC) to Yres — connection requirements.
---

# SAP Business Data Cloud (SAP_BDC)

**Category:** Azure storage (AzureBlobFS / SAS)  ·  🏅 Official partner

SAP Business Data Cloud delivers data as **Parquet files** in an Azure Data Lake container
(`dfs.core.windows.net` endpoint). Yres reads those files straight from the container using a
**SAS token**. The source type **`SAP_BDC`** has its **own form** in the *Add source* wizard
(`getFormAddSapBdc.ts`); it is the only SAP route with its own entry in the source picker. You use the
same input for [SAP Datasphere](sap-datasphere.md).

## Expected input

Besides the shared fields that apply to every source — **Source name** (unique, 2–45 characters; becomes
the name of the linked service and the basis for the Key Vault secrets `adf-{sourcename}-…`), **type**
(`SAP_BDC`), **integration runtime**, *credentials identical for all environments?*, *credentials expiry
date* and *tags* — the SAP_BDC form asks for three fields:

| Field (label) | Notes |
|---|---|
| **Sas uri** | The host URI of the storage endpoint, in the form `https://<storage-account>.dfs.core.windows.net/`. Only `https://` + host name, **without a path or query string** and **with a trailing `/`** — otherwise the form rejects the address. |
| **container** | The container (file system) in that storage account where SAP BDC delivers the data. |
| **Sas token** | The SAS token, **without a leading `?`**. It must contain the parameters `sig`, `sp`, `se`, `spr` and `st`; if one is missing, the form rejects the token. |

:::tip Validation rules at a glance
- **Sas uri**: `https://`, host name only, path is exactly `/`, no `?…` and no `#…`, ends with `/`.
- **Sas token**: does not start with `?` and contains `sig`, `sp`, `se`, `spr` and `st`.
:::

### Authentication

- **SAS token (Shared Access Signature)** — no username/password. The backend
  (`SapBusinessDataCloudSource`) creates a linked service of type **`AzureBlobFS`** whose `sasUri` and
  SAS token come from the Key Vault.
- **Secrets in Key Vault:** the frontend stores nothing. The values you enter go to the customer's
  **Azure Key Vault** as `adf-{sourcename}-sas-uri`, `adf-{sourcename}-sas-token` (with the expiry date you
  provided) and `adf-{sourcename}-container` (used by the metadata pipeline).

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** The storage endpoint is publicly reachable over HTTPS; the
  `AzureBlobFS` linked service (template `SAP_BDC.json`) sets **no `connectVia`** and therefore always runs
  on the cloud runtime. A self-hosted integration runtime does not apply here.

## How Yres reads the data

- **Metadata** — the pipeline `GetMetaData - SAP_BDC` lists the **folders** in the container: each folder
  is one table. Per folder, Yres reads the metadata file **`.sap.partfile.metadata`** (JSON) that SAP BDC
  places next to the data and uses it to fill the columns in the dictionary. The **container** becomes
  the schema of the tables; the folder name becomes the table name.
- **Data** — the pipeline `Dynamic Pipeline YRES - SAP_BDC` reads all **`*.parquet`** files
  (recursively) from the table's folder into `STAGE`; the merge into `HIS` then happens via
  `[LoadManagement].[spLoadDWH]`, just like for any other source.
- **Data types** — SAP_BDC uses the same type mapping as SQL Server (`MSSQL_ADF`), with one exception:
  `timestamp` is landed as `bigint`.

## Load types and delta

SAP_BDC supports the standard load types (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL).
One fixed rule applies to incremental loads:

:::caution Fixed delta column: `ETL_DATE`
For SAP_BDC the delta column is **always `ETL_DATE`** — the load stamp SAP BDC includes in the files. If you
pick a different column for a `DELTA`/`DELTAIMAGE` load in the *Add table* wizard, the engine ignores it with
the warning *"Source … is a deltalake source. Delta's are always based on ETL_DATE, … will be ignored as a
delta column"* (`spMaintainTable`).
:::

The delta works differently from database sources: Yres does not build a `WHERE` clause but passes the
**watermark** (`LoadManagement.UsedTables.LatestRecord`, the highest `ETL_DATE` of the previous load) to
the pipeline unchanged. The pipeline uses it as **`modifiedDatetimeStart`**: only Parquet files modified or
added since that moment are read. After a successful load the watermark advances to the highest `ETL_DATE`
in the batch.

## Requirements

1. An **Azure Data Lake Gen2 container** (`dfs.core.windows.net`) where SAP BDC delivers the data: one
   folder per table with Parquet files and the `.sap.partfile.metadata` file. Your SAP/BDC administrator
   sets up this delivery and gives you the host name and container name.
2. A valid **SAS token** with at least **read and list permissions** on the container (Azure Portal →
   storage account → **Security + networking → Shared access signature**). The token is the part **after**
   the `?`; copy it right away, because it is shown only once.
3. The **expiry date** of the SAS token. Also enter it in the wizard field *credentials expire?* — see
   below.

:::warning SAS token expiry date
A SAS token always has an end date (`se`). Once it passes, the metadata refresh and the loads of this source
fail. Therefore enter the expiry date in the wizard field **credentials expire?**: Yres stores it with the
Key Vault secret and warns you in good time before the token expires. Then create a new token and update the
source.
:::

---

**See also:** [SAP Datasphere](sap-datasphere.md) (same form) · [SAP S/4HANA](sap-s4hana.md) · [SAP HANA](sap-hana.md) · [Azure Blob Storage](azure-blob-storage.md) · [Azure Data Lake](azure-data-lake.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
