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

**Microsoft Entra service principal (app-only), through Microsoft Graph.** You register an app, grant it
read access to SharePoint, and provide the client ID, client secret and tenant ID.

:::note Through Microsoft Graph since v1.56
Yres used to fetch SharePoint files through the **Azure ACS** token endpoint
(`accounts.accesscontrol.windows.net`) and the SharePoint REST API. Microsoft has retired that app-only
flow, which made SharePoint loads fail. From v1.56 Yres obtains its token at `login.microsoftonline.com`
and reaches files through **Microsoft Graph** (site → document library → file). The fields you enter and
the Key Vault secrets are unchanged; what does change are the **permissions the app needs** — see
[Prerequisites](#prerequisites).
:::

### How Yres locates a file

Yres derives the path to a file from your configuration in three steps:

1. **The site** — the site name (`stageCategory`) is combined with your tenant name into the Graph site.
2. **The document library** — the **first path segment** of the file location is taken as the name of the
   document library (drive) within that site.
3. **The file** — the rest of the file location plus the file name is the path *inside* that library.

:::caution The file location must start with the library
Because the first segment identifies the document library, the file location has to contain one — for
example `Shared Documents/Finance/`. If it holds only a folder name without a library, Yres finds no
matching library and the step fails.
:::

The file is then loaded in two steps: first as a binary copy into the environment's Blob Storage, then
read from there into `STAGE`. The intermediate copy is cleaned up automatically afterwards.

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
4. **Grant the app read access through Microsoft Graph.** App → **API permissions** → **Add a permission**
   → **Microsoft Graph** → **Application permissions** → at least **`Sites.Read.All`**. Then click
   **Grant admin consent**; without that approval the app stays unauthorized.

   :::warning The old appinv.aspx route no longer works
   Up to v1.55 you granted the app rights through `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx`
   with a permission XML (SharePoint app-only through Azure ACS). Microsoft has switched that flow off.
   Existing connections authorized only that way need Graph permissions as described above.
   :::

> Official documentation: [Register an app in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
