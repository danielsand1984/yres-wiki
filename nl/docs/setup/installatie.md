---
sidebar_position: 1
title: Installatie
description: Yres installeren in een Azure-tenant — van App Registration tot de eerste organisatie.
---

# Installatie

Yres draait volledig in **jouw eigen Azure-tenant**. Een installatie bestaat uit een set Azure-resources (Data Factory, Azure SQL `IRIS_DWH`, Key Vault, optioneel Data Lake) die Yres tijdens het aanmaken van een organisatie volgens de Yres-templates aanmaakt en configureert. Om dat te kunnen doen heeft Yres toegang tot je Azure-abonnement nodig via een **App Registration** met de juiste rollen en API-permissies.

De installatie verloopt in drie stappen, in deze volgorde:

1. **App Registration** aanmaken in Microsoft Entra (de identiteit waarmee Yres jouw Azure beheert).
2. **Abonnement(en) en resource groups** klaarzetten en de app als **Owner** toewijzen.
3. **Organisatie aanmaken** in de Yres-webapp (SuperAdmin), waarmee de resources daadwerkelijk worden uitgerold.

:::info Wie voert de installatie uit
Het aanmaken van een organisatie gebeurt in het **SuperAdmin-paneel** van de Yres-webapp. Dat is voorbehouden aan de Yres-/Plainwater-beheerder. Stappen 1 en 2 (App Registration en Azure-rechten) bereid je als klant zelf voor; de waarden die daaruit komen lever je aan voor stap 3.
:::

## 1. Voorbereiding — App Registration

1. Maak in **Microsoft Entra** een nieuwe **App Registration** (bv. `Yres-dataplatform-user`). Account type: **Single tenant**; redirect-URI leeg laten. Klik **Register**.
2. Open de app → **API permissions** → **Add a permission** en voeg toe:
   - **Azure Service Management** → gedelegeerde permissie **user_impersonation** — laat Yres het Azure-abonnement, de resource groups en de resources beheren.
   - **Microsoft Graph** → gedelegeerde permissie **User.Read** — voor het uitlezen van het ingelogde gebruikersprofiel.
   - **Azure Key Vault** — voor het wegschrijven en uitlezen van bron-credentials in de Key Vault.
   - **Azure DevOps** — voor de Git-/CI/CD-koppeling (DACPAC-deploy + `publish-datafactory`).
3. Ga naar **Certificates & secrets** → **New client secret** (bv. naam `WebApp`), geldigheid max. **24 maanden** (advies: 24). **Kopieer de secret-waarde direct** — die is later niet meer zichtbaar.
4. Verzamel deze vier waarden (op **Overview** en bij de Managed Application):
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Object ID** van de **Managed Application** _(let op: niet de Object ID van het eerste Overview-scherm, maar die van de Enterprise/Managed Application)_
   - **Client secret** (de waarde uit stap 3)

:::danger Bewaar veilig
Client secret, client ID, tenant ID en object ID heb je bij stap 3 nodig. Bewaar ze in een secure store; de client secret kun je na het aanmaken niet meer terugzien.
:::

## 2. Abonnementen & resource groups

Beantwoord vooraf:

1. **Hoeveel omgevingen?** De eerste omgeving is altijd **`dev`**; `prod` is verplicht voor productie. Daartussen zijn `test`, `acceptance` (acc) en `quality` mogelijk.
2. **Eén abonnement, één per omgeving, of gemengd?**
3. **Eén resource group, één per omgeving, of gemengd?**

:::info Aantal omgevingen hangt af van je licentie
Het aantal omgevingen dat je mag uitrollen is licentie-gebonden. **Essentials** ondersteunt **één omgeving** (`dev`); **Advanced** twee; **Ultimate** onbeperkt. Voor een DTAP-straat (dev → test → prod) heb je dus minimaal Advanced of hoger nodig. Zie [Prijzen](../prijzen.md) voor de exacte tiers.
:::

**Advies:** 2–4 omgevingen, elke omgeving een eigen resource group, in één abonnement (of elk een eigen abonnement).

Werk daarna de volgende punten af:

- Maak indien nodig het abonnement of de abonnementen aan en controleer de **resource providers** (`Microsoft.DataFactory`, `Microsoft.KeyVault`, `Microsoft.Sql`, `Microsoft.Storage`). Zie [troubleshooting → deployment rights](../troubleshooting.md).
- Heb je **dedicated abonnementen** en voeg je de app als **Owner** op het abonnement toe? Dan maakt Yres de resource groups voor je — sla de volgende stap over.
- Anders: maak de **resource groups** zelf aan. Gebruik **`dev`** en **`prod`** verplicht in de naam; overige namen vrij (advies: `test`, `acc`, `quality`, `prod`).
- Voeg de App Registration toe als **Owner** op elke resource group: **Access control (IAM)** → **Add role assignment** → **Privileged administrator roles** → **Owner** → je app selecteren → **Review + assign**.

:::warning Owner is vereist (niet Contributor)
De App Registration heeft **Owner**-rechten nodig, niet alleen Contributor. Yres moet tijdens de installatie namelijk **rollen toewijzen aan de managed identities** van de aangemaakte resources (bv. de Data Factory die de Key Vault en de SQL-database mag benaderen). Alleen een Owner mag roltoewijzingen maken. Verleen Owner op **resource-group-niveau** (aanbevolen) of op **subscription-niveau**.
:::

## 3. Installatie in de webapp

Met de waarden uit stap 1 en de rechten uit stap 2 maak je in de Yres-webapp een nieuwe organisatie aan. Dat gebeurt in het **SuperAdmin-paneel**.

### 3.1 SuperAdmin — Organisaties

Open het SuperAdmin-paneel. Het **Organisaties**-overzicht toont alle bestaande organisaties (naam, aanmaakdatum, of ze gepubliceerd zijn, en de infrastructuur). Hiervandaan start je een nieuwe installatie met **Add organization**.

![SuperAdmin-overzicht met links de Organisaties-tabel (naam, aangemaakt, gepubliceerd, infrastructuur) met een Add-organization-knop, en rechts de Gebruikers-tabel met rolbadge en SSO-status.](/img/screens/superadmin-organizations.svg)

Het SuperAdmin-overzicht: organisaties beheren en een nieuwe organisatie starten.

1. **Organisaties-tabel** — naam, aanmaakdatum, gepubliceerd-status en infrastructuur per organisatie.
2. **Add organization** — opent de aanmaakwizard (zie hieronder).
3. **Verwijderen** — een organisatie kun je hier verwijderen (bevestigingsmodal).
4. **Gebruikers-tabel** — gebruikers per organisatie met rolbadge en of SSO aanstaat.

### 3.2 Organisatie aanmaken (wizard)

Klik op **Add organization**. De aanmaakwizard leidt je in stappen langs alle gegevens die nodig zijn om de tenant uit te rollen.

![Aanmaakwizard voor een nieuwe organisatie met bovenaan een stappenbalk en per stap een formulier: organisatie en project, plan en versie, omgevingen, database, resourcenamen, en de Azure-app met permissies.](/img/screens/superadmin-create-organization.svg)

De aanmaakwizard voor een nieuwe organisatie, met de stappenbalk en de Azure-stappen onderaan.

1. **Stappenbalk** — toont de voortgang door de wizard.
2. **Organisatie en project** — organisatienaam en het eerste project.
3. **Plan en versie** — de licentie (plan) en de Yres-versie die wordt uitgerold.
4. **Omgevingen** — `dev` en `prod` verplicht; maximaal 6 omgevingen.
5. **Resourcenamen** — de naamgeving met de `$`-conventie voor de omgeving.
6. **Azure-app + permissies** — de App-Registration-waarden en de roltoewijzingen op de resource groups.

Doorloop de wizard als volgt:

1. **Organisatie en project** — vul de **organisatienaam** in: minimaal 2 tekens, alleen letters en spaties (`/^[a-zA-Z ]*$/`). Geef ook het eerste project op.
2. **Plan en versie** — kies de **licentie (plan)** en de **Yres-versie** die wordt uitgerold.
3. **Omgevingen** — minimaal **`dev`** en **`prod`** (afhankelijk van de licentie kunnen er omgevingen tussen, bv. `test`, `acceptance`). Maximaal 6 omgevingen.
4. **Resourcenamen** — volledig of semi-gegenereerd:
   - *Volledig*: namen volgens de Microsoft naming convention; bij een conflict wordt een unieke postfix toegevoegd.
   - *Semi*: gebruik altijd de **`$`** in de naam (die wordt vervangen door de omgevingsnaam). Bv. een keyvault in de dev-resourcegroup = `company-keyvault-$`, in prod wordt dat `company-keyvault-prod`. Zonder omgeving in de naam ontstaan conflicten (automatisch opgelost met een postfix, maar slechter herkenbaar).
   - Heb je de resource groups in stap 2 al zelf aangemaakt? Zorg dan dat de namen hiermee **matchen**.
5. **Custom database** — eventuele database-specifieke instellingen voor `IRIS_DWH`.
6. **Azure-waarden invullen** (uit de voorbereiding in stap 1):
   - Active Directory ID → **Directory (Tenant) ID**
   - Application Object ID → **Object ID** van de Managed Application
   - Client ID → **Application (client) ID**
   - Client secret → de **secret-waarde**
7. **Abonnementen** — kies **single** of **multiple**. Bij *multiple* vul je per omgeving het **subscription-ID** in; bij *single* wordt het abonnement van `dev` gekopieerd naar de overige omgevingen.
8. **Permissies controleren** — de laatste stap toont de resource groups en de roltoewijzingen. Controleer dat de App Registration overal **Owner** is.
9. Klik **Submit**. Een statusscherm toont de voortgang van de uitrol; daarna word je naar de deployments-pagina geleid.

:::note Uitrol kost tijd
Een nieuwe organisatie aanmaken kan even duren — de Azure-resources worden daadwerkelijk geprovisioneerd. Sommige frontend-onderdelen werken pas correct als die uitrol klaar is. Een typische installatie duurt in de orde van **~20 minuten**.
:::

## Wat is er na de installatie aangemaakt?

Na een geslaagde uitrol heeft elke omgeving zijn eigen data-plane in je Azure-tenant:

- één **Azure Data Factory** (de orchestratie + Copy-activiteiten);
- één **Azure SQL-database `IRIS_DWH`** (het warehouse + de laadengine);
- een **Azure Key Vault** voor alle bron-credentials;
- optioneel een **Azure Data Lake (Gen2)** voor Parquet;
- de Azure DevOps-koppeling voor DACPAC-deploys en `publish-datafactory`.

Volgende stap: koppel je eerste bron. Zie [Databron koppelen](databron-koppelen.md) en [Aan de slag](aan-de-slag.md).
