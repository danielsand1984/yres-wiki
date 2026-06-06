---
title: SAP Analytics Cloud (SAC)
sidebar_label: SAP Analytics Cloud (SAC)
description: Connect SAP Analytics Cloud (SAC) to Yres — connection requirements.
---

# SAP Analytics Cloud (SAC)

**Category:** OData  ·  🏅 Official partner

SAP Analytics Cloud. Official partner.

## Connection requirements

- URL
- Authentication URL
- Client ID
- Client secret

## Setup

Set up an OAuth client on SAP Analytics Cloud.

## Where to find these

- **URL** — this is your SAC tenant URL, e.g. `https://<tenant>.<region>.sapanalytics.cloud` (the URL you use to log in to SAP Analytics Cloud).
- **Authentication URL** — this is the OAuth **token endpoint**. You find it together with the Authorization URL on the **System → Administration → App Integration** page; provide the **Token URL** as the Authentication URL.
- **Client ID + Client secret** — in SAC, create an **OAuth client** via **System → Administration → App Integration → Add a New OAuth Client**. Under Authorization Grant, choose **Client Credentials**. After saving, SAC shows the **OAuth Client ID** and its **Secret**; copy both and provide them to Yres.

Official documentation: [SAP Analytics Cloud — Manage OAuth Clients](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/00f68c2e08b941f081002fd3691d86a7/4f43b54398fc4acaa5efa32badfe3df6.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
