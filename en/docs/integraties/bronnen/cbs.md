---
title: Centraal Bureau voor de Statistiek (CBS)
sidebar_label: Centraal Bureau voor de Statistiek (CBS)
description: Connect Centraal Bureau voor de Statistiek (CBS) to Yres — connection requirements.
---

# Centraal Bureau voor de Statistiek (CBS)

**Category:** OData

Official Dutch statistics (StatLine) via OData. In Yres, CBS is a **preset** on top of the
generic OData source type: the OData feed URL and the authentication are already fixed, so you only fill
in the dataset you want. Behind the scenes the source is stored as type `OData`.

## Expected input

When you add a CBS source, you go through the **"Add source" wizard**. Besides the general
fields that apply to every source, the CBS form asks for just one source-specific field.

### General fields (for every source)

| Field | Notes |
|---|---|
| **Source name** (`source_name`) | Required, unique per organization, 2–45 characters, starts with a letter (alphanumeric). Becomes the name of the linked service in ADF. CBS has no credentials, so no `adf-{sourcename}-…` secrets are created in Key Vault. |
| **Type** | Select **CBS** in the source picker. |
| **Integration runtime** | Default **`AutoResolveIntegrationRuntime`** (cloud). See [Integration runtime](#integration-runtime). |
| **Credentials the same for all environments?** | Not relevant for CBS — there are no credentials. |
| **Credentials expire?** | Not applicable (no credentials). |
| **Tags** | Optional, comma-separated. |

### Source-specific field

| Field | Required | Notes |
|---|---|---|
| **Dataset** | Yes | The table/dataset identifier from CBS (e.g. the table code from the CBS data portal). |

The **base URL is fixed and read-only**: Yres places your dataset after
`https://opendata.cbs.nl/ODataFeed/odata/`. So you don't have to build or enter a full URL —
just the dataset identifier.

The following settings are filled in **automatically** and are not visible in the form:

- **Authentication:** `Anonymous` (open data, no credentials).
- **Pagination:** `paginationType = BodyUrl` with `body_url = $['@odata.nextLink']` — Yres
  automatically follows the `@odata.nextLink` continuation URLs to retrieve large datasets in full.

## Authentication

**Anonymous — no credentials.** CBS StatLine is open data, so no username,
password, API key or token is needed. No secrets are stored in Azure Key Vault either.

## Integration runtime

**Cloud (`AutoResolveIntegrationRuntime`).** The CBS OData feed is publicly reachable over the internet,
so the default cloud IR is sufficient. A self-hosted integration runtime is not needed.

## Requirements

- No app registration, client secret, SAS token or Key Vault secret needed.
- You only need the **dataset identifier** of the CBS table you want. Look it up in the
  CBS data portal ([opendata.cbs.nl](https://opendata.cbs.nl/)) or via the catalog service.

:::tip Feed vs. standard API
CBS offers a **Feed variant** (for retrieving large amounts of data) alongside the standard
OpenData API (limited to 10,000 cells per call). Yres uses the Feed variant
(`/ODataFeed/odata/`), so that even large tables can be loaded in full.
:::

## Load types and delta

CBS delivers complete tables via OData. In practice you use a load type that processes the full set
(for example **FULL** or **IMAGE**). Note: in Yres, **FULL** preserves the SCD2 history
(new records added, changed records as a new version); only **OVERWRITE** removes the
history. See [Load types](../../concepten/load-types.md) for the full explanation.

---

**Official documentation:** [StatLine as open data](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data) · [Quick start guide](https://www.cbs.nl/en-gb/our-services/open-data/statline-as-open-data/quick-start-guide)

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
