---
title: SAP Datasphere
sidebar_label: SAP Datasphere
description: Connect SAP Datasphere to Yres — connection requirements.
---

# SAP Datasphere

**Category:** Azure storage (AzureBlobFS / SAS)  ·  🏅 Official partner

SAP Datasphere. Official partner. Within Yres, Datasphere is exposed as an **AzureBlobFS / SAS** source — the same connection form as [SAP Business Data Cloud (SAP_BDC)](sap-hana.md) and [Azure Blob Storage](azure-blob-storage.md).

:::caution SAP Datasphere ≠ SAP Business Data Cloud (SAP_BDC)
**SAP Datasphere** and **SAP Business Data Cloud (SAP_BDC)** are two **different** SAP products — not synonyms. Each has its own ADF linked-service template (`Datasphere.json` and `SAP_BDC.json` respectively), but **both** share the same form: `type: AzureBlobFS` with a SAS URI on the `dfs.core.windows.net` endpoint. SAP_BDC has its own input form in the webapp; for Datasphere the same SAS input is used.
:::

## Expected input

Datasphere is connected through an **`AzureBlobFS`** linked service with a **SAS URI** on an Azure Data Lake / Blob endpoint (`dfs.core.windows.net`). The connection form is identical to that of SAP Business Data Cloud.

### Fields

The connection uses the same SAS-based input as the SAP_BDC form (`getFormAddSapBdc.ts`):

| Field | Description |
|---|---|
| **Sas uri** | The host URI of the storage endpoint, in the form `https://<host>/` (host name only, **with a trailing slash** — this is validated). |
| **Container** | The container / file system within the storage endpoint where the Datasphere export is located. |
| **Sas token** | The SAS token that grants access. It must contain the parameters `sig`, `sp`, `se`, `spr`, and `st`, and **must not** begin with a `?` (this is validated). |

### Authentication

- **SAS token (Shared Access Signature)** — no username/password. The SAS URI, the token, and the container are stored as secrets in your environment's **Azure Key Vault** and referenced by the linked service; the frontend never holds secrets.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** The storage endpoint is publicly reachable over HTTPS. The `AzureBlobFS` template sets **no `connectVia`** and therefore runs on the cloud IR — just like SAP_BDC and Azure Blob Storage. A self-hosted integration runtime is not needed here.

### Requirements

1. An **Azure Data Lake / Blob endpoint** (`dfs.core.windows.net`) where the Datasphere export is located or written to.
2. A valid **SAS token** with at least read/list permissions on the container, along with the corresponding **SAS URI** (host) and **container name**.
3. A **Key Vault secret** following the Yres naming convention `adf-{sourcename}-{suffix}` (e.g. `adf-{sourcename}-sas-uri`, `adf-{sourcename}-sas-token`, `adf-{sourcename}-container`). The values are injected from Key Vault during provisioning, not from the frontend.
4. (Recommended) An **expiry date** on the SAS token. Also enter it in the wizard's *credentials expiry* field, so Yres warns you in good time before the token expires.

> Note: the values in the bundled `Datasphere.json` (host, endpoint) are **sample/seed data** for the dev factory, not customer-specific configuration. The *shape* of the linked service is what matters, not the host names.

:::info To be confirmed
**No dedicated input form or backend builder for Datasphere** was found in the code (there is a `Datasphere.json` template, but no `DatasphereSource.php` and no separate item in `CreateSource.tsx`). It is therefore unconfirmed whether SAP Datasphere appears **as a standalone choice** in the "Add source" wizard in the webapp, or whether you connect it **via the SAP_BDC form** (same SAS input). Have the owner confirm this before documenting the exact selection step.
:::

## Preparing data in SAP Datasphere

To expose data through this AzureBlobFS/SAS path, you export from Datasphere to an Azure Data Lake / Blob container and share it via a SAS token. A Datasphere administrator prepares the desired view or analytic model for this.

- **Expose the data** — In Datasphere, expose the view or analytic model for consumption (mark it as *Expose for Consumption*).
- **Export to storage** — Write the exposed data out to an Azure Data Lake / Blob container (the `dfs.core.windows.net` endpoint you provide in the **Sas uri**).
- **SAS token** — On that storage account, generate a SAS token with at least read/list permissions and an expiry date (Azure Portal → storage account → **Security + networking → Shared access signature**). The token is the part after the `?`; save it right away, because it is shown only once.

### Alternative: consumption/OData API

SAP Datasphere can also expose data directly through a **consumption/OData API**. This path falls outside the bundled `Datasphere.json` template (which is AzureBlobFS/SAS), but is usable if you connect Datasphere as a generic [OData](odata.md) or [OData (OAuth)](odata-oauth.md) source.

- **Expose the data** — Mark the view or analytic model as *Expose for Consumption*. The OData URL follows the pattern `https://<tenant-host>/api/v1/dwc/consumption/relational/<space>/<object>/<object>` (or `.../analytical/...` for analytic models).
- **OAuth client** — A Datasphere administrator creates an OAuth 2.0 client (**System → Administration → App Integration**). That yields the **Client ID**, **Client secret**, and the **Authorization** and **Token** URLs for the OAuth flow.
- **Database alternative** — Instead of OData you can also use a database/Open SQL schema user for a direct database connection.

> Official documentation: [Consuming Data via the OData API](https://help.sap.com/docs/SAP_DATASPHERE/43509d67b8b84e66a30851e832f66911/7a453609c8694b029493e7d87e0de60a.html) · [Create OAuth2.0 Clients to Authenticate Against SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE/9f804b8efa8043539289f42f372c4862/3f92b46fe0314e8ba60720e409c219fc.html) · [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

## Load types

Through this path, SAP Datasphere is a **file/storage source**: Yres reads the structure from the exported files in the container, not from a database dictionary. You add a table per file (or file pattern) and choose the desired load type, just as with other sources.

---

**See also:** [SAP Business Data Cloud (SAP HANA)](sap-hana.md) · [Azure Blob Storage](azure-blob-storage.md) · [Azure Data Lake](azure-data-lake.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
