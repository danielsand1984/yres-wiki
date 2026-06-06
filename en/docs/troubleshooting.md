---
sidebar_position: 5
title: Troubleshooting
description: Known errors and solutions.
---

# Troubleshooting

## 1. Deployment rights error
If a resource on an Azure subscription was **not created by a user**, an API call cannot create it either. In that case, register the resource providers on the subscription before continuing with the installation.

> See also the Microsoft documentation on resource providers, and the [installation guide](./setup/installatie.md).

## 2. Loading local files fails
ADF then returns an error such as:

```
The value of the property '' is invalid: 'Access to serverName is denied,
resolved IP address is ::1, network type is OnPremise'.
```

**Solution:** enable `-EnableLocalMachineAccess` on the Windows server where the Integration Runtime runs. Run the following in CMD or PowerShell:

```powershell
cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
.\dmgcmd.exe -EnableLocalMachineAccess
```

## Health checks
For DWH issues: the [Health Checks screen](./frontend/admin.md) (based on `[Maintenance].[vwYresChecks]`) shows common problems, often with a fix script.

:::warning
Only run health-check scripts once you understand their effect — when in doubt, consult a Yres admin.
:::
