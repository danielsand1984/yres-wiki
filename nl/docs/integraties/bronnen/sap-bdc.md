---
title: SAP Business Data Cloud
sidebar_label: SAP Business Data Cloud (SAP_BDC)
description: SAP Business Data Cloud (SAP_BDC) koppelen aan Yres — verbindingseisen.
---

# SAP Business Data Cloud (SAP_BDC)

**Categorie:** Azure-opslag (AzureBlobFS / SAS)  ·  🏅 Official partner

SAP Business Data Cloud levert data als **Parquet-bestanden** in een Azure Data Lake-container
(`dfs.core.windows.net`-endpoint). Yres leest die bestanden rechtstreeks uit de container met een
**SAS-token**. Het brontype **`SAP_BDC`** heeft in de wizard *Bron toevoegen* een **eigen formulier**
(`getFormAddSapBdc.ts`); het is de enige SAP-route met een eigen keuze in de bronpicker. Dezelfde
invoer gebruik je ook voor [SAP Datasphere](sap-datasphere.md).

## Verwachte input

Naast de gedeelde velden die voor elke bron gelden — **Bronnaam** (uniek, 2–45 tekens; wordt de naam van
de linked service en de basis voor de Key Vault-secrets `adf-{bronnaam}-…`), **type** (`SAP_BDC`),
**integration runtime**, *credentials voor alle omgevingen identiek?*, *vervaldatum credentials* en
*tags* — vraagt het SAP_BDC-formulier om drie velden:

| Veld (label) | Toelichting |
|---|---|
| **Sas uri** | De host-uri van het opslag-endpoint, in de vorm `https://<storage-account>.dfs.core.windows.net/`. Alleen `https://` + hostnaam, **zonder pad of querystring** en **mét afsluitende `/`** — het formulier keurt het adres anders af. |
| **container** | De container (het filesystem) in dat storage-account waarin SAP BDC de data neerzet. |
| **Sas token** | Het SAS-token, **zonder voorloop-`?`**. Het moet de parameters `sig`, `sp`, `se`, `spr` en `st` bevatten; ontbreekt er één, dan keurt het formulier het token af. |

:::tip Validatieregels in één oogopslag
- **Sas uri**: `https://`, alleen hostnaam, pad is precies `/`, geen `?…` en geen `#…`, eindigt op `/`.
- **Sas token**: begint niet met `?` en bevat `sig`, `sp`, `se`, `spr` en `st`.
:::

### Authenticatie

- **SAS-token (Shared Access Signature)** — geen gebruikersnaam/wachtwoord. De backend
  (`SapBusinessDataCloudSource`) maakt een linked service van het type **`AzureBlobFS`** aan waarvan de
  `sasUri` en het SAS-token uit de Key Vault komen.
- **Geheimen in Key Vault:** de frontend bewaart niets. De ingevoerde waarden gaan naar de **Azure Key
  Vault** van de klant als `adf-{bronnaam}-sas-uri`, `adf-{bronnaam}-sas-token` (met de opgegeven
  vervaldatum) en `adf-{bronnaam}-container` (gebruikt door de metadata-pipeline).

### Integration runtime

- **Cloud (`AutoResolveIntegrationRuntime`).** Het opslag-endpoint is publiek bereikbaar via HTTPS; de
  `AzureBlobFS`-linked service (template `SAP_BDC.json`) zet **geen `connectVia`** en draait dus altijd op
  de cloud-runtime. Een self-hosted integration runtime is hier niet van toepassing.

## Hoe Yres de data leest

- **Metadata** — de pipeline `GetMetaData - SAP_BDC` lijst de **mappen** in de container: elke map is
  één tabel. Per map leest Yres het metadatabestand **`.sap.partfile.metadata`** (JSON) dat SAP BDC
  naast de data neerzet en vult daarmee de kolommen in het woordenboek. De **container** wordt daarbij
  het schema van de tabellen; de mapnaam de tabelnaam.
- **Data** — de pipeline `Dynamic Pipeline YRES - SAP_BDC` leest alle **`*.parquet`**-bestanden
  (recursief) uit de map van de tabel naar `STAGE`; de merge naar `HIS` gebeurt daarna via
  `[LoadManagement].[spLoadDWH]`, net als bij elke andere bron.
- **Datatypen** — SAP_BDC gebruikt dezelfde typemapping als SQL Server (`MSSQL_ADF`), met één
  uitzondering: `timestamp` wordt als `bigint` geland.

## Load types en delta

SAP_BDC ondersteunt de standaard load types (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD,
ADDITIONAL). Voor incrementele loads geldt één vaste regel:

:::caution Vaste deltakolom: `ETL_DATE`
Bij SAP_BDC is de deltakolom **altijd `ETL_DATE`** — de laadstempel die SAP BDC in de bestanden meegeeft.
Kies je in de wizard *Add table* bij een `DELTA`-/`DELTAIMAGE`-load een andere kolom, dan negeert de engine
die met de waarschuwing *"Source … is a deltalake source. Delta's are always based on ETL_DATE, … will be
ignored as a delta column"* (`spMaintainTable`).
:::

De delta werkt anders dan bij databasebronnen: Yres bouwt geen `WHERE`-clausule, maar geeft het
**watermerk** (`LoadManagement.UsedTables.LatestRecord`, de hoogste `ETL_DATE` van de vorige load)
ongewijzigd door aan de pipeline. Die gebruikt het als **`modifiedDatetimeStart`**: alleen
Parquet-bestanden die sinds dat moment zijn gewijzigd of toegevoegd worden gelezen. Na een geslaagde load
schuift het watermerk op naar de hoogste `ETL_DATE` in de batch.

## Voorwaarden

1. Een **Azure Data Lake Gen2-container** (`dfs.core.windows.net`) waarin SAP BDC de data levert: per tabel
   één map met Parquet-bestanden en het bestand `.sap.partfile.metadata`. Je SAP-/BDC-beheerder richt
   deze levering in en geeft je de hostnaam en de containernaam.
2. Een geldig **SAS-token** met minimaal **lees- en lijstrechten** op de container (Azure Portal →
   storage-account → **Security + networking → Shared access signature**). Het token is het deel **ná**
   het `?`; kopieer het direct, want het wordt maar één keer getoond.
3. De **vervaldatum** van het SAS-token. Vul die ook in het wizard-veld *credentials expire?* in — zie
   hieronder.

:::warning Vervaldatum van het SAS-token
Een SAS-token heeft altijd een einddatum (`se`). Zodra die verstrijkt, mislukken de metadata-refresh én
de loads van deze bron. Vul de vervaldatum daarom in het wizard-veld **credentials expire?** in: Yres
bewaart die bij het Key Vault-secret en waarschuwt je tijdig voordat het token verloopt. Maak dan een
nieuw token aan en werk de bron bij.
:::

---

**Zie ook:** [SAP Datasphere](sap-datasphere.md) (zelfde formulier) · [SAP S/4HANA](sap-s4hana.md) · [SAP HANA](sap-hana.md) · [Azure Blob Storage](azure-blob-storage.md) · [Azure Data Lake](azure-data-lake.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
