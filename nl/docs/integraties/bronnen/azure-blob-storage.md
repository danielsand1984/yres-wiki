---
title: Azure Blob Storage
sidebar_label: Azure Blob Storage
description: Azure Blob Storage koppelen aan Yres — verbindingseisen.
---

# Azure Blob Storage

**Categorie:** Azure · Bestand

Bestandsopslag in Azure. Yres leest bestanden (CSV, Excel, Parquet) rechtstreeks uit een blob-container en voegt ze als tabel toe aan je data-warehouse.

## Verwachte input

Azure Blob Storage gebruikt **één SAS-token** voor de authenticatie — geen gebruikersnaam of wachtwoord. In de "Bron toevoegen"-wizard vul je drie velden in; Yres bouwt daaruit automatisch de volledige SAS-URL `https://{account}.blob.core.windows.net/{container}?{sastoken}`.

### Velden

| Veld | Toelichting |
|---|---|
| **Account name** | De naam van het Azure-storage-account. |
| **Container name** | De blob-container binnen dat account waarin je bestanden staan. |
| **SAS Token** | De query-string (het deel ná het `?`) die toegang verleent tot de container. |

> Het veld **SAS url** in de wizard is alleen-lezen en wordt door Yres zelf samengesteld uit bovenstaande drie velden.

### Authenticatie

- **SAS-token (Shared Access Signature).** Yres slaat de volledige SAS-URL als één secret op in de Azure Key Vault van je omgeving (naampatroon `adf-{bronnaam}-connectionstring`). De gekoppelde linked service (`type: AzureBlobStorage`) verwijst via `sasUri` naar dit secret; het token wordt nooit in de frontend bewaard.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** Azure Blob Storage is publiek bereikbaar via HTTPS, dus de standaard cloud-IR volstaat. Een self-hosted integration runtime is hier niet nodig.

### Vereisten

1. Een bestaand **Azure-storage-account** met een **blob-container** waarin je bronbestanden staan.
2. Een geldig **SAS-token** met minimaal de rechten **Read** en **List** op de container.
3. (Aanbevolen) Een **vervaldatum** op het SAS-token. Vul de vervaldatum ook in het wizard-veld *credentials expiry* in, zodat Yres je tijdig kan waarschuwen voordat het token verloopt.

## Setup

Maak een **SAS-token** aan via het storage-account → **Security + networking** → **Shared access signature**.

### Gegevens ophalen

- **Account name** — de naam van het storage-account. In de [Azure Portal](https://portal.azure.com) → **Storage accounts** → kies (of maak) het account; de naam staat bovenaan en in de blade **Overzicht**.
- **Container name** — een blob-container binnen dat account. Open het storage-account → blade **Containers**; de naam van de container die je bestanden bevat is wat je hier invult. Hier maak je desgewenst ook een nieuwe container aan.
- **SAS Token** — de query-string die toegang verleent. Maak deze aan via het storage-account → **Security + networking** → **Shared access signature**: kies **Blob** als toegestane service, selecteer de benodigde rechten (minimaal *Read* en *List*) en een vervaldatum, en klik **Generate SAS and connection string**. Een container-specifieke SAS kan ook via **Container → Shared access tokens**. Het token is het deel ná het vraagteken: `?sv=...&ss=...&sig=...`. Bewaar het direct — het wordt maar één keer getoond.

> Officiële documentatie: [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

## Load-types en bestanden

Azure Blob Storage is een **bestandsbron**: Yres slaat geen metadata-stap (`GetMetaData`) over via een databasedictionary, maar leest de structuur uit de bestanden zelf. Je voegt per bestand (of bestandspatroon) een tabel toe en kiest daarbij het gewenste load-type, net als bij andere bronnen.

:::info Te bevestigen
Yres gebruikt intern een vergelijkbaar `AzureBlobFS`/SAS-patroon voor zijn eigen staging- en Data Lake-opslag. Het blob-storage-account dat je hier koppelt is een **door jou gekozen bronaccount** en staat los van die interne infrastructuur. Controleer bij twijfel of je het juiste account/container opgeeft.
:::

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
