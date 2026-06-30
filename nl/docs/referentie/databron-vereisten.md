---
sidebar_position: 1
title: Databron-vereisten
description: Verbindingseisen, authenticatie en integration-runtime per ondersteund brontype.
---

# Databron-vereisten

Deze pagina is de **complete verbindingsmatrix** voor elke databron die Yres ondersteunt: welke velden
je invult, welke authenticatiemethode geldt, welke **integration runtime (IR)** nodig is en welke
voorbereiding (app-registratie, secret, SAS-token, redirect-URL) je vooraf regelt.

Wil je de stap-voor-stap procedure of de bronspecifieke details? Zie de [bronpagina's per type](../integraties/bronnen/azure-blob-storage.md)
en de how-to [Databron koppelen](../setup/databron-koppelen.md). Deze pagina blijft daarmee in sync.

:::tip Vaste regels (gelden voor élke bron)
- **Bronnaam** is uniek per organisatie, begint met een letter, is alfanumeriek en 2–45 tekens lang. De
  naam wordt de naam van de ADF linked service én de Key Vault-secretgroep `adf-{bronnaam}-…`.
- Yres slaat **nooit secrets op in de frontend**. Alle credentials gaan naar de **Azure Key Vault van de
  klant**; de linked service verwijst er alleen naar.
- De **IR** staat standaard op `AutoResolveIntegrationRuntime` (cloud). Voor on-premises of afgeschermde
  bronnen kies je een **self-hosted IR** (`pwccIntegrationRuntimeLinked`).
:::

## De wizard "Create source"

Elke bron maak je aan via dezelfde wizard. Stap 1 ("Source") vraagt om velden die voor **alle** brontypes
gelden; stap 2 ("Credentials") vraagt de bronspecifieke verbindingsgegevens, per omgeving.

![Wizard 'Create source', stap 1: de gedeelde brondefinitie-velden](/img/screens/source-create-wizard.png)

*Stap 1 van de wizard "Create source": je definieert eerst de bron, daarna voer je per omgeving de
credentials in.*

1. **Source name** — alfanumeriek, begint met een letter, uniek per organisatie (bijv. `SQL_CRM`). Wordt
   de naam van de linked service en de Key Vault-secretgroep.
2. **type** — de gecategoriseerde bronpicker (Databases: SQL Server / Azure SQL / Oracle / DB2; apps:
   AFAS, ExactOnline, Monday …). De keuze bepaalt welk subformulier verschijnt.
3. **integration runtime** — standaard `AutoResolveIntegrationRuntime`; toont ook alle gepubliceerde
   self-hosted runtimes.
4. **Credentials identical for all environments?** — "Yes" voert je de credentials één keer in; "No"
   voegt per omgeving een aparte stap toe. (Voor Exact Online geforceerd op "No".)
5. **Stap 2 (Credentials)** — de bronspecifieke velden (bijv. host / database name / port / user name /
   password) per omgeving.
6. **Next** — gaat naar de credentials; de laatste stap verstuurt `POST /data-source`.

Daarnaast vraagt stap 1 nog **credentials expire?** (optionele vervaldatum die meegaat naar de
Key Vault-secret) en **Tags** (optioneel, kommagescheiden).

## Databases (directe verbinding)

Alle databasebronnen zijn **on-prem-geschikt**: IR = `AutoResolveIntegrationRuntime` als de database
vanuit de cloud bereikbaar is, anders een **self-hosted IR**. Authenticatie is altijd
gebruikersnaam/wachtwoord, opgeslagen in Key Vault.

| Bron | Vereisten | Auth | IR |
|---|---|---|---|
| **MySQL** | Host · Port · Database name · Username · Password | Basic | AutoResolve / self-hosted |
| **DB2** | Host · Port · Database name · Username · Password | Basic | AutoResolve / self-hosted |
| **SQL Server** | Host · Port · Database name · Username · Password | Basic | AutoResolve / self-hosted |
| **Azure SQL Database** | Host · Port · Database name · Username · Password | Basic | Cloud (AutoResolve) |
| **Oracle** | Host · Port · **Service name** · Username · Password | Basic | AutoResolve / self-hosted |
| **PostgreSQL** | Host · Port · Database name · Username · Password | Basic | AutoResolve / self-hosted |
| **Snowflake** | Account name · Username · Password · Database · Warehouse · Role *(optioneel)* | Basic | Cloud (AutoResolve) |

:::note Oracle gebruikt een service name
Oracle is de enige database die om een **Service name** vraagt in plaats van een database-naam. SQL
Server en Azure SQL slaan intern op als DWH-brontype `MSSQL_ADF`.
:::

:::warning MySQL: maar één delta-kolom
MySQL is de **enige SQL-bron die geen twee delta-kolommen ondersteunt**. Voor alle andere SQL-bronnen
(`MSSQL_ADF`, `DB2`, `Sybase`, `PostgreSQL`, `Salesforce`, `OneStream`) kun je twee delta-kolommen
instellen; voor MySQL gebruik je **één delta-kolom**. De standaard laadtypes
(FULL/DELTA/OVERWRITE/RELOAD/IMAGE/ADDITIONAL) werken wel gewoon. Zie [MySQL](../integraties/bronnen/mysql.md).
:::

### SAP HANA / SAP S/4HANA

SAP HANA en S/4HANA hebben **geen eigen formulier**. Je bereikt ze via een generieke methode:

- **Directe ODBC/database-verbinding** — gebruik het generieke DB-formulier (host + SQL-poort
  `3<instance>15`, DB-user + wachtwoord), of
- **OData-service** — HANA via `…​.xsodata`; S/4HANA via `…/sap/opu/odata/<namespace>/<service>`
  (activeer de service in de SAP Gateway met `/IWFND/MAINT_SERVICE`), met Basic auth of OAuth.

Voor de Business Data Cloud-route, zie [SAP_BDC](#sap-bdc) hieronder. Zie ook
[SAP HANA](../integraties/bronnen/sap-hana.md) en [SAP S/4HANA](../integraties/bronnen/sap-s4hana.md).

## Azure / Microsoft-platform

### Azure Blob Storage

Vereist een **SAS-token** (aanmaken via het storage-account → Security + Networking → Shared Access
Signature). De wizard bouwt zelf de SAS-url `https://{account}.blob.core.windows.net/{container}?{sasToken}`.

- **Velden:** Account name · Container name · SAS token
- **Auth:** SAS-token · **IR:** instelbaar (cloud of self-hosted)

### Azure Data Lake (Gen2)

Het Data Lake (`AzureBlobFS`, SAS-authenticatie) is primair Yres' **eigen** staging-/outputlaag, niet
standaard een door de gebruiker toegevoegde bron. Wanneer het als bron wordt gebruikt, volgt het hetzelfde
**SAS-patroon** als Azure Blob Storage / SAP_BDC.

:::note Koppelen via Azure Blob Storage
Azure Data Lake heeft **geen** eigen keuze in de bronpicker (`SourceField.tsx`). Wil je er data uit ophalen,
koppel de Data Lake dan als **Azure Blob Storage**-bron (zelfde `AzureBlobFS`/SAS-vorm). Daarnaast dient een
Data Lake als interne Yres-staging-/uitvoeropslag.
:::

### SharePoint

Registreer vooraf een app in Azure AD, maak een client secret, sla App ID + secret op in de Azure Key
Vault (in je resource group) en voeg de app toe aan de SharePoint-site/het Teams-team via
`.../_layouts/15/appinv.aspx` met deze permissie:

```xml
<AppPermissionRequests AllowAppOnlyPolicy="true">
  <AppPermissionRequest Scope="http://sharepoint/content/sitecollection/web" Right="FullControl" />
</AppPermissionRequests>
```

- **Velden:** SharePoint site URL · AD tenant name · Postfix (`sites`/`teams`/`personal`/leeg) · AD tenant
  ID · Application ID / Service principal ID · Application secret / Service principal key
- **Auth:** Azure AD app-only (service principal); de linked service zelf wordt als `HttpServer` +
  Anonymous aangemaakt, de werkelijke auth verloopt via de opgeslagen clientId/secret/tenant.

### Microsoft Teams

Teams heeft **geen eigen formulier**; je benadert het via **Microsoft Graph** (zie hieronder). Je hebt een
Entra ID (Azure AD) app-registratie nodig: Client ID, Tenant ID, Client secret en Graph-permissies (bijv.
`Channel.ReadBasic.All`, `ChannelMessage.Read.All`) met admin-consent. Zie [Teams](../integraties/bronnen/teams.md).

### Microsoft Graph

| Veld | Toelichting |
|---|---|
| URL | Vast: `https://graph.microsoft.com/v1.0` |
| Token URL | Vast (tenant-gebouwd): `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token` |
| Tenant ID · Client ID · Client Secret · Scope | Uit de Entra ID app-registratie |
| Grant Type | `Client Credentials` of `Authorization Code` (de laatste voegt een **Refresh token** toe) |

- **Auth:** OAuth2 (client-credentials of authorization-code). **Vooraf:** Entra ID app-registratie,
  client secret (eenmalig zichtbaar), Graph API-permissies + admin-consent. Zie
  [Microsoft Graph](../integraties/bronnen/microsoft-graph.md).

### Dynamics 365 (Business Central / Dataverse)

| Veld | Toelichting |
|---|---|
| URL | Vast: Business Central OData V4 (`tenant` + `company` ingebouwd) |
| Access token URL | Vast: `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token` |
| Tenant ID · Company name · Client ID · Client secret · Scope | Uit de Entra ID app-registratie |
| Grant Type | `Client Credentials` of `Authorization Code` (+ Refresh token) |

- **Auth:** OAuth2 service principal. **Vooraf:** omgevings-URL `https://<org>.crm4.dynamics.com`; Entra
  ID app-registratie met Dynamics CRM/Dataverse `user_impersonation`, client secret. Zie
  [Dynamics 365](../integraties/bronnen/dynamics-365.md).

### Intune Data Warehouse

- **Velden:** URL is vast
  (`https://fef.{tenant}.manage.microsoft.com/ReportingService/DataWarehouseFEService?api-version=v1.0`) ·
  OAuth2-velden identiek aan Graph/D365 (Tenant ID · Client ID · Client Secret · Scope · Grant Type).
- **Auth:** OAuth2. Er is (nog) geen aparte bronpagina voor Intune DWH; het werkt als OData-preset.

### Power BI

- **Velden:** Tenant ID · Client ID · Client secret
- **Auth:** Azure AD app (service principal). Power BI is een **filebron zonder metadata**: er wordt geen
  linked service of dataset aangemaakt; Yres schrijft alleen drie Key Vault-secrets en consumeert via de
  Power BI API (niet via een ADF-copy). Bedoeld voor unified models / dashboards. Zie
  [Power BI](../integraties/bronnen/powerbi.md).

## SAP-familie & Datasphere

### SAC (SAP Analytics Cloud)

- **Velden:** URL · Authentication URL · Client ID · Client secret
- **Auth:** OAuth2 client-credentials (zet een OAuth-client op in SAC). Draait op de cloud-IR. Zie
  [SAC](../integraties/bronnen/sac.md).

### Onestream *(preview)*

- **Velden:** URL · Application · **AuthenticationType** (`OAUTH2` of `PAT`).
  - `OAUTH2` → Client ID · Client secret · Access token URL
  - `PAT` → Personal access token
- **Auth:** OAuth2 client-credentials óf Personal Access Token. *(preview — kan instabiel zijn.)* Zie
  [Onestream](../integraties/bronnen/onestream.md).

### SAP Business Data Cloud (SAP_BDC) {#sap-bdc}

- **Velden:** **Sas uri** (`https://<host>/`, met afsluitende slash, alleen hostname) · container · **Sas
  token** (moet `sig, sp, se, spr, st` bevatten, zonder voorloop-`?`)
- **Auth:** **SAS-token** (de bron exposeert een Azure Data Lake / Blob FS-endpoint). Draait op de
  cloud-IR.

### SAP Datasphere

SAP Datasphere heeft **geen eigen formulier**. De template is een `AzureBlobFS` met SAS-uri — dezelfde
vorm als SAP_BDC. Datasphere wordt dus geconsumeerd als een **AzureBlobFS/SAS-bron**. Zie
[SAP Datasphere](../integraties/bronnen/sap-datasphere.md).

:::note
SAP_BDC ("SAP Business Data Cloud") en SAP Datasphere zijn verwante maar **verschillende** SAP-producten.
Datasphere heeft **geen eigen picker-entry**; je koppelt het via het **SAP_BDC-formulier**.
:::

## Business-apps / SaaS

| Bron | Vereisten | Auth | Setup |
|---|---|---|---|
| **Monday** | URL · API token | API-token als Authorization-header | API-token aanmaken (Monday-docs) |
| **AFAS** | URL (`https://…​.afas.online/profitrestservices`) · API token | API-token als Authorization-header | Via de AFAS app-connector |
| **Exact Online** | Client ID · Client secret · (interactieve OAuth-login) | OAuth2 authorization-code (per omgeving) | Exact-apps voor **dev én prod**; redirect-URL instellen volgens de webapp |
| **Simplicate** | Domain name · Authentication key · Authentication secret | Twee custom HTTP-headers (key + secret) | API-key + secret in Simplicate |
| **Salesforce** | Environment URL · Client ID · Client secret | OAuth2 client-credential | Consumer ID/secret uit de App Manager |
| **Topdesk** | Domain · Username · Password | Basic | Applicatiewachtwoord aanmaken in Topdesk |
| **BoardEPM** | Server · Application · Identity provider | OAuth2 client-credential | OAuth-client opzetten in Board |

:::note Exact Online: aparte app per omgeving
Voor Exact Online staat **"Credentials identical for all environments?" geforceerd op "No"**: je maakt een
**aparte Exact-app per omgeving** aan en stelt per omgeving de redirect-URL in
(`{BACKEND_URL}/exactonline/callback`). Zie [Exact Online](../integraties/bronnen/exact-online.md).
:::

:::note Topdesk gebruikt het OData-reporting-endpoint
Yres verbindt met Topdesk via het **OData-reporting-endpoint**
`https://{domain}.topdesk.net/services/reporting/v2/odata` (opgeslagen als brontype `OData`, Basic auth,
paginatie `BodyUrl`) — niet via de REST-API `/tas/api`. Het applicatiewachtwoord blijft de
Basic-credential. Zie [Topdesk](../integraties/bronnen/topdesk.md).
:::

### Mendix

Mendix heeft **geen eigen formulier**. Verbind via **REST/OData**: publiceer een OData-service in Studio
Pro en gebruik het generieke OData- of RestService-formulier met de service-URL
`https://<app-host>/<location>/` en Basic/API-key-credentials. Zie [Mendix](../integraties/bronnen/mendix.md).

## Generieke protocollen

### OData

- **Velden:** URL · Pagination type (`BodyUrl`) · Body URL (`$['@odata.nextLink']`) ·
  **AuthenticationType** (`Anonymous`/`Basic`; Basic voegt Username + Password toe) · optionele extra
  HTTP-headers (`Authorization`, `APIKey`, `X-API-KEY`).
- **Auth:** Anonymous of Basic. De webapp voegt een afsluitende `/` toe aan de OData-URL. Zie
  [OData](../integraties/bronnen/odata.md).

### OData OAuth

- **Velden:** URL · Body URL (`$['@odata.nextLink']`) · Client ID · Client secret · Access token URL ·
  Scope · **Grant Type** (`Client Credentials`/`Authorization Code`; de laatste vereist een **Refresh
  token**).
- **Auth:** OAuth2 (client-credentials of authorization-code). Zie
  [OData OAuth](../integraties/bronnen/odata-oauth.md).

### RestService

- **Velden:** OpenAPI-specificatie-URL *(optioneel)* · **Base URL** *(verplicht, eindigt niet op `/`)* ·
  **paginationType** (`No pagination`/`RFC5988`/`BodyUrl`/`Offset`/`Paging`/`OffsetPage`; elk type voegt
  eigen velden toe) · **AuthenticationType** (`Anonymous`/`Basic`/`OAuth2ClientCredential`) · optionele
  extra HTTP-headers.
  - `Basic` → Username + Password
  - `OAuth2ClientCredential` → Token endpoint + Client ID + Client Secret + Scope + Resource
- **Auth:** Anonymous, Basic of OAuth2 client-credential. Zie
  [RestService](../integraties/bronnen/restservice.md).

:::tip OpenAPI-ondersteuning
REST-bronnen ondersteunen OpenAPI 3.x: bij een geldige `openapi.json`/`swagger.json` kies je de endpoints
in de frontend in plaats van ze handmatig in te typen.
:::

### CBS (helper, OData)

- **Velden:** alleen **Dataset** (de URL is vast: `https://opendata.cbs.nl/ODataFeed/odata/` + dataset).
- **Auth:** Anonymous — geen credentials nodig. Zie [CBS](../integraties/bronnen/cbs.md).

### Tweede Kamer (helper, OData)

- **Velden:** geen (vaste URL `https://gegevensmagazijn.tweedekamer.nl/OData/v4/2.0/`).
- **Auth:** Anonymous — geen credentials nodig. Zie [Tweede Kamer](../integraties/bronnen/tweede-kamer.md).

## Filebronnen

### File Server

- **Velden:** Host / bestandspad op de integration runtime (bijv. `\\SERVERNAME\SharedFolder`) · Username
  · Password
- **Auth:** Windows-gebruiker/wachtwoord. **IR: self-hosted verplicht** (leest van een UNC-/bestandspad).
  Zie [File Server](../integraties/bronnen/file-server.md).

### Lokale bestanden (CSV/Excel)

- **Geen credentials.** Bestanden worden direct geüpload of via een **self-hosted IR** op de machine met
  de bestanden gelezen. Draait de IR onder een serviceaccount? Voer dan eenmalig op de IR-host uit:
  `.\dmgcmd.exe -EnableLocalMachineAccess`. **IR: self-hosted verplicht.** Zie
  [Lokale bestanden](../integraties/bronnen/lokale-bestanden.md) en
  [troubleshooting](../troubleshooting.md).

## Authenticatie- & IR-overzicht (spiekbrief)

Snel zien welke authenticatiemethode en welke integration runtime bij elke bron horen.

### Per authenticatiemethode

| Authenticatie | Bronnen |
|---|---|
| **Username + password (Basic, in Key Vault)** | MySQL, DB2, SQL Server, Azure SQL, Oracle, PostgreSQL, Snowflake, OData (Basic), RestService (Basic), Topdesk, File Server, Mendix *(optie)* |
| **SAS-token** | Azure Blob Storage, SAP_BDC, SAP Datasphere, Azure Data Lake |
| **API-token als HTTP-header** | AFAS, Monday, Simplicate (key + secret) |
| **OAuth2 client-credentials** | SAC, Salesforce, OData OAuth (Client Credentials), RestService (OAuth2ClientCredential), BoardEPM, Onestream (OAUTH2), Graph/Dynamics 365/Intune (Client Credentials) |
| **OAuth2 authorization-code (+ refresh token)** | Exact Online, OData OAuth (Authorization Code), Graph/Dynamics 365/Intune (Authorization Code) |
| **Azure AD service principal (app-registratie)** | SharePoint, Power BI, Teams/Graph, Dynamics 365 |
| **Personal access token** | Onestream (PAT) |
| **Anonymous (publiek)** | CBS, Tweede Kamer |

### Per integration runtime

| IR-vereiste | Bronnen |
|---|---|
| **Self-hosted IR verplicht** | File Server, Lokale bestanden, plus elke on-prem/afgeschermde DB (MySQL, DB2, SQL Server, Oracle, PostgreSQL, SAP HANA ODBC) |
| **Cloud (AutoResolve) gebruikelijk**, self-hosted optioneel | Azure SQL, Snowflake, alle SaaS/OData/REST-bronnen, SharePoint, Salesforce, SAC, SAP_BDC, Power BI |

:::note PostgreSQL is één type
Alle PostgreSQL-verbindingen lopen via het on-prem-geschikte `PostgreSql`-type. De aparte
`AzurePostgreSql`-variant is in de code uitgeschakeld en wordt niet gebruikt.
:::
