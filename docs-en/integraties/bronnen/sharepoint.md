---
title: SharePoint
sidebar_label: SharePoint
description: Connect SharePoint to Yres — connection requirements.
---

# SharePoint

**Category:** Azure

Microsoft SharePoint lists and documents.

## Connection requirements

- SharePoint site URL
- AD tenant name
- Postfix
- AD tenant ID
- Application ID / Service principal ID
- Application secret / Service principal key

## Setup

Register an app in Azure AD, store App ID + secret in Azure Key Vault (in your resource group) and add the app to the SharePoint site via `.../_layouts/15/appinv.aspx` with FullControl permission on the site collection.

## Where to find these

SharePoint requires an **Azure AD / Microsoft Entra app registration** as its identity. Create one in the [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**.

- **Application ID / Service principal ID** — after registering, shown on the app's **Overview** page as **Application (client) ID**.
- **AD tenant ID** — also on the **Overview** page as **Directory (tenant) ID**.
- **AD tenant name** — the prefix of your tenant in the form `<tenant>.onmicrosoft.com`. Found in Entra ID → **Overview** (Primary domain) or as the domain in your usernames.
- **Application secret / Service principal key** — create one under the app → **Certificates & secrets** → **Client secrets** → **New client secret**. Copy the **Value** immediately; it is shown only once.
- **SharePoint site URL** — the site you want to access, in the form `https://<tenant>.sharepoint.com/sites/<site>`.
- **Postfix** — the site-specific suffix (the `<site>` part after `/sites/` in the URL above).

Then grant the app access to the site. The classic route is `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx` (enter the App ID → Lookup → grant a permission XML with FullControl on the site collection). For modern, per-site access Microsoft uses the **Sites.Selected** permission model.

> Official documentation: [Register an application in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
