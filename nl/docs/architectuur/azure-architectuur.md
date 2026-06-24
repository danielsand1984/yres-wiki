---
slug: /referentie/azure-architectuur
sidebar_position: 2
title: Azure-architectuur
description: Welke Azure-resources Yres in jouw tenant gebruikt, vereiste permissies, toegangsniveaus, firewall- en netwerkregels en het schaalmodel.
---

# Azure-architectuur

> Aanvullend op [Installatie](../setup/installatie.md).

Yres draait **volledig in jouw eigen Azure-tenant**. Per organisatie × omgeving komt er één **Azure Data Factory** plus één **`IRIS_DWH` Azure SQL Database** te staan; de Yres-webapp van Plainwater voorziet en bestuurt die resources, maar slaat zelf nooit jouw data op. Deze pagina beschrijft welke resources Yres gebruikt, welke rechten nodig zijn en hoe firewall, netwerk en schalen geregeld zijn.

## Azure-resources die Yres gebruikt

| Resource | Doel | Yres-integratie | Kosten |
|---|---|---|---|
| **Azure Data Factory (ADF)** | Orkestratie & Copy | Yres genereert linked services en pipelines, triggert runs, monitort ze en beheert Integration Runtimes | Pay-per-activity + IR-kosten |
| **Azure Blob Storage** | Raw data landing | Staging van bestanden voor import | Hot/Cool tier |
| **Azure Data Lake (Gen2)** | Onbewerkte data (data science) | Slaat data ruw op als Parquet; Yres voegt **RowHash, KeyHash, EtlDate** toe | Storage |
| **Azure SQL Database (`IRIS_DWH`)** | Curated opslag, load-engine & queries | Yres-Copy landt in `STAGE`; stored procedures bouwen de historie in `HIS`/`ODS` en exposeren via `Exposed` | DTU-/vCore-based |
| **Azure Key Vault** | Credentials | ADF leest secrets om bronnen te verbinden; de webapp schrijft ze ernaartoe | Pay-per-operation |

Data uit een bron kan in de **database**, de **Data Lake**, of **beide** worden opgeslagen. De keuze maak je per tabel bij het configureren van de laad.

:::note Twee soorten "historie" — niet verwarren
Yres legt op twee plekken historie vast, en die werken anders:

- **In de Data Lake** schrijft Yres elke extract weg als Parquet met de framework-kolommen **`RowHash`**, **`KeyHash`** en **`EtlDate`**. Dit is de ruwe, onbewerkte landing — de basis voor een medallion-achtige opslag voor data science.
- **In de database (`HIS`/`ODS`)** bouwt de load-engine een echte **SCD2-historie** op via de stored procedure `[LoadManagement].[spHIS_InsertAndUpdate]`: per record een open/gesloten versie met `ETL_Date`, `ETL_EndDate`, `IsCurrent` en `Delta`. De `KeyHash`/`RowHash` zijn hier persisted computed columns op `STAGE` die de wijzigingsdetectie aansturen.

De hashing in de Data Lake is dus **niet** hetzelfde als de SCD2-versionering in de database. De [load-types](../concepten/load-types.md) en het [Historie & SCD2-model](../concepten/historie-scd2.md) bepalen welke historie in de database ontstaat.
:::

## App Registration — vereiste permissies

Yres krijgt toegang tot een bestaande Azure-tenant via een **App Registration** (single tenant) met de volgende API-permissies:

- **Azure DevOps** — User impersonation
- **Azure Key Vault** — User impersonation
- **Azure Service Management** — User impersonation
- **Microsoft Graph** — `User.Read`

## Toegangsniveaus

Toegang kan op drie niveaus worden verleend. In **alle** gevallen heeft Yres tijdens de installatie **Owner-rechten** nodig (niet alleen Contributor), omdat de app rollen moet toewijzen aan de managed identities van de aangemaakte resources.

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

Firewall- en netwerkregels beheer je per resource vanuit het admin-scherm **Firewall**. Daar zie je per resource (SQL Database, Key Vault, Storage account, Data Factory) welke regels actief zijn, welke door Yres zijn aangemaakt en welke je zelf hebt toegevoegd.

![Admin-scherm Firewall met per-resource tabs en een tabel met firewallregels voor de SQL Database](/img/screens/admin-firewall.svg)

*Het Firewall-scherm onder Admin: kies bovenaan de Azure-resource, en beheer daaronder de toegestane IP-regels voor de geselecteerde omgeving.*

1. **Resource-tabs** — wissel tussen SQL Database, Key Vault, Storage account en Data Factory; elke resource heeft zijn eigen set firewallregels.
2. **Status van de database-firewall** — voor de database staat de firewall standaard **aan**; de Yres-IP's zijn bij installatie al toegevoegd, zodat de webapp en de Integration Runtimes kunnen verbinden.
3. **Yres-beheerde regels** — door Yres aangemaakte regels (webapp, IR-pool) zijn gemarkeerd; pas ze niet handmatig aan.
4. **Extra regels toevoegen** — eigen IP-ranges (kantoor, gateway, …) voeg je handmatig toe via de rij onderaan.

Belangrijkste regels in het kort:

- De **database-firewall staat standaard aan**; Yres-IP's worden bij installatie automatisch toegevoegd. Extra regels voeg je handmatig toe.
- Storage accounts, Key Vault en ADF hebben standaard **geen** actieve firewall.
- Alle network rules worden ondersteund, mits resources elkaar én de webapp kunnen bereiken.
- **VPN-toegang** voor de webapp is op aanvraag mogelijk; de webapp heeft zelf ook een firewall om toegang per locatie te beperken.

:::info Te bevestigen
Of **site-to-site VPN** en **web application firewall** aan specifieke licentieversies gekoppeld zijn, staat niet vast in de productdocumentatie. VPN is volgens de documentatie "op aanvraag" configureerbaar. Bevestig de exacte voorwaarden bij Plainwater voordat je dit als versie-gebonden feature communiceert.
:::

## Schalen

Azure auto-scaling werkt op CPU-gebruik, maar SQL Server geeft geheugen niet makkelijk vrij — databases blijven dan duur hangen op een hoge tier. Yres beheert het schalen rond loads/refreshes: **opschalen alleen wanneer nodig, daarna direct terugschalen**.

Het schaalgedrag wordt aangestuurd door de instellingen `AutomaticDatabaseScaling`, `DefaultServiceTier` (basistier) en `HighServiceTier` (tier waarnaar wordt opgeschaald onder load). Zet `AutomaticDatabaseScaling = 0` om het automatisch schalen uit te zetten. Zie [Admin](../frontend/admin.md) voor het beheer van de DWH-instellingen.

## Installatiemodel (invitation link)

Installeren vereist een **invitation link van Plainwater**: gekoppeld aan één Microsoft-account, single-use, geconfigureerd voor de gekochte versie en het aantal omgevingen van de licentie. Herbruikbaar tot de installatie klaar is; daarna ongeldig. Een typische installatie duurt volgens de documentatie ongeveer **20 minuten**, afhankelijk van het aantal omgevingen.

| Versie | Bronnen | Omgevingen |
|---|---|---|
| **Essentials** | 2 | 1 |
| **Advanced** | 5 | 2 |
| **Ultimate** | Onbeperkt | Onbeperkt |

:::info Te bevestigen
De licentie-**structuur** hierboven (aantal bronnen en omgevingen per versie) is geverifieerd. Eventuele **prijzen** en de koppeling van losse features aan een versie zijn commerciële voorwaarden die door Plainwater bevestigd moeten worden en niet uit de productdocumentatie volgen.
:::
