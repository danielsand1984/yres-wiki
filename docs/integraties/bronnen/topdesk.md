---
title: Topdesk
sidebar_label: Topdesk
description: Topdesk koppelen aan Yres — verbindingseisen.
---

# Topdesk

**Categorie:** Directe koppeling

Service-managementtool. Directe koppeling.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Topdesk koppelt via zijn **REST API**. Je hebt een gebruikersnaam en een **applicatiewachtwoord** nodig; deze worden via Basic-authenticatie meegestuurd.

- **Base URL**: de API van jouw Topdesk-omgeving heeft de vorm `https://<organisatie>.topdesk.net/tas/api`. Vervang `<organisatie>` door je eigen Topdesk-subdomein.
- **API-account / operator**: maak (bij voorkeur) een speciaal API-operatoraccount aan met een permissiegroep die de rechten "REST API" en "Use application passwords" heeft.
- **Applicatiewachtwoord**: log in met dat operatoraccount, open het gebruikersmenu rechtsboven, ga naar Application passwords en kies Add. Het wachtwoord is **maar één keer zichtbaar** — sla het direct op. Je gebruikt de operator-loginnaam + dit applicatiewachtwoord als gebruikersnaam/wachtwoord van de koppeling.

Zie de officiële documentatie: [Generating an application password](https://docs.topdesk.com/en/generating-an-application-password.html) en [Authorizing access to TOPdesk API](https://docs.topdesk.com/VA2023R2/en/authorizing-access-to-topdesk-api.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
