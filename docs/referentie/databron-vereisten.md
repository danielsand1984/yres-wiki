---
sidebar_position: 1
title: Databron-vereisten
description: Verbindingseisen per brontype.
---

# Databron-vereisten

Verbindingseisen per ondersteund brontype.

## Databases

| Bron | Vereisten |
|---|---|
| **MySQL** | Host · Port · Database name · Username · Password |
| **DB2** | Host · Port · Database name · Username · Password |
| **SQL Server** | Host · Port · Database name · Username · Password |
| **Azure SQL Database** | Host · Port · Database name · Username · Password |
| **Oracle** | Host · Port · **Service name** · Username · Password |
| **PostgreSQL** | Host · Port · Database name · Username · Password |
| **Snowflake** | Account name · Username · Password · Database · Warehouse · Role *(optioneel)* |

## Azure

### Azure Blob Storage
Vereist een **SAS-token** (aanmaken via het storage-account → Security + Networking → Shared Access Signature).
- Account name · Container name · SAS token

### SharePoint
Vooraf: registreer een app in Azure AD, maak een client secret, sla App ID + secret op in Azure Key Vault (in je resource group), en voeg de app toe aan de SharePoint-site/Teams-team via `.../_layouts/15/appinv.aspx` met permissie:
```xml
<AppPermissionRequests AllowAppOnlyPolicy="true">
  <AppPermissionRequest Scope="http://sharepoint/content/sitecollection/web" Right="FullControl" />
</AppPermissionRequests>
```
- SharePoint site URL · AD tenant name · Postfix · AD tenant ID · Application ID / Service principal ID · Application secret / Service principal key

## File

### File Server
- Host / bestandspad op de integration runtime · Username · Password

(Lokale bestanden laden? Zie [troubleshooting](../troubleshooting.md) — `-EnableLocalMachineAccess`.)

## Services & Apps

| Bron | Vereisten | Setup |
|---|---|---|
| **Monday** | URL · API token | API-token aanmaken (Monday-docs). |
| **AFAS** | URL · API token | Via de AFAS app-connector. |
| **Exact Online** | Exact-apps voor dev én prod | Redirect-URL instellen volgens de aanwijzingen in de webapp. |
| **Simplicate** | Domain name · Authentication key · Authentication secret | API-key + secret in Simplicate. |
| **SalesForce** | Environment URL · Client ID · Client secret | Consumer ID/secret uit de App Manager. |
| **SAC** (SAP Analytics Cloud) | URL · Authentication URL · Client ID · Client secret | OAuth-client opzetten in SAC. |
| **OneStream** *(preview)* | URL · Client ID · Client secret · Access token URL · Application | Preview — kan instabiel zijn. |
| **PowerBI** | Tenant ID · Client ID · Client secret | Voor unified models / dashboards. |

## Generieke protocollen

### OData
- URL · Authentication type *(Basic vereist username + password)* · HTTP headers

### OData OAuth
- URL · Body URL · Client ID · Client secret · Access token URL · Scope · Grant Type *("Authorization Code" vereist een refresh token)*

### RestService
- API specification URL · Base URL · Pagination type *(Body URL / Offset / Paging / OffsetPage hebben elk eigen velden)* · Authentication type *(Basic = user+pass; OAuth2ClientCredential = token endpoint, client ID+secret, scope, resource)* · optionele extra headers

> REST-bronnen ondersteunen OpenAPI: bij een `openapi.json`/`swagger.json` kies je endpoints visueel in de frontend.
