---
title: SAP HANA
sidebar_label: SAP HANA
description: Connect SAP HANA to Yres — connection requirements.
---

# SAP HANA

**Category:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. Connects via OData and a direct ODBC/BDC connection.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

SAP HANA connects via a **direct ODBC** connection or via an **XS OData** service.

- **Host and SQL port** — For an ODBC connection you need the HANA server hostname and the SQL port. The SQL port follows the pattern `3<instance>15` (e.g. `30015` for instance `00`); for a tenant database (MDC) this is `3<instance>13` for the system DB or a tenant-specific port. A SAP/HANA administrator can confirm these.
- **Database user** — A HANA DB user with password and read authorization (`SELECT`) on the relevant schemas/objects.
- **OData alternative** — If data is published through an XS OData service, use the service URL `https://<host>:<port>/<path>.xsodata`.

Official docs: [Connect to SAP HANA via ODBC (SAP Help Portal)](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/66a4169b84b2466892e1af9781049836.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
