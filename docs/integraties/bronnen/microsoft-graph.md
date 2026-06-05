---
title: Microsoft Graph
sidebar_label: Microsoft Graph
description: Microsoft Graph koppelen aan Yres — verbindingseisen.
---

# Microsoft Graph

**Categorie:** OData · REST

Microsoft 365-data via Microsoft Graph. Koppelt via OData en REST.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Microsoft Graph vereist een **app-registratie in Microsoft Entra ID (Azure AD)**. Registreer in het Microsoft Entra-beheercentrum onder Identity → Applications → App registrations een nieuwe applicatie.

- **Application (client) ID** en **Directory (tenant) ID**: te vinden op het Overzicht-tabblad van de app-registratie.
- **Client secret**: aanmaken onder Certificates & secrets. De waarde is **maar één keer zichtbaar** — kopieer hem direct.
- **Permissies**: voeg onder API permissions de benodigde Microsoft Graph-rechten toe (application- of delegated-permissies, afhankelijk van het scenario) en laat een beheerder **admin consent** verlenen.

Deze gegevens vul je in als verbindingsinstellingen. Zie de officiële documentatie: [Register an application with the Microsoft identity platform](https://learn.microsoft.com/en-us/graph/auth-register-app-v2).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
