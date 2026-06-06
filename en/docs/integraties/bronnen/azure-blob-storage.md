---
title: Azure Blob Storage
sidebar_label: Azure Blob Storage
description: Connect Azure Blob Storage to Yres — connection requirements.
---

# Azure Blob Storage

**Category:** Azure · File

File storage in Azure. Upload files directly and add them as tables.

## Connection requirements

- Account name
- Container name
- SAS token

## Setup

Create a **SAS token** via the storage account → Security + Networking → Shared Access Signature.

## Where to find these

- **Account name** — the name of the storage account. In the [Azure Portal](https://portal.azure.com) → **Storage accounts** → pick (or create) the account; the name is shown at the top and on the **Overview** blade.
- **Container name** — a blob container inside that account. Open the storage account → **Containers** blade; the name of the container holding your files is what you enter here. You can also create a new container here.
- **SAS token** — the query string that grants access. Create it via the storage account → **Security + networking** → **Shared access signature**: choose **Blob** as the allowed service, select the permissions you need (at least *Read* and *List*) and an expiry, then click **Generate SAS and connection string**. A container-scoped SAS is also possible via **Container → Shared access tokens**. The token is the part after the question mark: `?sv=...&ss=...&sig=...`. Copy it immediately — it is shown only once.

> Official documentation: [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
