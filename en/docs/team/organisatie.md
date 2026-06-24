---
sidebar_position: 1
title: Organization
description: Who does what within Yres / Plainwater — the company, the team, roles and partners.
---

# Organization

Yres is the data-platform automation product from **Plainwater**. This page describes
the company behind Yres, the roles within the team and the partners around the product.

:::info To be completed
The team composition, roles and partner arrangements below are not yet fully
documented. Fill in the marked sections with input from the team before this
page is published externally.
:::

## Company

Yres is developed and delivered by **Plainwater**. Plainwater issues the
installation invitations (the invitation links) with which a customer starts using Yres in their own Azure
environment, and acts as the product and support party behind the platform.

- **Product:** Yres (formerly **IRIS** — the name still appears in internal identifiers such as
  `IRIS_DWH`, `kv-iris-…` and the pipeline `Dynamic Workflow IRIS`).
- **Company:** Plainwater.

### Contact details

| Channel | Details |
|---|---|
| Address | Friesestraatweg 219, 9743 AD Groningen |
| Email | info@yres.app |
| Phone | +31 85 130 3905 |
| Feedback (in product) | feedback@yres.app |

:::info To be confirmed
The address, phone number and email addresses above come from the existing wiki and the
marketing site, not from the official product documentation. Confirm the exact address details,
the phone number and the literal email addresses (`info@yres.app`, `feedback@yres.app`) with the
team. The **feedback flow** itself is documented (see below); only the exact
email address cannot yet be verified from the product documentation.
:::

## Team & roles

_To be completed:_ who are the data architects, who handles onboarding, who does support, who
does sales and who does product development? Record at least one contact person per role.

A suggested role breakdown you can fill in here:

| Role | Responsibility | Contact person |
|---|---|---|
| Data architect | Data-model setup, load types, SCD2 history | _To be completed_ |
| Onboarding / consultancy | Customer installation, first sources, knowledge transfer | _To be completed_ |
| Support | Health checks, troubleshooting, releases | _To be completed_ |
| Sales | Demos, licenses, commercial agreements | _To be completed_ |
| Product development | New connectors, releases, roadmap | _To be completed_ |

:::info To be completed
Contact persons per customer have not yet been recorded. Add an account owner
for each active customer.
:::

## How the team supports customers

A number of support building blocks are anchored directly in the product and do not need to be
filled in separately:

- **Feedback form (in app):** customers submit a **Bug report**, **Feature
  request** or **Feedback** from the web app; replies go to the account email address. This is the official
  product feedback flow.
- **Health checks:** the health of an environment is checked via the view
  `[Maintenance].[vwYresChecks]` (source file `vwIrisChecks.sql`). See the admin documentation for the
  checks that run on it.
- **Announcements:** administrators send organization-wide or global announcements (for example
  for maintenance or downtime), with Markdown text, priority and a start/end date.
- **Update advice:** always test a new Yres version on the **dev** environment first before
  updating production.

:::info To be completed
SLAs, response times, escalation paths and the sales funnel (ICP, contract terms) are not in the
product documentation. Fill these in from the team.
:::

## Partners

Plainwater delivers ready-made connectors for a number of major source systems. The connectors
themselves are verified in the product; their status as a formal **partner** is a commercial
arrangement that the team must confirm.

- **Source connectors (verified):** Exact Online, AFAS, SAP (SAC, S/4HANA, HANA, Datasphere and
  SAP Business Data Cloud / `SAP_BDC`).
- **Connector commitment:** if a desired application is a common (Standard) system, Plainwater
  helps connect it **free of charge** and the connector is added to a future
  release.

:::info To be confirmed
Whether Exact Online, AFAS and SAP may actually be presented as **official partners** cannot be
derived from the product documentation — only the connectors are verified. Confirm the
partner status, plus any other partnerships, resellers and BI partners (for example Kleinbar, mentioned at
Paragon), with the team.
:::
