---
title: NetSuite
sidebar_label: NetSuite
description: Connecting NetSuite to Yres — connection requirements.
---

# NetSuite

**Category:** REST · Dedicated ADF connector

Oracle NetSuite (ERP/CRM). Yres connects through NetSuite's **SuiteTalk REST API** using **Token-Based Authentication (TBA)**. NetSuite has its own dedicated ADF connector — linked services `NetSuite` (`RestService`) and `NetSuite_HTTP` (`HttpServer`), datasets `NetSuite_MAIN`/`NetSuite_HTTP`, the pipeline **`Dynamic Pipeline YRES - NetSuite`** and the metadata pipeline **`GetMetaData - NetSuite`** (all in the ADF folder `PW - Yres/Sources/NetSuite`).

:::info To be confirmed
NetSuite has (version 1.55) **no selectable item in the "Add source" wizard** (`CreateSource.tsx`) — unlike most sources, it is therefore currently **not a self-service selectable source**, but a dedicated/sample connector that is configured in collaboration with Yres. The fields below are derived from the ADF linked services, datasets and pipelines; confirm with Yres whether NetSuite is available as a selectable source for your environment and which input form applies.
:::

## Expected input

Yres builds the NetSuite connection on the SuiteTalk REST API. The following values are required; in a self-service form they would be requested as fields, otherwise they are set up by Yres. The shared source fields from step 1 also apply (**source name**, **type**, **integration runtime**, **credentials the same for all environments?**, **credentials expiry date**, **tags**).

| Value | Explanation |
|---|---|
| **Source name** | Name of the source (unique per organization, 2–45 characters, starts with a letter). Becomes the name of the ADF linked service and the prefix of the Key Vault secrets (`adf-{name}-…`). |
| **Base URL** | The account-specific SuiteTalk REST URL: `https://<account-id>.suitetalk.api.netsuite.com` (for example `https://td2872575.suitetalk.api.netsuite.com`). The `<account-id>` part is your NetSuite Account ID (lowercase, with `_` instead of dots/hyphens). Stored as `adf-{name}-baseUrl`. |
| **Consumer Key** | The Consumer Key of the **Integration Record** (linked NetSuite application). Stored as `adf-{name}-consumerKey`. |
| **Consumer Secret** | The Consumer Secret of the Integration Record. Stored as `adf-{name}-consumerSecret`. |
| **Token ID** | The Token ID (oAuth token) of the **Access Token** that is linked to the integration and role. Stored as `adf-{name}-oAuthToken`. |
| **Token Secret** | The Token Secret of the Access Token. Stored as `adf-{name}-oAuthSecret`. |

**Authentication:** **NetSuite Token-Based Authentication (TBA)** — an OAuth 1.0a flow with **`HMAC-SHA256`** signing. Yres computes the `Authorization: OAuth …` header itself for each request, using the function `LoadManagement.fxCreateNetsuiteAuthHeader` (based on Consumer Key/Secret, Token ID/Secret, account `realm`, timestamp and nonce). The four credential values (Consumer Key, Consumer Secret, Token ID, Token Secret) plus the Base URL are retrieved from the Azure Key Vault.

:::note
In the published linked services, `authenticationType: Anonymous` is set. This is **not** an anonymous connection: the actual authentication is added at runtime via the computed TBA header (`fxCreateNetsuiteAuthHeader`) and the Key Vault secrets. The `Anonymous` value and the sample account ID left behind in the connector (`td2872575`) are seed/sample data, not customer values.
:::

**Integration runtime:** by default the cloud IR **`AutoResolveIntegrationRuntime`** — the SuiteTalk REST API is publicly reachable. A self-hosted IR is only needed when you want to route the outbound traffic through your own network; the chosen IR is recorded in the linked service (`connectVia`).

## Obtaining the data

You create all credentials in NetSuite itself. First enable **Token-Based Authentication** via **Setup → Company → Enable Features → SuiteCloud → Manage Authentication → Token-Based Authentication**.

- **Account ID (Base URL):** you can find your NetSuite Account ID in **Setup → Company → Company Information** (field *Account ID*). The REST host is `https://<account-id>.suitetalk.api.netsuite.com`, where in the host you replace dots/hyphens with `_` (for example account `TD2872575` → `td2872575`).
- **Consumer Key + Consumer Secret:** create an **Integration Record** via **Setup → Integration → Manage Integrations → New**. Enable **Token-Based Authentication**; on saving, NetSuite shows the **Consumer Key** and **Consumer Secret** once (store these immediately, they cannot be retrieved afterwards).
- **Token ID + Token Secret:** create an **Access Token** via **Setup → Users/Roles → Access Tokens → New**, linked to the integration, a user and a role with REST permissions. On saving, NetSuite shows the **Token ID** and **Token Secret** once.

**Data and metadata:** Yres retrieves records with **SuiteQL** via the endpoint `query/v1/suiteql/` (dataset `NetSuite_MAIN`, with pagination via `offset`/`limit`). Field and object metadata comes from the **REST metadata catalog** (`record/v1/metadata-catalog/…`, dataset `NetSuite_HTTP`). The pipeline **`GetMetaData - NetSuite`** uses this to populate `LoadManagement.Dictionary`, so that you can then select tables; this metadata step must therefore have run before adding tables. The role attached to the Access Token must have read permissions on the records and fields you want to retrieve.

Official documentation: [NetSuite — SuiteTalk REST Web Services & Token-Based Authentication](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_1545222128.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
