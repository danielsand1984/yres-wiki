---
title: AFAS
sidebar_label: AFAS
description: AFAS koppelen aan Yres — verbindingseisen.
---

# AFAS

**Categorie:** Directe koppeling  ·  🏅 Official partner

Nederlands ERP-systeem. Official partner.

## Verbindingseisen

- URL
- API token

## Setup

Koppel via de AFAS app-connector.

## Gegevens ophalen

- **URL** — dit is de REST-basis-URL van je AFAS Profit/InSite-omgeving: `https://<env>.rest.afas.online/profitrestservices`. `<env>` is je omgevingsnummer (te zien in AFAS Profit, bijvoorbeeld `12345`).
- **API token** — maak in AFAS Profit een **App connector** aan via **Algemeen → Beheer → App connector**. Voeg daar de GetConnectors toe die Yres mag uitlezen en genereer vervolgens het token. Het token wordt als XML-bestand opgeslagen; geef de tokenwaarde door aan Yres. De autorisatieheader van AFAS heeft de vorm `AfasToken <token>`.

Officiële documentatie: [AFAS Profit — GetConnector / App connector](https://docs.afas.help/profit/en/get-connector).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
