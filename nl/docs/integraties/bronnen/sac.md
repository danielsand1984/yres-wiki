---
title: SAP Analytics Cloud (SAC)
sidebar_label: SAP Analytics Cloud (SAC)
description: SAP Analytics Cloud (SAC) koppelen aan Yres — verbindingseisen.
---

# SAP Analytics Cloud (SAC)

**Categorie:** OData  ·  🏅 Official partner

SAP Analytics Cloud koppel je aan Yres via een OAuth-client met de grant *Client Credentials*. Yres
maakt onder water twee linked services aan (`{bronnaam}_HTTP` en `{bronnaam}_REST`) en haalt de data op
via de data-export API van je SAC-tenant. Official partner.

## Verwachte input

Bij het toevoegen van de bron vul je naast de standaard bronvelden (zie *Vereisten* hieronder) de
volgende verbindingsvelden in. De veldlabels komen exact overeen met het invoerformulier.

| Veld | Omschrijving |
|---|---|
| **Url** | De data-export endpoint van je SAC-tenant, bijvoorbeeld `https://tenant-name.eu10.hcs.cloud.sap/api/v1/dataexport/`. |
| **Authentication url** | Het OAuth **token endpoint** van je SAP-identityprovider, bijvoorbeeld `https://tenant-name.authentication.eu10.hana.ondemand.com/oauth/token`. |
| **Client Id** | De OAuth Client ID van de in SAC aangemaakte OAuth-client. |
| **Client Secret** | Het bijbehorende OAuth Client Secret. |

**Authenticatie:** OAuth2 *Client Credentials*. Yres haalt met Client Id + Client Secret een token op
bij de *Authentication url* en gebruikt dat token om de data-export endpoint te benaderen.

**Integration runtime:** **`AutoResolveIntegrationRuntime`** (cloud). SAC is via internet bereikbaar, dus
een self-hosted integration runtime is niet nodig.

:::note Hoe Yres dit opslaat
De ingevulde waarden worden niet door Yres bewaard maar als secrets weggeschreven naar de Azure Key Vault
van je omgeving, onder de namen `adf-{bronnaam}-URL`, `adf-{bronnaam}-clientId`,
`adf-{bronnaam}-clientsecret` en `adf-{bronnaam}-AuthURL`. De twee linked services (`{bronnaam}_HTTP` en
`{bronnaam}_REST`) staan zelf op authenticatietype *Anonymous*; de OAuth-token wordt in de pipeline
opgehaald en de keyvault-verwijzing naar het client secret wordt automatisch ingevuld.
:::

## Vereisten

- Een **OAuth-client** in SAP Analytics Cloud met grant **Client Credentials** (zie *Setup*).
- De **Token URL** (Authentication url) en de **data-export URL** van je tenant.
- De **Client ID** en het **Client Secret** van die OAuth-client.

## Setup

Maak in SAP Analytics Cloud een OAuth-client aan via **System → Administration → App Integration**:

1. Ga naar **System → Administration → App Integration → Add a New OAuth Client**.
2. Kies bij **Authorization Grant** de optie **Client Credentials**.
3. Sla de client op. SAC toont nu de **OAuth Client ID** en het bijbehorende **Secret** — kopieer beide.
4. Noteer op dezelfde **App Integration**-pagina de **Token URL** (gebruik die als *Authentication url* in
   Yres).

## Gegevens ophalen

- **Url** — de data-export endpoint van je tenant. Voorbeeld:
  `https://tenant-name.eu10.hcs.cloud.sap/api/v1/dataexport/`. Vervang `tenant-name` en de regio
  (`eu10`) door die van jouw SAC-omgeving.
- **Authentication url** — het OAuth **token endpoint**. Je vindt deze op **System → Administration →
  App Integration**. Voorbeeld:
  `https://tenant-name.authentication.eu10.hana.ondemand.com/oauth/token`.
- **Client Id + Client Secret** — afkomstig van de OAuth-client die je in de stap *Setup* hebt aangemaakt
  (grant **Client Credentials**). Na opslaan toont SAC de **OAuth Client ID** en het **Secret**.

Officiële documentatie: [SAP Analytics Cloud — Manage OAuth Clients](https://help.sap.com/docs/SAP_ANALYTICS_CLOUD/00f68c2e08b941f081002fd3691d86a7/4f43b54398fc4acaa5efa32badfe3df6.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
