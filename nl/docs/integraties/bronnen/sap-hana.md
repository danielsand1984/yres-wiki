---
title: SAP HANA
sidebar_label: SAP HANA
description: SAP HANA koppelen aan Yres — verbindingseisen.
---

# SAP HANA

**Categorie:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. Er is **geen apart invoerformulier** voor SAP HANA: je
koppelt via een **generieke database-verbinding (ODBC)** of via een **XS OData**-service. Welke route je
kiest bepaalt welk brontype en welke verbindingsvelden je gebruikt bij het toevoegen van de bron.

## Verwachte input

Welke velden je invult hangt af van de gekozen route. Daarnaast vul je altijd de standaard bronvelden in
(bronnaam, type, integration runtime, credentials-instellingen) uit de *Bron toevoegen*-wizard.

### Route A — Directe ODBC-verbinding (generiek databasetype)

Gebruik het generieke database-invoerformulier en vul de databaseverbinding in:

| Veld | Omschrijving |
|---|---|
| **Host** | De hostnaam (of IP) van de HANA-server. |
| **Poort** | De SQL-poort. Deze volgt het patroon `3<instance>15` (bv. `30015` voor instance `00`); bij een tenant-database (MDC) is dit `3<instance>13` voor de system-DB of een tenant-specifieke poort. Een SAP-/HANA-beheerder bevestigt de juiste poort. |
| **Gebruikersnaam** | Een HANA-DB-gebruiker met leesautorisatie (`SELECT`) op de betreffende schema's/objecten. |
| **Wachtwoord** | Het wachtwoord van die DB-gebruiker. |

**Authenticatie:** Basic (gebruikersnaam + wachtwoord).

**Integration runtime:** **self-hosted integration runtime** (`pwccIntegrationRuntimeLinked`). Een directe
ODBC-verbinding loopt naar een on-prem of afgeschermde HANA-server, dus de cloud-runtime
`AutoResolveIntegrationRuntime` kan deze niet bereiken.

### Route B — XS OData-service

Als data via een **XS OData**-service is gepubliceerd, koppel je die als OData-bron en vul je de
service-URL in:

| Veld | Omschrijving |
|---|---|
| **Url** | De OData-service-URL met de vorm `https://<host>:<port>/<path>.xsodata`. |
| **Gebruikersnaam / Wachtwoord** | De HANA-/XS-gebruiker waarmee de service wordt benaderd (Basic), als de service niet anoniem is. |

**Authenticatie:** Basic (of OAuth, indien de service daarvoor is ingericht — zie *OData OAuth*).

**Integration runtime:** **`AutoResolveIntegrationRuntime`** (cloud) als de OData-service via internet
bereikbaar is; een self-hosted integration runtime als de service achter een firewall staat.

:::note Geen eigen brontype — via SAP_BDC of OData
SAP HANA heeft **geen eigen wizard-formulier** in Yres (bronpicker `SourceField.tsx`). Afhankelijk van de
use-case koppel je HANA via **SAP_BDC** of via **OData** (XS OData / SAP Gateway). Welke route past, hangt
af van hoe je HANA-omgeving data ontsluit; stem dit af met je SAP-/HANA-beheerder.
:::

:::note Hoe Yres credentials opslaat
De ingevulde gegevens worden niet door Yres bewaard, maar als secrets weggeschreven naar de Azure Key
Vault van je omgeving onder namen die beginnen met `adf-{bronnaam}-`. De linked service verwijst naar die
secrets.
:::

## Gegevens ophalen

SAP HANA koppelt via een **directe ODBC**-verbinding of via een **XS OData**-service.

- **Host en SQL-poort (ODBC)** — Bij een ODBC-verbinding heb je de hostnaam van de HANA-server en de
  SQL-poort nodig. De SQL-poort volgt het patroon `3<instance>15` (bv. `30015` voor instance `00`); bij een
  tenant-database (MDC) is dit `3<instance>13` voor de system-DB of een tenant-specifieke poort. Een SAP-/
  HANA-beheerder kan deze bevestigen. Een directe ODBC-verbinding vereist een **self-hosted integration
  runtime**.
- **Databasegebruiker** — Een HANA-DB-gebruiker met wachtwoord en leesautorisatie (`SELECT`) op de
  betreffende schema's/objecten.
- **OData-alternatief** — Als data via een XS OData-service is gepubliceerd, gebruik je de service-URL
  `https://<host>:<port>/<path>.xsodata`.

Officiële docs: [Connect to SAP HANA via ODBC (SAP Help Portal)](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/66a4169b84b2466892e1af9781049836.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
