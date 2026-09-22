---
title: OneStream
sidebar_label: OneStream
description: Connect OneStream to Yres — connection requirements.
---

# OneStream

**Category:** REST

Corporate Performance Management. Yres connects to OneStream via the REST API with OAuth 2.0 or a Personal
Access Token.

## Connection requirements

- URL
- Application
- Authentication type (`OAUTH2` or `PAT`)
- For `OAUTH2`: Client ID · Client secret · Access token URL
- For `PAT`: Personal access token (PAT)

## Expected input

OneStream connects via the **REST API**. You fill in the following fields in the wizard screen. You choose the **authentication method** yourself through the **Authentication type** selector: OAuth 2.0 client-credential (`OAUTH2`) or a Personal Access Token (`PAT`).

**Always required:**

- **URL** — The base URL of the OneStream REST API of your environment (the Web API / OneStream server URL).
- **Application** — The name of the OneStream application that data is pulled from.
- **Authentication type** — A selector with two options: `OAUTH2` or `PAT`. The remaining fields depend on your choice.

**With Authentication type = `OAUTH2`** (OAuth 2.0, `client_credentials`):

- **Client ID** + **Client secret** — These come from the application registered with your identity provider (Azure AD / Microsoft Entra ID, Okta or PingFederate) that uses the OneStream Web API. Copy the client secret immediately after creating it — it is usually only shown once.
- **Access token URL** — The token endpoint of that identity provider. For Azure AD this is `https://login.microsoftonline.com/<tenant-id>/oauth2/v2.0/token`.

**With Authentication type = `PAT`:**

- **Personal access token (PAT)** — A personal access token that you create in OneStream.

**Authentication:** OAuth 2.0 client-credential (`OAUTH2`) **or** Personal Access Token (`PAT`). Under the hood Yres builds a linked service of type **RestService** with **Anonymous** authentication; the token or the OAuth credentials are passed as an HTTP credential from Key Vault.

**Integration runtime:** By default the cloud IR **`AutoResolveIntegrationRuntime`**. OneStream is reachable over HTTPS, so a self-hosted integration runtime is normally not needed. Yres writes the chosen integration runtime into the linked service (`connectVia`); only select a self-hosted IR if your OneStream environment is reachable exclusively within a secured network.

**Prerequisites:**

- For `OAUTH2`: an application registered with your identity provider (Azure AD / Entra ID, Okta or PingFederate) with a **client secret**, authorized for the OneStream Web API. Have your **OneStream administrator** configure and provide it.
- For `PAT`: a **Personal Access Token** created in OneStream.
- The secrets you enter are stored by Yres in your **Azure Key Vault** under the naming `adf-{sourcename}-…`. For `OAUTH2` these include `adf-{sourcename}-clientId`, `adf-{sourcename}-clientSecret`, `adf-{sourcename}-url`, `adf-{sourcename}-application` and `adf-{sourcename}-authType`; for `PAT` these are `adf-{sourcename}-token`, `adf-{sourcename}-url`, `adf-{sourcename}-application` and `adf-{sourcename}-authType`. The frontend itself never stores secrets.

## Retrieving data

Have the values above configured and provided by your **OneStream administrator**. Yres treats OneStream as a **REST** source; metadata detection and adding tables go through the source's REST mechanism.

Official documentation: [OneStream Web API Authentication](https://documentation.onestream.com/docs/Content/SPC/Web%20API%20Authentication.html) · [Azure AD (Microsoft Entra ID) Configuration](https://documentation.onestream.com/docs/Content/REST%20API/Azure%20AD%20Configuration.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
