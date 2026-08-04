---
sidebar_position: 1
title: Installation
description: Installing Yres in an Azure tenant — from App Registration to the first organization.
---

# Installation

Yres runs entirely in **your own Azure tenant**. An installation consists of a set of Azure resources (Data Factory, Azure SQL `IRIS_DWH`, Key Vault, optionally a Data Lake) that Yres creates and configures according to the Yres templates while an organization is being created. To do this, Yres needs access to your Azure subscription through an **App Registration** with the appropriate roles and API permissions.

The installation proceeds in three steps, in this order:

1. Create an **App Registration** in Microsoft Entra (the identity Yres uses to manage your Azure).
2. Prepare the **subscription(s) and resource groups** and assign the app as **Owner**.
3. **Hand over the values** to Yres/Plainwater, who use them to create your organization and environments and roll out the resources.

:::info What you do, what Yres does
As a customer you prepare steps 1 and 2 (App Registration and Azure permissions) yourself. You hand over the values they produce; actually creating your organization and rolling out the resources happens on the Yres/Plainwater side (step 3).
:::

## 1. Preparation — App Registration

1. In **Microsoft Entra**, create a new **App Registration** (e.g. `Yres-dataplatform-user`). Account type: **Single tenant**; leave the redirect URI empty. Click **Register**.
2. Open the app → **API permissions** → **Add a permission** and add:
   - **Azure Service Management** → delegated permission **user_impersonation** — lets Yres manage the Azure subscription, the resource groups and the resources.
   - **Microsoft Graph** → delegated permission **User.Read** — for reading the signed-in user's profile.
   - **Azure Key Vault** — for writing and reading source credentials in the Key Vault.
   - **Azure DevOps** — for the Git/CI-CD integration (DACPAC deploy + `publish-datafactory`).
3. Go to **Certificates & secrets** → **New client secret** (e.g. name `WebApp`), validity max. **24 months** (recommended: 24). **Copy the secret value immediately** — it will no longer be visible later.
4. Collect these four values (on **Overview** and at the Managed Application):
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Object ID** of the **Managed Application** _(note: not the Object ID from the first Overview screen, but the one from the Enterprise/Managed Application)_
   - **Client secret** (the value from step 3)

:::danger Store securely
You will need the client secret, client ID, tenant ID and object ID in step 3. Keep them in a secure store; you cannot view the client secret again after creating it.
:::

## 2. Subscriptions & resource groups

Decide beforehand:

1. **How many environments?** The first environment is always **`dev`**; `prod` is required for production. In between, `test`, `acceptance` (acc) and `quality` are possible.
2. **One subscription, one per environment, or mixed?**
3. **One resource group, one per environment, or mixed?**

:::info Number of environments depends on your license
The number of environments you may roll out is license-bound. **Essentials** supports **one environment** (`dev`); **Advanced** two; **Ultimate** a maximum of **six** (enforced by the webapp). So for a DTAP pipeline (dev → test → prod) you need at least Advanced or higher. See [Pricing](../prijzen.md) for the exact tiers.
:::

**Recommendation:** 2–4 environments, each with its own resource group, in one subscription (or each in its own subscription).

Then work through the following points:

- If needed, create the subscription or subscriptions and verify the **resource providers** (`Microsoft.DataFactory`, `Microsoft.KeyVault`, `Microsoft.Sql`, `Microsoft.Storage`). See [troubleshooting → deployment rights](../troubleshooting.md).
- Do you have **dedicated subscriptions** and add the app as **Owner** on the subscription? Then Yres creates the resource groups for you — skip the next step.
- Otherwise: create the **resource groups** yourself. Use **`dev`** and **`prod`** as required parts of the name; the remaining names are free (recommended: `test`, `acc`, `quality`, `prod`).
- Add the App Registration as **Owner** on each resource group: **Access control (IAM)** → **Add role assignment** → **Privileged administrator roles** → **Owner** → select your app → **Review + assign**.

:::warning Owner is required (not Contributor)
The App Registration needs **Owner** permissions, not just Contributor. During installation, Yres must **assign roles to the managed identities** of the resources it creates (e.g. the Data Factory that needs access to the Key Vault and the SQL database). Only an Owner may make role assignments. Grant Owner at the **resource-group level** (recommended) or the **subscription level**.
:::

## 3. Rollout by Yres

Yres/Plainwater uses the values you hand over to create your organization and environments (this happens on the Yres side). You do not have to set anything up yourself for this; you only provide the values from steps 1 and 2.

What you hand over:

- The **Azure values** from the preparation (step 1): Directory (Tenant) ID, Object ID of the Managed Application, Application (client) ID and the client secret.
- The **subscription(s)** and **resource groups** from step 2, with the App Registration as **Owner**. With multiple subscriptions you provide the subscription ID per environment; with a single subscription the one from `dev` is used for the other environments.
- The desired **organization name** (at least 2 characters, letters and spaces only) and the **environments** you want (at least `dev` and `prod`, with `test`, `acceptance` or `quality` in between depending on your license).

:::tip Resource names — align the naming
Have you already created the resource groups yourself in step 2? Then pass on the exact names so the rollout **matches** them. In the naming, the **`$`** is replaced by the environment name: a key vault `company-keyvault-$` becomes `company-keyvault-prod` in prod, for example. Without an environment in the name, conflicts arise (automatically resolved with a postfix, but harder to recognize).
:::

:::note Rollout takes time
Creating a new organization can take a while — the Azure resources are actually provisioned. A typical installation takes on the order of **~20 minutes**.
:::

## What has been created after installation?

After a successful rollout, each environment has its own data plane in your Azure tenant:

- one **Azure Data Factory** (the orchestration + Copy activities);
- one **Azure SQL database `IRIS_DWH`** (the warehouse + the load engine);
- an **Azure Key Vault** for all source credentials;
- optionally an **Azure Data Lake (Gen2)** for Parquet;
- the Azure DevOps integration for DACPAC deploys and `publish-datafactory`.

Next step: connect your first source. See [Connect a data source](databron-koppelen.md) and [Getting started](aan-de-slag.md).
