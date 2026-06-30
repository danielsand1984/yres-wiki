---
title: SQL Server
sidebar_label: SQL Server
description: SQL Server koppelen aan Yres — verbindingseisen.
---

# SQL Server

**Categorie:** Directe koppeling

Microsoft SQL Server. Directe koppeling. In Yres heeft deze bron het brontype **`MSSQL`**; in het datawarehouse wordt hij verwerkt als brontype **`MSSQL_ADF`**.

## Verwachte input

Bij het aanmaken van de bron (wizard **Bron toevoegen**) vul je naast de algemene velden — bronnaam, type, integration runtime, "credentials gelijk voor alle omgevingen?", vervaldatum credentials, tags — de volgende verbindingsvelden in:

| Veld | Toelichting |
|---|---|
| **Host** | Servernaam of IP-adres van de SQL Server (bij een named instance eventueel `server\instance`). |
| **Port** | Luisterpoort van de database (standaard **1433**). |
| **Database name** | Naam van de specifieke database (catalog). |
| **Username** | SQL-login met leesrechten op de database. |
| **Password** | Wachtwoord bij de gebruiker. |

- **Authenticatie:** Basic (gebruikersnaam + wachtwoord).
- **Integration runtime:** standaard de cloud-runtime **`AutoResolveIntegrationRuntime`** wanneer de server publiek bereikbaar is. Staat de server **on-premises of achter een firewall**, kies dan een **self-hosted integration runtime** (`pwccIntegrationRuntimeLinked`); deze moet eerst gepubliceerd zijn.
- **Geen secrets in de frontend:** je wachtwoord wordt nooit in de webapp opgeslagen. Yres schrijft de gegevens als één Key Vault-secret weg in de Azure Key Vault van je eigen omgeving, onder de naam **`adf-{bronnaam}-connectionstring`**. De ADF linked service (`type: SqlServer`) verwijst naar die secret.

:::note Oudere deploy-route met één connectionstring-secret
SQL Server heeft (anders dan bijvoorbeeld MySQL, Oracle en Snowflake) geen aparte moderne deploy-builder. De bron wordt via de oudere `SourceSystemManager`-route (`AddLinkedService`) gepubliceerd, met één gecombineerde secret **`adf-{bronnaam}-connectionstring`** in de Key Vault in plaats van losse secrets per veld.
:::

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop SQL Server draait (bij een named instance eventueel `server\instance`); Port is de luisterpoort van de database (standaard **1433**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van de specifieke database (catalog) waarmee je wilt koppelen.
- **Username / Password** — Gebruik bij voorkeur een apart SQL-serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een self-hosted Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

## Load types en delta

Alle standaard load types zijn beschikbaar (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL). Voor SQL Server worden **twee delta-kolommen** ondersteund voor incrementeel laden — dat is de norm voor SQL-bronnen (alleen MySQL is hierop een uitzondering en ondersteunt één delta-kolom).

> Officiële documentatie: [JDBC Driver for SQL Server — Connection URL](https://learn.microsoft.com/sql/connect/jdbc/building-the-connection-url)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
