---
title: Snowflake
sidebar_label: Snowflake
description: Connect Snowflake to Yres — connection requirements.
---

# Snowflake

**Category:** Direct connection

Cloud data warehouse. Uses column-oriented storage by default.

## Connection requirements

- Account name
- Username
- Password
- Database
- Warehouse
- Role (optional)

## Where to find these

You'll find these values in Snowsight (the Snowflake web interface).

- **Account name** — This is the **account identifier** (preferably in the form `organization-account`, or the legacy account locator). Found via the account menu at the bottom-left of Snowsight → **View account details**, or derived from the account URL `https://<account>.snowflakecomputing.com`.
- **Warehouse** — An existing virtual warehouse that runs the queries. Found in Snowsight under **Admin → Warehouses**.
- **Role** — The role used for the connection (determines permissions). Found/switched via the role switcher in Snowsight. Optional; if omitted, the user's default role is used.
- **Database** — The database you want to connect to, found in the **Databases** list in Snowsight.
- **Username / Password** — The credentials of a Snowflake user. Preferably use a dedicated account with **read-only** rights on the relevant database.

> Official documentation: [Snowflake — Account identifiers](https://docs.snowflake.com/en/user-guide/admin-account-identifier)

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
