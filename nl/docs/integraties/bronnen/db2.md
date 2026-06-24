---
title: DB2
sidebar_label: DB2
description: DB2 koppelen aan Yres — verbindingseisen.
---

# DB2

**Categorie:** Directe koppeling

IBM Db2 relationele database. Directe koppeling via een username/password-verbinding.

## Verwachte input

Je maakt de bron aan via de wizard **Bron toevoegen**. Naast de algemene velden (bronnaam,
integration runtime, credentials per omgeving, vervaldatum, tags) vraagt het Db2-formulier om de
standaard databasevelden.

### Verbindingsvelden

De labels hieronder zijn exact zoals ze in het formulier staan:

| Veld | Omschrijving |
|---|---|
| **host** | Servernaam of IP-adres waarop Db2 draait. |
| **database name** | De naam van de specifieke Db2-database waarmee je koppelt. |
| **port** | Luisterpoort van de database (numeriek). Standaard **50000**, of **50001** voor SSL. |
| **user name** | Gebruikersnaam van het databaseaccount. |
| **password** | Wachtwoord bij het account. |

### Authenticatie

- **Basic** (gebruikersnaam + wachtwoord). De linked service wordt aangemaakt als `type: Db2` met
  `authenticationtype=Basic`.
- Het wachtwoord/connectionstring wordt nooit in de frontend bewaard. Yres slaat de credential op in
  de **Azure Key Vault** van je eigen omgeving onder de naam **`adf-{bronnaam}-connectionstring`**, en
  de linked service verwijst ernaar.

### Integration runtime

- Db2 draait vrijwel altijd **on-premises of achter een firewall**. Daarom is een **self-hosted
  integration runtime** vereist; de meegeleverde linked service verwijst via `connectVia` naar
  `pwccIntegrationRuntimeLinked`.
- Selecteer de juiste self-hosted IR in de wizard. `AutoResolveIntegrationRuntime` (cloud) werkt
  alleen als de Db2-server publiek bereikbaar is, wat zelden het geval is.

### Vereisten

- **Netwerktoegang** vanaf de machine met de self-hosted IR naar de Db2-host en -poort (firewall /
  VPN openzetten).
- Bij voorkeur een apart **serviceaccount met alleen-lezen rechten** (least privilege) op de
  betreffende database, in plaats van een persoonlijk of admin-account.
- Een werkende self-hosted IR — zie [Databron koppelen](../../setup/databron-koppelen.md).

:::info Te bevestigen
Db2 heeft geen eigen backend-builder; de bron wordt aangemaakt via het oudere
deploy-pad (`SourceSystemManager`), dat één gecombineerde `adf-{bronnaam}-connectionstring`-secret
wegschrijft. De exacte opbouw van de connectionstring bij provisioning is niet uit de code te
verifiëren.
:::

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **host / port** — Host is de servernaam of het IP-adres waarop Db2 draait; port is de luisterpoort
  (standaard **50000**, of **50001** voor SSL). Te vinden in de serverconfiguratie of op te vragen bij
  je DBA.
- **database name** — De naam van de specifieke Db2-database waarmee je wilt koppelen.
- **user name / password** — Gebruik bij voorkeur een serviceaccount met alleen-lezen rechten.

## Load types en delta

Db2 hoort tot de SQL-gebaseerde bronnen en ondersteunt **twee delta-kolommen** (dit in tegenstelling
tot MySQL, dat slechts één delta-kolom toelaat). De standaard load types (FULL, DELTA, DELTAIMAGE,
IMAGE, OVERWRITE, RELOAD, ADDITIONAL) zijn beschikbaar. Zie [Load types](../../concepten/load-types.md)
voor de werking per type.

> Officiële documentatie: [IBM Db2 — URL format for the JDBC driver](https://www.ibm.com/docs/en/db2/12.1.0?topic=cdsudidsdjs-url-format-data-server-driver-jdbc-sqlj-type-4-connectivity)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
