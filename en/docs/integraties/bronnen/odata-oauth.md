---
title: OData OAuth
sidebar_label: OData OAuth
description: Connect OData OAuth to Yres — connection requirements.
---

# OData OAuth

**Category:** OData

OData with OAuth authentication. Grant Type "Authorization Code" requires a refresh token.

## Connection requirements

- URL
- Body URL
- Client ID
- Client secret
- Access token URL
- Scope
- Grant Type

## Where to find these

You obtain these values by **registering an OAuth client** with the provider of the OData service. The exact values are documented in that provider's API and OAuth documentation.

- **URL**: the service root of the OData feed.
- **Body URL**: the token endpoint the token request (with the OAuth body) is sent to.
- **Client ID** and **Client secret**: issued to you when you register the OAuth client with the provider.
- **Access token URL**: the provider's token endpoint (often the same as the Body URL).
- **Scope**: the scope(s) that grant access to the desired data; documented by the provider.
- **Grant Type**: usually "Client Credentials" (server-to-server) or "Authorization Code". For **Authorization Code**, a **refresh token** is also required.

For how the client credentials flow works, see a general reference: [OAuth 2.0 client credentials flow](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-client-creds-grant-flow).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
