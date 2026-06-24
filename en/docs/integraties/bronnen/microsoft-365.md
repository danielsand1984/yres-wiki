---
title: Microsoft 365 / Office 365
sidebar_label: Microsoft 365
description: Connecting Microsoft 365 (Office 365) to Yres — connection requirements.
---

# Microsoft 365 / Office 365

**Category:** Microsoft platform (Entra ID / Graph) · Dedicated ADF connector

Microsoft 365 (Office 365) data — think users, email, calendar and user
activity — is surfaced by Yres through the **`Office365` connector** of Azure
Data Factory. This connector pulls data from Microsoft 365 via the **Microsoft Graph Data
Connect** layer and authenticates with a **Microsoft Entra ID (Azure AD) service principal**.
There is a dedicated ADF connector for this integration: the linked service **`Office365`**
(`type: Office365`) and the pipeline **`DynamicMS365`** (ADF folder `PW - Yres/Sources/MS365`).

Microsoft 365 is related to, but **not the same as**, the [Microsoft Graph](microsoft-graph.md)
source. Microsoft Graph is a general OData/REST integration (preset `Graph`, stored as
`OData`) using OAuth2 tokens; the Microsoft 365 integration on this page uses the **specialized
`Office365` connector** with its own copy source (`Office365Source`). For Teams data specifically,
see [Microsoft Teams](teams.md).

:::info To be confirmed
Microsoft 365 / Office 365 has (version 1.55) **no choice item in the "Add source" wizard**
(`CreateSource.tsx`'s `getSourceForm` switch). Unlike most sources it is therefore currently
**not a self-service selectable source**, but a dedicated/example connector that is configured
in collaboration with Yres. The fields below are derived from the ADF linked service
`Office365.json` and the pipeline `DynamicMS365.json`; confirm with Yres whether, and how,
Microsoft 365 is available as a selectable source with an accompanying input form for your
environment.
:::

## Expected input

The `Office365` connector connects to a Microsoft Entra ID (Azure AD) **service principal**
(app registration). The following values are required; with a self-service form they would be
requested as fields, otherwise they are provisioned by Yres. In addition, the shared source
fields from step 1 apply (**source name**, **type**, **integration runtime**, **credentials the
same for all environments?**, **credential expiry date**, **tags**).

| Value | Explanation |
|---|---|
| **Source name** | Name of the source (unique per organization, 2–45 characters, starts with a letter). Becomes the name of the ADF linked service and the prefix of the Key Vault secrets (`adf-{name}-…`). |
| **Office 365 Tenant ID** | The Directory (tenant) ID of your Microsoft 365 tenant — the tenant the data is read from (`office365TenantId`, GUID). |
| **Service principal Tenant ID** | The Directory (tenant) ID of the Entra tenant in which the service principal (app registration) is registered (`servicePrincipalTenantId`, GUID). In most cases the same tenant as the Office 365 tenant. |
| **Service principal ID (Client ID)** | The Application (client) ID of the registered Entra app (`servicePrincipalId`, GUID). |
| **Service principal key (Client secret)** | The client secret / key of the app. Treated as a secret and stored in the Azure Key Vault. |

### Authentication

**Azure AD service principal (app-only).** The `Office365` connector authenticates with a
registered Entra ID app using tenant IDs, a service principal ID and a service principal key.
There is **no** username/password flow and no interactive login: it is a
service-to-service integration.

:::note
The `Office365` linked service in the repo contains an `encryptedCredential` field with seed/example data
from the dev factory (`adf-iris-dev-…`). These are **not customer values**: the real service principal key
is placed in the **Azure Key Vault** for your environment and referenced from there.
:::

### Integration runtime

By default the cloud runtime **`AutoResolveIntegrationRuntime`** — Microsoft 365 / Microsoft Graph
Data Connect is publicly reachable over HTTPS, so this is usually the right choice. A
**self-hosted integration runtime** is only needed if you have to route the outbound traffic over a
restricted or on-prem network.

### Secrets in Key Vault

The frontend does not store any secrets. The entered values go to the customer's **Azure Key Vault**
and are referenced from the linked service. The secrets are written under the group
`adf-{source name}-…` (the source name becomes both the name of the linked service and the prefix of the
Key Vault secrets).

## Prerequisites

1. **Register an app in Microsoft Entra ID (Azure AD).** Microsoft Entra admin center →
   **Identity → Applications → App registrations → New registration**.
   - **Service principal ID (Client ID)** — appears after registration on the **Overview**
     page as **Application (client) ID**.
   - **Service principal Tenant ID** — also on the **Overview** page as
     **Directory (tenant) ID**.
2. **Create a client secret (service principal key)** under the app →
   **Certificates & secrets** → **New client secret**. Copy the **Value** immediately; this value
   is **shown only once**.
3. **Grant the app access to the Microsoft 365 data.** The `Office365` connector runs through
   **Microsoft Graph Data Connect**; for this, Graph Data Connect must be enabled in the tenant
   and an administrator must approve the app (the service principal) for the desired datasets. Have
   an administrator grant **admin consent** for the required Microsoft Graph permissions.
4. **Note the Office 365 Tenant ID** — the tenant the data is retrieved from. If the
   app registration is in the same tenant, the Office 365 and service principal tenant IDs are
   the same.

:::info To be confirmed
The exact requirements on the Microsoft 365 side (which Graph Data Connect datasets, which
consent steps and any storage requirements) depend on what Microsoft requires for the
`Office365` connector and may differ per tenant. Confirm the precise setup with
Yres and the Microsoft documentation before taking this source into production.
:::

## How Yres loads the data

The pipeline **`DynamicMS365`** first copies the Microsoft 365 data with an
**`Office365Source`** copy activity to a blob (binary/JSON), then reads that JSON into the
`STAGE` layer (`FILE_{category}_{table}`) and afterwards runs `spHIS_InsertAndUpdate` to merge STAGE → HIS
(SCD2 history). The example in the pipeline retrieves the Microsoft Graph
**`User`** entity (columns such as `displayName`, `mail`, `jobTitle`, `department`,
`userPrincipalName`, etc.).

:::note Load type
The `DynamicMS365` pipeline is **fixed to load type `FULL`** (the
`spHIS_InsertAndUpdate` and `spUpdateETL_EndDate` steps are passed `TableLoadType=FULL`). FULL is
a history-preserving SCD2 upsert: new records are inserted, changed records get a
new version and existing/missing keys stay open. Only OVERWRITE truncates the
history. Other load types are not applied along this path.
:::

---

**See also:** [Microsoft Graph](microsoft-graph.md) · [Microsoft Teams](teams.md) · [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
