---
title: Microsoft Graph
sidebar_label: Microsoft Graph
description: Connect Microsoft Graph to Yres — connection requirements.
---

# Microsoft Graph

**Category:** OData · REST

Microsoft 365 data via Microsoft Graph. Connects via OData and REST.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Microsoft Graph requires an **app registration in Microsoft Entra ID (Azure AD)**. In the Microsoft Entra admin center, go to Identity → Applications → App registrations and register a new application.

- **Application (client) ID** and **Directory (tenant) ID**: found on the Overview tab of the app registration.
- **Client secret**: created under Certificates & secrets. The value is shown **only once** — copy it immediately.
- **Permissions**: under API permissions, add the required Microsoft Graph permissions (application or delegated, depending on the scenario) and have an administrator grant **admin consent**.

You then enter these values as connection settings. See the official documentation: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
