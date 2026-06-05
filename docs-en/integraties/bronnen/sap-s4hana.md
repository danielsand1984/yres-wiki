---
title: SAP S/4HANA
sidebar_label: SAP S/4HANA
description: Connect SAP S/4HANA to Yres — connection requirements.
---

# SAP S/4HANA

**Category:** OData  ·  🏅 Official partner

SAP S/4HANA ERP. Official partner. Connects via OData and a direct ODBC/BDC connection.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

S/4HANA connects via **OData** (and optionally a direct ODBC/BDC connection).

- **Activate the OData service** — A Basis/SAP administrator activates the required OData service in the SAP Gateway using transaction `/IWFND/MAINT_SERVICE` (Service Maintenance): add the service via *Add Service*, choose the back-end system alias (e.g. `LOCAL`) and activate it. Its status must be *Active*.
- **Service URL** — The URL has the form `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>`. Host and port are those of the SAP Gateway/ICM (often HTTPS port `443` or `5<instance>43`). You can test the service with transaction `/IWFND/GW_CLIENT`.
- **Authentication** — Basic authentication with an SAP (communication) user, or OAuth if the Gateway is configured for it. The user needs read authorization on the underlying data.

Official docs: [Activate OData Service in the SAP Gateway Hub (SAP Help Portal)](https://help.sap.com/docs/ABAP_PLATFORM_NEW/cc0c305d2fab47bd808adcad3ca7ee9d/1b023c1cad774eeb8b85b25c86d94f87.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
