---
title: OData
sidebar_label: OData
description: Connect OData to Yres — connection requirements.
---

# OData

**Category:** OData

Generic OData connection. Basic authentication requires a username and password.

## Connection requirements

- URL
- Authentication type
- HTTP headers

## Where to find these

These values come from the provider of the OData service; they are documented in that provider's API documentation.

- **URL**: the service root of the OData feed (often ending in `/odata`). Append `/$metadata` to the service root to inspect the data model (entities and fields).
- **Authentication type**: anonymous, basic, or header — depending on what the service requires. For **Basic**, enter the username and password the provider issued to you.
- **HTTP headers**: any extra headers the API requires (for example, an API key header). The provider's documentation states which headers are needed.

For an explanation of OData services, see the official documentation: [OData — Getting Started / Basic Tutorial](https://www.odata.org/getting-started/basic-tutorial/).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
