---
slug: /yres-uitgelegd
sidebar_position: 1
title: Yres explained
description: Yres in plain language — the elevator pitch, the problem it solves and the 10 unique selling points.
---

# Yres explained

> Intended to explain Yres to someone without Azure or data warehouse knowledge — handy for sales and onboarding.

## In plain language

Think of Yres as the **central control room** for all of an organization's data. Instead of information scattered across separate systems, Yres brings everything together in one secure, clear place. You don't have to be a techie to connect sources, keep data up to date and make it available for analysis — Yres automates the heavy lifting, without you writing a single line of code.

- **Data enabler** — makes data easy to find, link and use securely.
- **Smart data organizer** — gathers information from multiple systems in one place.
- **Reliable transporter** — moves data securely and automatically to wherever it's needed.

## Without vs. with Yres

| Without Yres | With Yres |
|---|---|
| Data scattered across places and formats | Everything in one secure, central place |
| Reports take days or weeks | Faster, with up-to-date information |
| Errors from outdated or inconsistent data | Automated, fewer human errors |
| Dependent on a handful of technical experts | Everyone gets the data they need |

## Real-world example

A mid-sized retail company had customer data spread across several systems: sales in one database, marketing campaigns in another and inventory in spreadsheets. Each month, IT spent days manually combining and cleaning that data. Managers waited on reports and worked with outdated figures. And they paid for large VMs to handle the processing — even during quiet periods.

**After Yres**, all sources were connected within a few days: sales, marketing and inventory were updated automatically and ready for the dashboards. Managers got near-real-time insight and could course-correct immediately. Thanks to automatic database scaling, extra capacity was only paid for during heavy processing, and the architecture handled large volumes without expensive VMs.

**Result:** reporting time went from days to minutes, decisions were made faster and the monthly Azure bill went down — all without extra technical staff.

:::note Illustrative example
This is a general, hypothetical example from the Yres course materials — not a specific, named customer.
:::

## 10 Unique Selling Points

1. **No-code data management** — manage sources and pipelines without code.
2. **Seamless Azure integration** — Azure Data Factory, Azure SQL and Blob Storage work together automatically.
3. **Automatic scaling for cost savings** — you only pay for the capacity you actually use during peak processing.
4. **Efficient architecture** — handles large data volumes without big, expensive VMs.
5. **Fast implementation** — pipelines and sources are up in hours, not weeks.
6. **Central visibility** — loads, logs and lifecycle in one interface.
7. **Flexible storage** — choose a database, a Data Lake or both.
8. **Enterprise-grade security** — Azure RBAC + SSO.
9. **No vendor lock-in** — runs entirely in the customer's own Azure environment.
10. **100% Azure-based** — all processes keep working within the customer's Azure environment, even if you stop using Yres.

## How Yres works (no jargon)

Yres lets you **configure sources, tables and load types in simple wizards**. Based on that, **Yres automatically generates the pipelines** in Azure Data Factory that fetch, move and update the data. So you don't design pipelines visually by hand — you fill in a few steps and Yres builds the rest. That makes connecting a new source a matter of configuring, not programming.

## Elevator pitch

> "Yres is a cloud platform that connects all your data, keeps it up to date automatically and makes it easy to use — without technical knowledge. It runs entirely in your own Azure environment, saves costs by scaling smartly, and gives you full control over your data without vendor lock-in."

## "Yres never has direct access" — what that means exactly

This is the strongest, most-repeated selling point of Yres, but it deserves one important nuance.

- **The Yres platform (the web application) itself never has direct access to your data sources.** The central Yres web app manages and configures your environment, but never stores customer data or source data itself. It directs; it doesn't read your sources.
- **The data processing runs entirely in your own Azure environment.** The pipelines that actually move your data run inside your Azure tenant. The credentials for your sources are kept securely in your **Azure Key Vault** — not with Yres. It's these pipelines in your environment that, using those credentials, connect to your sources to fetch data.

In other words: it's not the Yres company reaching into your systems, but the automation running in your own Azure environment. And because all configuration and pipelines live there, everything keeps working — **even if you stop using Yres**. That's the essence of "no vendor lock-in".

:::tip Important selling point
The Yres platform **never has direct access to the customer's data sources**; the data never leaves the customer's own Azure environment. All configured data flows keep working there — even without Yres.
:::

:::info To be confirmed
Some sales materials mention a Yres-hosted option alongside "own Azure tenant". That sits uneasily with the central message that everything runs 100% in the customer's own Azure environment. Have the product owner confirm the exact hosting options and wording before this is communicated externally.
:::
