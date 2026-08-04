---
title: Exact Online
sidebar_label: Exact Online
description: Exact Online koppelen aan Yres — verbindingseisen.
---

# Exact Online

**Categorie:** Directe koppeling  ·  🏅 Official partner

Nederlandse boekhoud-/ERP-software. Official partner. Yres haalt data op via de Exact Online REST API met **OAuth2 (authorization-code)**.

## Verwachte input

Je koppelt Exact Online via een eigen, vooraf geregistreerde Exact-app. In het formulier vul je de OAuth-credentials in en doorloop je daarna een interactieve login waarbij Yres de tokens ophaalt.

| Veld | Toelichting |
|---|---|
| **Bronnaam** (source name) | Unieke naam, begint met een letter, alfanumeriek, 2-45 tekens. Wordt de naam van de ADF linked service en de basis voor de Key Vault-secretnaam `adf-{bronnaam}-…`. |
| **Client ID** | OAuth client-ID van je Exact-app (uit het Exact App Center). |
| **Client secret** | OAuth client-secret van je Exact-app. |
| **Login met ExactOnline** | Interactieve OAuth-popup die na het inloggen automatisch een **access token** en **refresh token** ophaalt en aan Yres koppelt. Het access token is kortlevend (vervalt ~10 minuten na ophalen); Yres ververst het via het refresh token. |
| **Administratie (division)** | Voor de dev-omgeving kies je in een keuzelijst de Exact-administratie (division). Dit bepaalt welke administratie wordt uitgelezen. |

**Authenticatie:** OAuth2 authorization-code (met refresh token), **per omgeving apart**.

**Integration runtime:** cloud — **`AutoResolveIntegrationRuntime`**. Exact Online is een publiek bereikbare SaaS-bron; een self-hosted integration runtime is niet nodig.

**Credentials per omgeving:** voor Exact Online zijn de credentials **altijd verschillend per omgeving** (Yres dwingt "credentials identiek voor alle omgevingen" af op **Nee**). Je registreert dus een **aparte Exact-app voor dev én voor prod** en doorloopt de OAuth-login per omgeving los.

**Secrets:** de webapp slaat geen secrets op in de frontend. De **Client ID en het Client secret** gaan naar de **Azure Key Vault** van de klant (`adf-{bronnaam}-…`); de **access- en refresh-tokens** staan in de tabel **`Config.Tokens`** in de klant-DWH-database, waar Yres ze bijhoudt en ververst. De tokens worden bij de uitvoering in de REST-call geïnjecteerd — de committed linked services (`ExactOnline.json` / `ExactOnline_HTTP.json`, type `RestService`/`HttpServer`) staan zelf op `Anonymous`.

## Voorbereiding

Vóór het koppelen registreer je je Exact-app(s):

1. **App registreren** — log in op het [Exact Online App Center for App Developers](https://apps.exactonline.com) (apps.exactonline.com), open **Manage apps / Apps beheren** en registreer een nieuwe app (voor eigen gebruik). Doe dit **twee keer**: één app voor je **dev**-omgeving en één app voor je **prod**-omgeving.
2. **Client ID + Client secret** — Exact geeft per app een **Client ID** en **Client secret** (de OAuth-credentials). Deze vul je in het Yres-formulier in.
3. **Redirect-URL** — vul bij elke Exact-app de **redirect-URL** in precies zoals die in de Yres-webapp wordt getoond. De redirect moet exact overeenkomen, anders mislukt de OAuth-autorisatie.

:::tip Neem de redirect-URL uit de webapp over
De redirect-URL wordt door de webapp gegenereerd (een `…/exactonline/callback`-adres) en in het koppelformulier getoond. Neem de waarde over zoals die in de webapp staat — vul geen vaste URL uit deze documentatie in.
:::

## Gegevens ophalen

Na het invullen van Client ID en Client secret start je in het formulier de OAuth-login (**"Login with ExactOnline"**). Je logt in bij Exact, geeft toestemming, en de popup keert terug met de tokens. Voor dev kies je daarna de administratie (division). Vanaf dat moment haalt Yres de data via de Exact Online REST API op en ververst het access token automatisch met het refresh token.

Officiële documentatie: [Exact Online — App for Developers / OAuth](https://support.exactonline.com/community/s/knowledge-base#All-All-DNO-Content-oauth-eol-oauth-devstep1).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
