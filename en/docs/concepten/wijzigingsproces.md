---
sidebar_position: 6
title: The change process (DTAP)
sidebar_label: Change process
description: How you, as a customer, safely change your data warehouse and promote changes from dev through test to production — the CI/CD and change process from your perspective.
---

# The change process (DTAP)

Your data warehouse never stands still: sources are added, tables change, you build new views. Yres lets
you make those changes **safely** — you test everything first in a separate environment and only promote
to production what is correct. This page describes that process **from your perspective as a customer**:
what you do yourself, and what Yres handles automatically for you.

> For the screens and buttons, see [Projects & Changes](../frontend/projecten-changes.md). For the
> technology underneath (DACPAC, ADF publish, Azure DevOps), see [CI/CD & DTAP](../architectuur/cicd-dtap.md).

## The idea: dev → test → prod

Yres sets up your environment using the **DTAP model**: separate environments that each have their own role.

| Environment | What for | Who works here |
|---|---|---|
| **Development (dev)** | Where you build and change. The first environment is always dev. | You / your data team |
| **Test (test)** | Where you verify a change is correct before production. | You / acceptance |
| **Production (prod)** | The stable environment your reports run on. | Nobody edits here directly |

The principle: **you only build in dev and you never edit production directly.** A change travels as a
single package, in a controlled way, from dev → test → prod, so your environments stay in sync and no
half-finished work ever ends up in production.

:::note One environment? Then there is no transport
If you have only **one environment**, this whole process is invisible: there is nothing to promote. Your
changes are applied directly and the *Projects* section does not appear. The rest of this page is about
organizations with **multiple** environments. See the [license tiers](../referentie/licentie-limieten.md)
for who gets how many environments.
:::

## The two units: Project and Change

You bundle all your work into two units, so it travels as a whole and stays traceable:

- A **Project** is a container with a name, description and due date — for example *"AFAS expansion Q3"*.
- A **Change** is the unit you actually release and promote. Every edit you make in dev — connecting a
  source, adding tables, persisting a view, adding a scripted object via the Object Explorer — is
  **automatically booked under a Change**. A Change always belongs to a Project.

So you don't have to track manually what changed: Yres collects it in the Change, and that Change is your
transport unit to test and prod.

## A change's journey — step by step

```
   DEV                         TEST                        PROD
 ┌───────────┐   release    ┌───────────┐   install      ┌───────────┐
 │  build    │ ───────────▶ │ validate  │ ─────────────▶ │  live     │
 │  (Change) │   (locked)   │           │                │           │
 └───────────┘              └───────────┘                └───────────┘
      1–3            4            5                6
```

You run this whole journey **from the change itself**: on the **Changes** screen you pick a project and a
change, and the buttons you see are **contextual to the status** of that change. An open change shows
**Release**; a released change shows **Import** and **Install** together with the environment hop. So you
don't go to separate release or install screens.

1. **Plan your work — create a Project.** Give it a name, description and due date. You collect your
   changes under this project.
2. **Build in dev.** Connect sources, add tables, create persisted views, and add scripted objects via the
   **Object Explorer** (the object tree under Data Engineering). Everything you do is recorded under your
   **Change**. You load and test freely here — this does not touch test or prod.
3. **Review and check the Change.** You see its content as a **diagram** (source → schema → table) or as
   a **table** (per object the load type, the delta column, and what happens if the object already
   exists). That way you know exactly what will travel.
4. **Release the Change.** On the open change you click **Release**. This **locks** the change: nothing can
   be edited anymore and it becomes a sealed, promotable package. Yres first checks the **dependencies** —
   if your change contains something that relies on another, not-yet-released change, Yres blocks the
   release and names that other change(s). This way you never accidentally take half-finished work along.
5. **Promote to test and validate.** On the released change you pick the environment hop **dev → test** and
   click **Install**. Yres brings your change to test and you verify there that the loads and structures are
   correct.
6. **Promote to production.** Correct in test? Then install the same change from **test → prod**. With
   that, your change is live — tested and confirmed.

![The change detail with inline Release / Import / Install: the DTAP flow strip, the change's status badge, the change content (diagram/table), the environment hop (from → to) and the Import change and Install change buttons.](/img/screens/changes-release-install.png)

*You release and promote a change from the change itself: on a released change you pick the environment hop
and click Import or Install. The progress appears as a notification, because publishing the pipelines
continues in the background.*

### Import vs. install

On a released change you have two actions — you carry out both **on the change itself**, with the
environment hop (from → to) next to them:

- **Import change** — brings the change into the **data warehouse** of the target environment only. The
  ADF pipelines are **not** refreshed. Useful when you just want to stage the DWH structure.
- **Install change** — does the full job: the change in the data warehouse **and** republishing the ADF
  pipelines, so your new source pipelines land in the target environment too. This is the step that brings
  DWH and ADF in sync.

In most cases you choose **Install change**. On an already-installed change you can reimport or reinstall
through the same buttons.

## What Yres handles automatically for you

The nice part: at steps 5 and 6 you don't have to do anything technical yourself. Behind a single button
Yres handles:

- **Rolling out the database structure** in the target environment (new/changed tables, views, procedures).
- **Republishing the ADF pipelines** so your source loads work in the target environment.
- **Translating names** between environments. A source called `ERP_DEV.Product` in dev becomes
  `ERP_TST.Product` in test and `ERP.Product` in prod — Yres automatically adapts the change to the right
  physical objects per environment (the *change deployment rules*).
- **Guarding versions** (see below).

> Under the hood this runs `[Change].[spRelease]`, `[Change].[spImport]` and `[Change].[spInstall]`, plus
> the Azure DevOps pipeline `publish-datafactory`. The full technology is in
> [CI/CD & DTAP](../architectuur/cicd-dtap.md).

## The guardrails — why this is safe

Yres builds in a number of checks so you can't break production:

- **Versions must match.** Before an install, Yres checks that the **DWH versions** of the source and
  target environment are equal. If not, you get *"Environment versions do not match, please update"* and
  nothing is installed — first update the lagging environment via
  [Update environments](../frontend/admin.md).
- **Dependencies are checked** when releasing: you cannot release a change that relies on work that has
  not yet been released.
- **A released change is locked** — nobody can quietly change anything after release.
- **You cannot delete a project** while it still contains open changes, and a change's due date must be on
  or before that of the project.
- **Nothing goes to prod untested**, because you always promote via test first.
- **Your history is preserved.** The load engine versions your data (SCD2), so a structural change does
  not throw away existing history. See [History & SCD2](./historie-scd2.md).

If something does go wrong, you can roll back a load or change — see [Rollback & reset](./rollback-reset.md).

## A real-world example

*Illustrative — a typical course of events, not a specific customer.*

Acme wants to unlock their AFAS administration:

1. A data engineer creates the project **"AFAS connection"** with a due date.
2. In **dev** she connects the AFAS source, refreshes the metadata and adds the desired tables — all
   booked under the change **"AFAS tables v1"**.
3. She runs the first loads in dev and checks the data.
4. She **reviews the change content** (is the load type per table correct?), and **releases** the change.
5. She **installs** the change from **dev → test**, runs the loads in test and has a colleague validate
   the reporting.
6. Approved? Then she **installs** the same change from **test → prod**. The AFAS data is live, and dev,
   test and prod are in sync again.

For a **new source of an existing type** (as above) there is usually **no** code change needed — these are
metadata rows that the install flow promotes neatly between your environments.

## Further reading

- [Projects & Changes](../frontend/projecten-changes.md) — the screens, buttons and fields
- [CI/CD & DTAP](../architectuur/cicd-dtap.md) — the technology: DACPAC, `adf_publish`, Azure DevOps
- [Rollback & reset](./rollback-reset.md) — roll back a change or load
- [Data flow](./gegevensstroom.md) and [History & SCD2](./historie-scd2.md) — what a load does to your data
