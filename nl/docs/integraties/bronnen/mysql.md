---
title: MySQL
sidebar_label: MySQL
description: MySQL koppelen aan Yres — verbindingseisen.
---

# MySQL

**Categorie:** Directe koppeling

Relationele database. Directe koppeling.

## Verwachte input

Je voegt MySQL toe via de wizard **Bron toevoegen**. Naast de algemene velden die voor elke bron gelden — **Bronnaam** (uniek, 2–45 tekens; wordt de naam van de linked service en de basis voor de Key Vault-secrets `adf-{bronnaam}-…`), **type**, **integration runtime**, *credentials voor alle omgevingen identiek?*, *vervaldatum credentials* en *tags* — vraagt het MySQL-formulier om de volgende verbindingsvelden:

| Veld (label) | Toelichting |
|---|---|
| **Host** | Servernaam of IP-adres waarop MySQL draait. |
| **Database name** | De naam van het specifieke schema/de database waarmee je wilt koppelen. |
| **Port** | Luisterpoort van de database (standaard **3306**). |
| **User name** | Gebruikersnaam van het databaseaccount. |
| **Password** | Wachtwoord van dat account. |

- **Authenticatie:** Basic — gebruikersnaam + wachtwoord.
- **Integration runtime:** kies **`AutoResolveIntegrationRuntime`** (cloud) als de database publiek bereikbaar is. Staat MySQL **on-premises of achter een firewall**, kies dan een **self-hosted integration runtime** (in de meegeleverde template `pwccIntegrationRuntimeLinked`). Zie [Databron koppelen](../../setup/databron-koppelen.md).
- **Secrets:** het wachtwoord (en de overige verbindingsgegevens) worden nooit door de frontend opgeslagen. Ze gaan naar de **Azure Key Vault** van de klant onder de groep **`adf-{bronnaam}-…`**; de linked service verwijst ernaar.

### Voorwaarden

- Een databaseaccount met **alleen-lezen** rechten (least privilege) op de betreffende database — gebruik bij voorkeur een apart serviceaccount in plaats van een persoonlijk of admin-account.
- Bij een on-prem/gefirewallde database: een geïnstalleerde en gepubliceerde **self-hosted integration runtime** die de MySQL-server kan bereiken.

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop MySQL draait; Port is de luisterpoort van de database (standaard **3306**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Database name** — De naam van het specifieke schema/de database waarmee je wilt koppelen (zichtbaar via `SHOW DATABASES;` of bij je DBA).
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende database, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Dan is een Integration Runtime nodig om de verbinding tot stand te brengen — zie [Databron koppelen](../../setup/databron-koppelen.md).

## Load types en delta

MySQL ondersteunt de standaard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL).

:::note Twee deltakolommen ondersteund
MySQL ondersteunt — net als de andere SQL-/databasebronnen — **twee deltakolommen** (komma-gescheiden, zelfde datatype; de hoogste waarde telt). Zie [Load types → Meerdere deltakolommen](../../concepten/load-types.md#meerdere-deltakolommen).
:::

> Officiële documentatie: [MySQL Connector/J — Connection URL Syntax](https://dev.mysql.com/doc/connector-j/en/connector-j-reference-jdbc-url-format.html)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
