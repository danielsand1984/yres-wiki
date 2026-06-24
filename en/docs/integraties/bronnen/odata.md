---
title: OData
sidebar_label: OData
description: Connect OData to Yres — connection requirements.
---

# OData

**Category:** OData

Generic OData connector for any OData feed (v2/v4). Yres accesses the service over HTTP; authentication
is either **Anonymous** (public feed) or **Basic** (username + password). Optionally, you can add extra
HTTP headers (for example, an API-key header).

## Expected input

You fill in these fields in the **Add source** wizard (form `getFormAddSourceOdata`). In addition to the
shared fields (source name, type, integration runtime, credentials the same for all environments?,
credentials expiry date, tags), Yres expects the following for OData:

| Field (label) | Explanation |
|---|---|
| **Url** | The service root of the OData feed (often ending in `/odata`). Yres automatically appends a trailing `/`. |
| **Pagination type** | Fixed at **`BodyUrl`** (read-only): paging works via the OData `nextLink`. |
| **Body url** | JSON path to the next-page link. Defaults to `$['@odata.nextLink']`. |
| **Authentication type** | Choice of **`Anonymous`** or **`Basic`**. With **Basic**, extra fields **Username** and **Password** appear. |
| **Username** + **Password** | Only with Basic: the username and password you received from the provider of the OData service. |
| **HTTP headers** (optional) | One or more header/value pairs. Suggestions from the dropdown: `Authorization`, `APIKey`, `X-API-KEY`. Use this for APIs that require an extra header (for example, an API key). |

- **Authentication:** Anonymous or Basic (username + password). Additional headers are sent along as
  extra authentication headers.
- **Integration runtime:** defaults to **`AutoResolveIntegrationRuntime`** (cloud) for publicly
  reachable OData services. If the feed sits behind a firewall or is on-premises, choose a
  **self-hosted integration runtime**.
- **Secrets in Key Vault:** Yres does not store any secrets itself. The backend (`ODataSource`) writes
  the entered values to the customer's **Azure Key Vault**: the URL as `adf-{bronnaam}-http-url` and,
  for Basic, the credentials as `adf-{bronnaam}-basic-http-username` and
  `adf-{bronnaam}-basic-http-password`. The linked service references these secrets. From DWH version
  1.52 onward, the data linked service is built as `RestService` (before that, as `OData`); in
  addition, a separate metadata linked service `{bronnaam}_HTTP` is created.

:::info To be confirmed
For an OData feed with OAuth authentication, do not use this source but
[**OData OAuth**](odata-oauth.md). A few helper sources (CBS, Tweede Kamer, Topdesk, Microsoft Graph,
Dynamics 365) are also stored as type `OData` under the hood, but have their own input fields;
document those on their own pages.
:::

## Retrieving the data

These values come from the provider of the OData service; they are documented in that provider's API
documentation.

- **Url**: the service root of the OData feed (often ending in `/odata`). Append `/$metadata` to the
  service root to inspect the data model (entities and fields).
- **Authentication type**: `Anonymous` or `Basic`, depending on what the service requires. With
  **Basic**, you enter the username and password you received from the provider.
- **HTTP headers**: any extra headers the API requires (for example, an API-key header). Which headers
  are needed is described in the provider's documentation.

For an explanation of OData services, see the official documentation: [OData — Getting Started / Basic Tutorial](https://www.odata.org/getting-started/basic-tutorial/).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
