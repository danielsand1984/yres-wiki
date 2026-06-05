---
title: Microsoft Teams
sidebar_label: Microsoft Teams
description: Microsoft Teams koppelen aan Yres — verbindingseisen.
---

# Microsoft Teams

**Categorie:** Directe koppeling

Microsoft Teams. Directe koppeling.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Microsoft Teams wordt benaderd via de Microsoft Graph API. Je hebt geen aparte Teams-portal nodig, maar wel een **app-registratie in Microsoft Entra ID (Azure AD)** met de juiste Graph-rechten.

- **Client ID (Application/client ID)** en **Tenant ID (Directory/tenant ID)**: te vinden op het Overzicht-tabblad van de app-registratie in het Microsoft Entra-beheercentrum (Identity → Applications → App registrations).
- **Client secret**: maak je aan onder Certificates & secrets bij de app-registratie. De waarde is maar één keer zichtbaar — kopieer hem direct.
- **Graph-rechten voor Teams**: voeg onder API permissions de benodigde Microsoft Graph-permissies toe (bijvoorbeeld voor het lezen van teams en kanalen, zoals `Channel.ReadBasic.All` of `ChannelMessage.Read.All`) en laat een beheerder **admin consent** verlenen. Application-permissies geven tenant-brede toegang zonder dat de app lid hoeft te zijn van een team.

Deze gegevens geef je vervolgens door als verbindingsinstellingen voor de Microsoft Graph-koppeling. Zie de officiële documentatie: [Use the Microsoft Graph API to work with Microsoft Teams](https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview) en [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
