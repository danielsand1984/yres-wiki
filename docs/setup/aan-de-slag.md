---
sidebar_position: 2
title: Aan de slag
description: Inloggen, organisaties, gebruikers, rollen en omgevingen.
---

# Aan de slag

## Inloggen
Log in met het door Yres verstrekte wachtwoord op de webapp ([www.yres.app](https://www.yres.app)).

## Organisaties
Organisaties zijn de basis van Yres: een afgeschermde ruimte met standaard een **dev**- en **prod**-omgeving, zodat ontwikkeling (dev) de live-versie (prod) niet raakt.

Een nieuwe organisatie maak je in het **SuperAdmin-paneel**:
1. Naam invoeren.
2. Omgevingen toevoegen (dev + prod standaard).
3. Resourcenamen genereren — handmatig (let op de `$`-conventie, bv. `company-keyvault-$`) of automatisch.
4. Azure-ID's invullen (Entra-ID met permissies **ServiceManagement** en **KeyVault**): tenant-ID, subscription-ID, application object-ID, client-ID + secret.
5. Azure-permissies opzetten: rolgroepen voor dev en prod worden gegenereerd o.b.v. de resource group (standaard `rg-Yres-dev` / `rg-Yres-prod`).

## Gebruikers beheren
In het SuperAdmin-home-paneel voeg je gebruikers toe (organisatie, naam, e-mail, rol). Niveaus:

| Niveau | Rechten |
|---|---|
| **User** | Geen toegang tot Admin- of SuperAdmin-paneel. |
| **Organization Admin** | Adminrechten binnen de eigen organisatie; toegang tot Admin-paneel. |
| **System Admin** | Adminrechten over álle organisaties; toegang tot SystemAdmin-paneel. |

Aangemaakte gebruikers verschijnen ook in het Admin-paneel van de organisatie.

## Rollen beheren
In het [Admin-paneel](../frontend/admin.md) maak je rollen aan voor fijnmazige permissies. Wijs ze toe via het groene potlood-icoon naast de gebruiker.

## Omgevingen
Omgevingen zijn afgeschermde versies van een organisatie; wijzigingen op de ene raken de andere niet.

- **Bijwerken** via de Admin-tab *Update environment* (toont DWH-versie, status, resultaat, laatste run).
- **Projecten & changes** categoriseren werk en transporteren content van dev → prod. Zie [Projecten & Changes](../frontend/projecten-changes.md).

> Voor nieuwe Azure-gebruikers is het aan te raden eerst de interne handleiding *"Setting up Azure for use with Yres"* (voorheen IRIS) op Confluence door te nemen.
