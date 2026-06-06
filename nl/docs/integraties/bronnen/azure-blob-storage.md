---
title: Azure Blob Storage
sidebar_label: Azure Blob Storage
description: Azure Blob Storage koppelen aan Yres — verbindingseisen.
---

# Azure Blob Storage

**Categorie:** Azure · Bestand

Bestandsopslag in Azure. Upload bestanden direct en voeg ze als tabel toe.

## Verbindingseisen

- Account name
- Container name
- SAS token

## Setup

Maak een **SAS-token** aan via het storage-account → Security + Networking → Shared Access Signature.

## Gegevens ophalen

- **Account name** — de naam van het storage-account. In de [Azure Portal](https://portal.azure.com) → **Storage accounts** → kies (of maak) het account; de naam staat bovenaan en in de blade **Overzicht**.
- **Container name** — een blob-container binnen dat account. Open het storage-account → blade **Containers**; de naam van de container die je bestanden bevat is wat je hier invult. Hier maak je desgewenst ook een nieuwe container aan.
- **SAS token** — de query-string die toegang verleent. Maak deze aan via het storage-account → **Security + networking** → **Shared access signature**: kies **Blob** als toegestane service, selecteer de benodigde rechten (minimaal *Read* en *List*) en een vervaldatum, en klik **Generate SAS and connection string**. Een container-specifieke SAS kan ook via **Container → Shared access tokens**. Het token is het deel ná het vraagteken: `?sv=...&ss=...&sig=...`. Bewaar het direct — het wordt maar één keer getoond.

> Officiële documentatie: [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
