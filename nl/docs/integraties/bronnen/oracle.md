---
title: Oracle
sidebar_label: Oracle
description: Oracle koppelen aan Yres — verbindingseisen.
---

# Oracle

**Categorie:** Directe koppeling

Oracle-database. Directe koppeling. Let op: Oracle gebruikt een **Service name** (of het oudere **SID**) in plaats van een database-naam.

## Verwachte input

Je voegt Oracle toe via de wizard **Bron toevoegen**. Naast de algemene velden die voor elke bron gelden — **Bronnaam** (uniek, 2–45 tekens; wordt de naam van de linked service en de basis voor de Key Vault-secrets `adf-{bronnaam}-…`), **type**, **integration runtime**, *credentials voor alle omgevingen identiek?*, *vervaldatum credentials* en *tags* — vraagt het Oracle-formulier om de volgende verbindingsvelden:

| Veld (label) | Toelichting |
|---|---|
| **Host** | Servernaam of IP-adres waarop Oracle draait. |
| **Port** | Luisterpoort van de listener (standaard **1521**). |
| **Service name** | De Oracle **Service name** (of het oudere **SID**) — niet de database-naam. |
| **User name** | Gebruikersnaam van het databaseaccount. |
| **Password** | Wachtwoord van dat account. |

- **Authenticatie:** Basic — gebruikersnaam + wachtwoord.
- **Integration runtime:** de wizard toont een IR-keuzeveld, maar die keuze wordt bij Oracle momenteel **niet toegepast** op de linked service: die wordt zonder `connectVia` uitgerold en draait dus altijd op de **cloud-IR** (`AutoResolveIntegrationRuntime`). De Oracle-server moet daarom vanaf Azure bereikbaar zijn. Staat Oracle **on-premises of achter een firewall**, dan werkt dat op dit moment niet out-of-the-box — het vergt een handmatige aanpassing van de linked service (een fix om de IR-keuze wél toe te passen staat op de rol). Zie [Databron koppelen](../../setup/databron-koppelen.md).
- **Secrets:** wachtwoord en verbindingsgegevens worden nooit door de frontend opgeslagen. Ze gaan naar de **Azure Key Vault** van de klant onder de groep **`adf-{bronnaam}-…`**; de linked service verwijst ernaar. Yres bouwt hierbij de server-string als **`host:port/service_name`** en bewaart deze samen met gebruikersnaam en wachtwoord als aparte secrets (`adf-{bronnaam}-server`, `adf-{bronnaam}-username`, `adf-{bronnaam}-password`).

:::info Driver versie 2.0
Yres gebruikt voor Oracle de **driver versie 2.0**. Hierbij zijn versleuteling (`encryptionClient=accepted`, AES/3DES) en een crypto-checksum (SHA) standaard ingeschakeld. Dit hoef je zelf niet in te stellen; de wizard regelt het.
:::

### Voorwaarden

- Een databaseaccount met **alleen-lezen** rechten (least privilege) op de betreffende schema's — gebruik bij voorkeur een apart serviceaccount in plaats van een persoonlijk of admin-account.
- **Bereikbaarheid vanaf Azure**: de database moet bereikbaar zijn voor de cloud-IR. Bij een on-prem/gefirewallde database geldt de beperking hierboven — de IR-keuze wordt momenteel niet op de linked service toegepast.

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop Oracle draait; Port is de luisterpoort van de listener (standaard **1521**). Te vinden in de serverconfiguratie of op te vragen bij je DBA.
- **Service name** — Oracle gebruikt een **Service name** (of het oudere **SID**) in plaats van een database-naam. De service name staat in het `tnsnames.ora`-bestand op de server/client, is op te vragen via `lsnrctl status` op de server, of bij je DBA.
- **Username / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten (least privilege) op de betreffende schema's, in plaats van een persoonlijk of admin-account.

Staat de database achter een firewall of on-premises? Houd dan rekening met de beperking hierboven: de linked service draait momenteel altijd op de cloud-IR, dus de database moet vanaf Azure bereikbaar zijn — zie [Databron koppelen](../../setup/databron-koppelen.md).

## Load types en delta

Oracle ondersteunt de standaard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL). Als SQL-gebaseerde bron kun je bij een delta-load twee deltakolommen instellen.

> Officiële documentatie: [Oracle JDBC — Database URLs and Database Specifiers](https://docs.oracle.com/en/database/oracle/oracle-database/21/jjdbc/data-sources-and-URLs.html)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
