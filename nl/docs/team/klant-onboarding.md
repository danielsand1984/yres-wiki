---
sidebar_position: 2
title: Klant-onboarding
description: Een nieuwe klant live krijgen op Yres — technische checklist en begeleiding.
---

# Klant-onboarding

Deze pagina beschrijft hoe je een nieuwe klant van nul naar een werkende Yres-omgeving brengt: eerst de technische voorbereiding in Azure, daarna het aanmaken van de organisatie en het inrichten van bronnen, loads en rapportage.

> Een typische installatie van een Yres-omgeving duurt in de orde van **~20 minuten** (de Azure-resources worden daadwerkelijk geprovisioneerd). De doorlooptijd van een volledige onboarding — inclusief bronnen, loads en eerste rapportage — hangt af van het aantal bronnen en de afspraken met de klant.

:::info Te bevestigen
De exacte doorlooptijd voor een complete klant-onboarding (van kick-off tot eerste werkende rapportage) en de richttijd "een nieuwe bron koppel je in ~X minuten" zijn nog niet formeel vastgelegd. Bevestig deze cijfers voordat je ze als belofte naar buiten brengt.
:::

## Technische checklist

Werk de stappen in deze volgorde af. De Azure-voorbereiding (stappen 1–2) doet de klant zelf; het aanmaken van de organisatie (stap 3) gebeurt in het SuperAdmin-paneel door de Yres-/Plainwater-beheerder.

1. **App Registration** in Microsoft Entra met de juiste API-permissies en een client secret. Voeg deze gedelegeerde permissies toe:
   - **Azure Service Management** (`user_impersonation`) — Azure-abonnement, resource groups en resources beheren.
   - **Microsoft Graph** → **User.Read** — het ingelogde gebruikersprofiel uitlezen.
   - **Azure Key Vault** — bron-credentials wegschrijven en uitlezen.
   - **Azure DevOps** — de Git-/CI/CD-koppeling (DACPAC-deploy + `publish-datafactory`).

   Maak daarna een **client secret** (geldigheid max. 24 maanden) en verzamel **Application (client) ID**, **Directory (tenant) ID**, het **Object ID** van de Managed Application en de **secret-waarde**. → [Installatie](../setup/installatie.md)
2. **Abonnement(en) & resource groups** bepalen (advies: 2–4 omgevingen, eigen resource group per omgeving) en de App Registration als **Owner** toevoegen op resource-group- of subscription-niveau. → [Installatie](../setup/installatie.md)
3. **Organisatie aanmaken** in de webapp (SuperAdmin): omgevingen (`dev` en `prod` verplicht, optioneel `test`/`acc`/`quality`), resourcenamen met de `$`-conventie en de Azure-waarden uit stap 1. → [Installatie](../setup/installatie.md)
4. **Gebruikers & rollen** opzetten (SSO waar gewenst). → [Aan de slag](../setup/aan-de-slag.md)
5. **Databronnen koppelen** en metadata verversen. → [Databron koppelen](../setup/databron-koppelen.md)
6. **Loads & triggers** inrichten; eventueel master pipelines. → [Views, pipelines & triggers](../setup/views-pipelines.md)
7. **Power BI-modellen** koppelen indien van toepassing.

:::warning Owner is vereist — niet Contributor
De App Registration heeft **Owner**-rechten nodig, niet alleen Contributor. Yres moet tijdens de installatie namelijk **rollen toewijzen aan de managed identities** van de aangemaakte resources (bijvoorbeeld de Data Factory die de Key Vault en de SQL-database mag benaderen). Alleen een Owner mag roltoewijzingen maken. Verleen Owner op **resource-group-niveau** (aanbevolen) of op **subscription-niveau**.
:::

## Begeleiding

Wat klanten waardeerden tijdens onboarding:

- **Productsessies** over de werking van Yres en uitleg over zelfbeheer.
- **Scrum-werkwijze** met driewekelijkse sprints en duidelijke deliverables.
- **Strategische / inspiratiesessies** rond cloudmigratie.
- **Proactieve checks** (dagelijkse controles) en een vaste contactpersoon voor incidenten.

:::info Te bevestigen
De hierboven genoemde werkwijzen zijn afkomstig uit eerdere klanttrajecten en zijn niet formeel vastgelegd als standaard. Bevestig welke onderdelen onderdeel zijn van het reguliere onboarding-aanbod (en bij welke klanten/quotes deze publiek gedeeld mogen worden) voordat je ze extern gebruikt.
:::

:::info In te vullen
Formaliseer dit tot een standaard onboarding-traject: doorlooptijd, wie-doet-wat, sjablonen, kick-off-agenda en opleverdocument.
:::
