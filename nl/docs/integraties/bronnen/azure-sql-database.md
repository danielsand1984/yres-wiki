---
title: Azure SQL Database
sidebar_label: Azure SQL Database
description: Azure SQL Database koppelen aan Yres — verbindingseisen.
---

# Azure SQL Database

**Categorie:** Directe koppeling · Azure

Beheerde SQL-database in Azure. Directe koppeling: Yres leest de tabellen via een Copy-activiteit in
Azure Data Factory en laadt ze naar het datawarehouse.

## Verwachte input

Bij het toevoegen van de bron (type **Azure SQL Database**) vul je dezelfde vijf databasevelden in als
voor SQL Server:

| Veld | Toelichting |
|---|---|
| **Host** | De volledige servernaam, in de vorm `xxx.database.windows.net`. |
| **Port** | De luisterpoort van de database. Voor Azure SQL Database altijd **1433**. |
| **Database name** | De naam van de database (catalog) waarmee je wilt koppelen. |
| **Username** | Een SQL-login (Yres gebruikt SQL-authenticatie). |
| **Password** | Het wachtwoord bij die login. |

**Authenticatie:** Basic (gebruikersnaam + wachtwoord, SQL-authenticatie).

**Integration runtime:** Azure SQL Database is publiek bereikbaar vanuit de cloud, dus de standaard
**`AutoResolveIntegrationRuntime`** (cloud) volstaat. Een self-hosted Integration Runtime is alleen
nodig als de database via een privénetwerk of firewall is afgeschermd en niet rechtstreeks bereikbaar
is.

**Vereisten / voorbereiding:**

- Een **SQL-login** met leesrechten op de betreffende database (zie *Gegevens ophalen*).
- Sta het IP-bereik van Azure Data Factory toe in de firewall van de SQL-server, óf zet de optie
  **"Allow Azure services and resources to access this server"** aan op de Azure SQL-server, zodat de
  cloud Integration Runtime de database kan bereiken.

:::info Te bevestigen
Yres slaat de inloggegevens niet zelf op: de verbinding wordt als één secret
**`adf-{bronnaam}-connectionstring`** in de Azure Key Vault van de klant geplaatst en daar door de
linked service (`type: AzureSqlDatabase`) uit gelezen. De exacte secret-naamgeving en het wegschrijven
naar Key Vault gebeuren in de (off-limits) webapp/provisioning-laag.
:::

## Gegevens ophalen

Deze waarden vind je in de Azure Portal.

- **Host / Port** — Host is de volledige servernaam in de vorm `xxx.database.windows.net`. Open in de Azure Portal je **SQL database → Overzicht (Overview)** en kopieer de waarde naast **Servernaam**. Port is altijd **1433**.
- **Database name** — De naam van de database, eveneens te vinden op het **Overzicht**-scherm van de SQL database.
- **Username / Password** — Gebruik een **SQL-login** (Yres maakt gebruik van SQL-authenticatie). Maak bij voorkeur een apart account met **alleen-lezen** rechten op de betreffende database.

> Officiële documentatie: [Microsoft Learn — Connect and query Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/connect-query-content-reference-guide)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
