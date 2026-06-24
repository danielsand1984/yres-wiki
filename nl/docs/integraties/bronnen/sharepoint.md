---
title: SharePoint
sidebar_label: SharePoint
description: SharePoint koppelen aan Yres — verbindingseisen.
---

# SharePoint

**Categorie:** Azure

Microsoft SharePoint-lijsten en -documenten. SharePoint is een bestandsbron: na het koppelen
selecteer je bestanden (geen metadata-refresh van tabellen).

## Verwachte input

In de wizard **Bron toevoegen** vul je de volgende velden in (formulier
`getFormAddSourceSharePoint.ts`):

| Veld | Toelichting |
|---|---|
| **SharePoint site URL** | Alleen-lezen; automatisch samengesteld als `https://<tenant>.sharepoint.com/<postfix>`. |
| **AD tenant name** | De tenantnaam (het `<tenant>`-deel van `https://<tenant>.sharepoint.com`). |
| **Postfix** | Het pad-achtervoegsel: `sites`, `teams`, `personal` of leeg. Bepaalt waar de site/team staat. |
| **AD tenant ID** | De Directory (tenant) ID van je Microsoft Entra-tenant (GUID). |
| **Application ID / Service principal ID** | De Application (client) ID van de geregistreerde app (GUID). |
| **Application secret / Service principal key** | Het client secret van de app (wordt als geheim behandeld). |

De `postfix` wordt ook in de relatieve dataset-URL's verwerkt (`sites`/`teams`/`personal`).

### Authenticatie

**Azure AD / Microsoft Entra service principal (app-only).** Je registreert een app, geeft die
toegang tot de SharePoint-site en levert client ID, client secret en tenant ID aan.

:::info Te bevestigen
De linked service wordt in ADF aangemaakt als `HttpServer` met `authenticationType: Anonymous`
(template `linkedService/Sharepoint.json`); de daadwerkelijke service-principal-authenticatie wordt
afgehandeld door de metadata- en data-pipelines op basis van de opgeslagen `clientId`, `clientSecret`
en `tenantId`. Dit is een implementatiedetail van de (afgeschermde) backend.
:::

### Integration runtime

Standaard de cloud-runtime **`AutoResolveIntegrationRuntime`** — SharePoint Online is publiek
bereikbaar, dus dit is doorgaans de juiste keuze. De gekozen runtime wordt via `withConnectVia` in de
linked service geschreven; een **self-hosted integration runtime** is alleen nodig als je de bron via
een afgeschermd netwerk benadert.

### Geheimen in Key Vault

De frontend slaat geen geheimen op. De ingevoerde waarden gaan naar de **Azure Key Vault** van de klant
en worden vanuit de linked service gerefereerd. SharePoint schrijft de volgende geheimen weg onder de
groep `adf-{bronnaam}-…`:

- `adf-{bronnaam}-http-url`
- `adf-{bronnaam}-clientId`
- `adf-{bronnaam}-clientSecret`
- `adf-{bronnaam}-tenantId`
- `adf-{bronnaam}-tenantName`

(De bronnaam die je in de wizard kiest, wordt de naam van de linked service én de prefix van de
Key Vault-geheimen.)

## Vereisten (prerequisites)

1. **Registreer een app in Microsoft Entra ID (Azure AD).** Azure Portal → **Microsoft Entra ID** →
   **App registrations** → **New registration**.
   - **Application ID / Service principal ID** — staat na registratie op de **Overzicht (Overview)**-pagina als **Application (client) ID**.
   - **AD tenant ID** — eveneens op de **Overzicht**-pagina als **Directory (tenant) ID**.
   - **AD tenant name** — het `<tenant>`-prefix van je tenant (bv. `<tenant>.onmicrosoft.com` of `<tenant>.sharepoint.com`).
2. **Maak een client secret aan** onder de app → **Certificates & secrets** → **Client secrets** →
   **New client secret**. Kopieer de **Value** direct; deze wordt maar één keer getoond.
3. **Sla App ID + secret op in Azure Key Vault** (in de resource group van de omgeving) — dit verloopt
   automatisch via de wizard.
4. **Geef de app toegang tot de site.** De klassieke route is
   `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx`: vul de App ID in → **Lookup**
   → ken een permissie-XML toe met **FullControl** op de site collection
   (`http://sharepoint/content/sitecollection/web`).

> Officiële documentatie: [Een app registreren in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
