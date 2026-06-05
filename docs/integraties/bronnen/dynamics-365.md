---
title: Dynamics 365
sidebar_label: Dynamics 365
description: Dynamics 365 koppelen aan Yres — verbindingseisen.
---

# Dynamics 365

**Categorie:** Directe koppeling

Microsoft Dynamics 365. Directe koppeling.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Dynamics 365 koppelt direct via de Dataverse/D365 Web API met een **service principal**.

- **Omgevings-URL** — De URL van je D365-/Dataverse-omgeving, bijv. `https://<org>.crm4.dynamics.com` (de regio-suffix `crm4` verschilt per datacenter).
- **App registreren** — Registreer in Microsoft Entra ID (Azure portal) → **App registrations** een app, met API-permissies voor Dynamics CRM/Dataverse (`user_impersonation`). Op *Overview* vind je de **client ID** (en tenant ID); maak onder **Certificates & secrets** een **client secret** aan en kopieer die direct.
- **Application user** — Maak in de D365-omgeving (Power Platform admin center → *Application users*) een application user die aan de geregistreerde app is gekoppeld, en wijs die een securityrol met de benodigde leesrechten toe.

Officiële docs: [Register an app with Microsoft Entra ID (Microsoft Dataverse) — Microsoft Learn](https://learn.microsoft.com/en-us/power-apps/developer/data-platform/walkthrough-register-app-azure-active-directory).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
