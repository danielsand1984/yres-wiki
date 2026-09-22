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
- **Offset** / **OffsetPage**: add **Offset Object** and **Limit Object** — the name of the offset and limit parameter that the API uses.
- **Paging**: adds only a **Page Object** — the name of the page-number parameter. There is no Limit Object for this type.

Note that Yres **always generates all three pagination pipelines** (`Paging`/`Offset`/`OffsetPage`) plus the main pipeline, regardless of the chosen pagination type; the chosen type determines which pipeline is actually used during a load.

### Authentication — fields per type

- **Anonymous**: no credentials.
- **Basic**: **Username** + **Password**. Stored in Key Vault as `adf-{bronnaam}-basic-http-username` and `adf-{bronnaam}-basic-http-password`.
- **OAuth2ClientCredential**: **Token endpoint** + **Client ID** + **Client Secret** + **Scope** + **Resource**. Stored as `adf-{bronnaam}-tokenEndpoint`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret` (and optionally `scope` and `resource`).

## Integration runtime

`AutoResolveIntegrationRuntime` (cloud) is the default and the right choice for a publicly reachable REST API. Choose a **self-hosted integration runtime** only when the API runs on-premises or behind a firewall. The backend (`RestServiceSource.php`) writes the chosen IR to the linked service via `withConnectVia` and sets `enableServerCertificateValidation=true`.

## How Yres builds the request URL

Yres builds the complete request URL **itself, inside the pipeline** — the connector does no URI resolution of its own. That avoids the well-known pitfalls of relative URLs (where .NET would discard the Base URL's path). You supply two things; Yres combines them on every run.

### What you enter

| Input | Where | What it is |
|---|---|---|
| **Base URL** | Once, on the **source** (step 1 of the wizard) | The root of the API. Stored in the Key Vault as `adf-{bronnaam}-http-url`. May already contain a query string itself (e.g. a fixed `?api-version=2.0`). |
| **Endpoint** | Per **table** (the *Endpoint* field) | The path and/or query of that specific endpoint. This field decides whether Yres appends a path or a query. |

On every run the pipeline reads the `http-url` secret, splits it on the first `?` into a **base path** and a **base query**, parses your endpoint, and joins everything into one URL.

### The rules

Yres decides purely from how you write the **Endpoint** field:

- **Empty** → only the Base URL is used.
- Starts with `/`, or a bare name such as `cars` or `cars/active` → appended as a **path** to the base path.
- Starts with `?` or `&`, or a bare `name=value` (contains `=` and no `/`) → added as a **query**.
- Contains both a path and a `?` → everything before the `?` is path, everything after is query.

Further details that shape the behaviour:

- **Query parameters from the Base URL are always preserved** and come before the endpoint and pagination query.
- The wizard does **not accept a trailing `/`** on the Base URL (validation `notEndWith('/')`). The pipeline is nevertheless tolerant: if the `http-url` secret does end with a `/` (for example set by hand in the Key Vault), it is removed as soon as a path is appended; without a path it stays — see the tolerance examples below.
- A `=` **inside a path segment** (e.g. `/path/a=b`) simply stays part of the path — the `=` rule only applies when the endpoint has no `/`.
- Yres does **not de-duplicate query parameters**: if `key=` appears in both the Base URL and the endpoint, both end up in the URL (`?key=1&key=2`). So set a parameter in one place only.

### Examples

Assuming the **Base URL** is stored as the `http-url` secret:

| Base URL (secret) | Endpoint (per table) | Resulting request URL |
|---|---|---|
| `https://api.example.com/v1` | `/customers` | `https://api.example.com/v1/customers` |
| `https://api.example.com/v1` | `customers` | `https://api.example.com/v1/customers` |
| `https://api.example.com/v1` | `customers/active` | `https://api.example.com/v1/customers/active` |
| `https://api.example.com/v1` | `?$top=100` | `https://api.example.com/v1?$top=100` |
| `https://api.example.com/v1` | `&$top=100` | `https://api.example.com/v1?$top=100` |
| `https://api.example.com/v1` | `active=true` | `https://api.example.com/v1?active=true` |
| `https://api.example.com/v1` | `/path/a=b` | `https://api.example.com/v1/path/a=b` |

Pipeline tolerance — only relevant if the secret ends with `/` anyway, outside the wizard (the wizard itself does not allow it):

| Base URL (secret) | Endpoint (per table) | Resulting request URL |
|---|---|---|
| `https://api.example.com/v1/` | `/cars` | `https://api.example.com/v1/cars` |
| `https://api.example.com/v1/` | *(empty)* | `https://api.example.com/v1/` |

More complex combinations, where the Base URL itself already carries a fixed query:

| Base URL (secret) | Endpoint (per table) | Resulting request URL |
|---|---|---|
| `https://api.example.com/v1?api-version=2.0` | `/orders?status=open` | `https://api.example.com/v1/orders?api-version=2.0&status=open` |
| `https://api.example.com/v1?key=abc` | `cars?type=ev&year=2024` | `https://api.example.com/v1/cars?key=abc&type=ev&year=2024` |
| `https://api.example.com/v1?key=abc` | *(empty)* | `https://api.example.com/v1?key=abc` |
| `https://api.example.com/v1?key=abc` | `&$select=id,name` | `https://api.example.com/v1?key=abc&$select=id,name` |

### Pagination

For any pagination type other than *No pagination*, the matching pipeline appends the page parameters to the end of that same query string, once per page. The names come from the **Offset Object** and **Limit Object** fields (for *Paging*: the **Page Object**) you fill in on the source; `pageSize` is the load setting. Assuming Base URL `https://api.example.com/v1?key=abc`, endpoint `/orders` and `pageSize = 500`:

| Type | Fields | Page 1 | Page 2 | … |
|---|---|---|---|---|
| **Offset** | Offset Object `offset`, Limit Object `limit` | `…/orders?key=abc&offset=0&limit=500` | `…&offset=500&limit=500` | offset increments by `pageSize` |
| **OffsetPage** | Offset Object `page`, Limit Object `limit` | `…/orders?key=abc&page=0&limit=500` | `…&page=1&limit=500` | page increments by 1, `limit` stays `pageSize` |
| **Paging** | Page Object `page` | `…/orders?key=abc&page=1` | `…&page=2` | page increments by 1, no limit |

The loop stops as soon as a page returns no more rows. **BodyUrl** and **RFC5988** use no offset/limit fields: they follow the next-page link from the response body and the `Link` header respectively, starting from the URL built above.

## From JSON response to table

Yres does **not** let ADF map the JSON column by column: it fetches the whole response as text and
parses it **server-side in SQL Server**. This way Yres creates and widens the table automatically based
on the fields in the response, without you supplying a field mapping. The only knob you usually need is
the **collection** (the path to the records array, defaulting to `AUTO`). How this works exactly —
nested objects, arrays, data types and worked examples — is on **[JSON to tables](restservice-json.md)**.

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

**See also:** [JSON to tables](restservice-json.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
