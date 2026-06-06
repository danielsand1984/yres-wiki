---
sidebar_position: 12
title: Troubleshooting
description: Bekende fouten en oplossingen.
---

# Troubleshooting

## 1. Deployment rights error
Als een resource op een Azure-abonnement **niet door een gebruiker is aangemaakt**, kan een API-call dat ook niet. Registreer in dat geval de resource providers op het abonnement voordat je verder gaat met de installatie.

> Zie ook de Microsoft-documentatie over resource providers, en de [installatiehandleiding](./setup/installatie.md).

## 2. Lokale bestanden laden lukt niet
ADF geeft dan een fout als:

```
The value of the property '' is invalid: 'Access to serverName is denied,
resolved IP address is ::1, network type is OnPremise'.
```

**Oplossing:** zet `-EnableLocalMachineAccess` aan op de Windows-server waar de Integration Runtime draait. Voer in CMD of PowerShell uit:

```powershell
cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
.\dmgcmd.exe -EnableLocalMachineAccess
```

## Health checks
Voor DWH-issues: het [Health Checks-scherm](./frontend/admin.md) (gebaseerd op `[Maintenance].[vwYresChecks]`) toont veelvoorkomende problemen, vaak met een fix-script.

:::warning
Voer health-check-scripts pas uit als je het effect begrijpt — overleg bij twijfel met een Yres-admin.
:::
