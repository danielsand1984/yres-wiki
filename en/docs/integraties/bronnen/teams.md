---
title: Microsoft Teams
sidebar_label: Microsoft Teams
description: Connecting Microsoft Teams to Yres — connection requirements.
---

# Microsoft Teams

**Category:** Microsoft platform (Entra ID / Graph)

Microsoft Teams is **not a standalone, direct connector**: the data is exposed under the hood via the
**Microsoft Graph API** (`https://graph.microsoft.com/v1.0`). You register a single
**Microsoft Entra ID app (Azure AD)** with the appropriate Graph permissions and authenticate with OAuth2.
In the wizard you select the **Graph** preset for this; you reach Teams, channel and message data via the
Graph endpoints. See also the source [Microsoft Graph](microsoft-graph.md), which describes the same
connection at a more general level.

## Expected input

In the **Add source** wizard you select the Graph preset and fill in the following fields
(frontend preset **Graph**, form `getFormAddGraph.ts`):

| Field | Description |
|---|---|
| **URL** | Read-only; fixed at `https://graph.microsoft.com/v1.0`. |
| **Token URL** | Read-only; automatically assembled from your tenant: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| **Tenant ID** | The Directory (tenant) ID of your Microsoft Entra tenant (GUID). |
| **Client ID** | The Application (client) ID of the registered app (GUID). |
| **Client Secret** | The app's client secret (treated as a secret). |
| **Scope** | The OAuth scope, e.g. `https://graph.microsoft.com/.default`. |
| **Grant Type** | Choice of `Client Credentials` or `Authorization Code`. With **Authorization Code**, an additional **Refresh token** field appears (required). |

Hidden, fixed values for this source: `paginationType=BodyUrl`,
`body_url=@odata.nextLink` and `authenticationType=Anonymous` (the OAuth token is fetched by the
pipeline and sent along as a header; pagination follows the Graph `@odata.nextLink`).

### Authentication

**OAuth2 via a Microsoft Entra ID (Azure AD) service principal.** You provide the tenant ID, client ID
and client secret. Depending on the **Grant Type**, Yres uses the client-credential flow
(service-to-service, without a signed-in user) or the authorization-code flow (with refresh token,
on behalf of a user). Access to Teams data is governed by the Microsoft Graph
**application permissions** you assign to the Entra app (see Prerequisites).

### Integration runtime

By default the cloud runtime **`AutoResolveIntegrationRuntime`** — Microsoft Graph is publicly
reachable over HTTPS, so this is usually the right choice. A **self-hosted integration runtime**
is only needed if you have to route the traffic through a shielded or on-prem network.

### Secrets in Key Vault

The frontend does not store any secrets. The values you enter go to the customer's **Azure Key Vault**
and are referenced from the linked service. The secrets are written under the group
`adf-{sourcename}-…` (the source name you choose in the wizard becomes the name of the linked service as
well as the prefix of the Key Vault secrets).

:::info To be confirmed
The Graph preset is stored in the backend as source type **`OData`**, while the form supplies
OAuth fields (`client_id`, `token_url`, `grant_type`, `refresh_token`). The corresponding
ADF templates are `linkedService/ODataoAuth_HTTP.json` and `ODataoAuth_REST.json` (both pointing at
`https://graph.microsoft.com/v1.0/`). Exactly which deploy path processes the OAuth credentials (the
OAuth builder versus the general OData builder) is handled in the shielded backend and cannot be fully
confirmed from the data-plane repos.
:::

## Prerequisites

1. **Register an app in Microsoft Entra ID (Azure AD).** Microsoft Entra admin center →
   **Identity → Applications → App registrations → New registration**.
   - **Client ID** — after registration this appears on the **Overview** page as
     **Application (client) ID**.
   - **Tenant ID** — also on the **Overview** page as **Directory (tenant) ID**.
2. **Create a client secret** under the app → **Certificates & secrets** →
   **New client secret**. Copy the **Value** right away; this value is **only shown once**.
3. **Add Microsoft Graph permissions for Teams** under **API permissions** → **Microsoft Graph**.
   For reading teams, channels and messages, these are permissions such as
   `Channel.ReadBasic.All`, `Team.ReadBasic.All` or `ChannelMessage.Read.All` (choose the scopes that
   fit your scenario). Application permissions grant tenant-wide access without the app having to be a
   member of a team. Have an administrator grant **admin consent**.
4. **Decide on the Grant Type.** For service-to-service access (background, without a signed-in user)
   use **Client Credentials**. For access on behalf of a user, use **Authorization Code** and
   additionally supply a **Refresh token**.

> Official documentation: [Use the Microsoft Graph API to work with Microsoft Teams](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview) · [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)

---

**See also:** [Microsoft Graph](microsoft-graph.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
