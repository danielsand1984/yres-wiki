---
sidebar_position: 1
title: Installation
description: Installing Yres in an Azure tenant — from App Registration to organization.
---

# Installation

Yres consists of a set of Azure resources and templates. During installation these are created and configured according to the Yres templates. Yres needs access to the Azure subscription through an **App Registration** with the appropriate roles.

## 1. Preparation — App Registration

1. In **Microsoft Entra**, create a new **App Registration** (e.g. `Yres-dataplatform-user`). Account type: **Single tenant**; leave the redirect empty. Click **Register**.
2. Open the app → **API Permissions** → **Add permissions** and add:
   - **Azure Service Management** → permission **User impersonation**
   - **Azure Key Vault**
   - **Azure DevOps**
3. Go to **Certificates & Secrets** → **New client secret** (e.g. name `WebApp`), validity max. **24 months** (recommended: 24). **Copy the secret value immediately** — it will no longer be visible later.
4. Collect from **Overview** + Managed Application:
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Object ID** of the Managed Application _(note: not the Object ID from the first screen)_

:::danger Store securely
You will need the client secret, client ID, tenant ID and object ID later during installation. Keep them in a secure store.
:::

## 2. Subscriptions & resource groups

Decide beforehand:
1. How many environments? (`dev`, `test`, `acceptance`, `quality`, `prod`)
2. One subscription, one per environment, or mixed?
3. One resource group, one per environment, or mixed?

**Recommendation:** 2–3 environments, each with its own resource group, in one subscription (or each in its own subscription).

- If needed, create the subscription(s) and verify the **resource providers** (see [troubleshooting → deployment rights](../troubleshooting.md)).
- Do you have dedicated subscriptions and add the app as **Owner** on the subscription? Then Yres creates the resource groups for you — skip the next step.
- Otherwise: create resource groups. Use **`dev`** and **`prod`** as required parts of the name; the rest is free (recommended: `test`, `acc`, `quality`, `prod`).
- Add the App Registration as **Owner** on each resource group (Access control → Add role assignment → Privileged administrator roles → Owner → select your app → Review + assign).

:::warning Owner is required
The App Registration needs **Owner** permissions (not just Contributor), because during installation Yres must assign roles to the managed identities of resources. Grant this at the resource-group level (recommended) or subscription level.
:::

## 3. Installation in the web app

1. Create a new organization in the web app via the SuperAdmin menu.
2. **Organization name** — min. 2 characters, letters and spaces only (`/^[a-zA-Z ]*$/`).
3. **Environments** — at least `dev` + `prod`; depending on the license, environments in between (e.g. `test`, `acceptance`).
4. **Resource names** — fully or semi-generated:
   - *Full*: names following the Microsoft naming convention; a unique postfix is added on conflict.
   - *Semi*: always use the **`$`** in the name (it is replaced by the environment). E.g. a key vault in the dev resource group = `company-keyvault-$`, in prod = `company-keyvault-prod`. Without an environment in the name, conflicts arise (automatically resolved with a postfix, but poorly recognizable).
   - If you have already created the resource groups: make sure the names match.
5. **Fill in Azure values** (from the preparation):
   - Active directory ID → **Directory (Tenant) ID**
   - Application Object ID → **Object ID**
   - Client ID → **Application (client) ID**
   - Client secret → **secret value**
6. **Subscriptions** — choose single or multiple. For multiple: enter the subscription ID per environment; for single it is copied from dev.
7. Click **Next**, review the resource groups and role assignments, and **Submit**. A status screen shows the progress.

:::note
Creating a new organization can take a while; some frontend elements only work correctly once it is finished.
:::
