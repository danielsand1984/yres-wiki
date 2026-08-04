---
title: SAP HANA
sidebar_label: SAP HANA
description: SAP HANA koppelen aan Yres — verbindingseisen.
---

# SAP HANA

**Categorie:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. Er is **geen apart invoerformulier** voor SAP HANA en
ook **geen generiek HANA-/ODBC-brontype**: je koppelt HANA-data via een **XS OData**-service, of via
een export-route zoals **SAP_BDC**.

## Verwachte input

Naast de route-specifieke velden hieronder vul je altijd de standaard bronvelden in (bronnaam, type,
integration runtime, credentials-instellingen) uit de *Bron toevoegen*-wizard.

:::caution Directe ODBC-/databaseverbinding — niet beschikbaar
Yres heeft **geen** HANA- of ODBC-brontype: een directe databaseverbinding op de SQL-poort van de
HANA-server is dus **niet mogelijk** — niet in de bronpicker en niet in de laadengine. Gebruik de XS
OData-route hieronder, of de export-route via SAP_BDC.
:::

### XS OData-service

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

SAP HANA koppel je via een **XS OData**-service (of via de SAP_BDC-exportroute).

- **OData-service-URL** — Als data via een XS OData-service is gepubliceerd, gebruik je de service-URL
  `https://<host>:<port>/<path>.xsodata`. Een SAP-/HANA-beheerder kan de juiste service-URL bevestigen.
- **Servicegebruiker** — De HANA-/XS-gebruiker (met wachtwoord) waarmee de service wordt benaderd, met
  leesautorisatie op de betreffende objecten.
- **Geen directe databaseverbinding** — hostnaam en SQL-poort van de HANA-server zijn voor Yres niet
  relevant: een directe ODBC-verbinding wordt niet ondersteund (zie hierboven).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
