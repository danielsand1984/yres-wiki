---
sidebar_position: 2
title: Integratiecatalogus
description: Alle ondersteunde databronnen, gecategoriseerd.
---

# Integratiecatalogus

Dit is de complete lijst met databronnen die Yres ondersteunt. De catalogus is gegroepeerd naar
**verbindingstype** (directe databasekoppeling, OData, REST, bestandsbronnen, Microsoft-platform).
Elke bron heeft een eigen pagina met categorie, verwachte input, verbindingseisen en setup — zie
**Bronnen (A–Z)** in het menu.

:::note Hoe Yres koppelt
Veel SaaS-bronnen koppelen niet via een eigen, dedicated connector maar via een **generiek protocol**
(OData of REST) of via **Microsoft Graph**. In de catalogus is dat aangegeven in de kolom
**Bijzonderheid**, zodat je weet welke onderliggende techniek en welke invoer je kunt verwachten.
:::

## Verwachte input (kort)

Welke gegevens je per bron invult hangt af van de categorie. De volle details staan op elke bronpagina;
dit is het patroon:

- **Databases** (Microsoft SQL, Azure SQL, MySQL, PostgreSQL, DB2, Oracle, Snowflake): host/account ·
  database (of *service name* bij Oracle) · poort · gebruikersnaam · wachtwoord. **Auth:** Basic.
- **Azure-opslag** (Azure Blob Storage, SAP Business Data Cloud, SAP Datasphere, Azure Data Lake):
  account/container + **SAS-token**. **Auth:** SAS.
- **OData / REST**: service-URL + paginatie-instelling, met Anonymous, Basic of OAuth2.
- **Microsoft-platform** (SharePoint, Teams, Microsoft Graph, Dynamics 365, Power BI,
  Intune): een **Entra ID (Azure AD) app-registratie** met Tenant ID, Client ID en Client secret.
- **SaaS met token** (AFAS, Monday, Simplicate, Exact Online, Salesforce): API-token of OAuth2.

**Integration Runtime:** cloudbereikbare bronnen draaien op de cloud-IR `AutoResolveIntegrationRuntime`;
on-premises of afgeschermde bronnen (lokale databases, File Server, lokale bestanden) vereisen een
**self-hosted Integration Runtime**.

**Secrets:** Yres slaat nooit credentials in de webapp op. Alles gaat naar de **Azure Key Vault** van de
klant, met de naamconventie `adf-{bronnaam}-{suffix}`; de linked service verwijst daarnaar.

---

## Databases (directe koppeling)

Directe database-koppeling via Azure Data Factory. Auth is gebruikersnaam/wachtwoord (Basic),
opgeslagen in de Key Vault. On-premises databases vereisen een self-hosted Integration Runtime.

| Bron | Bijzonderheid |
|---|---|
| Microsoft SQL | |
| Azure SQL Database | Cloud — AutoResolve-IR volstaat |
| MySQL | Geen ondersteuning voor twee delta-kolommen (zie bronpagina) |
| PostgreSQL | |
| DB2 | |
| Oracle | Vereist *service name* i.p.v. databasenaam |
| Snowflake | Cloud — AutoResolve-IR volstaat |

## OData

Bronnen die via het OData-protocol worden ontsloten. Auth is Anonymous, Basic of OAuth2 (zie bronpagina).

| Bron | Bijzonderheid |
|---|---|
| SAP Analytics Cloud (SAC) | 🏅 Official partner — OAuth2 |
| SAP S/4HANA | 🏅 Official partner — OData-service via SAP Gateway |
| SAP HANA | 🏅 Official partner — `.xsodata` of directe ODBC-koppeling |
| OData (generiek) | Elke OData v4-service; Anonymous of Basic |
| OData OAuth | OData-service met OAuth2 (client credentials / authorization code) |
| Centraal Bureau voor de Statistiek (CBS) | Vaste OData-URL, anoniem |
| Tweede Kamer | Vaste OData-URL, anoniem |

## REST

Generieke REST-koppeling en SaaS-bronnen die onder water op REST draaien.

| Bron | Bijzonderheid |
|---|---|
| REST API's (generiek) | Optioneel OpenAPI-spec; Anonymous, Basic of OAuth2 client credentials |
| AFAS | 🏅 Official partner — API-token via de AFAS app connector |
| Monday | API-token (eigen `Monday`-type, REST onder water) |
| Simplicate | Onder water REST; twee auth-headers (key + secret) |
| Exact Online | OAuth2 authorization-code; aparte app per omgeving |
| Salesforce | OAuth2 client credentials |
| Mendix | Via gepubliceerde OData- of REST-service in Studio Pro |
| Onestream | *(preview)* — OAuth2 of Personal Access Token (PAT) |
| Board (BoardEPM) | OAuth2 client credentials |

## Microsoft-platform (Entra ID / Graph)

Bronnen die via een **Entra ID (Azure AD) app-registratie** worden ontsloten. Teams, Dynamics 365 en
Topdesk koppelen niet met een eigen connector maar rijden onder water mee op **Microsoft Graph** of
**OData**; de invoer is in alle gevallen Tenant ID, Client ID en Client secret (of, bij Topdesk,
gebruikersnaam + wachtwoord).

| Bron | Bijzonderheid |
|---|---|
| SharePoint | Azure AD app-only; rechten via `appinv.aspx` |
| Microsoft Teams | Via **Microsoft Graph** (OData/REST onder water) |
| Microsoft Graph | OAuth2 (client credentials of authorization code) |
| Dynamics 365 (Business Central) | Via **OData** + OAuth2 onder water |
| Topdesk | Via **OData** (reporting-endpoint) + Basic auth onder water |
| Microsoft Intune (Intune Data Warehouse) | Via **OData** + OAuth2 onder water |
| Power BI | Azure AD service principal; geconsumeerd via de Power BI API (geen ADF-copy) |

## Azure-opslag & SAP (SAS-token)

Bronnen met een Azure Blob/Data Lake-endpoint, ontsloten met een **SAS-token**.

| Bron | Bijzonderheid |
|---|---|
| Azure Blob Storage | SAS-token op het storage-account |
| SAP Business Data Cloud (SAP_BDC) | 🏅 Official partner — SAS-uri + container + SAS-token |
| SAP Datasphere | 🏅 Official partner — AzureBlobFS / SAS (apart SAP-product, zie hieronder) |

:::info SAP Business Data Cloud vs. SAP Datasphere
**SAP Business Data Cloud (SAP_BDC)** en **SAP Datasphere** zijn twee **verschillende** SAP-producten.
Beide worden in Yres ontsloten als een **AzureBlobFS / SAS**-bron (account + container + SAS-token),
maar het zijn losse aansluitingen — geen synoniemen. SAP_BDC heeft een eigen invoerformulier in de
webapp; voor Datasphere wordt dezelfde SAS-invoer gebruikt.
:::

## Bestandsbronnen

| Bron | Bijzonderheid |
|---|---|
| Lokale bestanden (CSV, Excel) | Self-hosted IR **verplicht** |
| File Server | UNC-pad; self-hosted IR **verplicht** |
| Azure Data Lake (Gen2) | SAS-token (AzureBlobFS) |

:::note Geen losse wizard-keuze
**Azure Data Lake** en **SAP Datasphere** hebben wel een ADF-template (`AzureBlobFS`), maar zijn **geen
losse keuze** in de bron-wizard (`SourceField.tsx`). Wil je data uit een Data Lake ophalen, koppel die dan
als **Azure Blob Storage**-bron; SAP Datasphere koppel je via het **SAP_BDC**-formulier.
:::

## Custom

Staat jouw bron er niet tussen? Via onze database-, OData- en REST-integraties ondersteunen we veel meer
dan we hier kunnen tonen. Neem contact op en we kijken samen of we jouw scenario kunnen ondersteunen.

---

:::note Lokale netwerken
Bronnen in een lokaal netwerk worden vanuit Azure Data Factory bereikt via een **self-hosted
Integration Runtime (IR)**. Beschikbaar in alle pakketten.
:::

:::tip Officiële documentatie
Voor de exacte invoer per bron (veldlabels, auth-methode, IR-vereiste en voorbereiding zoals
app-registratie, client secret of SAS-token) — zie de individuele bronpagina onder **Bronnen (A–Z)**.
:::
