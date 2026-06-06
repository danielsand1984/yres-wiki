---
title: AFAS
sidebar_label: AFAS
description: Connect AFAS to Yres — connection requirements.
---

# AFAS

**Category:** Direct connection  ·  🏅 Official partner

Dutch ERP system. Official partner.

## Connection requirements

- URL
- API token

## Setup

Connect via the AFAS app connector.

## Where to find these

- **URL** — this is the REST base URL of your AFAS Profit/InSite environment: `https://<env>.rest.afas.online/profitrestservices`. `<env>` is your environment number (shown in AFAS Profit, e.g. `12345`).
- **API token** — in AFAS Profit, create an **App connector** via **General → Management → App connector**. Add the GetConnectors that Yres may read, then generate the token. The token is saved as an XML file; provide the token value to Yres. AFAS's authorization header has the form `AfasToken <token>`.

Official documentation: [AFAS Profit — GetConnector / App connector](https://docs.afas.help/profit/en/get-connector).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
