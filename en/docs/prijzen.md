---
sidebar_position: 9
title: Pricing
description: Essentials, Advanced and Ultimate — license packages based on sources and environments.
---

# Pricing

> The biggest data costs rarely sit in the tooling itself. They sit in maintenance, outages and the hours engineers spend keeping custom solutions running. Yres replaces that complexity with a standardized Azure environment: predictable costs, less dependency, more control.

## How the license works

A Yres license isn't billed per individual component; instead it defines **how many source systems** and **how many environments** you may set up. The package you choose fixes those two limits:

- **Source systems** — the number of data sources (SQL Server, Exact Online, AFAS, REST APIs, and so on) you may connect.
- **Environments** — the number of DTAP environments (for example `dev`, `test`, `production`). The first environment is always called **dev**.

The license itself is tied to a **single-use invitation link** from Plainwater: linked to one Microsoft account, configured for the purchased package, and no longer usable after installation. The license is recorded in the database and caps usage according to the chosen package.

## Packages

| | **Essentials** | **Advanced** ⭐ | **Ultimate** |
|---|---|---|---|
| **Price** | €350/mo | €674/mo | €997/mo |
| **For** | Small teams & starting environments | Most data teams | Large, complex environments |
| **Environments** | 1 | 2 | Unlimited |
| **Source systems** | Max. 2 | Max. 5 | All supported sources |
| **Tables** | Unlimited | Unlimited | Unlimited |
| **Hosting** | Your own Azure tenant | Your own Azure tenant | Your own Azure tenant |
| **Changes system** | — | ✅ | ✅ |
| **Automatic database scaling** | — | ✅ | ✅ |
| **Web application firewall** | — | ✅ | ✅ |
| **Local networks (via IR)** | ✅ | ✅ | ✅ |
| **Site-to-site VPN** | — | — | ✅ |

⭐ Advanced = **most chosen**.

The **source systems / environments** split per package (2 / 1 · 5 / 2 · unlimited / unlimited) is fixed in the license. Tables are not limited: these are configuration rows, not licensed objects.

:::info To be confirmed
The **monthly prices** (€350 / €674 / €997) are commercial rates that don't appear in the product documentation and must be confirmed by the owner before they're published. The **package structure** itself — Essentials = 2 source systems / 1 environment, Advanced = 5 source systems / 2 environments, Ultimate = unlimited — has been verified.
:::

:::info To be confirmed
The **mapping of features to packages** (changes system, automatic scaling, web application firewall, site-to-site VPN, local networks via IR) has not yet been confirmed. The features all exist, but the product documentation doesn't tie them to a specific package. Two points to watch:

- **Site-to-site VPN** is configured on request and is therefore not necessarily Ultimate-only.
- The **changes system** is technically present in every data warehouse; whether it's commercially restricted to Advanced/Ultimate needs to be confirmed.

Have the owner verify the tier assignment per feature.
:::

:::info To be confirmed
The option to have Yres **hosted by Plainwater** instead of in your own Azure tenant doesn't appear in the product documentation and is at odds with the core message that everything runs **100% within your own Azure tenant** (no vendor lock-in). For now, the table above therefore lists only "Your own Azure tenant". Confirm whether the Yres-hosted variant is offered and on which packages.
:::

## What's in each package?

### Essentials
For small teams and starting environments. One environment, a maximum of two source systems, and an unlimited number of tables. Local networks are reachable via a self-hosted integration runtime.

### Advanced ⭐
The most chosen package. In addition to a second environment — so you can safely keep developing on `dev` without touching existing dashboards in production — you get access to the **changes system**, **automatic scaling** of databases and the **web application firewall**.

### Ultimate
For large, complex environments: an unlimited number of source systems and environments, plus the option of a **site-to-site VPN** for isolated networks.

## Frequently asked pricing questions

**What's the difference between Essentials and Advanced?**
With Essentials you work in a single environment. Advanced gives you a separate development and production environment, so you can safely keep developing without touching existing dashboards. According to the current (still to be confirmed) tier breakdown, the changes system and automatic scaling are also reserved for Advanced and Ultimate.

**Do we need at least a dev and a production environment?**
The first environment is always called **dev** and is mandatory. A second environment (for example production) comes with Advanced and higher; Essentials offers only one environment. For larger teams we generally recommend two to four environments.

**Can we scale up later?**
Yes. You can move to a larger package at any time. We handle the migration without your environment going offline.

:::info To be confirmed
Scaling up without downtime is a commercial commitment that can't be found in the product documentation. Confirm the exact conditions.
:::

**Do our data and pipelines run on your infrastructure?**
By default, no: Yres runs within your own Azure tenant and your data never leaves your environment. Yres never has direct access to your sources, and your processes keep working even if you stop using Yres — there is no vendor lock-in.

See the full [FAQ](./faq.md).
