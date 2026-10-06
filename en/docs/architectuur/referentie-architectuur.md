---
sidebar_position: 1.5
title: Reference architecture
description: The complete Yres setup on Azure on one diagram. Sources, control plane, Azure Data Factory, Azure SQL with SCD2 history, Power BI or Fabric and DTAP, to view on screen or print on A3.
---

# Reference architecture

The complete Yres setup on Azure on one diagram. It shows which sources come in and how, what runs in the Yres tenant and what runs in the customer's tenant, how a load run proceeds and how Power BI or Fabric consumes the data. It is meant for architects, security teams and anyone preparing an installation.

[![Yres reference architecture on Azure](/img/referentie-architectuur-en.webp)](pathname:///referentie-architectuur/yres-azure-architectuur-en.html)

**[Open the diagram at full size](pathname:///referentie-architectuur/yres-azure-architectuur-en.html)** · [Nederlandse versie](pathname:///referentie-architectuur/yres-azure-architectuur-nl.html)

## How to read the diagram

From left to right, the diagram follows the data.

1. **Sources and connectivity.** Cloud sources go through the Azure Integration Runtime. Sources in your own network go through a self-hosted integration runtime that only makes outbound connections (HTTPS, port 443). No inbound port needs to be opened.
2. **Control plane.** The Yres web app runs in the Yres tenant. That is where you set up sources, tables and changes. The web app manages the customer's Azure resources through an App Registration and never stores customer data itself.
3. **Azure Data Factory.** One workflow loads everything in five steps: register the run, read the metadata, load per table (up to five at a time), refresh the reporting views and close the run. The metadata decides which source, which table and which load type.
4. **Azure SQL.** Data lands in STAGE and moves to the HIS layer with SCD2 history. Reports read from Exposed. Optionally, Yres writes the mutations per table as Parquet to a Data Lake.
5. **Power BI or Fabric.** Semantic models read from Exposed. After the load, ADF starts the refresh through the Power BI REST API.

The bottom row shows the Azure resources per environment, security and identity, monitoring and the DTAP pipeline. Each environment has its own Data Factory, SQL database and Key Vault; the self-hosted IR is shared by the three environments.

:::note
The sources on the diagram are examples. All connectors are listed under [Integrations](../integraties/overzicht.md). Resource names on the diagram are placeholders.
:::

## Printing

The diagram is designed for A3 or A2 landscape. Open it at full size and print from the browser: it scales itself to a single page and always prints in the light colours.

## Further reading

- [Architecture](./overzicht.md): the two planes and the stack in text
- [Azure architecture](./azure-architectuur.md): resources, permissions, access levels and network
- [CI/CD & DTAP](./cicd-dtap.md): how changes move from DEV to PROD
- [Load types](../concepten/load-types.md): the seven load types
- [Installation](../setup/installatie.md)
