---
title: SAP Analytics Cloud (SAC)
sidebar_label: SAP Analytics Cloud (SAC)
description: Connecting SAP Analytics Cloud (SAC) to Yres — connection requirements.
---

# SAP Analytics Cloud (SAC)

**Category:** OData  ·  🏅 Official partner

You connect SAP Analytics Cloud to Yres through an OAuth client using the *Client Credentials* grant. Under
the hood, Yres creates two linked services (`{bronnaam}_HTTP` and `{bronnaam}_REST`) and retrieves the data
through your SAC tenant's data-export API. Official partner.

## Expected input

When adding the source, in addition to the standard source fields (see *Requirements* below) you fill in the
following connection fields. The field labels match the input form exactly.

| Field | Description |
|---|---|
| **Url** | The data-export endpoint of your SAC tenant, for example `https://tenant-name.eu10.hcs.cloud.sap/api/v1/dataexport/`. |
| **Authentication url** | The OAuth **token endpoint** of your SAP identity provider, for example `https://tenant-name.authentication.eu10.hana.ondemand.com/oauth/token`. |
| **Client Id** | The OAuth Client ID of the OAuth client created in SAC. |
| **Client Secret** | The matching OAuth Client Secret. |

**Authentication:** OAuth2 *Client Credentials*. Yres uses the Client Id + Client Secret to retrieve a token
from the *Authentication url* and uses that token to reach the data-export endpoint.

**Integration runtime:** **`AutoResolveIntegrationRuntime`** (cloud). SAC is reachable over the internet, so a
self-hosted integration runtime is not needed.

:::note How Yres stores this
The values you enter are not retained by Yres but written as secrets to your environment's Azure Key Vault,
under the names `adf-{bronnaam}-URL`, `adf-{bronnaam}-clientId`, `adf-{bronnaam}-clientsecret` and
`adf-{bronnaam}-AuthURL`. The two linked services (`{bronnaam}_HTTP` and `{bronnaam}_REST`) themselves use
authentication type *Anonymous*; the OAuth token is retrieved in the pipeline and the Key Vault reference to
the client secret is filled in automatically.
:::

## Requirements

- An **OAuth client** in SAP Analytics Cloud with the **Client Credentials** grant (see *Setup*).
- The **Token URL** (Authentication url) and the **data-export URL** of your tenant.
- The **Client ID** and the **Client Secret** of that OAuth client.

## Setup

Create an OAuth client in SAP Analytics Cloud via **System → Administration → App Integration**:

1. Go to **System → Administration → App Integration → Add a New OAuth Client**.
2. Under **Authorization Grant**, choose **Client Credentials**.
3. Save the client. SAC now shows the **OAuth Client ID** and its matching **Secret** — copy both.
4. On the same **App Integration** page, note the **Token URL** (use it as the *Authentication url* in
   Yres).

## Retrieving the data

- **Url** — the data-export endpoint of your tenant. Example:
  `https://tenant-name.eu10.hcs.cloud.sap/api/v1/dataexport/`. Replace `tenant-name` and the region
  (`eu10`) with those of your SAC environment.
- **Authentication url** — the OAuth **token endpoint**. You find it under **System → Administration →
  App Integration**. Example:
  `https://tenant-name.authentication.eu10.hana.ondemand.com/oauth/token`.
- **Client Id + Client Secret** — taken from the OAuth client you created in the *Setup* step
  (the **Client Credentials** grant). After saving, SAC shows the **OAuth Client ID** and the **Secret**.

Official documentation: [SAP Analytics Cloud — Manage OAuth Clients](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/00f68c2e08b941f081002fd3691d86a7/4f43b54398fc4acaa5efa32badfe3df6.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
