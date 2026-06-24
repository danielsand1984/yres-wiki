---
title: Salesforce
sidebar_label: Salesforce
description: Connecting Salesforce to Yres — connection requirements.
---

# Salesforce

**Category:** Direct connection · REST

CRM platform. Yres connects via the Salesforce connector (`SalesforceV2`) using OAuth2 client-credential authentication.

## Expected input

When adding the source, fill in the following fields on the form:

| Field | Description |
|---|---|
| **Source name** | Name of the source (unique per organization, 2–45 characters, starts with a letter). Becomes the name of the ADF linked service and the prefix of the Key Vault secrets (`adf-{name}-…`). |
| **Environment url** | Your Salesforce My Domain / login URL, for example `https://<mycompany>.my.salesforce.com`. |
| **Client Id** | The **Consumer Key** of your Connected App. |
| **Client Secret** | The **Consumer Secret** of your Connected App. |

In addition, the shared source fields requested for every source apply: **integration runtime**, **credentials identical across all environments? (Yes/No)**, **credentials expiry date** (optional) and **tags** (optional).

**Authentication:** OAuth2 client-credential (`authenticationType: OAuth2ClientCredential`). With this, Yres builds a `SalesforceV2` linked service (API version `60.0`) for the data, plus an additional anonymous HTTP linked service (`{name}_HTTP`) for retrieving metadata.

**Integration runtime:** by default the cloud IR **`AutoResolveIntegrationRuntime`** — Salesforce is publicly reachable. A self-hosted IR is only needed when you want to route the outbound traffic through your own network; the chosen IR is recorded in the linked service (`connectVia`).

**Delta columns:** Salesforce is among the SQL sources that support **two delta columns**. The standard load types (FULL/DELTA/OVERWRITE/RELOAD/IMAGE/ADDITIONAL) work as usual.

## Prerequisites

- A **Connected App** in Salesforce with **OAuth settings enabled** and configured with **Client Credentials** as the grant type.
- The **Consumer Key** (Client Id) and **Consumer Secret** (Client secret) from the App Manager.
- The correct **OAuth scopes** and an authorized run-as user for the client-credentials flow (see the Salesforce documentation).

Yres never stores credentials itself: the entered values go to the customer's Azure Key Vault and are retrieved by the linked service. The secrets are stored under the prefix `adf-{name}-` (including the Environment url, Client Id and Client secret).

## Obtaining the details

- **Environment url** — this is your Salesforce My Domain / login URL, for example `https://<mycompany>.my.salesforce.com`. You can find your My Domain under **Setup → Company Settings → My Domain**.
- **Client Id (Consumer Key) + Client secret (Consumer Secret)** — create a **Connected App** via **Setup → App Manager → New Connected App**. Turn on **Enable OAuth Settings**, choose **Client Credentials** as the OAuth flow, enter a callback URL and the desired OAuth scopes, and save. Then open the app in App Manager → **Manage Consumer Details** to view and copy the **Consumer Key** (Client Id) and **Consumer Secret** (Client secret).

Official documentation: [Salesforce — Connected App / OAuth client credentials](https://help.salesforce.com/s/articleView?id=xcloud.connected_app_client_credentials_setup.htm&type=5).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
