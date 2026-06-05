---
title: Power BI
sidebar_label: Power BI
description: Connect Power BI to Yres — connection requirements.
---

# Power BI

**Category:** Direct connection

For unified models and refreshing Power BI models from Yres loads.

## Connection requirements

- Tenant ID
- Client ID
- Client secret

## Where to find these

Power BI uses a **service principal** (a registered Azure AD app) for access.

- **Register an app** — In Microsoft Entra ID (Azure portal) → **App registrations**, register a new application. On the *Overview* tab you'll find the **Directory (tenant) ID** and the **Application (client) ID**.
- **Client secret** — Under **Certificates & secrets** → *New client secret*, create a secret and copy the value immediately (it's only shown once).
- **Enable service-principal access** — In the **Power BI Admin portal** → *Tenant settings* → *Developer settings*, enable *Service principals can use Fabric/Power BI APIs* (optionally scoped to a security group containing the app).
- **Add the app to the workspace** — Add the service principal as a *Member* or *Admin* of the relevant Power BI workspace.

Official docs: [Embed Power BI content with service principal and an application secret (Microsoft Learn)](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
