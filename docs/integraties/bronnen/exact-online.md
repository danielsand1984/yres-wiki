---
title: Exact Online
sidebar_label: Exact Online
description: Exact Online koppelen aan Yres — verbindingseisen.
---

# Exact Online

**Categorie:** Directe koppeling  ·  🏅 Official partner

Nederlandse boekhoud-/ERP-software. Official partner.

## Verbindingseisen

- Exact-apps voor dev én prod

## Setup

Maak Exact-apps aan voor dev én prod en stel de redirect-URL in volgens de aanwijzingen in de webapp.

## Gegevens ophalen

Exact Online gebruikt **OAuth2**. Je moet een **app** registreren in het Exact Online App Center for App Developers (apps.exactonline.com), en wel apart voor **dev** én **prod**.

- **App registreren** — log in op [apps.exactonline.com](https://apps.exactonline.com), open **Manage apps / Apps beheren** en registreer een nieuwe app (voor eigen gebruik). Doe dit twee keer: één app voor je dev-omgeving en één voor je prod-omgeving.
- **Client ID + Client secret** — na registratie geeft Exact per app een **Client ID** en **Client secret** (de OAuth-credentials). Geef deze door aan Yres.
- **Redirect URL** — vul bij elke app de **redirect-URL** in precies zoals aangegeven in de Yres-webapp. Deze moet exact overeenkomen, anders mislukt de OAuth-autorisatie.

Officiële documentatie: [Exact Online — App for Developers / OAuth](https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-devstep1).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
