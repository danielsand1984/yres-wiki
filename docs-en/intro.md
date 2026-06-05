---
slug: /
sidebar_position: 1
title: What is Yres?
description: Yres is the Azure data platform for reliable dashboards and reporting.
---

# What is Yres?

**Yres designs, builds and manages your complete data warehouse in Microsoft Azure**, so data teams can deliver faster with less maintenance and complexity.

Yres sits *beneath* Power BI — not beside it or instead of it. It ensures that the data your dashboards pull in is reliable, up to date and correctly structured.

## In one sentence

> The Azure data platform for a reliable and scalable data environment — built for organizations working with Azure and Power BI.

## The core idea

Data platforms often grow into complex custom structures that are hard to manage and become dependent on a single engineer. With Yres you centralize and standardize data sources, pipelines and management within **one Azure environment**. This lets you work faster with reliable data, without unnecessary complexity.

| | Without Yres | With Yres |
|---|---|---|
| **Connections** | Set up differently per application, custom-built | Standardized, off-the-shelf |
| **Management** | Knowledge held by one engineer | Transparent and transferable |
| **Pipelines** | Fragile scripts | Fixed structures, translated into ADF |
| **Hosting** | — | Your own Azure tenant (default) or hosted by Yres |
| **Onboarding** | Long implementation process | Complete environment within an hour |

## Who it is for

Organizations working with **Microsoft Azure** and **Power BI** that want control over the management of their data sources, pipelines and data warehouse — without manual work or hidden complexity.

## Name change: Iris → Yres

The product used to be called **Iris** and is now called **Yres**. You will still come across "Iris" in older sources, Azure resource names, Confluence spaces (`spaceKey=IRIS`) and internal URLs — that is the same product.

## Domains & endpoints

| Purpose | URL |
|---|---|
| Marketing site | https://oogopdata.nl |
| Web app | https://www.yres.app |
| Feedback mailbox | feedback@yres.app |

## Core concepts

Technically, Yres consists of a set of **Azure resources and templates**. During installation these are created and configured according to the Yres templates; Yres gains access to the Azure tenant via an **App Registration** with the right roles.

- **Organization** — the isolated space in which a customer uses Yres; by default with a **dev** and **prod** environment.
- **Environment** — at least `dev` and `prod`; depending on the license, `test`/`acceptance`/`quality` in between.
- **Projects & changes** — categorize work and transport changes dev → prod.
- **Data sources** — the heart of Yres; the sources data is loaded from.
- **Load Management** — pipelines (ADF), triggers, monitoring and persisted views.

Core features: **SSO** (Azure), **Log Management**, **Life Cycle Management** (dev → prod via changes), **flexibility & scalability** via Azure resources.

## How this wiki is structured

| Section | Content |
|---|---|
| **Product** | Proposition, use cases, features, how it works |
| **Concepts** | Yres explained, load types, glossary |
| **Architecture** | Azure resources, access, setups |
| **Usage (frontend)** | What each panel in the web app does |
| **Setup & installation** | Installing Yres in an Azure tenant |
| **Integrations** | Sources + connection requirements per source |
| **Reference** | SQL interaction, release notes |
| **Pricing · Customers · FAQ · Troubleshooting · Team** | Other |
