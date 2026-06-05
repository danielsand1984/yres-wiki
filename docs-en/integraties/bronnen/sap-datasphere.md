---
title: SAP Datasphere
sidebar_label: SAP Datasphere
description: Connect SAP Datasphere to Yres — connection requirements.
---

# SAP Datasphere

**Category:** OData  ·  🏅 Official partner

SAP Datasphere. Official partner. Connects via OData.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

SAP Datasphere connects via **OData** (the consumption/OData API).

- **Expose the data** — In Datasphere, expose the view or analytic model for consumption (mark it as *Expose for Consumption*). The OData URL follows the pattern `https://<tenant-host>/api/v1/dwc/consumption/relational/<space>/<object>/<object>` (or `.../analytical/...` for analytic models).
- **OAuth client** — For authentication, a Datasphere administrator creates an OAuth 2.0 client (System → Administration → App Integration). That yields the **Client ID**, **Client secret**, and the **Authorization** and **Token** URLs for the OAuth flow.
- **Alternative** — Instead of OData you can also use a database/Open SQL schema user for a direct database connection.

Official docs: [Consuming Data via the OData API](https://help.sap.com/docs/SAP_DATASPHERE/43509d67b8b84e66a30851e832f66911/7a453609c8694b029493e7d87e0de60a.html) · [Create OAuth2.0 Clients to Authenticate Against SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE/9f804b8efa8043539289f42f372c4862/3f92b46fe0314e8ba60720e409c219fc.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
