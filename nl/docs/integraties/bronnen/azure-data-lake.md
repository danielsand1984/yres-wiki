---
title: Azure Data Lake
sidebar_label: Azure Data Lake
description: Azure Data Lake koppelen aan Yres — verbindingseisen.
---

# Azure Data Lake

**Categorie:** Azure · Bestand

Azure Data Lake Storage Gen2 is een Azure Storage-account met **hiërarchische naamruimte (hierarchical namespace)** ingeschakeld. Binnen Yres speelt de Data Lake vooral een rol als **opslag voor (onbewerkte) data**: naast de database kan Yres geladen data optioneel ook als **Parquet** in de Data Lake landen. Yres voegt daarbij de framework-kolommen `RowHash`, `KeyHash` en `EtlDate` toe, zodat een medallion-architectuur (bronze/silver/gold) mogelijk is.

:::note Geen selecteerbare bron — interne staging/opslag
De Data Lake is **geen losse, selecteerbare bron** in de "Bron toevoegen"-wizard: in de bronpicker (`SourceField.tsx` / `CreateSource.tsx`) staat geen Azure Data Lake-keuze. Wat er wél is, is een vaste linked service (`AzureDataLakeStorage.json`, type `AzureBlobFS`) die Yres als **eigen staging-/uitvoeropslag** gebruikt — de bestemming waar Yres optioneel Parquet wegschrijft.
:::

## Verwachte input

Wanneer de Data Lake als opslag wordt aangesproken, gebruikt Yres dezelfde verbindingsvorm als bij Azure Blob Storage en SAP Business Data Cloud: een **`AzureBlobFS`**-linked service met een **SAS-uri** op het `dfs.core.windows.net`-endpoint.

**Verbindingsvelden** (analoog aan de SAS-gebaseerde opslagbronnen):

- **Storage-accountnaam** — het Azure Storage-account met hiërarchische naamruimte ingeschakeld.
- **Container / filesystem** — in ADLS Gen2 heet een container ook wel een *filesystem*. De naam ervan geef je op.
- **SAS-token** — het token dat toegang verleent tot de Data Lake.

**Authenticatie:** **SAS-token** (geen gebruikersnaam/wachtwoord). De volledige SAS-uri wordt opgeslagen in **Azure Key Vault** en door de linked service gerefereerd; de frontend bewaart nooit secrets.

**Integration runtime:** **cloud** — de standaard `AutoResolveIntegrationRuntime`. De `AzureBlobFS`-template zet geen `connectVia` en draait dus op de cloud-IR (net als Azure Blob Storage en SAP_BDC).

**Vereisten:**

- Een Azure Storage-account met **hiërarchische naamruimte** ingeschakeld (anders is het een gewoon Blob-account, geen Data Lake Gen2).
- Een **SAS-token** met minimaal lees-/lijstrechten op de container/het filesystem.
- Een Key Vault-secret volgens de Yres-naamconventie `adf-{bronnaam}-{suffix}` (de SAS-uri komt bij provisioning vanuit Key Vault, niet uit de frontend).

> Let op: de waarden in de meegeleverde `AzureDataLakeStorage.json` (account, host) zijn **voorbeeld-/seeddata** voor de dev-factory, geen klant-specifieke configuratie. De *vorm* van de linked service is leidend, de hostnamen niet.

## Gegevens ophalen

De verbindingsgegevens haal je op dezelfde plek op als bij Azure Blob Storage:

- **Storage-accountnaam** — in de [Azure Portal](https://portal.azure.com) → **Storage accounts** → het account met hiërarchische naamruimte (zichtbaar onder **Settings → Configuration → Hierarchical namespace: Enabled**).
- **Container / filesystem** — open het account → blade **Containers**; in ADLS Gen2 heet een container ook wel een *filesystem*. De naam ervan is wat je opgeeft.
- **SAS-token** — maak je aan via **Security + networking → Shared access signature** (Blob-service + benodigde rechten + vervaldatum → **Generate SAS**). Bewaar het token direct: het wordt maar één keer getoond.

> Officiële documentatie: [Introduction to Azure Data Lake Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/data-lake-storage-introduction)

---

**Zie ook:** [Azure Blob Storage](azure-blob-storage.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
