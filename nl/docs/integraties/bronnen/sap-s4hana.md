---
title: SAP S/4HANA
sidebar_label: SAP S/4HANA
description: SAP S/4HANA koppelen aan Yres — verbindingseisen.
---

# SAP S/4HANA

**Categorie:** OData  ·  🏅 Official partner

SAP S/4HANA ERP. Official partner. SAP S/4HANA heeft in Yres **geen eigen connector met een apart
invulformulier**: je koppelt het systeem via een van twee routes — een **OData**-service via de SAP
Gateway (de meest gebruikelijke route), of via de **SAP Business Data Cloud (SAP_BDC)** wanneer data daar
als bestand wordt aangeboden. Een directe database-/ODBC-verbinding op de onderliggende SAP HANA bestaat
in Yres **niet** (zie [SAP HANA](sap-hana.md)).

## Verwachte input

Welke velden je invult, hangt af van de gekozen route. In alle gevallen vraagt de wizard **Bron toevoegen**
eerst de gedeelde velden die voor élke bron gelden: **Bronnaam** (uniek, 2–45 tekens; wordt de naam van de
linked service en de basis voor de Key Vault-secrets `adf-{bronnaam}-…`), **type**, **integration runtime**,
*credentials voor alle omgevingen identiek?*, *vervaldatum credentials* en *tags*.

### Route A — OData-service (aanbevolen)

Kies in de wizard het brontype **OData** (of **OData OAuth** als de SAP Gateway OAuth gebruikt). Het
OData-formulier (`getFormAddSourceOdata` / `getFormAddSourceOdataOauth`) vraagt om:

| Veld (label) | Toelichting |
|---|---|
| **Url** | De service-root van de OData-service, in de vorm `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>/`. Yres voegt automatisch een afsluitende `/` toe. |
| **Pagination type** | Vast op **`BodyUrl`** (alleen-lezen): paginering verloopt via de OData-`nextLink`. |
| **Body url** | JSON-pad naar de volgende-pagina-link. Standaard `$['@odata.nextLink']`. |
| **Authentication type** | **`Anonymous`** of **`Basic`**. Bij **Basic** verschijnen extra velden **Username** en **Password** — de SAP-(communicatie)gebruiker met leesautorisatie. |
| **HTTP headers** (optioneel) | Eén of meer header/waarde-paren voor API's die een extra header verlangen. |

Bij OAuth (route via **OData OAuth**) vul je in plaats van username/password de OAuth-velden in: **Client id**,
**Client secret**, **Access token url**, **Scope** en **Grant Type** (`Client Credentials` of `Authorization
Code`; bij Authorization Code is ook een **Refresh token** verplicht).

- **Authenticatie:** Basic (SAP-gebruiker + wachtwoord) of OAuth2, afhankelijk van hoe de SAP Gateway is
  ingericht.
- **Integration runtime:** is de OData-service publiek bereikbaar, kies dan
  **`AutoResolveIntegrationRuntime`** (cloud). Staat de SAP Gateway **on-premises of achter een firewall**,
  kies dan een **self-hosted integration runtime**.
- **Secrets:** Yres slaat zelf geen geheimen op. De backend schrijft de waarden naar de **Azure Key Vault**
  van de klant onder de groep **`adf-{bronnaam}-…`** (bij Basic o.a. `adf-{bronnaam}-basic-http-username` en
  `adf-{bronnaam}-basic-http-password`; de URL als `adf-{bronnaam}-http-url`); de linked service verwijst
  ernaar.

Zie de pagina's [OData](odata.md) en [OData OAuth](odata-oauth.md) voor het volledige veldoverzicht van deze
twee brontypen.

### Route B — SAP Business Data Cloud (SAS-token)

Wordt data via SAP BDC als bestand (Azure Blob FS / Data Lake) aangeboden, dan koppel je die via het
**SAP_BDC**-formulier met een **SAS uri**, **container** en **SAS token**. Dit is een aparte route met eigen
authenticatie (SAS) en draait op de cloud integration runtime. Zie
[SAP Business Data Cloud](sap-bdc.md) voor de velden, de validatieregels en de vaste deltakolom `ETL_DATE`.

:::note Geen eigen brontype — via SAP_BDC of OData
SAP S/4HANA heeft in `CreateSource.tsx` geen eigen brontype of invulformulier. Afhankelijk van de use-case
koppel je S/4HANA via **SAP_BDC** of via **OData** (SAP Gateway). Welke route past, hangt af van hoe de
SAP-omgeving data ontsluit; stem dit af met je SAP-/Basis-beheerder. De afbeeldingen `saphana`/`saptable`
in de webapp zijn alleen iconen, geen aparte connectors.
:::

## Gegevens ophalen

S/4HANA koppelt het vaakst via een **OData**-service uit de SAP Gateway.

- **OData-service activeren** — Een Basis-/SAP-beheerder activeert de gewenste OData-service in de SAP
  Gateway. Gebruik daarvoor transactie `/IWFND/MAINT_SERVICE` (Service Maintenance): voeg de service toe via
  *Add Service*, kies het systeemalias van het back-end-systeem (bv. `LOCAL`) en activeer de service. De
  status moet *Active* zijn.
- **Service-URL** — De aangeroepen URL heeft de vorm
  `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>`. Host en poort zijn die van de SAP
  Gateway/het ICM (vaak de HTTPS-poort `443` of `5<instance>43`). Test de service eventueel met transactie
  `/IWFND/GW_CLIENT`.
- **Authenticatie** — Basic authentication met een SAP-(communicatie)gebruiker, of OAuth indien de Gateway
  daarvoor is ingericht. De gebruiker heeft leesautorisatie nodig op de onderliggende data.

### Voorwaarden

- Een geactiveerde OData-service in de SAP Gateway (zie hierboven) en een **SAP-(communicatie)gebruiker** met
  leesautorisatie op de betreffende data.
- Bij OAuth: een ingerichte OAuth-client in de SAP Gateway (client id/secret, token-endpoint).
- Bij een on-premises of gefirewalde SAP-omgeving: een geïnstalleerde en gepubliceerde **self-hosted
  integration runtime** die de SAP Gateway kan bereiken.

## Load types en delta

S/4HANA via OData ondersteunt de standaard load types (FULL, DELTA, OVERWRITE, RELOAD, IMAGE, ADDITIONAL).
Let op: **FULL** en **RELOAD** behouden historie (SCD2); alleen **OVERWRITE** verwijdert de bestaande
historie. Voor delta-loads stel je een deltakolom in op basis van een betrouwbaar gewijzigd-op-veld in de
OData-entiteit.

Officiële docs: [Activate OData Service in the SAP Gateway Hub (SAP Help Portal)](https://help.sap.com/docs/ABAP_PLATFORM_NEW/cc0c305d2fab47bd808adcad3ca7ee9d/1b023c1cad774eeb8b85b25c86d94f87.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
