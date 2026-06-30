---
title: AFAS
sidebar_label: AFAS
description: Connect AFAS to Yres — connection requirements.
---

# AFAS

**Category:** Direct connection  ·  🏅 Official partner

Dutch ERP system. Official partner. Yres reads from AFAS via the
**AFAS App connector** (the REST services of AFAS Profit/InSite). In Azure Data
Factory this becomes a `RestService` linked service.

## Expected input

You set up the connection through the **Add source** wizard. Besides the fields that
apply to every source (source name, type, integration runtime, whether the credentials
are the same for all environments, an optional credential expiry date, tags), the
AFAS source asks for the following fields:

| Field | Notes |
|---|---|
| **URL** | The REST base URL of your AFAS environment. It must end in `…afas.online/profitrestservices`. Example/placeholder: `https://12345.rest.afas.online/profitrestservices`, where `12345` is your AFAS environment number. |
| **API token** | The full token blob that AFAS generates for the App connector: `<token><version>1</version><data>…</data></token>`. Paste the whole value, not just the `data` part. |

**Authentication:** the API token is sent as an **Authorization header**
(RestService with auth headers — `hasAuthHeaders() = true`). There is no
username/password.

**Integration runtime:** **cloud** — `AutoResolveIntegrationRuntime`. AFAS Online is
publicly reachable over HTTPS, so a self-hosted integration runtime is not needed.

**Where the credentials end up:** the frontend stores no secrets. The API token
goes into the **Azure Key Vault** of your own environment and is retrieved from the
linked service as the secret **`adf-AFAS-connectionstring`** (the secret falls under the
naming group `adf-{sourcename}-…`). The linked service (`AFAS.json`) itself is set to
`Anonymous` and sets the token via `authHeaders.Authorization` as a reference to that
Key Vault secret.

## Preparation (in AFAS Profit)

1. Create an **App connector** via **General → Management → App connector**.
2. Add the **GetConnectors** that Yres may read (each GetConnector is a
   source "table" that you can later select as a used table).
3. Generate the token. AFAS delivers it as an XML file; the contents are the
   `<token>…</token>` blob that you paste into the **API token** field.
4. Note your environment number for the **URL** (`https://<environmentnumber>.rest.afas.online/profitrestservices`).

:::note Authorization header
The exact form of the Authorization header (for example a prefix such as
`AfasToken <token>`) and any license/subscription requirements for the App connector
are determined by AFAS, not by Yres. Yres sends the value you provide as the
header; check the current AFAS documentation for the precise header formatting.
:::

## Load types & delta

AFAS tables are loaded via GetConnectors. The usual load types
(FULL, DELTA, IMAGE, OVERWRITE, RELOAD, ADDITIONAL, DELTAIMAGE) apply;
delta loading requires a suitable delta column in the relevant GetConnector. The
two-delta-column limitation applies only to MySQL, not to AFAS.

Official documentation: [AFAS Profit — GetConnector / App connector](https://docs.afas.help/profit/en/get-connector).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
