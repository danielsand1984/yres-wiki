---
title: SAP HANA
sidebar_label: SAP HANA
description: Connecting SAP HANA to Yres — connection requirements.
---

# SAP HANA

**Category:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. There is **no dedicated input form** for SAP HANA: you
connect either through a **generic database connection (ODBC)** or through an **XS OData** service. The
route you choose determines which source type and which connection fields you use when adding the source.

## Expected input

Which fields you fill in depends on the route you choose. In addition, you always complete the standard
source fields (source name, type, integration runtime, credentials settings) from the *Add source* wizard.

### Route A — Direct ODBC connection (generic database type)

Use the generic database input form and fill in the database connection:

| Field | Description |
|---|---|
| **Host** | The host name (or IP) of the HANA server. |
| **Port** | The SQL port. It follows the pattern `3<instance>15` (e.g. `30015` for instance `00`); for a tenant database (MDC) this is `3<instance>13` for the system DB or a tenant-specific port. A SAP/HANA administrator confirms the correct port. |
| **Username** | A HANA DB user with read authorization (`SELECT`) on the relevant schemas/objects. |
| **Password** | The password of that DB user. |

**Authentication:** Basic (username + password).

**Integration runtime:** **self-hosted integration runtime** (`pwccIntegrationRuntimeLinked`). A direct
ODBC connection runs to an on-prem or shielded HANA server, so the cloud runtime
`AutoResolveIntegrationRuntime` cannot reach it.

### Route B — XS OData service

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

SAP HANA connects through a **direct ODBC** connection or through an **XS OData** service.

- **Host and SQL port (ODBC)** — For an ODBC connection you need the host name of the HANA server and the
  SQL port. The SQL port follows the pattern `3<instance>15` (e.g. `30015` for instance `00`); for a
  tenant database (MDC) this is `3<instance>13` for the system DB or a tenant-specific port. A SAP/HANA
  administrator can confirm these. A direct ODBC connection requires a **self-hosted integration
  runtime**.
- **Database user** — A HANA DB user with a password and read authorization (`SELECT`) on the relevant
  schemas/objects.
- **OData alternative** — If the data is published through an XS OData service, you use the service URL
  `https://<host>:<port>/<path>.xsodata`.

Official docs: [Connect to SAP HANA via ODBC (SAP Help Portal)](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/66a4169b84b2466892e1af9781049836.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
