---
title: TrustIT
sidebar_label: TrustIT
description: Connecting TrustIT to Yres — connection requirements.
---

# TrustIT

**Category:** REST · Dedicated ADF connector

TrustIT is an administration/accounting platform. Yres connects to it through TrustIT's **REST API** and retrieves the data per administration and per day. TrustIT has its own ADF connector — the linked service `TrustIT` (`RestService`), the dataset `TrustIT_DATASET` (`RestResource`) and the pipeline **`Dynamic Pipeline YRES - TrustIT`** (in the ADF folder `PW - Yres/Sources/Trustit`).

:::info To be confirmed
TrustIT has (version 1.55) **no choice item in the "Add source" wizard** (`CreateSource.tsx`) — unlike most sources, it is therefore currently **not a self-service selectable source**, but a dedicated/example connector that is configured in collaboration with Yres. The fields below are derived from the ADF linked service, dataset and pipeline; confirm with Yres or TrustIT whether TrustIT is available as a selectable source for your environment and which input form then applies.
:::

## Expected input

Yres builds the TrustIT connection on the REST API. The following values are required; with a self-service form they would be requested as fields, otherwise they are set up by Yres. In addition, the shared source fields from step 1 apply (**source name**, **type**, **integration runtime**, **credentials the same for all environments?**, **credentials expiry date**, **tags**).

| Value | Description |
|---|---|
| **Source name** | Name of the source (unique per organization, 2–45 characters, starts with a letter). Becomes the name of the ADF linked service and the prefix of the Key Vault secrets (`adf-{name}-…`). |
| **URL** | The base URL (`url`) of the TrustIT REST API. Stored as `adf-{name}-http-url` (in the supplied template `adf-TrustIT-http-url`). |
| **Username** | The username for Basic authentication. Stored as `adf-{name}-basic-http-username` (template `adf-TrustIT-basic-http-username`). |
| **Password** | The password for Basic authentication. Stored as `adf-{name}-basic-http-password` (template `adf-TrustIT-basic-http-password`). |
| **API key** | The TrustIT API key that is sent along as the HTTP header `trustit-api-key`. Stored as `adf-{name}-authHeader-trustit-api-key` (template `adf-TrustIT-authHeader-trustit-api-key`). |

**Authentication:** **Basic** (username + password), supplemented with an **API key as an HTTP header** `trustit-api-key`. The linked service has `type: RestService`, `authenticationType: Basic`, with `enableServerCertificateValidation: true`. All four values (URL, username, password and the API key header) reference secrets in the Azure Key Vault; Yres never stores them in the frontend.

**Integration runtime:** by default the cloud IR **`AutoResolveIntegrationRuntime`** — the TrustIT REST API is publicly reachable. A self-hosted IR is only needed when you want to route the outbound traffic through your own network.

## Requirements

- **API credentials from TrustIT.** Request the **API URL**, a **username/password** for Basic authentication and an **API key** (`trustit-api-key`) from TrustIT (or your TrustIT administrator). You need these values before you add the source in Yres.
- **Key Vault secrets.** Yres writes the four values to the Azure Key Vault of your own environment and retrieves them from there in the linked service. The secrets follow the naming convention `adf-{source name}-…`:
  - `adf-{name}-http-url`
  - `adf-{name}-basic-http-username`
  - `adf-{name}-basic-http-password`
  - `adf-{name}-authHeader-trustit-api-key`

:::info To be confirmed
The username/password and API key inherit the permissions of the TrustIT account/integration under which they were created. Make sure that account has read access to the administrations and data you want to unlock. Check with TrustIT whether the API key and/or the password have an expiry date; fill it in at **credentials expiry date** if applicable.
:::

## Retrieving data

The TrustIT connector retrieves data **per administration and per day**. The pipeline **`Dynamic Pipeline YRES - TrustIT`** sends a **`POST`** call to the chosen endpoint each day with a JSON body of the form:

```json
{
    "administrationCodes": ["DSG_1"],
    "dateFrom": "<date>T00:00:00.000Z",
    "dateTo": "<date>T23:59:59.999Z"
}
```

where `<date>` is filled in per day. The endpoint to query follows from the `Endpoint` parameter of the dataset (`TrustIT_DATASET`, `RestResource`), which is appended as a relative URL after the base URL (example value `countries`).

:::note
The `administrationCodes` in the example body (`["DSG_1"]`) is **seed/example data** in the published pipeline, not a customer value — just like the other example values in the connector. The actual administration code(s) are set up per environment.
:::

**Load/delta behavior:** TrustIT loads **incrementally on a daily basis**. The *GetMissing Days* activity determines, based on `ODS.CALENDAR` and the previously successful load moments (`Loads30Days`), which days are still missing, and the pipeline processes those days one by one (sequentially, with a wait time between pages). Each day is retrieved through its own `dateFrom`/`dateTo` window. Take this into account when setting the load type and scheduling triggers; the practical historical depth is bounded by the calendar (`ODS.CALENDAR`) and the retained load history.

:::info To be confirmed
TrustIT's official, publicly available API documentation is not captured within the Yres codebase. Request the current API reference (endpoints, data fields, authentication) from TrustIT.
:::

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
