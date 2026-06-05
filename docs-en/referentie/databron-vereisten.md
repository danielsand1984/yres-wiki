---
sidebar_position: 1
title: Data source requirements
description: Connection requirements per source type.
---

# Data source requirements

Connection requirements per supported source type.

## Databases

| Source | Requirements |
|---|---|
| **MySQL** | Host · Port · Database name · Username · Password |
| **DB2** | Host · Port · Database name · Username · Password |
| **SQL Server** | Host · Port · Database name · Username · Password |
| **Azure SQL Database** | Host · Port · Database name · Username · Password |
| **Oracle** | Host · Port · **Service name** · Username · Password |
| **PostgreSQL** | Host · Port · Database name · Username · Password |
| **Snowflake** | Account name · Username · Password · Database · Warehouse · Role *(optional)* |

## Azure

### Azure Blob Storage
Requires a **SAS token** (create via the storage account → Security + Networking → Shared Access Signature).
- Account name · Container name · SAS token

### SharePoint
Beforehand: register an app in Azure AD, create a client secret, store App ID + secret in Azure Key Vault (in your resource group), and add the app to the SharePoint site/Teams team via `.../_layouts/15/appinv.aspx` with permission:
```xml
<AppPermissionRequests AllowAppOnlyPolicy="true">
  <AppPermissionRequest Scope="http://sharepoint/content/sitecollection/web" Right="FullControl" />
</AppPermissionRequests>
```
- SharePoint site URL · AD tenant name · Postfix · AD tenant ID · Application ID / Service principal ID · Application secret / Service principal key

## File

### File Server
- Host / file path on the integration runtime · Username · Password

(Loading local files? See [troubleshooting](../troubleshooting.md) — `-EnableLocalMachineAccess`.)

## Services & Apps

| Source | Requirements | Setup |
|---|---|---|
| **Monday** | URL · API token | Create an API token (Monday docs). |
| **AFAS** | URL · API token | Via the AFAS app connector. |
| **Exact Online** | Exact apps for dev and prod | Set the redirect URL as instructed in the web app. |
| **Simplicate** | Domain name · Authentication key · Authentication secret | API key + secret in Simplicate. |
| **SalesForce** | Environment URL · Client ID · Client secret | Consumer ID/secret from the App Manager. |
| **SAC** (SAP Analytics Cloud) | URL · Authentication URL · Client ID · Client secret | Set up an OAuth client in SAC. |
| **OneStream** *(preview)* | URL · Client ID · Client secret · Access token URL · Application | Preview — may be unstable. |
| **PowerBI** | Tenant ID · Client ID · Client secret | For unified models / dashboards. |

## Generic protocols

### OData
- URL · Authentication type *(Basic requires username + password)* · HTTP headers

### OData OAuth
- URL · Body URL · Client ID · Client secret · Access token URL · Scope · Grant Type *("Authorization Code" requires a refresh token)*

### RestService
- API specification URL · Base URL · Pagination type *(Body URL / Offset / Paging / OffsetPage each have their own fields)* · Authentication type *(Basic = user+pass; OAuth2ClientCredential = token endpoint, client ID+secret, scope, resource)* · optional extra headers

> REST sources support OpenAPI: with an `openapi.json`/`swagger.json` you select endpoints visually in the frontend.
