---
sidebar_position: 2
title: Customer onboarding
description: Getting a new customer live on Yres.
---

# Customer onboarding

> A complete Yres environment is operational **within an hour**; connecting a new source typically takes about 5 minutes.

## Technical checklist

1. **App Registration** in Entra with permissions for Azure Service Management, Key Vault and DevOps; collect the client secret (24 months) + IDs. → [Installation](../setup/installatie.md)
2. **Determine subscription(s) & resource groups** (recommendation: 2–3 environments, a dedicated resource group per environment). Add the app as **Contributor**.
3. **Create the organization** in the web app; environments (`dev`/`prod` + optional), resource names, Azure IDs.
4. **Set up users & roles** (SSO where desired). → [Getting started](../setup/aan-de-slag.md)
5. **Connect data sources** and refresh metadata. → [Connect a data source](../setup/databron-koppelen.md)
6. **Configure loads & triggers**; optionally master pipelines. → [Views, pipelines & triggers](../setup/views-pipelines.md)
7. **Connect Power BI models** if applicable.

## Guidance

What customers valued during onboarding:
- **Product sessions** on how Yres works and explanations of self-management.
- **Scrum approach** with three-week sprints and clear deliverables (Woonstichting 'thuis).
- **Strategic / inspiration sessions** around cloud migration (Paragon).
- **Proactive checks** (daily monitoring) and a fixed point of contact for incidents.

:::info To be completed
Formalize this into a standard onboarding process: lead time, who does what, templates, kick-off agenda, delivery document. Currently derived from setup docs + interviews.
:::
