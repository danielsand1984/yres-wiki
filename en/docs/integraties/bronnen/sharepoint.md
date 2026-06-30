---
title: SharePoint
sidebar_label: SharePoint
description: Connecting SharePoint to Yres — connection requirements.
---

# SharePoint

**Category:** Azure

Microsoft SharePoint lists and documents. SharePoint is a file source: after connecting you
select files (there is no metadata refresh of tables).

## Expected input

In the **Add source** wizard you fill in the following fields (form
`getFormAddSourceSharePoint.ts`):

| Field | Description |
|---|---|
| **SharePoint site URL** | Read-only; automatically assembled as `https://<tenant>.sharepoint.com/<postfix>`. |
| **AD tenant name** | The tenant name (the `<tenant>` part of `https://<tenant>.sharepoint.com`). |
| **Postfix** | The path suffix: `sites`, `teams`, `personal` or empty. Determines where the site/team is located. |
| **AD tenant ID** | The Directory (tenant) ID of your Microsoft Entra tenant (GUID). |
| **Application ID / Service principal ID** | The Application (client) ID of the registered app (GUID). |
| **Application secret / Service principal key** | The app's client secret (treated as a secret). |

The `postfix` is also incorporated into the relative dataset URLs (`sites`/`teams`/`personal`).

### Authentication

**Azure AD / Microsoft Entra service principal (app-only).** You register an app, grant it
access to the SharePoint site, and provide the client ID, client secret and tenant ID.

:::note Authentication implementation
The linked service is created in ADF as `HttpServer` with `authenticationType: Anonymous`
(template `linkedService/Sharepoint.json`); the actual service-principal authentication is
handled by the metadata and data pipelines based on the stored `clientId`, `clientSecret`
and `tenantId`. This is an implementation detail of the (shielded) backend.
:::

### Integration runtime

By default the cloud runtime **`AutoResolveIntegrationRuntime`** — SharePoint Online is
publicly reachable, so this is usually the right choice. The chosen runtime is written into the
linked service via `withConnectVia`; a **self-hosted integration runtime** is only needed if you
reach the source through a shielded network.

### Secrets in Key Vault

The frontend does not store any secrets. The values you enter go to the customer's **Azure Key
Vault** and are referenced from the linked service. SharePoint writes the following secrets under
the group `adf-{sourcename}-…`:

- `adf-{bronnaam}-http-url`
- `adf-{bronnaam}-clientId`
- `adf-{bronnaam}-clientSecret`
- `adf-{bronnaam}-tenantId`
- `adf-{bronnaam}-tenantName`

(The source name you choose in the wizard becomes the name of the linked service as well as the
prefix of the Key Vault secrets.)

## Prerequisites

1. **Register an app in Microsoft Entra ID (Azure AD).** Azure Portal → **Microsoft Entra ID** →
   **App registrations** → **New registration**.
   - **Application ID / Service principal ID** — after registration this appears on the **Overview** page as **Application (client) ID**.
   - **AD tenant ID** — also on the **Overview** page as **Directory (tenant) ID**.
   - **AD tenant name** — the `<tenant>` prefix of your tenant (e.g. `<tenant>.onmicrosoft.com` or `<tenant>.sharepoint.com`).
2. **Create a client secret** under the app → **Certificates & secrets** → **Client secrets** →
   **New client secret**. Copy the **Value** right away; this value is only shown once.
3. **Store the App ID + secret in Azure Key Vault** (in the environment's resource group) — this
   happens automatically via the wizard.
4. **Grant the app access to the site.** The classic route is
   `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx`: enter the App ID → **Lookup**
   → assign a permission XML with **FullControl** on the site collection
   (`http://sharepoint/content/sitecollection/web`).

> Official documentation: [Register an app in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
