---
title: Microsoft Graph
sidebar_label: Microsoft Graph
description: Connecting Microsoft Graph to Yres — connection requirements.
---

# Microsoft Graph

**Category:** OData · REST

Microsoft 365 data via Microsoft Graph (`https://graph.microsoft.com/v1.0`). Graph is the
underlying connection for scenarios such as Teams and Office 365: you register a single
Microsoft Entra ID app (Azure AD) and authenticate with OAuth2.

## Expected input

In the **Add source** wizard you fill in the following fields (frontend preset **Graph**,
form `getFormAddGraph.ts`):

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
`body_url=@odata.nextLink` and `authenticationType=Anonymous` (the OAuth token is fetched by
the pipeline and sent along as a header; pagination follows the Graph `@odata.nextLink`).

### Authentication

**OAuth2 via a Microsoft Entra ID (Azure AD) service principal.** You provide the tenant ID,
client ID and client secret; depending on the **Grant Type**, Yres uses the
client-credential flow (client credentials) or the authorization-code flow (with refresh token).

### Integration runtime

By default the cloud runtime **`AutoResolveIntegrationRuntime`** — Microsoft Graph is publicly
reachable over HTTPS, so this is usually the right choice. A **self-hosted integration
runtime** is only needed if you have to route the traffic through a shielded or on-prem network.

### Where the details end up

The frontend does not store any secrets. The **http URL, client ID, client secret and grant
type** go as secrets to the customer's **Azure Key Vault**, under the group
`adf-{sourcename}-…` (the source name you choose in the wizard becomes the name of the
linked service as well as the prefix of the Key Vault secrets). The **refresh token, scope
and token URL** are kept in the **`Config.Tokens`** table in the customer's DWH database,
where the token flow uses them. The linked services themselves are set to `Anonymous` and
reference only the http-url secret.

## Prerequisites

1. **Register an app in Microsoft Entra ID (Azure AD).** Microsoft Entra admin center →
   **Identity → Applications → App registrations → New registration**.
   - **Client ID** — after registration this appears on the **Overview** page as
     **Application (client) ID**.
   - **Tenant ID** — also on the **Overview** page as **Directory (tenant) ID**.
2. **Create a client secret** under the app → **Certificates & secrets** →
   **New client secret**. Copy the **Value** right away; this value is **only shown
   once**.
3. **Add Microsoft Graph permissions** under **API permissions** (application or
   delegated permissions, depending on your scenario) and have an administrator grant
   **admin consent**.
4. **Decide on the Grant Type.** For service-to-service access (background, without a signed-in
   user) use **Client Credentials**. For access on behalf of a user, use
   **Authorization Code** and additionally supply a **Refresh token**.

> Official documentation: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
