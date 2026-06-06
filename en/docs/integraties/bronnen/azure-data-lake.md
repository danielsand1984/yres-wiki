---
title: Azure Data Lake
sidebar_label: Azure Data Lake
description: Connect Azure Data Lake to Yres — connection requirements.
---

# Azure Data Lake

**Category:** Azure · File

Storage for raw data. Imported data can land in the database, the Data Lake or both; Yres adds RowHash, KeyHash and EtlDate for a medallion architecture.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Azure Data Lake (Gen2) is a regular Azure Storage account with **hierarchical namespace** enabled. In Yres it is used as storage for raw/medallion data (bronze/silver/gold). The connection values come from the same place as for Azure Blob Storage:

- **Storage account name** — in the [Azure Portal](https://portal.azure.com) → **Storage accounts** → the account that has hierarchical namespace (visible under **Settings → Configuration → Hierarchical namespace: Enabled**).
- **Container / filesystem** — open the account → **Containers** blade; in ADLS Gen2 a container is also called a *filesystem*. Its name is what you supply.
- **SAS token or access key** — create a SAS via **Security + networking → Shared access signature** (Blob service + permissions + expiry → Generate SAS). Alternatively use an **account access key** via **Security + networking → Access keys** (key1/key2 → Show/Copy).

> Official documentation: [Introduction to Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
