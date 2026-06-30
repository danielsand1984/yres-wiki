---
title: Power BI
sidebar_label: Power BI
description: Connecting Power BI to Yres — connection requirements.
---

# Power BI

**Category:** Direct connection

The **PowerBI** source type registers a Power BI tenant in Yres through an Azure AD
service principal. Unlike most sources, Yres copies **no tables** here: no ADF pipeline or
linked service is created for it, and there is no metadata phase. The connection is used to
retrieve the tenant's **workspaces and (unified) models** and to **refresh** those models
during loads (via the Master pipeline).

The registered tenant then appears on the **PowerBI Models** page, where you link the
correct model per Yres environment that is invoked by an action.

:::note Embedded dashboard ≠ this source type
The **embedded dashboard** in the Yres web app (admin tab *PowerBI Dashboard*) is separate from this
source type. That dashboard is configured with the settings `BiDashboardUrl` (the embed URL of a Power BI
report) and `BiDashboardHeight` (height), not through this source connection.
:::

## Expected input

When adding the source (wizard *Add source*) you fill in the shared fields
(including **Source name**, **type**, **integration runtime**, validity of the credentials)
plus the following Power BI-specific fields:

| Field | Description |
|---|---|
| **Tenant Id** | The Directory (tenant) ID of your Microsoft Entra tenant. |
| **Client Id** | The Application (client) ID of the registered Azure AD app. |
| **Client secret** | The client secret of that same app. |

- **Authentication:** Azure AD app (**service principal**) — Tenant Id, Client Id and Client
  secret together.
- **Integration runtime:** for this source type no ADF copy process is run and no linked
  service is created; the tenant is accessed directly via the **Power BI API**. A
  self-hosted integration runtime is not needed here.

:::note No integration-runtime choice
The PowerBI source form shows **no** integration-runtime choice (only Tenant Id, Client Id and Client
Secret). Functionally the runtime does not apply either, because no ADF copy takes place.
:::

## Requirements

- **App registration** — In Microsoft Entra ID (Azure portal) → **App registrations**,
  register a new application. On the *Overview* tab you'll find the **Directory (tenant) ID**
  and the **Application (client) ID**.
- **Client secret** — Under **Certificates & secrets** → *New client secret*, create a
  secret and copy the value immediately (it is shown only once).
- **Enable service principal access** — In the **Power BI Admin portal** → *Tenant settings*
  → *Developer settings*, enable *Service principals can use Fabric/Power BI APIs*
  (optionally scoped to a security group that contains the app).
- **Add the app to the workspace** — Add the service principal as a *Member* or *Admin* of
  the relevant Power BI workspace(s), so Yres can retrieve and refresh the workspaces and
  models.

## How Yres stores the credentials

The three entered values are not kept by the frontend, but stored as secrets in the
customer's **Azure Key Vault**, under the names:

- `adf-{bronnaam}-tenantId`
- `adf-{bronnaam}-clientId`
- `adf-{bronnaam}-clientSecret`

Here `{bronnaam}` is the name you provided under **Source name**.

## Note

- **No metadata and no tables.** PowerBI is a "file source" without metadata: there is no
  metadata-retrieval step and you don't add tables/load types as you would for a database or
  file source. The connection serves solely to enable refreshing the tenant's models.
- **Linking models.** After the source is created, the tenant appears on **PowerBI Models**;
  there you link the correct model per environment.

Official docs: [Embed Power BI content with service principal and an application secret (Microsoft Learn)](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
