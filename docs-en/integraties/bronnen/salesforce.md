---
title: Salesforce
sidebar_label: Salesforce
description: Connect Salesforce to Yres — connection requirements.
---

# Salesforce

**Category:** Direct connection · REST

CRM platform. Connects via multiple protocols.

## Connection requirements

- Environment URL
- Client ID
- Client secret

## Setup

Get the Consumer ID and secret from the App Manager.

## Where to find these

- **Environment URL** — this is your Salesforce My Domain / login URL, e.g. `https://<yourcompany>.my.salesforce.com`. Find your My Domain under **Setup → Company Settings → My Domain**.
- **Client ID (Consumer Key) + Client secret (Consumer Secret)** — create a **Connected App** via **Setup → App Manager → New Connected App**. Turn on **Enable OAuth Settings**, set a callback URL and the required OAuth scopes, and save. Then open the app in App Manager → **Manage Consumer Details** to view and copy the **Consumer Key** (Client ID) and **Consumer Secret** (Client secret).

Official documentation: [Salesforce — Connected App / OAuth client credentials](https://help.salesforce.com/s/articleView?id=xcloud.connected_app_client_credentials_setup.htm&type=5).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
