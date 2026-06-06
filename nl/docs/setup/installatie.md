---
sidebar_position: 1
title: Installatie
description: Yres installeren in een Azure-tenant — App Registration tot organisatie.
---

# Installatie

Yres bestaat uit een set Azure-resources en templates. Bij installatie worden die aangemaakt en geconfigureerd volgens de Yres-templates. Yres heeft toegang tot het Azure-abonnement nodig via een **App Registration** met de juiste rollen.

## 1. Voorbereiding — App Registration

1. Maak in **Microsoft Entra** een nieuwe **App Registration** (bv. `Yres-dataplatform-user`). Account type: **Single tenant**; redirect leeg laten. Klik **Register**.
2. Open de app → **API Permissions** → **Add permissions** en voeg toe:
   - **Azure Service Management** → permissie **User impersonation**
   - **Azure Key Vault**
   - **Azure DevOps**
3. Ga naar **Certificates & Secrets** → **New client secret** (bv. naam `WebApp`), geldigheid max. **24 maanden** (advies: 24). **Kopieer de secret-waarde direct** — die is later niet meer zichtbaar.
4. Verzamel op **Overview** + Managed Application:
   - **Application (client) ID**
   - **Directory (tenant) ID**
   - **Object ID** van de Managed Application _(let op: niet de Object ID van het eerste scherm)_

:::danger Bewaar veilig
Client secret, client ID, tenant ID en object ID heb je straks nodig bij de installatie. Bewaar ze in een secure store.
:::

## 2. Abonnementen & resource groups

Beantwoord vooraf:
1. Hoeveel omgevingen? (`dev`, `test`, `acceptance`, `quality`, `prod`)
2. Eén abonnement, één per omgeving, of gemengd?
3. Eén resource group, één per omgeving, of gemengd?

**Advies:** 2–3 omgevingen, elke omgeving een eigen resource group, in één abonnement (of elk een eigen abonnement).

- Maak indien nodig abonnement(en) aan en controleer de **resource providers** (zie [troubleshooting → deployment rights](../troubleshooting.md)).
- Heb je dedicated abonnementen en voeg je de app als **Owner** op het abonnement toe? Dan maakt Yres de resource groups voor je — sla de volgende stap over.
- Anders: maak resource groups. Gebruik **`dev`** en **`prod`** verplicht in de naam; overige vrij (advies: `test`, `acc`, `quality`, `prod`).
- Voeg de App Registration toe als **Owner** op elke resource group (Access control → Add role assignment → Privileged administrator roles → Owner → je app selecteren → Review + assign).

:::warning Owner is vereist
De App Registration heeft **Owner**-rechten nodig (niet alleen Contributor), omdat Yres tijdens de installatie rollen moet toewijzen aan de managed identities van resources. Verleen dit op resource-group-niveau (aanbevolen) of subscription-niveau.
:::

## 3. Installatie in de webapp

1. Maak in de webapp een nieuwe organisatie aan via het SuperAdmin-menu.
2. **Organisatienaam** — min. 2 tekens, alleen letters en spaties (`/^[a-zA-Z ]*$/`).
3. **Omgevingen** — minimaal `dev` + `prod`; afhankelijk van licentie omgevingen ertussen (bv. `test`, `acceptance`).
4. **Resourcenamen** — volledig of semi-gegenereerd:
   - *Volledig*: namen volgens de Microsoft naming convention; bij conflict een unieke postfix.
   - *Semi*: gebruik altijd de **`$`** in de naam (wordt vervangen door de omgeving). Bv. keyvault in dev-resourcegroup = `company-keyvault-$`, in prod = `company-keyvault-prod`. Zonder omgeving in de naam ontstaan conflicten (automatisch opgelost met postfix, maar slecht herkenbaar).
   - Als je de resource groups al hebt aangemaakt: zorg dat de namen matchen.
5. **Azure-waarden invullen** (uit de voorbereiding):
   - Active directory ID → **Directory (Tenant) ID**
   - Application Object ID → **Object ID**
   - Client ID → **Application (client) ID**
   - Client secret → **secret-waarde**
6. **Abonnementen** — kies single of multiple. Bij multiple: vul per omgeving het subscription-ID; bij single wordt het van dev gekopieerd.
7. Klik **Next**, controleer resource groups en roltoewijzingen, en **Submit**. Een status toont de voortgang.

:::note
Een nieuwe organisatie aanmaken kan even duren; sommige frontend-elementen werken pas correct als dat klaar is.
:::
