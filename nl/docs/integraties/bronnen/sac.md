---
title: SAP Analytics Cloud (SAC)
sidebar_label: SAP Analytics Cloud (SAC)
description: SAP Analytics Cloud (SAC) koppelen aan Yres — verbindingseisen.
---

# SAP Analytics Cloud (SAC)

**Categorie:** OData  ·  🏅 Official partner

SAP Analytics Cloud. Official partner.

## Verbindingseisen

- URL
- Authentication URL
- Client ID
- Client secret

## Setup

Stel een OAuth-client in op SAP Analytics Cloud.

## Gegevens ophalen

- **URL** — dit is de URL van je SAC-tenant, bijvoorbeeld `https://<tenant>.<regio>.sapanalytics.cloud` (de URL waarmee je inlogt op SAP Analytics Cloud).
- **Authentication URL** — dit is het OAuth-**token endpoint**. Je vindt deze samen met de Authorization URL op de pagina **System → Administration → App Integration**; geef de **Token URL** door als Authentication URL.
- **Client ID + Client secret** — maak in SAC een **OAuth-client** aan via **System → Administration → App Integration → Add a New OAuth Client**. Kies bij Authorization Grant **Client Credentials**. Na opslaan toont SAC de **OAuth Client ID** en het bijbehorende **Secret**; kopieer beide en geef ze door aan Yres.

Officiële documentatie: [SAP Analytics Cloud — Manage OAuth Clients](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/00f68c2e08b941f081002fd3691d86a7/4f43b54398fc4acaa5efa32badfe3df6.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
