---
title: Dynamics 365
sidebar_label: Dynamics 365
description: Connect Dynamics 365 to Yres — connection requirements.
---

# Dynamics 365

**Category:** Direct connection

Microsoft Dynamics 365 (Business Central / Dataverse) is connected as an **OData source**. You select this source via the **Dynamics 365** preset in the *Add source* wizard; the connection address and the token address are mostly built automatically from your tenant and company.

:::caution OAuth2 support in development
The OAuth2 flow is currently **not yet executed**. The source is stored as a bare
**OData** type: at deploy time Yres only writes the http URL (and any basic
credentials) to Key Vault, and the OData pipelines perform no token flow. The wizard
form already shows OAuth fields (tenant, client ID/secret, scope, grant type), but
the deploy does not process them yet. Full OAuth2 support for Dynamics 365 is
**in development**.
:::

## Expected input

Besides the shared wizard fields (**source name**, **integration runtime**, **credentials identical for all environments?**, **credential expiry date**, **tags**), you fill in the following fields for Dynamics 365:

| Field | Notes |
|---|---|
| **URL** | _Read-only._ Built automatically (Business Central OData V4) from the **tenant** + **company name**. |
| **Access token URL** | _Read-only._ Built as `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| **Tenant ID** | The directory/tenant ID of your Microsoft Entra ID. |
| **Company name** | The name of the Business Central company you want to expose; it is woven into the OData URL. |
| **Client ID** | The application (client) ID of the registered app. |
| **Client secret** | The client secret of the app registration (shown only once when created). |
| **Scope** | The OAuth scope for the token request. |
| **Grant Type** | `Client Credentials` or `Authorization Code`. With **Authorization Code**, an extra **Refresh token** field appears. |

Fixed (hidden) parameters: pagination `paginationType=BodyUrl` with `body_url=@odata.nextLink` (Yres automatically follows the `@odata.nextLink` pagination of the OData feed).

**Authentication method:** the form asks for OAuth2 details of an Azure AD / Microsoft Entra ID service principal (client credentials or authorization code with refresh token), but the connection currently runs as a **bare OData connection without a token flow** — see the caution above.

**Integration runtime:** by default the cloud runtime **`AutoResolveIntegrationRuntime`**. A self-hosted IR is not needed, because the OData endpoints are publicly reachable over the internet.

**Where secrets are stored:** Yres never stores passwords or secrets itself. With the current OData deploy, only the **http URL** (and any basic credentials) is placed as a secret in the **Azure Key Vault** of your own environment, following the pattern `adf-{sourcename}-{suffix}`; the linked service in Azure Data Factory references those secrets. The OAuth fields from the form are not yet written to Key Vault.

## Preparation

- **Register an app in Microsoft Entra ID** — In the Azure portal → **App registrations**, register an application. On *Overview* you will find the **client ID** and the **tenant ID**.
- **Create a client secret** — Under **Certificates & secrets**, create a **client secret** and copy it immediately (it is no longer visible afterwards).
- **Permissions on Dynamics CRM/Dataverse** — Assign the app the required API permissions for Dynamics CRM/Dataverse (e.g. `user_impersonation`) with admin consent.
- **Company and tenant** — Keep the **tenant ID** and the **company name** (Business Central company) at hand; together they determine the automatically built OData URL.

## Load types & delta

Dynamics 365 is exposed as an OData source. Metadata discovery runs through the standard `GetMetaData` pipeline; after that you set the load type and any delta/key columns per table, just like with other OData sources. The OData feed is paginated automatically via `@odata.nextLink`.

Official documentation: [Register an app with Microsoft Entra ID (Microsoft Dataverse) — Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
