---
title: Exact Online
sidebar_label: Exact Online
description: Connect Exact Online to Yres — connection requirements.
---

# Exact Online

**Category:** Direct connection  ·  🏅 Official partner

Dutch accounting/ERP software. Official partner.

## Connection requirements

- Exact-apps voor dev én prod

## Setup

Create Exact apps for dev and prod and set the redirect URL as instructed in the web app.

## Where to find these

Exact Online uses **OAuth2**. You must register an **app** in the Exact Online App Center for App Developers (apps.exactonline.com), separately for both **dev** and **prod**.

- **Register an app** — log in to [apps.exactonline.com](https://apps.exactonline.com), open **Manage apps**, and register a new app (for your own use). Do this twice: one app for your dev environment and one for your prod environment.
- **Client ID + Client secret** — after registration Exact provides a **Client ID** and **Client secret** per app (the OAuth credentials). Provide these to Yres.
- **Redirect URL** — for each app, set the **redirect URL** exactly as instructed in the Yres web app. It must match exactly, otherwise OAuth authorization fails.

Official documentation: [Exact Online — App for Developers / OAuth](https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-devstep1).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
