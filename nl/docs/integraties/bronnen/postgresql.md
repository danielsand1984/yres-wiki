---
title: PostgreSQL
sidebar_label: PostgreSQL
description: PostgreSQL koppelen aan Yres — verbindingseisen.
---

# PostgreSQL

**Categorie:** Directe koppeling

PostgreSQL relationele database. Yres koppelt rechtstreeks op de database. Nieuwe PostgreSQL-bronnen
worden automatisch op **driverversie 2.0** gezet en deployen als een ADF-gekoppelde service van het
type **`AzurePostgreSql`**. Er is één PostgreSQL-brontype; de database moet vanaf Azure bereikbaar zijn
(zie *Integration runtime* hieronder).

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

**Authenticatie:** Basic (gebruikersnaam + wachtwoord), met **SslMode 3** (SSL vereist). Dit stelt de
wizard automatisch in; je hoeft zelf geen connection string samen te stellen.

**Integration runtime:** de gekoppelde service wordt **zonder `connectVia`** uitgerold en draait dus op
de **cloud-IR** (`AutoResolveIntegrationRuntime`). De IR-keuze die je in de wizard maakt wordt bij
PostgreSQL momenteel **niet toegepast** op de linked service. De PostgreSQL-server moet daarom vanaf
Azure bereikbaar zijn (publiek endpoint of opengestelde firewall); een on-premises database achter een
gesloten firewall werkt op dit moment niet zonder handmatige aanpassing van de linked service.

## Voorwaarden

- **Bereikbaarheid vanaf Azure**: netwerktoegang vanaf de Azure-cloud-IR naar `Host:Port` (standaard
  `5432`); pas zo nodig de firewall of `pg_hba.conf` aan zodat het serviceaccount mag verbinden. De
  verbinding vereist SSL (SslMode 3).
- **Serviceaccount** met **alleen-lezen** rechten op de betreffende database (least privilege), in
  plaats van een persoonlijk of admin-account.

De verbindingsgegevens worden door de backend opgeslagen in de Azure Key Vault van de klant als **vijf
losse secrets**: `adf-{Bronnaam}-server`, `adf-{Bronnaam}-database`, `adf-{Bronnaam}-port`,
`adf-{Bronnaam}-username` en `adf-{Bronnaam}-password`. De gekoppelde service verwijst per veld naar
het bijbehorende secret; je voert dus nooit credentials in pipelines of configuratie in.

:::note Historisch: het legacy-connectionstring-pad
Oudere PostgreSQL-bronnen (aangemaakt vóór het afdwingen van driverversie 2.0) gebruiken nog de oude
deploy-route met één gecombineerd `adf-{Bronnaam}-connectionstring`-secret. Nieuwe bronnen krijgen
altijd de `AzurePostgreSql`-vorm met de vijf losse secrets hierboven.
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
