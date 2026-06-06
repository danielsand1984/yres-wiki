---
title: SAP Datasphere
sidebar_label: SAP Datasphere
description: SAP Datasphere koppelen aan Yres — verbindingseisen.
---

# SAP Datasphere

**Categorie:** OData  ·  🏅 Official partner

SAP Datasphere. Official partner. Koppelt via OData.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

SAP Datasphere koppelt via **OData** (de consumption-/OData-API).

- **Data exposen** — Stel in Datasphere de view of het analytic model bloot voor consumptie (markeer als *Expose for Consumption*). De OData-URL volgt het patroon `https://<tenant-host>/api/v1/dwc/consumption/relational/<space>/<object>/<object>` (of `.../analytical/...` voor analytic models).
- **OAuth-client** — Voor authenticatie maakt een Datasphere-beheerder een OAuth 2.0-client aan (System → Administration → App Integration). Daaruit komen de **Client ID**, **Client secret**, **Authorization-** en **Token-URL** voor de OAuth-flow.
- **Alternatief** — In plaats van OData kun je ook een database-/Open SQL-schemagebruiker gebruiken voor een directe databaseverbinding.

Officiële docs: [Consuming Data via the OData API](https://help.sap.com/docs/SAP_DATASPHERE/43509d67b8b84e66a30851e832f66911/7a453609c8694b029493e7d87e0de60a.html) · [Create OAuth2.0 Clients to Authenticate Against SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE/9f804b8efa8043539289f42f372c4862/3f92b46fe0314e8ba60720e409c219fc.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
