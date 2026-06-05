---
title: SharePoint
sidebar_label: SharePoint
description: SharePoint koppelen aan Yres — verbindingseisen.
---

# SharePoint

**Categorie:** Azure

Microsoft SharePoint-lijsten en -documenten.

## Verbindingseisen

- SharePoint site URL
- AD tenant name
- Postfix
- AD tenant ID
- Application ID / Service principal ID
- Application secret / Service principal key

## Setup

Registreer een app in Azure AD, sla App ID + secret op in Azure Key Vault (in je resource group) en voeg de app toe aan de SharePoint-site via `.../_layouts/15/appinv.aspx` met FullControl-permissie op de site collection.

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
