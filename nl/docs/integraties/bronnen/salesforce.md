---
title: Salesforce
sidebar_label: Salesforce
description: Salesforce koppelen aan Yres — verbindingseisen.
---

# Salesforce

**Categorie:** Directe koppeling · REST

CRM-platform. Koppelt via meerdere protocollen.

## Verbindingseisen

- Environment URL
- Client ID
- Client secret

## Setup

Haal Consumer ID en secret op uit de App Manager.

## Gegevens ophalen

- **Environment URL** — dit is je My Domain-/login-URL van Salesforce, bijvoorbeeld `https://<mijnbedrijf>.my.salesforce.com`. Je vindt je My Domain in **Setup → Company Settings → My Domain**.
- **Client ID (Consumer Key) + Client secret (Consumer Secret)** — maak een **Connected App** aan via **Setup → App Manager → New Connected App**. Zet **Enable OAuth Settings** aan, vul een callback-URL en de gewenste OAuth-scopes in en sla op. Open daarna de app in App Manager → **Manage Consumer Details** om de **Consumer Key** (Client ID) en **Consumer Secret** (Client secret) te bekijken en te kopiëren.

Officiële documentatie: [Salesforce — Connected App / OAuth client credentials](https://help.salesforce.com/s/articleView?id=xcloud.connected_app_client_credentials_setup.htm&type=5).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
