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

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
