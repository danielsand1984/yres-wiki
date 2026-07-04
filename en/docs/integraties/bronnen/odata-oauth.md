---
title: OData OAuth
sidebar_label: OData OAuth
description: Connecting OData OAuth to Yres — connection requirements.
---

# OData OAuth

**Category:** OData

An OData feed secured with **OAuth 2.0**. Use this source for OData services behind an OAuth sign-in. For
an OData feed without OAuth (anonymous, Basic, or an API key in a header), use the [OData](./odata.md)
source instead.

For this source, Yres builds two linked services: a **REST** linked service for the data and an **HTTP**
linked service for the metadata. Pagination is handled through the OData continuation link
(`@odata.nextLink`).

## Expected input

You enter these fields in the Yres "Add source" form (the sub-form for `OData OAuth`).

| Field | Description |
|---|---|
| **Url** | The service root (base URL) of the OData feed. Yres automatically appends a trailing `/`. |
| **PaginationType** | Fixed at `BodyUrl` (read-only). |
| **Body url** | The JSON path to the continuation link; fixed at `$['@odata.nextLink']`. |
| **Client id** | The client/application id (UUID) of the registered OAuth client. |
| **Client secret** | The client secret of the OAuth client. |
| **Access token url** | The provider's token endpoint where Yres retrieves the access token. |
| **Scope** | The scope(s) that grant access to the desired data. |
| **Grant Type** | `Client Credentials` or `Authorization Code` (dropdown). |
| **Refresh token** | Only for **Authorization Code**: a valid refresh token (required). |

In addition to these source-specific fields, the wizard asks for the standard "source" details: **source
name** (unique, 2–45 characters, starts with a letter), **integration runtime**, **do the credentials
apply to all environments?**, **credential expiry date**, and optional **tags**.

### Authentication

**OAuth 2.0.** Two grant types are supported:

- **Client Credentials** — server-to-server. Using `Client id` + `Client secret`, Yres retrieves an
  access token from the `Access token url`. No user interaction needed.
- **Authorization Code** — additionally requires a **refresh token**, which Yres uses to retrieve a new
  access token each time. Without a refresh token, validation rejects the source.

Validation requires that `Url`, `Client id`, `Client secret`, and `Access token url` are filled in, that
`Grant Type` is one of `Authorization Code` / `Client Credentials`, and that for `Authorization Code` a
refresh token is present.

### Integration runtime

By default the cloud IR **`AutoResolveIntegrationRuntime`** — suitable for an OData service that is
publicly reachable (over the internet). Only choose a **self-hosted integration runtime** when the OData
service is on-premises or behind a firewall and not directly reachable from Azure. Yres writes the chosen
IR via `connectVia` to both linked services.

### Requirements and secrets

- **Register an OAuth client** with the provider of the OData service. This yields the `Client id`, the
  `Client secret`, the `Access token url`, and the allowed `Scope`(s). For `Authorization Code`, you also
  supply a valid **refresh token**.
- **Credentials are never stored in the frontend.** Yres writes them to the customer's **Azure Key
  Vault**, under the source-name prefix `adf-{bronnaam}-…`. For this source these include, among others,
  `adf-{bronnaam}-http-url`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientSecret`, and
  `adf-{bronnaam}-grantType`. The OAuth **tokens** (refresh token, scope, token URL, grant type) are
  stored separately.
- Consult the provider's API and OAuth documentation for the exact service root, scope names, and token
  endpoint.

:::tip Use the preset page for those services
A number of fixed presets use the same OData-OAuth mechanism under the hood. Dynamics 365 and
Intune Data Warehouse are stored as backend type `OData` (and deployed through the standard OData
builder); Microsoft Graph is stored as `ODataoAuth` since v1.56. For those services, use the relevant
preset page instead of this generic OData OAuth source.
:::

## Load types and delta

OData OAuth behaves like a generic OData/REST source. Metadata is retrieved through the HTTP linked
service; the actual records through the REST linked service with pagination on `@odata.nextLink`. Whether
incremental (DELTA) loading is possible depends on the presence of a suitable delta/change column in the
feed. See [Load types](../../concepten/load-types.md) for the available load types.

---

**Official documentation:** [OAuth 2.0 client credentials flow (Microsoft)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow) · [OAuth 2.0 authorization code flow (Microsoft)](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)

**See also:** [OData](./odata.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
