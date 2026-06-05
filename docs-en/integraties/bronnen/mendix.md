---
title: Mendix
sidebar_label: Mendix
description: Connect Mendix to Yres — connection requirements.
---

# Mendix

**Category:** Direct connection · REST

Low-code application platform. Connects via multiple protocols.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Mendix connects via **REST/OData** using OData services published by the Mendix app.

- **Publish an OData service** — In the Mendix app (Studio Pro), add a *Published OData service* and expose the required entities/resources. The *location* sets the path, e.g. `svc/products/v1/`.
- **Service URL** — A list of published services is available at the app's root URL followed by `/odata-doc/` (e.g. `https://<app-host>/odata-doc/`). The service itself runs at `https://<app-host>/<location>/`.
- **Credentials** — Configure the service to require authentication (e.g. a Mendix user role or API key/Basic auth, depending on the app configuration) and provide that user/key.

Official docs: [Published OData Services (Mendix Documentation)](https://docs.mendix.com/refguide/published-odata-services/).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
