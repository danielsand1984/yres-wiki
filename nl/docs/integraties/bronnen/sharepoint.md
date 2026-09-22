---
title: SharePoint
sidebar_label: SharePoint
description: SharePoint koppelen aan Yres — verbindingseisen.
---

# SharePoint

**Categorie:** Azure

Bestanden uit Microsoft SharePoint-**documentbibliotheken**. SharePoint is een bestandsbron: na het
koppelen selecteer je bestanden (geen metadata-refresh van tabellen). SharePoint-*lijsten* worden niet
uitgelezen.

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

**Microsoft Entra service principal (app-only), via Microsoft Graph.** Je registreert een app, geeft die
leesrechten op SharePoint en levert client ID, client secret en tenant ID aan.

:::note Sinds v1.56 via Microsoft Graph
Yres haalde SharePoint-bestanden vroeger op via het **Azure ACS**-tokenendpoint
(`accounts.accesscontrol.windows.net`) en de SharePoint REST-API. Microsoft heeft die app-only-flow
buiten werking gesteld, waardoor SharePoint-loads faalden. Vanaf v1.56 haalt Yres het token bij
`login.microsoftonline.com` op en benadert het bestanden via **Microsoft Graph** (site → documentbibliotheek
→ bestand). De op te geven velden en de Key Vault-geheimen zijn ongewijzigd; wat wél verandert zijn de
**rechten die de app nodig heeft** — zie [Vereisten](#vereisten-prerequisites).
:::

:::note Authenticatie-implementatie
De linked service wordt in ADF aangemaakt als `HttpServer` met `authenticationType: Anonymous`
(template `linkedService/Sharepoint.json`); de daadwerkelijke service-principal-authenticatie wordt
afgehandeld door de metadata- en data-pipelines op basis van de opgeslagen `clientId`, `clientSecret`
en `tenantId`. Dit is een implementatiedetail van de (afgeschermde) backend.
:::

### Hoe Yres een bestand terugvindt

Yres leidt het pad naar een bestand in drie stappen af uit je configuratie:

1. **De site** — de sitenaam (`stageCategory`) wordt gecombineerd met je tenantnaam tot de Graph-site.
2. **De documentbibliotheek** — het **eerste padsegment** van de bestandslocatie wordt opgevat als de
   naam van de documentbibliotheek (drive) binnen die site.
3. **Het bestand** — de rest van de bestandslocatie plus de bestandsnaam is het pad bínnen die
   bibliotheek.

:::caution Bestandslocatie moet met de bibliotheek beginnen
Omdat het eerste segment de documentbibliotheek aanwijst, moet de bestandslocatie er ook één bevatten —
bijvoorbeeld `Gedeelde documenten/Financieel/`. Staat er alleen een mapnaam zonder bibliotheek, dan vindt
Yres geen bijbehorende bibliotheek en faalt de stap.
:::

Het bestand wordt vervolgens in twee stappen geladen: eerst als binaire kopie naar de Blob Storage van de
omgeving, daarna van daaruit ingelezen in `STAGE`. De tussenkopie wordt na afloop automatisch opgeruimd.

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

## Vereisten (prerequisites) {#vereisten-prerequisites}

1. **Registreer een app in Microsoft Entra ID (Azure AD).** Azure Portal → **Microsoft Entra ID** →
   **App registrations** → **New registration**.
   - **Application ID / Service principal ID** — staat na registratie op de **Overzicht (Overview)**-pagina als **Application (client) ID**.
   - **AD tenant ID** — eveneens op de **Overzicht**-pagina als **Directory (tenant) ID**.
   - **AD tenant name** — het `<tenant>`-prefix van je tenant (bv. `<tenant>.onmicrosoft.com` of `<tenant>.sharepoint.com`).
2. **Maak een client secret aan** onder de app → **Certificates & secrets** → **Client secrets** →
   **New client secret**. Kopieer de **Value** direct; deze wordt maar één keer getoond.
3. **Sla App ID + secret op in Azure Key Vault** (in de resource group van de omgeving) — dit verloopt
   automatisch via de wizard.
4. **Geef de app leesrechten via Microsoft Graph.** App → **API permissions** → **Add a permission** →
   **Microsoft Graph** → **Application permissions** → minimaal **`Sites.Read.All`**. Klik daarna op
   **Grant admin consent**; zonder die goedkeuring blijft de app rechteloos.

   :::warning De oude appinv.aspx-route werkt niet meer
   Tot v1.55 gaf je de app rechten via `https://<tenant>.sharepoint.com/sites/<site>/_layouts/15/appinv.aspx`
   met een permissie-XML (SharePoint app-only via Azure ACS). Microsoft heeft die flow uitgezet. Bestaande
   koppelingen die alleen op die manier gemachtigd zijn, moeten Graph-rechten krijgen zoals hierboven.
   :::

> Officiële documentatie: [Een app registreren in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
