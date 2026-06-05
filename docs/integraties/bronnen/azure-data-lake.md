---
title: Azure Data Lake
sidebar_label: Azure Data Lake
description: Azure Data Lake koppelen aan Yres — verbindingseisen.
---

# Azure Data Lake

**Categorie:** Azure · Bestand

Opslag voor onbewerkte data. Geïmporteerde data kan in de database, de Data Lake of beide landen; Yres voegt RowHash, KeyHash en EtlDate toe voor een medallion-architectuur.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Azure Data Lake (Gen2) is een gewoon Azure Storage-account met **hiërarchische naamruimte (hierarchical namespace)** ingeschakeld. Wordt in Yres gebruikt als opslag voor onbewerkte/medallion-data (bronze/silver/gold). De verbindingsgegevens komen op dezelfde plek vandaan als bij Azure Blob Storage:

- **Storage-accountnaam** — in de [Azure Portal](https://portal.azure.com) → **Storage accounts** → het account met hiërarchische naamruimte (zichtbaar onder **Settings → Configuration → Hierarchical namespace: Enabled**).
- **Container / filesystem** — open het account → blade **Containers**; in ADLS Gen2 heet een container ook wel een *filesystem*. De naam ervan is wat je opgeeft.
- **SAS-token of access key** — een SAS maak je via **Security + networking → Shared access signature** (Blob-service + rechten + vervaldatum → Generate SAS). Als alternatief gebruik je een **account access key** via **Security + networking → Access keys** (key1/key2 → Show/Copy).

> Officiële documentatie: [Introduction to Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
