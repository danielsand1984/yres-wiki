---
title: REST API
sidebar_label: REST API
description: Connect REST API to Yres — connection requirements.
---

# REST API

**Category:** REST

Generic REST connection for any JSON API. OpenAPI/Swagger is supported: select endpoints visually in the frontend.

## Connection requirements

- API specification URL
- Base URL
- Pagination type
- Authentication type
- Extra headers (optional)

## Where to find these

All of these values come from the target API's documentation.

- **API specification URL**: if the API has an OpenAPI/Swagger specification, its URL (often `openapi.json` or `swagger.json`). This lets you select endpoints visually.
- **Base URL**: the base URL (root) of the API.
- **Pagination type**: how the API splits results into pages (for example offset/limit, page number, or RFC 5988 link headers). Check this in the API documentation.
- **Authentication type**: Basic or OAuth2. For **OAuth2 client credentials** you need the token endpoint, client ID, client secret, scope, and optionally a resource.
- **Extra headers**: any additional headers the API requires (for example, an API key header).

Consult the official documentation of the API you are connecting to for all of these values. For the OAuth2 flow, see: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
