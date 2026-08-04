---
title: Topdesk
sidebar_label: Topdesk
description: Topdesk koppelen aan Yres — verbindingseisen.
---

# Topdesk

**Categorie:** OData

Service-managementtool. Yres koppelt Topdesk via de **OData-reporting-API** (niet de `/tas/api` REST-API).

## Verwachte input

In het toevoegformulier voor een Topdesk-bron vul je de volgende velden in:

| Veld (label) | Invoer |
|---|---|
| **URL** | Alleen-lezen. Wordt automatisch opgebouwd uit **Domain**: `https://<domein>/services/reporting/v2/odata`. |
| **Domain** | Het **volledige** Topdesk-domein, bijvoorbeeld `mijnorganisatie.topdesk.net`. Let op: het formulier plakt `.topdesk.net` er **niet** automatisch achter — vul je alleen `mijnorganisatie` in, dan is de opgebouwde URL onjuist. Alleen letters, cijfers, punten en koppeltekens zijn toegestaan. |
| **Username** | De loginnaam van het Topdesk-(API-)operatoraccount. |
| **Password** | Het **applicatiewachtwoord** van dat operatoraccount (zie prerequisites). |

De velden **authenticatietype** (`Basic`), **paginatietype** (`BodyUrl`) en de pagina-URL-expressie (`$['@odata.nextLink']`) staan vast en hoef je niet in te vullen.

- **Authenticatie:** Basic — gebruikersnaam + applicatiewachtwoord, meegestuurd als Basic-authenticatie.
- **Integration runtime:** standaard `AutoResolveIntegrationRuntime` (cloud). Topdesk is een publiek bereikbare clouddienst; een self-hosted integration runtime is niet nodig.
- **Opslag van credentials:** je vult de gegevens één keer in; Yres bewaart ze in de Azure Key Vault van de klant (secretgroep `adf-{bronnaam}-…`). De frontend slaat geen secrets op.

## Prerequisites

- **API-account / operator:** maak (bij voorkeur) een speciaal API-operatoraccount aan met een permissiegroep die de rechten "REST API" en "Use application passwords" heeft. Dit account heeft leesrechten nodig op de gegevens die je wilt ontsluiten.
- **Applicatiewachtwoord:** log in met dat operatoraccount, open het gebruikersmenu rechtsboven, ga naar Application passwords en kies Add. Het wachtwoord is **maar één keer zichtbaar** — sla het direct op. Je gebruikt de operator-loginnaam als **Username** en dit applicatiewachtwoord als **Password** van de koppeling.

## Gegevens ophalen

Yres haalt data op via de OData-reporting-endpoint van jouw Topdesk-omgeving:

- **Endpoint:** `https://<domein>/services/reporting/v2/odata`, waarbij `<domein>` het volledige domein is dat je bij **Domain** invulde (bijvoorbeeld `mijnorganisatie.topdesk.net`). Yres plakt alleen het `https://`-voorvoegsel en het `/services/reporting/v2/odata`-pad eraan vast — **niet** het `.topdesk.net`-achtervoegsel.
- **Paginatie:** grote resultaatsets worden automatisch doorlopen via de OData-`@odata.nextLink` (pagination type `BodyUrl`).

Zie de officiële documentatie: [Generating an application password](https://docs.topdesk.com/en/generating-an-application-password.html) en [Authorizing access to TOPdesk API](https://docs.topdesk.com/VA2023R2/en/authorizing-access-to-topdesk-api.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
