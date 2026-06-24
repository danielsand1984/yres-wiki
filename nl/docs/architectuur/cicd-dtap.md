---
sidebar_position: 3
title: CI/CD & DTAP
description: Hoe Yres code en datastructuren uitrolt over DTAP — DACPAC-deployment, adf_publish, en de flow Changes › Release › Install.
---

# CI/CD & DTAP

Yres bestaat uit **twee repositories met twee heel verschillende deploymentmodellen**, die allebei worden gepromoot over **DTAP** (Development → Test → Acceptance → Production):

- **Het datawarehouse** (`IRIS_DWH`, Azure SQL) wordt uitgerold met **SSDT/DACPAC** (een schema-vergelijking die objecten aanmaakt en aanpast).
- **De ADF-factory** wordt uitgerold via een **Git-geïntegreerde publish** naar de `adf_publish`-branch en daarna naar de doelfactory.

Daarbovenop promoot Yres niet alleen *code*, maar ook *structuurwijzigingen* tussen al draaiende omgevingen via het runtime-changemanagement in het `Change`-schema — dit is wat de schermen **Changes › Release › Install** aansturen.

:::tip Eerst de architectuur op hoofdlijnen
Deze pagina veronderstelt kennis van [Architectuur (high-level)](./overzicht.md) en [Azure-architectuur](./azure-architectuur.md). Voor de bijbehorende schermen in de webapp, zie [Projecten & Changes](../frontend/projecten-changes.md).
:::

## Twee deploymentsporen in het kort

| Spoor | Repo | Artefact | Hoe het wordt uitgerold |
|---|---|---|---|
| **Datawarehouse** | `DWH/IRIS_DWH` | `master.dacpac` | SqlPackage / Azure DevOps publiceert de DACPAC naar de doel-Azure-SQL-database |
| **ADF-factory** | `adf-iris-dev-…` | `adf_publish`-branch (ARM-template) | `publish-datafactory`-pipeline deployt de ARM-template naar de doelfactory |

De twee sporen worden los uitgerold, maar voor één samenhangende wijziging hangen ze samen — zie [Cross-repo volgorde](#cross-repo-volgorde).

---

## DWH-deployment — SSDT / DACPAC

Het datawarehouse is een **Visual Studio SQL Database Project** (`IRIS_DWH.sqlproj`) dat compileert tot **`master.dacpac`**. Bij deployment vergelijkt de DACPAC het project met de doeldatabase en maakt/wijzigt objecten zodat ze overeenkomen.

Naast de schema-vergelijking draaien twee scripts die een gewone diff niet aankan:

### PreDeploymentScript.sql — versie-gated migraties

`PreDeploymentScript.sql` draait **vóór** de schema-vergelijking en behandelt drops, hernoemingen en datafixes die een diff niet veilig kan afleiden. Het is **versie-gated** met een `GOTO`-labelpatroon:

```sql
IF @CURRENT_VERSION_INT <= NNNNN GOTO UPGRADE_NNNNN
```

- De databaseversie staat in `Config.Settings` (de instelling heet `IRIS_VERSION`, op nieuwere builds `YRES_VERSION`).
- Upgrades worden ondersteund **vanaf ongeveer v1.50**; het huidige doel ligt rond v1.56. Erg oude databases moeten dus stapsgewijs worden opgehoogd voordat ze de laatste versie halen.

:::note Yres-versies sorteren als decimale breuken
Yres-versies ordenen als decimale breuken, niet als semver: **1.9 staat ná 1.56**. Houd hier rekening mee bij het inschatten of een database de doelversie al heeft.
:::

### Script.PostDeployment.sql — idempotente seed

`Script.PostDeployment.sql` draait **ná** de schema-vergelijking en zaait idempotent de basisinhoud:

- `Config.Settings` (de instellingenroster),
- `SourceType` en de standaard `TypeMapping`-rijen,
- de baseline-security.

Ook dit script is versie-gated, zodat seed-blokken per versie precies één keer draaien. Omdat het idempotent is, is het veilig om bij elke deployment opnieuw te draaien.

### Schema compare

Voor handmatig vergelijken tegen een specifieke database bestaan `*.scmp`-profielen (Schema Compare). Die gebruik je voor diagnose en drift-detectie, niet voor de geautomatiseerde uitrol.

---

## ADF-deployment — Git-geïntegreerde publish

De ADF-factory is Git-geïntegreerd. Pipeline-JSON wordt bewerkt op de **collaboration-branch `main`**; publiceren genereert de **`adf_publish`-branch** met de ARM-template (`ARMTemplateForFactory.json`).

De publish-configuratie (`publish_config.json`) is:

```json
{ "publishBranch": "adf_publish", "includeGlobalParamsTemplate": true, "enableGitComment": true }
```

### De publish-datafactory-pipeline (Azure DevOps)

De CI/CD-pipeline `publish-datafactory.yml` rolt de factory uit. De typische flow:

1. **`BuildADFTask`** valideert de pipeline-JSON.
2. **`PublishADFTask`** deployt de ARM-template naar de doelfactory.

Belangrijke instellingen van deze pipeline:

| Instelling | Waarde | Effect |
|---|---|---|
| `DeleteNotInSource` | `true` | Objecten die uit de code zijn verwijderd, worden ook uit de factory verwijderd. |
| `FilterText` | `-trigger.*, -integrationRuntime.*` | **Triggers en de Integration Runtime worden NIET door de pipeline gedeployd.** |
| `IgnoreLackOfReferencedObject` | `true` | Ontbrekende referenties blokkeren de deployment niet. |
| `StopStartTriggers` | `false` | De pipeline stopt/start geen triggers tijdens de deploy. |

:::warning Triggers en Integration Runtime staan buiten de automatische publish
Triggers (`-trigger.*`) en de Integration Runtime (`-integrationRuntime.*`) worden **uitgesloten** van de geautomatiseerde publish en worden handmatig beheerd. Dat is gevoelig voor drift tussen omgevingen — controleer ze los wanneer je een nieuwe omgeving inricht of een omgeving migreert.
:::

### Omgevingsoverrides

De pipelines zelf zijn omgevings-agnostisch: connection strings en secrets worden op runtime opgelost uit de Key Vault van de betreffende omgeving. Per omgeving wordt alleen een handvol properties gepatcht via `deployment/config-{dev,test,prod}.csv`. Elke regel is `type,name,path,value` en overschrijft vandaag de **Key Vault base URL** op de `keyvault`-linked-service en de globale parameter `keyVaultBaseUrl`, bijvoorbeeld:

- dev → `https://kv-iris-dev-….vault.azure.net/`
- test → `https://kv-iris-test-….vault.azure.net/`
- prod → `https://kv-iris-prod-….vault.azure.net/`

De factory gebruikt een **system-assigned managed identity** die `get`-rechten heeft op de Key Vault van de omgeving.

:::info Te bevestigen
De Key Vault-resources heten in de code nog `kv-iris-…` (IRIS-branding). De exacte Key Vault-URL's per klant worden bij provisioning gezet; de hier getoonde waarden zijn voorbeelden uit de repo, geen klant-truth.
:::

---

## DTAP op datniveau — runtime-changemanagement

Naast het uitrollen van *code* promoot Yres ook *structuur- en inhoudswijzigingen* tussen al draaiende omgevingen. Dat loopt via het **`Change`-schema** — precies wat de schermen **Changes / Release / Install** in de webapp aansturen.

Het pad is altijd **Changes → Release → Install**:

![Wireframe van het Yres-scherm voor het installeren van een released change, met de DTAP-flowstrip, de lijst met released changes, de omgeving-hop en de knoppen Import change en Install change](/img/screens/changes-release-install.svg)

*Het Install-scherm laat de released changes zien, de omgeving-hop (van dev naar de volgende omgeving) en de twee acties: Import change (alleen DWH) en Install change (DWH + ADF).*

1. **DTAP-flow** — een wijziging doorloopt Change (dev) → Release → Import → Install → `publish-datafactory`.
2. **Released changes** — alleen changes met status `released` zijn beschikbaar om te installeren; open changes verschijnen hier niet.
3. **Omgeving-hop** — kies van welke omgeving naar welke volgende omgeving je publiceert (de keuzelijst koppelt elke omgeving aan de eerstvolgende).
4. **Import change** — kopieert de change-JSON en draait `spImport` in de doelomgeving. Dit raakt **alleen het DWH** en publiceert de ADF-factory **niet**.
5. **Install change** — importeert én installeert, en publiceert daarna ADF (zie hieronder).
6. **Voortgang** — bij Install draait `publish-datafactory` in Azure DevOps; de webapp toont een voortgangsmelding omdat de publish asynchroon is.

### Changes → Release → Install — stap voor stap

1. **Bewerk in dev en bundel onder een Change.** Elke data-plane-bewerking (nieuwe tabellen, scripted objects) wordt vastgelegd in `Change.ChangeContent` onder een **Change**, die hoort bij een **Project**.
2. **Release de change** — `[Change].[spRelease]` valideert de afhankelijkheden en vergrendelt de change (geen verdere bewerkingen). Yres blokkeert het releasen als de change content bevat waar een andere, nog niet-released change van afhankelijk is; de foutmelding noemt die afhankelijke change(s).
3. **Importeer naar de volgende omgeving** — `[Change].[spImport]` importeert de released change (als JSON) in de doelomgeving. Dit is een **DWH-only** stap.
4. **Installeer** — `[Change].[spInstall]` past de change toe (`@Execute`: `1` = uitvoeren, `0` = SQL printen, `2` = impactanalyse). De ADF-pipeline **`InstallChange`** is het automatiseringsingangspunt.

**Install doet drie dingen achter elkaar:**

1. **Import** — draait `spImport` (de change-JSON wordt in de doelomgeving binnengehaald).
2. **Install** — draait de **`InstallChange`** ADF-pipeline als die bestaat (anders de DWH-procedure `InstallProcedure`).
3. **Publish ADF** — start de Azure DevOps-pipeline **`publish-datafactory`** met `{ environment: <doeltype> }`, zodat de nieuwe data-source-pipelines in de doelfactory landen.

Daarmee is **Install** de stap die DWH én ADF synchroniseert; **Import** raakt alleen het DWH.

:::warning Versies moeten overeenkomen
Vóór een install controleert Yres of de DWH-versies van bron- en doelomgeving gelijk zijn (`throwErrorIfDwhVersionDontMatch`). Komen ze niet overeen, dan volgt de melding *"Environment versions do not match, please update"* en wordt er niet geïnstalleerd. Werk eerst de achterlopende omgeving bij.
:::

:::note Changes vereisen meerdere omgevingen
Projecten en Changes zijn **niet beschikbaar voor organisaties met één omgeving** (`maintainProject`/`maintainChange` weigeren dit expliciet). Voor single-environment-organisaties gebruikt de tabel-wizard automatisch `ChangeId 1` en is er geen release/install-stap. Zie [Projecten & Changes](../frontend/projecten-changes.md).
:::

**Change deployment rules** vertalen objectnamen tussen omgevingen, bijvoorbeeld `ERP_DEV.Product` → `ERP_TST.Product` → `ERP.Product`, zodat dezelfde change in elke omgeving de juiste fysieke objecten raakt.

---

## Cross-repo volgorde

Als een wijziging **beide repo's** raakt — bijvoorbeeld een nieuw connectortype dat zowel een nieuwe ADF-pipeline als nieuwe SQL-metadata/procedures nodig heeft — rol dan **eerst het DWH** uit en daarna ADF:

1. **DWH eerst** — zodat de procedures en views die de pipeline aanroept al bestaan.
2. **ADF daarna** — de pipeline kan nu veilig naar die DWH-objecten verwijzen.

Voor een nieuwe *broninstantie* van een bestaand type is meestal **geen** codewijziging nodig: dat zijn metadata-rijen (`SourceSystems` + `UsedTables`), aangemaakt via de webapp (`spMaintainSource` / `spMaintainTable`). De [Install-flow](#dtap-op-datniveau--runtime-changemanagement) hierboven verzorgt dan de promotie tussen omgevingen.

## Verder lezen

- [Projecten & Changes](../frontend/projecten-changes.md) — de schermen die deze flow aansturen
- [Azure-architectuur](./azure-architectuur.md) — Azure DevOps, Key Vault en de managed identities
- [Installatie](../setup/installatie.md) — een omgeving voor het eerst inrichten
