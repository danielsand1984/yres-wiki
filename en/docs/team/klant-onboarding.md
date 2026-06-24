---
sidebar_position: 2
title: Customer onboarding
description: Getting a new customer live on Yres — technical checklist and guidance.
---

# Customer onboarding

This page describes how to take a new customer from zero to a working Yres environment: first the technical preparation in Azure, then creating the organization and setting up sources, loads and reporting.

> A typical Yres environment installation takes on the order of **~20 minutes** (the Azure resources are actually provisioned). The lead time for a full onboarding — including sources, loads and initial reporting — depends on the number of sources and the agreements made with the customer.

:::info To be confirmed
The exact lead time for a complete customer onboarding (from kick-off to first working report) and the guideline "you connect a new source in ~X minutes" have not yet been formally established. Confirm these figures before presenting them externally as a promise.
:::

## Technical checklist

Work through the steps in this order. The Azure preparation (steps 1–2) is done by the customer themselves; creating the organization (step 3) happens in the SuperAdmin panel, performed by the Yres/Plainwater administrator.

1. **App Registration** in Microsoft Entra with the correct API permissions and a client secret. Add these delegated permissions:
   - **Azure Service Management** (`user_impersonation`) — manage the Azure subscription, resource groups and resources.
   - **Microsoft Graph** → **User.Read** — read the signed-in user's profile.
   - **Azure Key Vault** — write and read source credentials.
   - **Azure DevOps** — the Git/CI/CD integration (DACPAC deploy + `publish-datafactory`).

   Then create a **client secret** (validity max. 24 months) and gather the **Application (client) ID**, **Directory (tenant) ID**, the **Object ID** of the Managed Application and the **secret value**. → [Installation](../setup/installatie.md)
2. Determine the **subscription(s) & resource groups** (recommendation: 2–4 environments, a dedicated resource group per environment) and add the App Registration as **Owner** at resource-group or subscription level. → [Installation](../setup/installatie.md)
3. **Create the organization** in the webapp (SuperAdmin): environments (`dev` and `prod` required, optionally `test`/`acc`/`quality`), resource names using the `$` convention and the Azure values from step 1. → [Installation](../setup/installatie.md)
4. **Set up users & roles** (SSO where desired). → [Getting started](../setup/aan-de-slag.md)
5. **Connect data sources** and refresh metadata. → [Connect a data source](../setup/databron-koppelen.md)
6. **Set up loads & triggers**; master pipelines if needed. → [Views, pipelines & triggers](../setup/views-pipelines.md)
7. **Connect Power BI models** where applicable.

:::warning Owner is required — not Contributor
The App Registration needs **Owner** rights, not just Contributor. During installation, Yres has to **assign roles to the managed identities** of the created resources (for example the Data Factory that is allowed to access the Key Vault and the SQL database). Only an Owner may create role assignments. Grant Owner at **resource-group level** (recommended) or at **subscription level**.
:::

## Guidance

What customers valued during onboarding:

- **Product sessions** on how Yres works and explanation of self-management.
- **Scrum way of working** with three-week sprints and clear deliverables.
- **Strategic / inspiration sessions** around cloud migration.
- **Proactive checks** (daily monitoring) and a dedicated point of contact for incidents.

:::info To be confirmed
The ways of working mentioned above come from earlier customer engagements and have not been formally established as standard. Confirm which components are part of the regular onboarding offering (and for which customers/quotes these may be shared publicly) before using them externally.
:::

:::info To be filled in
Formalize this into a standard onboarding process: lead time, who-does-what, templates, kick-off agenda and handover document.
:::
