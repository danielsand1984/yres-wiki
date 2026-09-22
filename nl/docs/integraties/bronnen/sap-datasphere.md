---
title: SAP Datasphere
sidebar_label: SAP Datasphere
description: SAP Datasphere koppelen aan Yres — verbindingseisen.
---

# SAP Datasphere

**Categorie:** Azure-opslag (AzureBlobFS / SAS)  ·  🏅 Official partner

SAP Datasphere. Official partner. Binnen Yres wordt Datasphere ontsloten als een **AzureBlobFS / SAS**-bron — dezelfde verbindingsvorm als **SAP Business Data Cloud (SAP_BDC)** (het SAP_BDC-formulier staat beschreven op de pagina [SAP Business Data Cloud](sap-bdc.md)) en [Azure Blob Storage](azure-blob-storage.md).

:::caution SAP Datasphere ≠ SAP Business Data Cloud (SAP_BDC)
**SAP Datasphere** en **SAP Business Data Cloud (SAP_BDC)** zijn twee **verschillende** SAP-producten — geen synoniemen. Ze hebben elk een eigen ADF-linked-service-template (`Datasphere.json` resp. `SAP_BDC.json`), maar **beide** hebben dezelfde vorm: `type: AzureBlobFS` met een SAS-uri op het `dfs.core.windows.net`-endpoint. SAP_BDC heeft een eigen invoerformulier in de webapp; voor Datasphere wordt dezelfde SAS-invoer gebruikt.
:::

## Verwachte input

Datasphere wordt aangesloten via een **`AzureBlobFS`**-linked service met een **SAS-uri** op een Azure Data Lake-/Blob-endpoint (`dfs.core.windows.net`). De verbindingsvorm is identiek aan die van SAP Business Data Cloud.

### Velden

De verbinding gebruikt dezelfde SAS-gebaseerde invoer als het SAP_BDC-formulier (`getFormAddSapBdc.ts`):

| Veld | Toelichting |
|---|---|
| **Sas uri** | De host-uri van het opslag-endpoint, vorm `https://<host>/` (alleen de hostnaam, **met afsluitende slash** — dit wordt gevalideerd). |
| **Container** | De container/het filesystem binnen het opslag-endpoint waarin de Datasphere-export staat. |
| **Sas token** | Het SAS-token dat toegang verleent. Moet de parameters `sig`, `sp`, `se`, `spr` en `st` bevatten en **mag niet** met een `?` beginnen (dit wordt gevalideerd). |

### Authenticatie

- **SAS-token (Shared Access Signature)** — geen gebruikersnaam/wachtwoord. De SAS-uri, het token en de container worden als secrets opgeslagen in de **Azure Key Vault** van je omgeving en door de linked service gerefereerd; de frontend bewaart nooit secrets.

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** Het opslag-endpoint is publiek bereikbaar via HTTPS. De `AzureBlobFS`-template zet **geen `connectVia`** en draait dus op de cloud-IR — net als SAP_BDC en Azure Blob Storage. Een self-hosted integration runtime is hier niet nodig.

### Vereisten

1. Een **Azure Data Lake-/Blob-endpoint** (`dfs.core.windows.net`) waarop de Datasphere-export staat of naartoe wordt geschreven.
2. Een geldig **SAS-token** met minimaal lees-/lijstrechten op de container, en de bijbehorende **SAS-uri** (host) en **containernaam**.
3. Een **Key Vault-secret** volgens de Yres-naamconventie `adf-{bronnaam}-{suffix}` (bv. `adf-{bronnaam}-sas-uri`, `adf-{bronnaam}-sas-token`, `adf-{bronnaam}-container`). De waarden worden bij provisioning vanuit Key Vault geïnjecteerd, niet vanuit de frontend.
4. (Aanbevolen) Een **vervaldatum** op het SAS-token. Vul die ook in het wizard-veld *credentials expiry* in, zodat Yres je tijdig waarschuwt voordat het token verloopt.

> Let op: de waarden in de meegeleverde `Datasphere.json` (host, endpoint) zijn **voorbeeld-/seeddata** voor de dev-factory, geen klant-specifieke configuratie. De *vorm* van de linked service is leidend, de hostnamen niet.

:::note Geen eigen wizard-keuze — koppel via SAP_BDC
SAP Datasphere is **geen zelfstandige keuze** in de "Bron toevoegen"-wizard: in de bronpicker (`SourceField.tsx` / `CreateSource.tsx`) staat geen Datasphere-item, en er is geen `DatasphereSource.php` (alleen een `Datasphere.json`-template). Je koppelt Datasphere daarom **via het SAP_BDC-formulier** (zelfde SAS-invoer).
:::

## Data klaarzetten in SAP Datasphere

Om data via dit AzureBlobFS/SAS-pad te ontsluiten, exporteer je vanuit Datasphere naar een Azure Data Lake-/Blob-container en deel je die via een SAS-token. Een Datasphere-beheerder zet daarvoor de gewenste view of het analytic model klaar.

- **Data exposen** — Stel in Datasphere de view of het analytic model bloot voor consumptie (markeer als *Expose for Consumption*).
- **Export naar opslag** — Schrijf de geëxposeerde data weg naar een Azure Data Lake-/Blob-container (het `dfs.core.windows.net`-endpoint dat je in de **Sas uri** opgeeft).
- **SAS-token** — Genereer op dat storage-account een SAS-token met minimaal lees-/lijstrechten en een vervaldatum (Azure Portal → storage-account → **Security + networking → Shared access signature**). Het token is het deel ná het `?`; bewaar het direct, want het wordt maar één keer getoond.

### Alternatief: consumption-/OData-API

SAP Datasphere kan data ook rechtstreeks via een **consumption-/OData-API** ontsluiten. Dit pad valt buiten de meegeleverde `Datasphere.json`-template (die is AzureBlobFS/SAS), maar is bruikbaar als je Datasphere als generieke [OData](odata.md)- of [OData (OAuth)](odata-oauth.md)-bron koppelt.

- **Data exposen** — Markeer de view of het analytic model als *Expose for Consumption*. De OData-URL volgt het patroon `https://<tenant-host>/api/v1/dwc/consumption/relational/<space>/<object>/<object>` (of `.../analytical/...` voor analytic models).
- **OAuth-client** — Een Datasphere-beheerder maakt een OAuth 2.0-client aan (**System → Administration → App Integration**). Daaruit komen de **Client ID**, **Client secret**, **Authorization-** en **Token-URL** voor de OAuth-flow.
- **Database-alternatief** — In plaats van OData kun je ook een database-/Open SQL-schemagebruiker gebruiken voor een directe databaseverbinding.

> Officiële documentatie: [Consuming Data via the OData API](https://help.sap.com/docs/SAP_DATASPHERE/43509d67b8b84e66a30851e832f66911/7a453609c8694b029493e7d87e0de60a.html) · [Create OAuth2.0 Clients to Authenticate Against SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE/9f804b8efa8043539289f42f372c4862/3f92b46fe0314e8ba60720e409c219fc.html) · [Grant limited access to data with shared access signatures (SAS)](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview)

## Load-types

SAP Datasphere is via dit pad een **bestand-/opslagbron**: Yres leest de structuur uit de geëxporteerde bestanden in de container, niet uit een databasedictionary. Je voegt per bestand (of bestandspatroon) een tabel toe en kiest daarbij het gewenste load-type, net als bij andere bronnen.

---

**Zie ook:** [SAP Business Data Cloud](sap-bdc.md) (het SAP_BDC-formulier) · [SAP HANA](sap-hana.md) · [Azure Blob Storage](azure-blob-storage.md) · [Azure Data Lake](azure-data-lake.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
