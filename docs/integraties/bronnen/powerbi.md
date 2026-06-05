---
title: Power BI
sidebar_label: Power BI
description: Power BI koppelen aan Yres — verbindingseisen.
---

# Power BI

**Categorie:** Directe koppeling

Voor unified models en het verversen van PowerBI-modellen vanuit Yres-loads.

## Verbindingseisen

- Tenant ID
- Client ID
- Client secret

## Gegevens ophalen

Power BI gebruikt een **service principal** (geregistreerde Azure AD-app) voor toegang.

- **App registreren** — Registreer in Microsoft Entra ID (Azure portal) → **App registrations** een nieuwe applicatie. Op het *Overview*-tabblad vind je de **Directory (tenant) ID** en de **Application (client) ID**.
- **Client secret** — Maak onder **Certificates & secrets** → *New client secret* een geheim aan en kopieer de waarde direct (deze is maar één keer zichtbaar).
- **Service-principal-toegang inschakelen** — In de **Power BI Admin portal** → *Tenant settings* → *Developer settings* schakel je *Service principals can use Fabric/Power BI APIs* in (eventueel beperkt tot een securitygroep waarin de app zit).
- **App aan workspace toevoegen** — Voeg de service principal als *Member* of *Admin* toe aan de betreffende Power BI-workspace.

Officiële docs: [Embed Power BI content with service principal and an application secret (Microsoft Learn)](https://learn.microsoft.com/en-us/power-bi/developer/embedded/embed-service-principal).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
