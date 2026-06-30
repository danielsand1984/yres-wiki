---
title: REST API
sidebar_label: REST API
description: Connect a REST API to Yres — connection requirements.
---

# REST API

**Category:** REST

Generic REST connector (`RestService`) for any JSON API. If the API provides an OpenAPI/Swagger specification, you can pick the endpoints in the frontend based on that specification. The connector supports several pagination and authentication styles, so almost any REST source can be connected through a single generic form.

## Expected input

You fill in these fields in the **Add source** form (`getFormAddSourceRestService.ts`). In addition to the source-specific fields below, every source also asks for the shared fields from step 1 (source name, type, integration runtime, credentials the same for all environments, expiry date, tags).

| Field (label) | Required | Explanation |
|---|---|---|
| **OpenAPI specification URL** | Optional | URL of the OpenAPI 3.x specification (JSON or YAML). When filled in, you can pick the endpoints visually. It is validated (`ValidApiSpecificationRule`). |
| **Base URL** | Yes | The base URL (root) of the API. **Must not end with a `/`.** |
| **paginationType** | Yes | Choice: `No pagination`, `RFC5988`, `BodyUrl`, `Offset`, `Paging`, `OffsetPage`. Determines which extra fields appear (see below). |
| **AuthenticationType** | Yes | Choice: `Anonymous`, `Basic` or `OAuth2ClientCredential`. Determines which credential fields appear (see below). |
| **HTTP headers** | Optional | One or more extra header/value pairs (for example, an API-key header) that the API requires. |

### Pagination — fields per type

Check the target API's documentation to see how it splits results into pages, and choose the matching `paginationType`:

- **No pagination**: no extra fields; all results come back in a single response.
- **RFC5988**: paging via `Link` headers (RFC 5988); no extra fields.
- **BodyUrl**: adds a **Body url** field — the JSON path to the next-page URL in the response body (for example, `$['@odata.nextLink']`).
- **Offset** / **OffsetPage** / **Paging**: add **Offset Object** and **Limit Object** — the name of the offset and limit parameter that the API uses.

The chosen pagination type also determines which dynamic pipelines Yres generates (`Paging`/`Offset`/`OffsetPage`).

### Authentication — fields per type

- **Anonymous**: no credentials.
- **Basic**: **Username** + **Password**. Stored in Key Vault as `adf-{bronnaam}-basic-http-username` and `adf-{bronnaam}-basic-http-password`.
- **OAuth2ClientCredential**: **Token endpoint** + **Client ID** + **Client Secret** + **Scope** + **Resource**. Stored as `adf-{bronnaam}-tokenEndpoint`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret` (and optionally `scope` and `resource`).

## Integration runtime

`AutoResolveIntegrationRuntime` (cloud) is the default and the right choice for a publicly reachable REST API. Choose a **self-hosted integration runtime** only when the API runs on-premises or behind a firewall. The backend (`RestServiceSource.php`) writes the chosen IR to the linked service via `withConnectVia` and sets `enableServerCertificateValidation=true`.

## Requirements

- **Base URL** of the API (without a trailing `/`).
- If you want to pick endpoints visually: a valid **OpenAPI/Swagger specification URL**.
- The correct **pagination type** with the associated fields (body url or offset/limit object).
- The correct **credentials** for the chosen authentication type (Basic: username + password; OAuth2 client credentials: token endpoint, client ID, client secret, scope and optionally resource). Yres stores these in the customer's Azure Key Vault under `adf-{bronnaam}-…`; the frontend keeps no secrets itself.
- Any **extra HTTP headers** that the API requires.

:::note No metadata step
REST sources have **no metadata step**: fetching/refreshing metadata is skipped (`hasMetadata()=false`). You therefore configure the data to retrieve directly based on the OpenAPI specification or the known endpoints, not via a metadata dictionary as with database sources.
:::

## Retrieving the data

All of these values come from the target API's documentation:

- **OpenAPI specification URL**: if the API publishes an OpenAPI/Swagger specification, its URL (often `openapi.json` or `swagger.json`). You use it to pick the endpoints in the frontend.
- **Base URL**: the base URL (root) of the API, without a trailing `/`.
- **paginationType**: how the API splits results into pages (offset/limit, page number, `BodyUrl` via a next-page link in the body, or RFC 5988 `Link` headers). Check this in the API documentation.
- **AuthenticationType**: `Anonymous`, `Basic` (username + password) or `OAuth2ClientCredential`. For **OAuth2 client credentials** you need the token endpoint, client ID, client secret, scope and optionally a resource.
- **HTTP headers**: any additional headers the API requires (for example, an API-key header).

For all of these values, consult the official documentation of the API you are connecting to. For the OAuth2 flow, see: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
