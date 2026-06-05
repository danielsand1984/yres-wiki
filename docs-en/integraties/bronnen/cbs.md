---
title: Centraal Bureau voor de Statistiek (CBS)
sidebar_label: Centraal Bureau voor de Statistiek (CBS)
description: Connect Centraal Bureau voor de Statistiek (CBS) to Yres — connection requirements.
---

# Centraal Bureau voor de Statistiek (CBS)

**Category:** OData

Official Dutch statistics via OData.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

CBS data is **open data**: no credentials or keys are required. You only need the OData feed URL of the table you want.

1. Pick a dataset/table in the CBS data portal ([opendata.cbs.nl](https://opendata.cbs.nl/)) or via the catalog service.
2. Use that table's OData feed URL as the connection URL. CBS offers a Feed variant (for retrieving large amounts of data) and a standard API (limited to 10,000 cells per call).

See the official documentation: [StatLine as open data](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data) and the [Quick start guide](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data/quick-start-guide).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
