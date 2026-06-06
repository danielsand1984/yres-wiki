---
title: Microsoft Teams
sidebar_label: Microsoft Teams
description: Connect Microsoft Teams to Yres — connection requirements.
---

# Microsoft Teams

**Category:** Direct connection

Microsoft Teams. Direct connection.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Microsoft Teams is accessed through the Microsoft Graph API. You don't need a separate Teams portal, but you do need an **app registration in Microsoft Entra ID (Azure AD)** with the right Graph permissions.

- **Client ID (Application/client ID)** and **Tenant ID (Directory/tenant ID)**: found on the Overview tab of the app registration in the Microsoft Entra admin center (Identity → Applications → App registrations).
- **Client secret**: created under Certificates & secrets on the app registration. The value is shown **only once** — copy it immediately.
- **Graph permissions for Teams**: under API permissions, add the required Microsoft Graph permissions (for example, to read teams and channels, such as `Channel.ReadBasic.All` or `ChannelMessage.Read.All`) and have an administrator grant **admin consent**. Application permissions provide tenant-wide access without the app needing to be a member of a team.

You then supply these values as connection settings for the Microsoft Graph integration. See the official documentation: [Use the Microsoft Graph API to work with Microsoft Teams](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview) and [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
