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
3. **Create the organization** in the Yres web app (SuperAdmin), which actually rolls out the resources.

:::info Who performs the installation
Creating an organization happens in the **SuperAdmin panel** of the Yres web app. This is reserved for the Yres/Plainwater administrator. As a customer you prepare steps 1 and 2 (App Registration and Azure permissions) yourself; the values they produce are what you hand over for step 3.
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
The number of environments you may roll out is license-bound. **Essentials** supports **one environment** (`dev`); **Advanced** two; **Ultimate** unlimited. So for a DTAP pipeline (dev → test → prod) you need at least Advanced or higher. See [Pricing](../prijzen.md) for the exact tiers.
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

## 3. Installation in the web app

With the values from step 1 and the permissions from step 2, you create a new organization in the Yres web app. This happens in the **SuperAdmin panel**.

### 3.1 SuperAdmin — Organizations

Open the SuperAdmin panel. The **Organizations** overview shows all existing organizations (name, creation date, whether they are published, and the infrastructure). From here you start a new installation with **Add organization**.

![SuperAdmin overview with the Organizations table on the left (name, created, published, infrastructure) and an Add-organization button, and the Users table on the right with role badge and SSO status.](/img/screens/superadmin-organizations.svg)

The SuperAdmin overview: managing organizations and starting a new one.

1. **Organizations table** — name, creation date, published status and infrastructure per organization.
2. **Add organization** — opens the creation wizard (see below).
3. **Delete** — you can delete an organization here (confirmation modal).
4. **Users table** — users per organization with role badge and whether SSO is enabled.

### 3.2 Create organization (wizard)

Click **Add organization**. The creation wizard takes you step by step through all the data needed to roll out the tenant.

![Creation wizard for a new organization with a step bar at the top and a form per step: organization and project, plan and version, environments, database, resource names, and the Azure app with permissions.](/img/screens/superadmin-create-organization.svg)

The creation wizard for a new organization, with the step bar and the Azure steps at the bottom.

1. **Step bar** — shows your progress through the wizard.
2. **Organization and project** — organization name and the first project.
3. **Plan and version** — the license (plan) and the Yres version that is rolled out.
4. **Environments** — `dev` and `prod` required; up to 6 environments.
5. **Resource names** — the naming with the `$` convention for the environment.
6. **Azure app + permissions** — the App Registration values and the role assignments on the resource groups.

Work through the wizard as follows:

1. **Organization and project** — enter the **organization name**: at least 2 characters, letters and spaces only (`/^[a-zA-Z ]*$/`). Also specify the first project.
2. **Plan and version** — choose the **license (plan)** and the **Yres version** that is rolled out.
3. **Environments** — at least **`dev`** and **`prod`** (depending on the license there can be environments in between, e.g. `test`, `acceptance`). Up to 6 environments.
4. **Resource names** — fully or semi-generated:
   - *Full*: names following the Microsoft naming convention; a unique postfix is added on conflict.
   - *Semi*: always use the **`$`** in the name (it is replaced by the environment name). E.g. a key vault in the dev resource group = `company-keyvault-$`, in prod that becomes `company-keyvault-prod`. Without an environment in the name, conflicts arise (automatically resolved with a postfix, but harder to recognize).
   - Have you already created the resource groups yourself in step 2? Then make sure the names **match** them.
5. **Custom database** — any database-specific settings for `IRIS_DWH`.
6. **Fill in Azure values** (from the preparation in step 1):
   - Active Directory ID → **Directory (Tenant) ID**
   - Application Object ID → **Object ID** of the Managed Application
   - Client ID → **Application (client) ID**
   - Client secret → the **secret value**
7. **Subscriptions** — choose **single** or **multiple**. For *multiple*, you enter the **subscription ID** per environment; for *single*, the subscription from `dev` is copied to the other environments.
8. **Check permissions** — the last step shows the resource groups and the role assignments. Verify that the App Registration is **Owner** everywhere.
9. Click **Submit**. A status screen shows the progress of the rollout; afterwards you are taken to the deployments page.

:::note Rollout takes time
Creating a new organization can take a while — the Azure resources are actually provisioned. Some frontend components only work correctly once that rollout is finished. A typical installation takes on the order of **~20 minutes**.
:::

## What has been created after installation?

After a successful rollout, each environment has its own data plane in your Azure tenant:

- one **Azure Data Factory** (the orchestration + Copy activities);
- one **Azure SQL database `IRIS_DWH`** (the warehouse + the load engine);
- an **Azure Key Vault** for all source credentials;
- optionally an **Azure Data Lake (Gen2)** for Parquet;
- the Azure DevOps integration for DACPAC deploys and `publish-datafactory`.

Next step: connect your first source. See [Connect a data source](databron-koppelen.md) and [Getting started](aan-de-slag.md).
