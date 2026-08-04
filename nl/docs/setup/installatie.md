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
3. **Waarden aanleveren** aan Yres/Plainwater, die op basis daarvan je organisatie en omgevingen aanmaakt en de resources uitrolt.

:::info Wat doe je zelf, wat doet Yres
Stappen 1 en 2 (App Registration en Azure-rechten) bereid je als klant zelf voor. De waarden die daaruit komen lever je aan; het daadwerkelijk aanmaken van je organisatie en het uitrollen van de resources gebeurt aan de Yres-/Plainwater-kant (stap 3).
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
Het aantal omgevingen dat je mag uitrollen is licentie-gebonden. **Essentials** ondersteunt **één omgeving** (`dev`); **Advanced** twee; **Ultimate** maximaal **zes** (afgedwongen door de webapp). Voor een DTAP-straat (dev → test → prod) heb je dus minimaal Advanced of hoger nodig. Zie [Prijzen](../prijzen.md) voor de exacte tiers.
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

## 3. Uitrol door Yres

Yres/Plainwater maakt op basis van de aangeleverde waarden je organisatie en omgevingen aan (dit gebeurt aan de Yres-kant). Je hoeft hiervoor zelf niets in te richten; je levert alleen de gegevens uit stap 1 en 2 aan.

Wat je aanlevert:

- De **Azure-waarden** uit de voorbereiding (stap 1): Directory (Tenant) ID, Object ID van de Managed Application, Application (client) ID en de client secret.
- De **abonnement(en)** en **resource groups** uit stap 2, met de App Registration als **Owner**. Bij meerdere abonnementen lever je per omgeving het subscription-ID aan; bij één abonnement wordt dat van `dev` voor de overige omgevingen gebruikt.
- De gewenste **organisatienaam** (minimaal 2 tekens, alleen letters en spaties) en de **omgevingen** die je wilt (minimaal `dev` en `prod`, afhankelijk van je licentie eventueel `test`, `acceptance`, `quality` ertussen).

:::tip Resourcenamen — stem de naamgeving af
Heb je de resource groups in stap 2 al zelf aangemaakt? Geef dan de exacte namen door, zodat de uitrol hiermee **matcht**. In de naamgeving wordt de **`$`** vervangen door de omgevingsnaam: een keyvault `company-keyvault-$` wordt in prod bijvoorbeeld `company-keyvault-prod`. Zonder omgeving in de naam ontstaan conflicten (automatisch opgelost met een postfix, maar slechter herkenbaar).
:::

:::note Uitrol kost tijd
Een nieuwe organisatie aanmaken kan even duren — de Azure-resources worden daadwerkelijk geprovisioneerd. Een typische installatie duurt in de orde van **~20 minuten**.
:::

## Wat is er na de installatie aangemaakt?

Na een geslaagde uitrol heeft elke omgeving zijn eigen data-plane in je Azure-tenant:

- één **Azure Data Factory** (de orchestratie + Copy-activiteiten);
- één **Azure SQL-database `IRIS_DWH`** (het warehouse + de laadengine);
- een **Azure Key Vault** voor alle bron-credentials;
- optioneel een **Azure Data Lake (Gen2)** voor Parquet;
- de Azure DevOps-koppeling voor DACPAC-deploys en `publish-datafactory`.

Volgende stap: koppel je eerste bron. Zie [Databron koppelen](databron-koppelen.md) en [Aan de slag](aan-de-slag.md).
