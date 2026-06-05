---
title: OneStream
sidebar_label: OneStream
description: Connect OneStream to Yres — connection requirements.
---

# OneStream

**Category:** REST

Corporate Performance Management. **Preview** — may be unstable.

## Connection requirements

- URL
- Client ID
- Client secret
- Access token URL
- Application

## Where to find these

OneStream connects via the **REST API**, secured with OAuth 2.0 (`client_credentials`). This is a **preview** connector.

- **URL** — The base URL of your environment's OneStream REST API (the Web API / OneStream server URL).
- **Application** — The name of the OneStream application to pull data from.
- **Client ID + Client secret** — Come from the application registered with your identity provider (Azure AD / Microsoft Entra ID, Okta or PingFederate) that the OneStream Web API uses. Copy the client secret immediately after creation — it is only shown once.
- **Access token URL** — The token endpoint of that identity provider. For Azure AD this is `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`.

Have these values configured/provided by your **OneStream administrator**. Official docs: [OneStream Web API Authentication](https://documentation.onestream.com/docs/Content/SPC/Web%20API%20Authentication.html) · [Azure AD (Microsoft Entra ID) Configuration](https://documentation.onestream.com/docs/Content/REST%20API/Azure%20AD%20Configuration.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
