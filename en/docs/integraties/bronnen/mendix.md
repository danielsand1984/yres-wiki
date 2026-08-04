---
title: Mendix
sidebar_label: Mendix
description: Connecting Mendix to Yres — connection requirements.
---

# Mendix

**Category:** Direct connection · OData / REST

Low-code application platform. A Mendix app can expose its data as a **published OData service**; Yres
accesses that service through the generic **OData** or **RestService** connection. Mendix has no
dedicated input screen of its own in Yres — when adding the source you select the type **OData** (or
**RestService**) and fill in the service URL and credentials of your Mendix app.

## Expected input

Because Mendix goes through the generic OData/REST route, you fill in the fields of the chosen type (form
`getFormAddSourceOdata` or `getFormAddSourceRestService`, respectively). In addition to the shared fields
(source name, type, integration runtime, credentials the same for all environments?, credentials expiry
date, tags), these are the relevant fields for Mendix:

| Field (label) | Explanation |
|---|---|
| **Url** / **Base URL** | The service URL of the published Mendix OData service: `https://<app-host>/<location>/` (you set the *location* in Studio Pro, e.g. `svc/products/v1/`). For OData, Yres automatically appends a trailing `/`; for RestService the Base URL must not end with `/`. |
| **Authentication type** | Usually **`Basic`** (a Mendix user role with username + password). Configure the published service in Mendix so that it requires authentication. For a public service, choose `Anonymous`. |
| **Username** + **Password** | Only for Basic: the user (Mendix role) and password used to access the OData service. |
| **HTTP headers** (optional) | One or more header/value pairs, for example an API-key header if your Mendix app expects one (dropdown: `Authorization`, `APIKey`, `X-API-KEY`). |
| **Pagination type** / **Body url** | For OData, only the pagination type is fixed to **`BodyUrl`**; the body path is **editable**, with `$['@odata.nextLink']` as the default (pagination via the OData `nextLink`). |

- **Authentication:** Basic (username + password of a Mendix user role) or Anonymous for a public
  service. Extra headers (e.g. an API key) are sent along as authentication headers.
- **Integration runtime:** by default **`AutoResolveIntegrationRuntime`** (cloud) if the Mendix app is
  publicly reachable. If the app runs behind a firewall or on a restricted network, choose a
  **self-hosted integration runtime**.
- **Secrets in Key Vault:** Yres does not store any secrets itself. The backend writes the entered values
  to the customer's **Azure Key Vault**: the URL as `adf-{bronnaam}-http-url` and, for Basic, the
  credentials as `adf-{bronnaam}-basic-http-username` and `adf-{bronnaam}-basic-http-password`. The
  linked service references these secrets.

### Arrange in advance in Mendix

- **Publish an OData service** — In the Mendix app (Studio Pro), add a *Published OData service* and
  expose the desired entities/resources. The service's *location* determines the path in the URL.
- **Find the service URL** — An overview of published services is available at the app's root URL
  followed by `/odata-doc/` (e.g. `https://<app-host>/odata-doc/`). The service itself runs at
  `https://<app-host>/<location>/`.
- **Set up authentication** — Configure the service to require authentication (a Mendix user role or
  API key/Basic auth, depending on the app configuration) and provide that user/key when adding the
  source.

:::note Connect via OData or RestService
Mendix is not a separate source type in Yres; the connection goes through the generic **OData** or
**RestService** source. Which of the two is most convenient depends on how your Mendix app publishes the
data (an OData feed or its own REST API). For a Mendix service with OAuth authentication, use the
[**OData OAuth**](odata-oauth.md) source instead.
:::

Official docs: [Published OData Services (Mendix Documentation)](https://docs.mendix.com/refguide/published-odata-services/).

---

**See also:** [OData](odata.md) · [RestService](restservice.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
