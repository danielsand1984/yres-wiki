---
title: Monday
sidebar_label: Monday
description: Connecting Monday to Yres — connection requirements.
---

# Monday

**Category:** Direct integration · REST

monday.com is a work and project management platform. Yres queries monday.com through the
**GraphQL API** (endpoint `https://api.monday.com/v2`) and retrieves the data using a
personal API token; the ADF linked-service type is technically `RestService`.

## Expected input

In the **Add source** wizard you first fill in the shared fields (source name, type,
integration runtime, whether the credentials are the same for all environments, an optional
expiry date and tags). For the **Monday** type, the following fields are additionally required:

| Field | Explanation |
|---|---|
| **url** | The base URL of the monday.com API. Must start with `https://api.monday.com/`; the default value is `https://api.monday.com/v2`. This is **not** the URL of your own account portal, but the fixed API endpoint. |
| **API token** | Your personal monday.com API v2 token. Yres sends it along as the HTTP `Authorization` header on every call. |

**Authentication:** API token as the `Authorization` header. In the generated linked service
the Monday source is defined as a `RestService` with `authenticationType: Anonymous`; the token
is added as `authHeaders.Authorization` and points to a Key Vault secret.

**Integration runtime:** the default **`AutoResolveIntegrationRuntime`** (cloud). monday.com
is a publicly reachable SaaS API, so a self-hosted integration runtime is not required.

## Requirements

- **Create an API token in monday.com.** Create a personal API v2 token in monday.com and keep
  it before you add the source in Yres (see *Retrieving the data* below).
- **Key Vault secret.** Yres never stores the token in the frontend. It is written to the
  Azure Key Vault of your own environment, and from there it is retrieved by the linked service
  as the `Authorization` header. The secret follows the naming convention `adf-{sourcename}-...`
  (in the supplied template `adf-MONDAY-ClientSecret`).

:::tip Token permissions
The token inherits the permissions of the user under whom it was created in monday.com. Create
the token under an account with sufficient read access to the boards you want to expose, and
take into account any expiry date on the token.
:::

## Retrieving the data

- **url** — enter the fixed API endpoint: `https://api.monday.com/v2`. The value must start
  with `https://api.monday.com/`.
- **API token** — log in to monday.com and click your avatar (profile picture) in the top right →
  **Developers** → **My Access Tokens**. Copy your personal API v2 token here (click
  *Show*). Administrators can also find it via **Administration → Connections → Personal API
  token**. The token inherits your own permissions in monday.

Official documentation: [monday.com API authentication](https://developer.monday.com/api-reference/docs/authentication).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
