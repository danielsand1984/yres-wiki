---
title: SAP S/4HANA
sidebar_label: SAP S/4HANA
description: Connect SAP S/4HANA to Yres — connection requirements.
---

# SAP S/4HANA

**Category:** OData  ·  🏅 Official partner

SAP S/4HANA ERP. Official partner. In Yres, SAP S/4HANA has **no dedicated connector with its own
form**: you connect the system through one of the generic connection routes — an **OData** service
(the most common route), a **direct database/ODBC connection** to the underlying SAP HANA, or via the
**SAP Business Data Cloud (SAP_BDC)** when data is delivered there as files.

## Expected input

Which fields you fill in depends on the route you choose. In every case, the **Add source** wizard first
asks for the shared fields that apply to *every* source: **Source name** (unique, 2–45 characters; becomes
the name of the linked service and the basis for the Key Vault secrets `adf-{bronnaam}-…`), **type**,
**integration runtime**, *are credentials identical for all environments?*, *credentials expiry date* and
*tags*.

### Route A — OData service (recommended)

In the wizard, choose the source type **OData** (or **OData OAuth** if the SAP Gateway uses OAuth). The
OData form (`getFormAddSourceOdata` / `getFormAddSourceOdataOauth`) asks for:

| Field (label) | Notes |
|---|---|
| **Url** | The service root of the OData service, in the form `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>/`. Yres automatically appends a trailing `/`. |
| **Pagination type** | Fixed at **`BodyUrl`** (read-only): pagination uses the OData `nextLink`. |
| **Body url** | JSON path to the next-page link. Defaults to `$['@odata.nextLink']`. |
| **Authentication type** | **`Anonymous`** or **`Basic`**. With **Basic**, the extra fields **Username** and **Password** appear — the SAP (communication) user with read authorization. |
| **HTTP headers** (optional) | One or more header/value pairs for APIs that require an additional header. |

For OAuth (via the **OData OAuth** route), instead of username/password you fill in the OAuth fields:
**Client id**, **Client secret**, **Access token url**, **Scope** and **Grant Type** (`Client Credentials`
or `Authorization Code`; with Authorization Code a **Refresh token** is also required).

- **Authentication:** Basic (SAP user + password) or OAuth2, depending on how the SAP Gateway is
  configured.
- **Integration runtime:** if the OData service is publicly reachable, choose
  **`AutoResolveIntegrationRuntime`** (cloud). If the SAP Gateway is **on-premises or behind a firewall**,
  choose a **self-hosted integration runtime**.
- **Secrets:** Yres does not store secrets itself. The backend writes the values to the customer's
  **Azure Key Vault** under the group **`adf-{bronnaam}-…`** (for Basic, among others
  `adf-{bronnaam}-basic-http-username` and `adf-{bronnaam}-basic-http-password`; the URL as
  `adf-{bronnaam}-http-url`); the linked service references them.

See the [OData](odata.md) and [OData OAuth](odata-oauth.md) pages for the full field overview of these
two source types.

### Route B — Direct database/ODBC connection (SAP HANA)

If you want to access the underlying SAP HANA database directly, use the generic database/HANA route. See
[SAP HANA](sap-hana.md) for the fields: **Host**, **SQL port** (pattern `3<instance>15`), **database user**
and **password**. A direct HANA connection is usually on-premises or firewalled and therefore requires a
**self-hosted integration runtime**.

### Route C — SAP Business Data Cloud (SAS token)

If data is delivered via SAP BDC as files (Azure Blob FS / Data Lake), you connect it through the
**SAP_BDC** form with a **SAS uri**, **container** and **SAS token**. This is a separate route with its own
authentication (SAS) and runs on the cloud integration runtime.

:::note No dedicated source type — generic route
SAP S/4HANA has no dedicated source type or form in `CreateSource.tsx`; the code only contains the generic
`OData`/`ODataoAuth`, HANA database and `SAP_BDC` routes (no `Datasphere.json`-style or `SapTable`
connector). Which route is right in your situation — OData via the SAP Gateway, a direct HANA connection, or
SAP_BDC — depends on how the SAP environment exposes its data. Coordinate this with your SAP/Basis
administrator. The `saphana`/`saptable` images in the webapp are just icons, not separate connectors.
:::

## Where to find these

S/4HANA connects most often via an **OData** service from the SAP Gateway.

- **Activate the OData service** — A Basis/SAP administrator activates the required OData service in the SAP
  Gateway. Use transaction `/IWFND/MAINT_SERVICE` (Service Maintenance) for this: add the service via
  *Add Service*, choose the system alias of the back-end system (e.g. `LOCAL`) and activate the service. Its
  status must be *Active*.
- **Service URL** — The URL has the form
  `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>`. Host and port are those of the SAP
  Gateway/ICM (often HTTPS port `443` or `5<instance>43`). You can test the service with transaction
  `/IWFND/GW_CLIENT`.
- **Authentication** — Basic authentication with an SAP (communication) user, or OAuth if the Gateway is
  configured for it. The user needs read authorization on the underlying data.

### Requirements

- An activated OData service in the SAP Gateway (see above) and an **SAP (communication) user** with read
  authorization on the relevant data.
- For OAuth: a configured OAuth client in the SAP Gateway (client id/secret, token endpoint).
- For an on-premises or firewalled SAP environment: an installed and published **self-hosted integration
  runtime** that can reach the SAP Gateway.

## Load types and delta

S/4HANA via OData supports the standard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL).
Note: **FULL** and **RELOAD** preserve history (SCD2); only **OVERWRITE** removes the existing history. For
delta loads, set a delta column based on a reliable changed-on field in the OData entity.

Official docs: [Activate OData Service in the SAP Gateway Hub (SAP Help Portal)](https://help.sap.com/docs/ABAP_PLATFORM_NEW/cc0c305d2fab47bd808adcad3ca7ee9d/1b023c1cad774eeb8b85b25c86d94f87.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
