---
title: Microsoft Teams
sidebar_label: Microsoft Teams
description: Microsoft Teams koppelen aan Yres — verbindingseisen.
---

# Microsoft Teams

**Categorie:** Microsoft-platform (Entra ID / Graph)

Microsoft Teams is **geen losse, directe connector**: de data wordt onder water via de
**Microsoft Graph API** (`https://graph.microsoft.com/v1.0`) ontsloten. Je registreert één
**Microsoft Entra ID-app (Azure AD)** met de juiste Graph-permissies en authenticeert met OAuth2.
In de wizard kies je hiervoor de **Graph**-preset; Teams-, kanaal- en berichtdata bereik je via de
Graph-endpoints. Zie ook de bron [Microsoft Graph](microsoft-graph.md), die dezelfde koppeling op
een algemener niveau beschrijft.

## Verwachte input

In de wizard **Bron toevoegen** kies je de Graph-preset en vul je de volgende velden in
(frontend-preset **Graph**, formulier `getFormAddGraph.ts`):

| Veld | Toelichting |
|---|---|
| **URL** | Alleen-lezen; vast op `https://graph.microsoft.com/v1.0`. |
| **Token URL** | Alleen-lezen; automatisch samengesteld uit je tenant: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`. |
| **Tenant ID** | De Directory (tenant) ID van je Microsoft Entra-tenant (GUID). |
| **Client ID** | De Application (client) ID van de geregistreerde app (GUID). |
| **Client Secret** | Het client secret van de app (wordt als geheim behandeld). |
| **Scope** | De OAuth-scope, bijv. `https://graph.microsoft.com/.default`. |
| **Grant Type** | Keuze `Client Credentials` of `Authorization Code`. Bij **Authorization Code** verschijnt een extra veld **Refresh token** (verplicht). |

Verborgen, vast ingestelde waarden voor deze bron: `paginationType=BodyUrl`,
`body_url=@odata.nextLink` en `authenticationType=Anonymous` (de OAuth-token wordt door de
pipeline opgehaald en als header meegestuurd; paginering volgt de Graph-`@odata.nextLink`).

### Authenticatie

**OAuth2 via een Microsoft Entra ID (Azure AD) service principal.** Je levert tenant ID, client ID
en client secret aan. Afhankelijk van **Grant Type** gebruikt Yres de client-credential-flow
(service-to-service, zonder ingelogde gebruiker) of de authorization-code-flow (met refresh token,
namens een gebruiker). De toegang tot Teams-data wordt geregeld via de Microsoft Graph
**app-permissies** die je aan de Entra-app toekent (zie Vereisten).

### Integration runtime

Standaard de cloud-runtime **`AutoResolveIntegrationRuntime`** — Microsoft Graph is publiek
bereikbaar over HTTPS, dus dit is doorgaans de juiste keuze. Een **self-hosted integration runtime**
is alleen nodig als je het verkeer via een afgeschermd of on-prem netwerk moet routeren.

### Geheimen in Key Vault

De frontend slaat geen geheimen op. De ingevoerde waarden gaan naar de **Azure Key Vault** van de
klant en worden vanuit de linked service gerefereerd. De geheimen worden weggeschreven onder de groep
`adf-{bronnaam}-…` (de bronnaam die je in de wizard kiest, wordt de naam van de linked service én de
prefix van de Key Vault-geheimen).

:::info Te bevestigen
De Graph-preset wordt in de backend opgeslagen als brontype **`OData`**, terwijl het formulier
OAuth-velden (`client_id`, `token_url`, `grant_type`, `refresh_token`) aanlevert. De bijbehorende
ADF-templates zijn `linkedService/ODataoAuth_HTTP.json` en `ODataoAuth_REST.json` (beide gericht op
`https://graph.microsoft.com/v1.0/`). Welk deploy-pad de OAuth-credentials precies verwerkt (de
OAuth-builder versus de algemene OData-builder) wordt afgehandeld in de afgeschermde backend en kan
vanuit de data-plane-repos niet volledig worden bevestigd.
:::

## Vereisten (prerequisites)

1. **Registreer een app in Microsoft Entra ID (Azure AD).** Microsoft Entra-beheercentrum →
   **Identity → Applications → App registrations → New registration**.
   - **Client ID** — staat na registratie op de **Overzicht (Overview)**-pagina als
     **Application (client) ID**.
   - **Tenant ID** — eveneens op de **Overzicht**-pagina als **Directory (tenant) ID**.
2. **Maak een client secret aan** onder de app → **Certificates & secrets** →
   **New client secret**. Kopieer de **Value** direct; deze waarde wordt **maar één keer getoond**.
3. **Voeg Microsoft Graph-permissies voor Teams toe** onder **API permissions** → **Microsoft Graph**.
   Voor het lezen van teams, kanalen en berichten gaat het om permissies zoals
   `Channel.ReadBasic.All`, `Team.ReadBasic.All` of `ChannelMessage.Read.All` (kies de scopes die bij
   jouw scenario passen). Application-permissies geven tenant-brede toegang zonder dat de app lid hoeft
   te zijn van een team. Laat een beheerder **admin consent** verlenen.
4. **Bepaal de Grant Type.** Voor service-to-service-toegang (achtergrond, zonder ingelogde gebruiker)
   gebruik je **Client Credentials**. Voor toegang namens een gebruiker gebruik je **Authorization
   Code** en lever je daarnaast een **Refresh token** aan.

> Officiële documentatie: [De Microsoft Graph API gebruiken voor Microsoft Teams](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview) · [Een applicatie registreren bij het Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2)

---

**Zie ook:** [Microsoft Graph](microsoft-graph.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
