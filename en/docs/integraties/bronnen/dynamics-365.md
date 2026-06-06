---
title: Dynamics 365
sidebar_label: Dynamics 365
description: Connect Dynamics 365 to Yres — connection requirements.
---

# Dynamics 365

**Category:** Direct connection

Microsoft Dynamics 365. Direct connection.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Dynamics 365 connects directly via the Dataverse/D365 Web API using a **service principal**.

- **Environment URL** — The URL of your D365/Dataverse environment, e.g. `https://<org>.crm4.dynamics.com` (the region suffix `crm4` differs per data center).
- **Register an app** — In Microsoft Entra ID (Azure portal) → **App registrations**, register an app with API permissions for Dynamics CRM/Dataverse (`user_impersonation`). On *Overview* you'll find the **client ID** (and tenant ID); under **Certificates & secrets** create a **client secret** and copy it immediately.
- **Application user** — In the D365 environment (Power Platform admin center → *Application users*), create an application user bound to the registered app and assign it a security role with the required read permissions.

Official docs: [Register an app with Microsoft Entra ID (Microsoft Dataverse) — Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
