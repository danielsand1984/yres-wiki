---
title: PostgreSQL
sidebar_label: PostgreSQL
description: PostgreSQL koppelen aan Yres — verbindingseisen.
---

# PostgreSQL

**Categorie:** Directe koppeling

PostgreSQL relationele database. Yres koppelt rechtstreeks op de database via een
ADF-gekoppelde service van het type `PostgreSql`. Er is één PostgreSQL-brontype: dezelfde koppeling
werkt voor zowel on-premises als in de cloud gehoste PostgreSQL-databases.

## Verwachte input

Bij het toevoegen van de bron via **Bron toevoegen** vul je eerst de gedeelde velden in die voor elke
bron gelden — **Bronnaam** (uniek, begint met een letter, 2-45 tekens; wordt de naam van de
gekoppelde service en de basis van de Key Vault-secret), **type** (PostgreSQL), **integration
runtime**, **inloggegevens identiek voor alle omgevingen?**, **vervaldatum inloggegevens** (optioneel)
en **tags** (optioneel).

Daarna vul je de PostgreSQL-specifieke verbindingsvelden in:

| Veld | Toelichting |
|---|---|
| **Host** | Servernaam of IP-adres waarop PostgreSQL draait. |
| **Database name** | De naam van de specifieke database waarmee je wilt koppelen. |
| **Port** | De luisterpoort van de database (standaard **5432**). |
| **User name** | De gebruikersnaam waarmee verbinding wordt gemaakt. |
| **Password** | Het wachtwoord; wordt nooit door de frontend opgeslagen maar naar Azure Key Vault geschreven. |

**Authenticatie:** Basic (gebruikersnaam + wachtwoord). Yres bouwt hiervan één connection string van de
vorm `host=…;port=5432;database=…;uid=…;encryptionmethod=0`.

**Integration runtime:** een **self-hosted Integration Runtime** is vereist. De gekoppelde service
verwijst via `connectVia` naar de self-hosted IR `pwccIntegrationRuntimeLinked`. Een PostgreSQL-bron
draait dus niet op de cloud-IR (`AutoResolveIntegrationRuntime`): selecteer een gepubliceerde
self-hosted IR die de database kan bereiken — ook wanneer de database in de cloud draait.

## Voorwaarden

- **Self-hosted Integration Runtime** geïnstalleerd en gepubliceerd op een machine die de
  PostgreSQL-server kan bereiken (zie [Databron koppelen](../../setup/databron-koppelen.md)).
- **Netwerktoegang** vanaf de IR-machine naar `Host:Port` (standaard `5432`); pas zo nodig de firewall
  of `pg_hba.conf` aan zodat het serviceaccount mag verbinden.
- **Serviceaccount** met **alleen-lezen** rechten op de betreffende database (least privilege), in
  plaats van een persoonlijk of admin-account.

De inloggegevens worden door de backend opgeslagen in de Azure Key Vault van de klant als één secret
volgens de conventie `adf-{Bronnaam}-connectionstring`; de gekoppelde service verwijst daarnaar. Je
voert dus nooit credentials in pipelines of configuratie in.

:::note Eén connectionstring-secret, self-hosted IR
PostgreSQL gebruikt de oudere deploy-route met één gecombineerde `…-connectionstring`-secret. Eerder
bestond ook een aparte cloud-variant (`AzurePostgreSql`), maar die mapping is in de codebase
uitgeschakeld (uitgecommentarieerd) en wordt niet meer gebruikt — alle PostgreSQL-koppelingen lopen via
het ene `PostgreSql`-type met self-hosted IR.
:::

## Gegevens ophalen

Deze waarden komen van je databasebeheerder (DBA) of uit de bestaande JDBC/ODBC-connectiestring.

- **Host / Port** — Host is de servernaam of het IP-adres waarop PostgreSQL draait; Port is de
  luisterpoort van de database (standaard **5432**). Te vinden in de serverconfiguratie of op te vragen
  bij je DBA.
- **Database name** — De naam van de specifieke database waarmee je wilt koppelen (zichtbaar via `\l`
  in psql of bij je DBA).
- **User name / Password** — Gebruik bij voorkeur een apart serviceaccount met **alleen-lezen** rechten
  (least privilege) op de betreffende database.

> Officiële documentatie: [PostgreSQL — Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
