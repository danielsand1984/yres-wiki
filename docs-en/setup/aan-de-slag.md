---
sidebar_position: 2
title: Getting started
description: Logging in, organizations, users, roles and environments.
---

# Getting started

## Logging in
Log in with the password provided by Yres on the web app ([www.yres.app](https://www.yres.app)).

## Organizations
Organizations are the foundation of Yres: an isolated space with, by default, a **dev** and a **prod** environment, so that development (dev) does not affect the live version (prod).

You create a new organization in the **SuperAdmin panel**:
1. Enter a name.
2. Add environments (dev + prod by default).
3. Generate resource names — manually (mind the `$` convention, e.g. `company-keyvault-$`) or automatically.
4. Fill in the Azure IDs (Entra ID with permissions **ServiceManagement** and **KeyVault**): tenant ID, subscription ID, application object ID, client ID + secret.
5. Set up Azure permissions: role groups for dev and prod are generated based on the resource group (by default `rg-Yres-dev` / `rg-Yres-prod`).

## Managing users
In the SuperAdmin home panel you add users (organization, name, email, role). Levels:

| Level | Permissions |
|---|---|
| **User** | No access to the Admin or SuperAdmin panel. |
| **Organization Admin** | Admin rights within their own organization; access to the Admin panel. |
| **System Admin** | Admin rights over all organizations; access to the SystemAdmin panel. |

Created users also appear in the organization's Admin panel.

## Managing roles
In the [Admin panel](../frontend/admin.md) you create roles for fine-grained permissions. Assign them via the green pencil icon next to the user.

## Environments
Environments are isolated versions of an organization; changes in one do not affect the others.

- **Update** via the Admin tab *Update environment* (shows DWH version, status, result, last run).
- **Projects & changes** categorize work and transport content from dev → prod. See [Projects & Changes](../frontend/projecten-changes.md).

> For users new to Azure, it is advisable to first review the internal guide *"Setting up Azure for use with Yres"* (formerly IRIS) on Confluence.
