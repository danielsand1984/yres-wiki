---
title: Simplicate
sidebar_label: Simplicate
description: Connecting Simplicate to Yres — connection requirements.
---

# Simplicate

**Category:** Direct connection

Project and CRM software. Yres connects to the Simplicate REST API; under the hood
this source is written out as type **RestService** (a fixed Simplicate base URL with
offset pagination and two authentication headers).

## Expected input

When adding the source (the **Add source** wizard), in addition to the shared fields
(source name, type, integration runtime, credentials settings, tags) you fill in the
following Simplicate-specific fields:

| Field | Description |
|---|---|
| **Domain name** | The name of your Simplicate environment. Yres uses this to build the base URL `https://{domain}.simplicate.app/api/v2/`. |
| **Authentication key** | The Authentication-Key from Simplicate. Sent as the HTTP header `Authentication-Key`. |
| **Authentication secret** | The matching Authentication-Secret from Simplicate. Sent as the HTTP header `Authentication-Secret`. |

- **Authentication:** two custom HTTP headers (`Authentication-Key` + `Authentication-Secret`).
  The linked service itself is set to `Anonymous`; the key and secret are sent as headers.
  Yres does not store the key and secret in the frontend — they are saved in the
  **Azure Key Vault** of your own environment (secrets in the group `adf-{bronnaam}-…`),
  which the linked service references.
- **Integration runtime:** the default **`AutoResolveIntegrationRuntime`** (cloud). Simplicate
  is reachable over HTTPS, so a self-hosted integration runtime is not required.
- **Pagination:** offset pagination (`offset` / `limit`) — this is fixed and you do not need to fill it in yourself.

### Requirements

- A Simplicate account with permission to create an API key.
- A created **Authentication-Key + Authentication-Secret** (see Setup below).

## Setup

In Simplicate, create an API key + secret and provide both values, together with your domain name,
to Yres.

## Retrieving the details

- **Domain name** — this is the name of your own Simplicate environment. You can find it in the
  address bar when you are logged in (for example `mijnorganisatie` in `https://mijnorganisatie.simplicate.nl`).
  Enter only the name; Yres builds the API URL `https://{domain}.simplicate.app/api/v2/` itself.
- **Authentication key + Authentication secret** — in Simplicate, go to **Settings → API**
  and click **New** in the top right to create an API key. You receive an **Authentication-Key**
  and a matching **Authentication-Secret**. An API key is tied to a user and inherits that user's
  permissions; provide both values to Yres.

Official documentation: [Simplicate — Creating an API key](https://support.simplicate.nl/en/articles/6693108-creating-and-deleting-an-api-key).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
