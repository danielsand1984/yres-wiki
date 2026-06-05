---
slug: /referentie/azure-architectuur
sidebar_position: 2
title: Azure-architectuur
description: Welke Azure-resources Yres gebruikt, toegangsniveaus en setups.
---

# Azure-architectuur

> Aanvullend op [Installatie](../setup/installatie.md).

## Azure-resources die Yres gebruikt

| Resource | Doel | Yres-integratie | Kosten |
|---|---|---|---|
| **Azure Data Factory (ADF)** | Orkestratie & ETL | Yres triggert pipelines en monitort runs; beheert Integration Runtimes | Pay-per-activity + IR-kosten |
| **Azure Blob Storage** | Raw data landing | Staging van bestanden voor import | Hot/Cool tier |
| **Azure Data Lake** | Onbewerkte data (data science) | Slaat data ruw op; Yres voegt **RowHash, KeyHash, EtlDate** toe → medallion-architectuur | Storage |
| **Azure SQL Database** | Curated opslag & queries | Yres Copy + stored procedures | DTU-based |
| **Azure Key Vault** | Credentials | ADF leest secrets om bronnen te verbinden | Pay-per-activity |

Data uit een bron kan in de **database**, de **Data Lake**, of **beide** worden opgeslagen.

## App Registration — vereiste permissies

Yres krijgt toegang tot een bestaande Azure-tenant via een **App Registration** (single tenant) met:

- **Azure DevOps** — User impersonation
- **Azure Key Vault** — User impersonation
- **Azure Service Management** — User impersonation
- **Microsoft Graph** — User.Read

## Toegangsniveaus

Toegang kan op drie niveaus worden verleend; in alle gevallen heeft Yres **Owner-rechten** nodig voor de installatie (om rollen toe te wijzen aan de managed identities van resources):

1. **Tenant** — afgeraden; alleen kort, voor testscenario's.
2. **Subscription** — prima als het abonnement alleen voor Yres is.
3. **Resource Group** — aanbevolen voor langdurig gebruik. Heb je de resource groups al? Gebruik niveau 3. Anders: start op subscription-niveau en verplaats de toegang naar resource-group-niveau zodra de groups bestaan.

:::warning Owner is vereist
De App Registration heeft **Owner**-rechten nodig (niet alleen Contributor), omdat Yres tijdens de installatie rollen moet toewijzen aan de managed identities van resources. Verleen dit bij voorkeur op resource-group-niveau.
:::

## Azure-setups

| Setup | Beschrijving |
|---|---|
| **Single subscription** | Yres op één abonnement; omgevingen verdeeld over resource groups. |
| **Split subscriptions** | Elke omgeving een eigen (bestaand) abonnement. Abonnementen moeten vooraf bestaan. |
| **Shared subscriptions** | Sommige omgevingen delen een abonnement (bv. dev+test), prod apart. Gedeelde abonnementen → aparte resource groups. |

> Meerdere omgevingen in één resource group kan, maar wordt **afgeraden** (fouten en verkeerde resource-mapping in de frontend).

## Resource providers (verplicht geregistreerd)

Missende provider-registraties zijn een hoofdoorzaak van mislukte installaties. In het abonnement moeten actief zijn:

- `Microsoft.DataFactory`
- `Microsoft.KeyVault`
- `Microsoft.Sql`
- `Microsoft.Storage`

## Naamgeving

Yres volgt bestaande naming conventions, met één vaste beperking: **de eerste omgeving heet altijd `dev`**. In resourcenamen (SQL Server, ADF) zit dus altijd `dev`, bv. `sqlsrv-xxx-dwh-dev`. Dit kan niet gewijzigd worden, ook niet als je intern een andere naam voor development gebruikt.

## Firewall & netwerk

- De **database-firewall staat standaard aan**; Yres-IP's worden bij installatie automatisch toegevoegd. Extra regels handmatig.
- Storage accounts, Key Vault en ADF hebben standaard **geen** actieve firewall.
- Alle network rules worden ondersteund, mits resources elkaar én de webapp kunnen bereiken.
- **VPN-toegang** voor de webapp is op aanvraag mogelijk; de webapp heeft zelf ook een firewall om toegang per locatie te beperken.

## Schalen

Azure auto-scaling werkt op CPU-gebruik, maar SQL Server geeft geheugen niet makkelijk vrij — databases blijven dan duur hangen op een hoge tier. Yres beheert het schalen rond loads/refreshes: **opschalen alleen wanneer nodig, daarna direct terugschalen**.

## Installatiemodel (invitation link)

Installeren vereist een **invitation link van Plainwater**: gekoppeld aan één Microsoft-account, single-use, geconfigureerd voor de gekochte versie en het aantal omgevingen van de licentie. Herbruikbaar tot de installatie klaar is; daarna ongeldig.

| Versie | Bronnen | Omgevingen |
|---|---|---|
| **Essentials** | 2 | 1 |
| **Advanced** | 5 | 2 |
| **Ultimate** | Onbeperkt | Onbeperkt |
