---
title: Tweede Kamer
sidebar_label: Tweede Kamer
description: Connect the Tweede Kamer to Yres — connection requirements.
---

# Tweede Kamer

**Category:** OData

Open data from the Dutch House of Representatives (Tweede Kamer) via OData. Yres provides a ready-made option for this in the source wizard: you select **Tweede Kamer** as the source type and don't have to assemble a feed URL yourself. Under the hood, the source is stored as a generic **OData** source type with a fixed, predefined feed URL.

## Expected input

In the source wizard (step 1) you fill in the shared fields that apply to every source:

- **Source name** — unique, 2–45 characters. Becomes the name of the linked service and the prefix of the Key Vault secrets (`adf-{sourcename}-…`).
- **Type** — choose **Tweede Kamer**.
- **Integration runtime** — **`AutoResolveIntegrationRuntime`** (cloud). The Tweede Kamer feed is publicly reachable over the internet, so a self-hosted integration runtime is **not** required.
- **Credentials the same for all environments?** / **credential expiry date** / **tags** — as with every source.

There are **no** source-specific connection fields: the feed URL, the authentication type and the pagination are fixed and cannot be entered by the user.

| Property | Value | User-configurable? |
|---|---|---|
| Feed URL | `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/` | No — fixed |
| Authentication | Anonymous (`authenticationType=Anonymous`) | No — fixed |
| Pagination | `BodyUrl` (`body_url=$['@odata.nextLink']`) | No — fixed |
| Stored source type | `OData` | n/a |

### Authentication

**Anonymous.** The Tweede Kamer data is **open data**: no credentials, API keys or tokens are needed. As a result, no **credential** secrets are created; the backend does write the fixed feed URL as the secret `adf-{sourcename}-http-url` to the Key Vault — the linked service references it.

### Prerequisites

None. Because there are no credentials and the source runs via the cloud integration runtime, you don't need to register anything in Azure beforehand (no app registration, no client secret, no SAS token). The only Key Vault secret — the feed URL (`adf-{sourcename}-http-url`) — is created by Yres itself.

## Retrieving data

The Tweede Kamer feed delivers data in JSON via OData v4. Using entities, attributes and filters in the URL, you compose your own query; Yres retrieves the results and pages through them automatically based on `@odata.nextLink`.

1. In the source wizard, choose **Tweede Kamer** as the source type and give the source a name.
2. Refer to the [Open Data Portal of the Tweede Kamer](https://opendata.tweedekamer.nl/) to determine which entities and fields you want to retrieve.

See the official documentation: [OData API — Open Data Portaal](https://opendata.tweedekamer.nl/documentatie/odata-api).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
