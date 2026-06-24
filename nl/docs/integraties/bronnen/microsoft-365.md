---
title: Microsoft 365 / Office 365
sidebar_label: Microsoft 365
description: Microsoft 365 (Office 365) koppelen aan Yres — verbindingseisen.
---

# Microsoft 365 / Office 365

**Categorie:** Microsoft-platform (Entra ID / Graph) · Dedicated ADF-connector

Microsoft 365 (Office 365)-data — denk aan gebruikers, e-mail, agenda en
gebruikersactiviteit — wordt door Yres ontsloten via de **`Office365`-connector** van Azure
Data Factory. Deze connector haalt data uit Microsoft 365 via de **Microsoft Graph Data
Connect**-laag en authenticeert met een **Microsoft Entra ID (Azure AD) service principal**.
Voor deze koppeling bestaat een eigen ADF-connector: linked service **`Office365`**
(`type: Office365`) en de pijplijn **`DynamicMS365`** (ADF-map `PW - Yres/Sources/MS365`).

Microsoft 365 is verwant aan, maar **niet hetzelfde** als de [Microsoft Graph](microsoft-graph.md)-
bron. Microsoft Graph is een algemene OData/REST-koppeling (preset `Graph`, opgeslagen als
`OData`) met OAuth2-tokens; de Microsoft 365-koppeling op deze pagina gebruikt de **gespecialiseerde
`Office365`-connector** met een eigen kopieerbron (`Office365Source`). Voor specifiek Teams-data,
zie [Microsoft Teams](teams.md).

:::info Te bevestigen
Microsoft 365 / Office 365 heeft (versie 1.55) **geen keuze-item in de wizard "Bron toevoegen"**
(`CreateSource.tsx`'s `getSourceForm`-switch). Anders dan de meeste bronnen is het op dit moment
dus **geen self-service selecteerbare bron**, maar een toegewijde/voorbeeld-connector die in
samenwerking met Yres wordt geconfigureerd. De velden hieronder zijn afgeleid uit de
ADF-linked-service `Office365.json` en de pijplijn `DynamicMS365.json`; bevestig met Yres of, en
hoe, Microsoft 365 als selecteerbare bron en bijbehorend invoerformulier voor jouw omgeving
beschikbaar is.
:::

## Verwachte input

De `Office365`-connector verbindt met een Microsoft Entra ID (Azure AD) **service principal**
(app-registratie). De volgende waarden zijn vereist; bij een self-service-formulier zouden ze als
velden worden gevraagd, anders worden ze door Yres ingericht. Daarnaast gelden de gedeelde
bronvelden uit stap 1 (**bronnaam**, **type**, **integration runtime**, **credentials gelijk voor
alle omgevingen?**, **vervaldatum credentials**, **tags**).

| Waarde | Toelichting |
|---|---|
| **Source name** | Naam van de bron (uniek per organisatie, 2–45 tekens, begint met een letter). Wordt de naam van de ADF linked service en de prefix van de Key Vault-secrets (`adf-{naam}-…`). |
| **Office 365 Tenant ID** | De Directory (tenant) ID van je Microsoft 365-tenant — de tenant waaruit de data wordt gelezen (`office365TenantId`, GUID). |
| **Service principal Tenant ID** | De Directory (tenant) ID van de Entra-tenant waarin de service principal (app-registratie) is geregistreerd (`servicePrincipalTenantId`, GUID). In de meeste gevallen dezelfde tenant als de Office 365-tenant. |
| **Service principal ID (Client ID)** | De Application (client) ID van de geregistreerde Entra-app (`servicePrincipalId`, GUID). |
| **Service principal key (Client secret)** | Het client secret / de sleutel van de app. Wordt als geheim behandeld en in de Azure Key Vault opgeslagen. |

### Authenticatie

**Azure AD service principal (app-only).** De `Office365`-connector authenticeert met een
geregistreerde Entra ID-app via tenant-ID's, een service-principal-ID en een service-principal-key.
Er is **geen** gebruikersnaam/wachtwoord-flow en geen interactieve login: het is een
service-to-service-koppeling.

:::note
De `Office365`-linked-service in de repo bevat een veld `encryptedCredential` met seed-/voorbeeldgegevens
van de dev-factory (`adf-iris-dev-…`). Dit zijn **geen klantwaarden**: de echte service-principal-key
wordt voor jouw omgeving in de **Azure Key Vault** geplaatst en vandaaruit gerefereerd.
:::

### Integration runtime

Standaard de cloud-runtime **`AutoResolveIntegrationRuntime`** — Microsoft 365 / Microsoft Graph
Data Connect is publiek bereikbaar over HTTPS, dus dit is doorgaans de juiste keuze. Een
**self-hosted integration runtime** is alleen nodig als je het uitgaande verkeer via een
afgeschermd of on-prem netwerk moet routeren.

### Geheimen in Key Vault

De frontend slaat geen geheimen op. De ingevoerde waarden gaan naar de **Azure Key Vault** van de
klant en worden vanuit de linked service gerefereerd. De geheimen worden weggeschreven onder de groep
`adf-{bronnaam}-…` (de bronnaam wordt de naam van de linked service én de prefix van de
Key Vault-geheimen).

## Vereisten (prerequisites)

1. **Registreer een app in Microsoft Entra ID (Azure AD).** Microsoft Entra-beheercentrum →
   **Identity → Applications → App registrations → New registration**.
   - **Service principal ID (Client ID)** — staat na registratie op de **Overzicht
     (Overview)**-pagina als **Application (client) ID**.
   - **Service principal Tenant ID** — eveneens op de **Overzicht**-pagina als
     **Directory (tenant) ID**.
2. **Maak een client secret (service-principal-key) aan** onder de app →
   **Certificates & secrets** → **New client secret**. Kopieer de **Value** direct; deze waarde
   wordt **maar één keer getoond**.
3. **Geef de app toegang tot de Microsoft 365-data.** De `Office365`-connector loopt via
   **Microsoft Graph Data Connect**; daarvoor moet Graph Data Connect in de tenant zijn ingeschakeld
   en moet een beheerder de app (de service principal) goedkeuren voor de gewenste datasets. Laat een
   beheerder **admin consent** verlenen voor de benodigde Microsoft Graph-permissies.
4. **Noteer de Office 365 Tenant ID** — de tenant waaruit de data wordt opgehaald. Als de
   app-registratie in dezelfde tenant staat, zijn de Office 365- en service-principal-tenant-ID
   gelijk.

:::info Te bevestigen
De exacte vereisten aan de kant van Microsoft 365 (welke Graph Data Connect-datasets, welke
toestemmingsstappen en eventuele opslagvereisten) hangen af van wat Microsoft voor de
`Office365`-connector vereist en kunnen per tenant verschillen. Bevestig de precieze inrichting met
Yres en de Microsoft-documentatie voordat je deze bron in productie neemt.
:::

## Hoe Yres de data laadt

De pijplijn **`DynamicMS365`** kopieert de Microsoft 365-data eerst met een
**`Office365Source`**-kopieeractie naar een blob (binair/JSON), leest die JSON vervolgens in de
`STAGE`-laag (`FILE_{categorie}_{tabel}`) en draait daarna `spHIS_InsertAndUpdate` om STAGE → HIS
(SCD2-historie) samen te voegen. Het voorbeeld in de pijplijn haalt de Microsoft Graph
**`User`**-entiteit op (kolommen als `displayName`, `mail`, `jobTitle`, `department`,
`userPrincipalName`, enz.).

:::note Load type
De `DynamicMS365`-pijplijn is **vast op load type `FULL`** ingesteld (de
`spHIS_InsertAndUpdate`- en `spUpdateETL_EndDate`-stappen krijgen `TableLoadType=FULL` mee). FULL is
een historie-bewarende SCD2-upsert: nieuwe records worden ingevoegd, gewijzigde records krijgen een
nieuwe versie en bestaande/ontbrekende sleutels blijven open. Alleen OVERWRITE truncatet de
historie. Andere load types worden langs dit pad niet toegepast.
:::

---

**Zie ook:** [Microsoft Graph](microsoft-graph.md) · [Microsoft Teams](teams.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
