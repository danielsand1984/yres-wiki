---
title: SAP HANA
sidebar_label: SAP HANA
description: Connecting SAP HANA to Yres — connection requirements.
---

# SAP HANA

**Category:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. There is **no dedicated input form** for SAP HANA and
also **no generic HANA/ODBC source type**: you connect HANA data through an **XS OData** service, or
through an export route such as [**SAP_BDC**](sap-bdc.md).

## Expected input

In addition to the route-specific fields below, you always complete the standard source fields (source
name, type, integration runtime, credentials settings) from the *Add source* wizard.

:::caution Direct ODBC/database connection — not available
Yres has **no** HANA or ODBC source type: a direct database connection to the HANA server's SQL port is
therefore **not possible** — neither in the source picker nor in the load engine. Use the XS OData
route below, or the export route via SAP_BDC.
:::

### XS OData service

If the data is published through an **XS OData** service, you connect it as an OData source and fill in the
service URL:

| Field | Description |
|---|---|
| **Url** | The OData service URL in the form `https://<host>:<port>/<path>.xsodata`. |
| **Username / Password** | The HANA/XS user used to access the service (Basic), if the service is not anonymous. |

**Authentication:** Basic (or OAuth, if the service is set up for it — see *OData OAuth*).

**Integration runtime:** **`AutoResolveIntegrationRuntime`** (cloud) if the OData service is reachable over
the internet; a self-hosted integration runtime if the service sits behind a firewall.

:::note No dedicated source type — via SAP_BDC or OData
SAP HANA has **no dedicated wizard form** in Yres (source picker `SourceField.tsx`). Depending on the use
case, you connect HANA via **SAP_BDC** or via **OData** (XS OData / SAP Gateway). Which route fits depends
on how your HANA environment exposes its data; align this with your SAP/HANA administrator.
:::

:::note How Yres stores credentials
The details you enter are not retained by Yres but written as secrets to the Azure Key Vault of your
environment under names that start with `adf-{bronnaam}-`. The linked service references those secrets.
:::

## Gathering the details

You connect SAP HANA through an **XS OData** service (or through the SAP_BDC export route).

- **OData service URL** — If the data is published through an XS OData service, you use the service URL
  `https://<host>:<port>/<path>.xsodata`. A SAP/HANA administrator can confirm the correct service URL.
- **Service user** — The HANA/XS user (with password) used to access the service, with read
  authorization on the relevant objects.
- **No direct database connection** — the HANA server's host name and SQL port are not relevant to
  Yres: a direct ODBC connection is not supported (see above).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
