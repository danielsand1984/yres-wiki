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

## Gegevens ophalen

SharePoint vereist een **Azure AD / Microsoft Entra app-registratie** als identiteit. Maak die aan in de [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations** → **New registration**.

- **Application ID / Service principal ID** — na registratie zichtbaar op de **Overzicht (Overview)**-pagina van de app als **Application (client) ID**.
- **AD tenant ID** — eveneens op de **Overzicht**-pagina als **Directory (tenant) ID**.
- **AD tenant name** — het prefix van je tenant in de vorm `<tenant>.onmicrosoft.com`. Te vinden in Entra ID → **Overview** (Primary domain) of als domein in je gebruikersnamen.
- **Application secret / Service principal key** — maak een geheim aan onder de app → **Certificates & secrets** → **Client secrets** → **New client secret**. Kopieer de **Value** direct; deze wordt maar één keer getoond.
- **SharePoint site URL** — de site die je wilt ontsluiten, in de vorm `https://<tenant>.sharepoint.com/sites/<site>`.
- **Postfix** — het site-specifieke achtervoegsel (het `<site>`-deel achter `/sites/` in de URL hierboven).

Geef de app vervolgens toegang tot de site. De klassieke route is `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx` (App ID invullen → Lookup → permissie-XML met FullControl op de site collection toekennen). Voor moderne, per-site toegang gebruikt Microsoft het **Sites.Selected**-permissiemodel.

> Officiële documentatie: [Een app registreren in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
