---
title: Dynamics 365
sidebar_label: Dynamics 365
description: Dynamics 365 koppelen aan Yres — verbindingseisen.
---

# Dynamics 365

**Categorie:** Directe koppeling

Microsoft Dynamics 365 (Business Central / Dataverse) wordt als OData-bron gekoppeld met OAuth2-authenticatie (Azure AD / Microsoft Entra ID). Je kiest deze bron via de preset **Dynamics 365** in de wizard *Bron toevoegen*; het verbindingsadres en het token-adres worden grotendeels automatisch opgebouwd uit je tenant en bedrijf, zodat je vooral de OAuth-gegevens van een app-registratie hoeft in te vullen.

## Verwachte input

Naast de gedeelde wizardvelden (**bronnaam**, **integration runtime**, **inloggegevens identiek voor alle omgevingen?**, **verloopdatum inloggegevens**, **tags**) vul je voor Dynamics 365 de volgende velden in:

| Veld | Toelichting |
|---|---|
| **URL** | _Alleen-lezen._ Wordt automatisch opgebouwd (Business Central OData V4) op basis van **tenant** + **bedrijfsnaam**. |
| **Access token URL** | _Alleen-lezen._ Wordt opgebouwd als `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| **Tenant ID** | De directory-/tenant-ID van je Microsoft Entra ID. |
| **Company name** (bedrijfsnaam) | De naam van het Business Central-bedrijf dat je wilt ontsluiten; wordt in de OData-URL verwerkt. |
| **Client ID** | De applicatie-(client-)ID van de geregistreerde app. |
| **Client secret** | Het client secret van de app-registratie (eenmalig zichtbaar bij aanmaken). |
| **Scope** | De OAuth-scope voor de tokenaanvraag. |
| **Grant Type** | `Client Credentials` of `Authorization Code`. Bij **Authorization Code** verschijnt een extra veld **Refresh token**. |

Vast ingestelde (verborgen) parameters: paginatie `paginationType=BodyUrl` met `body_url=@odata.nextLink` (Yres volgt automatisch de `@odata.nextLink`-paginering van de OData-feed).

**Authenticatiemethode:** OAuth2 via een Azure AD / Microsoft Entra ID service principal — client credentials of authorization-code (met refresh token).

**Integration runtime:** standaard de cloud-runtime **`AutoResolveIntegrationRuntime`**. Een self-hosted IR is niet nodig, omdat de OData-endpoints publiek via internet bereikbaar zijn.

**Opslag van geheimen:** Yres bewaart nooit zelf wachtwoorden of secrets. De ingevulde waarden worden als secrets in de **Azure Key Vault** van je eigen omgeving gezet, volgens het patroon `adf-{bronnaam}-{suffix}`; de linked service in Azure Data Factory verwijst naar die secrets.

## Voorbereiding

- **App registreren in Microsoft Entra ID** — Registreer in het Azure-portaal → **App registrations** een applicatie. Op *Overview* vind je de **client ID** en de **tenant ID**.
- **Client secret aanmaken** — Maak onder **Certificates & secrets** een **client secret** aan en kopieer dit direct (het is later niet meer zichtbaar).
- **Rechten op Dynamics CRM/Dataverse** — Wijs de app de benodigde API-permissies toe voor Dynamics CRM/Dataverse (bijv. `user_impersonation`) met admin-consent.
- **Bedrijf en tenant** — Houd de **tenant ID** en de **bedrijfsnaam** (Business Central company) bij de hand; deze bepalen samen de automatisch opgebouwde OData-URL.

:::info Te bevestigen
Deze preset wordt in de webapp opgeslagen als backend-type **`OData`**, maar het formulier levert OAuth-velden aan (`client_id`, `token_url`, `grant_type`, `refresh_token`). De standaard `ODataSource`-builder verwerkt alleen Anonymous/Basic-authenticatie. Of deze bron bij deployment daadwerkelijk via `ODataOAuthSource` (of een ouder code-pad) wordt afgehandeld, is **niet te bevestigen** vanuit de data-plane-repositories. Verifieer de deploy-routing voordat je hierop bouwt.
:::

## Load-types en delta

Dynamics 365 wordt als OData-bron ontsloten. Metadata-discovery verloopt via de standaard `GetMetaData`-pipeline; daarna stel je per tabel het load-type en de eventuele delta-/sleutelkolommen in zoals bij andere OData-bronnen. De OData-feed wordt automatisch gepagineerd via `@odata.nextLink`.

Officiële docs: [Register an app with Microsoft Entra ID (Microsoft Dataverse) — Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
