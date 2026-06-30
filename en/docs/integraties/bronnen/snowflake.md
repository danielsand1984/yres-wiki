---
title: Snowflake
sidebar_label: Snowflake
description: Connecting Snowflake to Yres — connection requirements.
---

# Snowflake

**Category:** Direct connection

Cloud data warehouse. Internally, Snowflake uses column-oriented (columnar) storage.

## Expected input

When adding a Snowflake source, the wizard (form `getFormAddSourceSnowflake`) asks for the following fields:

| Field | Required | Description |
|---|---|---|
| **Account name** | Yes | The Snowflake account identifier, e.g. in the form `fffffff.ca-central-1.aws` (organization/account + region + cloud). |
| **User name** | Yes | Snowflake username. |
| **Password** | Yes | The password for that user. |
| **Database** | Yes | The database you want to connect to. |
| **Warehouse** | Yes | The virtual warehouse that runs the queries. |
| **Role** | No (optional) | The role the connection uses (determines the permissions). If omitted, the user's default role is used. |

In addition, you provide the source with the general source fields that apply to every source: **source name** (unique, 2–45 characters), **type**, **integration runtime**, **whether the credentials are the same across all environments**, an optional **credentials expiry date** and **tags**.

### Authentication

- **Method:** Basic (username + password).
- The connection is built as a `SnowflakeV2` linked service with `authenticationType: "Basic"`.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`)** is the normal choice: Snowflake is a publicly reachable cloud data warehouse.
- A **self-hosted integration runtime** is optional and only needed when Snowflake is reachable behind network restrictions (firewall/private link). Yres writes the chosen IR into the linked service.

### Requirements

- A Snowflake user with **read access** to the relevant database. Preferably use a dedicated account with **read-only** rights.
- An existing, active **virtual warehouse**.
- The credentials are not stored in Yres. Yres places them as secrets in the customer's **Azure Key Vault** under the names `adf-{source name}-database`, `adf-{source name}-warehouse`, `adf-{source name}-accountName`, `adf-{source name}-userName`, `adf-{source name}-password` and `adf-{source name}-role`. The linked service references these secrets.

:::note Internal staging
For staging, the connector internally uses a blob storage container. This is internal Yres infrastructure and requires no additional input from the customer.
:::

## Obtaining the details

You'll find these values in Snowsight (the Snowflake web interface).

- **Account name** — This is the **account identifier** (preferably in the form `organization-account`, or the legacy account locator). Found via the account menu at the bottom-left of Snowsight → **View account details**, or derived from the account URL `https://<account>.snowflakecomputing.com`.
- **Warehouse** — An existing virtual warehouse that runs the queries. Found in Snowsight under **Admin → Warehouses**.
- **Role** — The role used for the connection (determines permissions). Found/switched via the role switcher in Snowsight. Optional; if omitted, the user's default role is used.
- **Database** — The database you want to connect to, found in the **Databases** list in Snowsight.
- **Username / Password** — The credentials of a Snowflake user. Preferably use a dedicated account with **read-only** rights on the relevant database.

> Official documentation: [Snowflake — Account identifiers](https://docs.snowflake.com/en/user-guide/admin-account-identifier)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
