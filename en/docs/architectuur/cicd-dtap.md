---
sidebar_position: 3
title: CI/CD & DTAP
description: How Yres rolls out code and data structures across DTAP — DACPAC deployment, adf_publish, and the release/install flow driven from the change on the Changes screen.
---

# CI/CD & DTAP

Yres consists of **two repositories with two very different deployment models**, both of which are promoted across **DTAP** (Development → Test → Acceptance → Production):

- **The data warehouse** (`IRIS_DWH`, Azure SQL) is rolled out with **SSDT/DACPAC** (a schema comparison that creates and alters objects).
- **The ADF factory** is rolled out via a **Git-integrated publish** to the `adf_publish` branch and from there to the target factory.

On top of that, Yres promotes not only *code* but also *structural changes* between already-running environments via the runtime change management in the `Change` schema — you drive this **from the change** on the **Changes** screen (release and install are actions on the change itself, not separate screens).

:::tip Architecture overview first
This page assumes familiarity with [Architecture (high-level)](./overzicht.md) and [Azure architecture](./azure-architectuur.md). For the corresponding screens in the web app, see [Projects & Changes](../frontend/projecten-changes.md).
:::

## The two deployment tracks in brief

| Track | Repo | Artifact | How it is rolled out |
|---|---|---|---|
| **Data warehouse** | `DWH/IRIS_DWH` | `master.dacpac` | SqlPackage / Azure DevOps publishes the DACPAC to the target Azure SQL database |
| **ADF factory** | `adf-iris-dev-…` | `adf_publish` branch (ARM template) | The `publish-datafactory` pipeline deploys the ARM template to the target factory |

The two tracks are rolled out separately, but for a single coherent change they belong together — see [Cross-repo ordering](#cross-repo-ordering).

---

## DWH deployment — SSDT / DACPAC

The data warehouse is a **Visual Studio SQL Database Project** (`IRIS_DWH.sqlproj`) that compiles to **`master.dacpac`**. On deployment, the DACPAC compares the project against the target database and creates/alters objects so that they match.

Alongside the schema comparison, two scripts run to handle things a plain diff cannot:

### PreDeploymentScript.sql — version-gated migrations

`PreDeploymentScript.sql` runs **before** the schema comparison and handles drops, renames, and data fixes that a diff cannot safely infer. It is **version-gated** with a `GOTO` label pattern:

```sql
IF @CURRENT_VERSION_INT <= NNNNN GOTO UPGRADE_NNNNN
```

- The database version lives in `Config.Settings` (the setting is named `IRIS_VERSION`, on newer builds `YRES_VERSION`).
- Upgrades are supported **from roughly v1.50 onward**; the current target is around v1.56. Very old databases must therefore be upgraded step by step before they reach the latest version.

:::note Yres versions sort as decimal fractions
Yres versions order as decimal fractions, not as semver: **1.9 comes after 1.56**. Keep this in mind when judging whether a database already has the target version.
:::

### Script.PostDeployment.sql — idempotent seed

`Script.PostDeployment.sql` runs **after** the schema comparison and idempotently seeds the baseline content:

- `Config.Settings` (the settings roster),
- `SourceType` and the default `TypeMapping` rows,
- the baseline security.

This script is version-gated too, so that seed blocks run exactly once per version. Because it is idempotent, it is safe to re-run on every deployment.

### Schema compare

For manual comparison against a specific database, `*.scmp` profiles (Schema Compare) exist. You use these for diagnostics and drift detection, not for the automated rollout.

---

## ADF deployment — Git-integrated publish

The ADF factory is Git-integrated. Pipeline JSON is edited on the **collaboration branch `main`**; publishing generates the **`adf_publish` branch** with the ARM template (`ARMTemplateForFactory.json`).

The publish configuration (`publish_config.json`) is:

```json
{ "publishBranch": "adf_publish", "includeGlobalParamsTemplate": true, "enableGitComment": true }
```

### The publish-datafactory pipeline (Azure DevOps)

The CI/CD pipeline `publish-datafactory.yml` rolls out the factory. The typical flow:

1. **`BuildADFTask`** validates the pipeline JSON.
2. **`PublishADFTask`** deploys the ARM template to the target factory.

Key settings of this pipeline:

| Setting | Value | Effect |
|---|---|---|
| `DeleteNotInSource` | `true` | Objects removed from the code are also removed from the factory. |
| `FilterText` | `-trigger.*, -integrationRuntime.*` | **Triggers and the Integration Runtime are NOT deployed by the pipeline.** |
| `IgnoreLackOfReferencedObject` | `true` | Missing references do not block the deployment. |
| `StopStartTriggers` | `false` | The pipeline does not stop/start triggers during the deploy. |

:::warning Triggers and Integration Runtime are outside the automated publish
Triggers (`-trigger.*`) and the Integration Runtime (`-integrationRuntime.*`) are **excluded** from the automated publish and are managed manually. This is prone to drift between environments — check them separately when you provision a new environment or migrate one.
:::

### Environment overrides

The pipelines themselves are environment-agnostic: connection strings and secrets are resolved at runtime from the Key Vault of the relevant environment. Per environment, only a handful of properties are patched via `deployment/config-{dev,test,prod}.csv`. Each line is `type,name,path,value` and today overrides the **Key Vault base URL** on the `keyvault` linked service and the global parameter `keyVaultBaseUrl`, for example:

- dev → `https://kv-iris-dev-….vault.azure.net/`
- test → `https://kv-iris-test-….vault.azure.net/`
- prod → `https://kv-iris-prod-….vault.azure.net/`

The factory uses a **system-assigned managed identity** that has `get` permissions on the environment's Key Vault.

:::info To be confirmed
The Key Vault resources are still named `kv-iris-…` in the code (IRIS branding). The exact Key Vault URLs per customer are set at provisioning time; the values shown here are examples from the repo, not customer truth.
:::

---

## DTAP at the data level — runtime change management

Besides rolling out *code*, Yres also promotes *structural and content changes* between already-running environments. This goes through the **`Change` schema** — which you drive **from the change** on the **Changes** screen in the web app. There are no separate Release or Install screens anymore: you pick a project + change on the Changes screen, and the change's actions are **contextual to its status** (an open change shows **Release**; a released change shows **Import** and **Install** with the environment hop).

The path is always **Changes → Release → Install**:

![Screenshot of the Yres change detail view, showing the DTAP flow strip, the released status badge, the change content, the environment hop, and the inline Import change and Install change buttons](/img/screens/changes-release-install.png)

*The change detail view on the Changes screen shows the change's status and — once it is released — the environment hop (from dev to the next environment) and the two inline actions: Import change (DWH only) and Install change (DWH + ADF). Everything happens from the change itself, not on a separate screen.*

1. **DTAP flow** — a change moves through Change (dev) → Release → Import → Install → `publish-datafactory`.
2. **Status-contextual actions** — the actions appear on the change itself based on its status: an **open** change shows **Release**; only a change with status `released` shows **Import** and **Install**. (Reimport / reinstall are available the same way on an already-installed change.)
3. **Environment hop** — choose from which environment to which next environment you publish (the dropdown links each environment to the immediately following one).
4. **Import change** — copies the change JSON and runs `spImport` in the target environment. This touches **the DWH only** and does **not** publish the ADF factory.
5. **Install change** — both imports and installs, and then publishes ADF (see below).
6. **Progress** — on Install, `publish-datafactory` runs in Azure DevOps; the web app shows a progress notification because the publish is asynchronous.

### Changes → Release → Install — step by step

1. **Edit in dev and bundle under a Change.** Every data-plane edit (new tables, scripted objects) is recorded in `Change.ChangeContent` under a **Change**, which belongs to a **Project**. Scripted/custom objects are added to the change from the **Object Explorer** (the object tree under Data Engineering).
2. **Release the change** — from the open change, **Release** runs `[Change].[spRelease]`, which validates the dependencies and locks the change (no further edits). Yres blocks releasing if the change contains content that another, not-yet-released change depends on; the error message names that dependent change(s).
3. **Import to the next environment** — the **Import** action on the released change runs `[Change].[spImport]`, which imports the released change (as JSON) into the target environment. This is a **DWH-only** step.
4. **Install** — the **Install** action on the released change runs `[Change].[spInstall]`, which applies the change (`@Execute`: `1` = execute, `0` = print SQL, `2` = impact analysis). The ADF pipeline **`InstallChange`** is the automation entry point.

**Install does three things in sequence:**

1. **Import** — runs `spImport` (the change JSON is pulled into the target environment).
2. **Install** — runs the **`InstallChange`** ADF pipeline if it exists (otherwise the DWH procedure `InstallProcedure`).
3. **Publish ADF** — starts the Azure DevOps pipeline **`publish-datafactory`** with `{ environment: <targettype> }`, so that the new data-source pipelines land in the target factory.

That makes **Install** the step that synchronizes both DWH and ADF; **Import** touches the DWH only.

:::warning Versions must match
Before an install, Yres checks that the DWH versions of the source and target environments are equal (`throwErrorIfDwhVersionDontMatch`). If they do not match, the message *"Environment versions do not match, please update"* appears and nothing is installed. Update the lagging environment first.
:::

:::note Changes require multiple environments
Projects and Changes are **not available for organizations with a single environment** (`maintainProject`/`maintainChange` explicitly refuse this). For single-environment organizations, the table wizard automatically uses `ChangeId 1` and there is no release/install step. See [Projects & Changes](../frontend/projecten-changes.md).
:::

**Change deployment rules** translate object names between environments, for example `ERP_DEV.Product` → `ERP_TST.Product` → `ERP.Product`, so that the same change targets the correct physical objects in each environment.

---

## Cross-repo ordering

If a change touches **both repos** — for example a new connector type that needs both a new ADF pipeline and new SQL metadata/procedures — roll out **the DWH first** and ADF afterwards:

1. **DWH first** — so that the procedures and views the pipeline calls already exist.
2. **ADF afterwards** — the pipeline can now safely reference those DWH objects.

For a new *source instance* of an existing type, no code change is usually needed: those are metadata rows (`SourceSystems` + `UsedTables`), created via the web app (`spMaintainSource` / `spMaintainTable`). The [Install flow](#dtap-at-the-data-level--runtime-change-management) above then handles promotion between environments.

## Further reading

- [Projects & Changes](../frontend/projecten-changes.md) — the screens that drive this flow
- [Azure architecture](./azure-architectuur.md) — Azure DevOps, Key Vault, and the managed identities
- [Installation](../setup/installatie.md) — provisioning an environment for the first time
