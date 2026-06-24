---
sidebar_position: 1
title: Organisatie
description: Wie doet wat binnen Yres / Plainwater — bedrijf, team, rollen en partners.
---

# Organisatie

Yres is het dataplatform-automatiseringsproduct van **Plainwater**. Deze pagina beschrijft
het bedrijf achter Yres, de rollen in het team en de partners rond het product.

:::info In te vullen
De teamsamenstelling, rollen en partnerafspraken hieronder zijn nog niet volledig
gedocumenteerd. Vul de gemarkeerde onderdelen aan met input van het team voordat deze
pagina extern wordt gepubliceerd.
:::

## Bedrijf

Yres wordt ontwikkeld en geleverd door **Plainwater**. Plainwater verstrekt de
installatie-uitnodigingen (de invitation links) waarmee een klant Yres in de eigen Azure-omgeving
in gebruik neemt, en treedt op als product- en supportpartij achter het platform.

- **Product:** Yres (voorheen **IRIS** — de naam komt nog terug in interne identifiers zoals
  `IRIS_DWH`, `kv-iris-…` en de pipeline `Dynamic Workflow IRIS`).
- **Bedrijf:** Plainwater.

### Contactgegevens

| Kanaal | Gegeven |
|---|---|
| Adres | Friesestraatweg 219, 9743 AD Groningen |
| E-mail | info@yres.app |
| Telefoon | +31 85 130 3905 |
| Feedback (in product) | feedback@yres.app |

:::info Te bevestigen
Het adres, telefoonnummer en de e-mailadressen hierboven komen uit de bestaande wiki en de
marketingsite, niet uit de officiële productdocumentatie. Bevestig de exacte adresgegevens,
het telefoonnummer en de literal e-mailadressen (`info@yres.app`, `feedback@yres.app`) bij het
team. De **feedbackstroom** zelf is wel gedocumenteerd (zie hieronder); alleen het exacte
mailadres is nog niet uit de productdocumentatie te verifiëren.
:::

## Team & rollen

_In te vullen:_ wie zijn de data-architecten, wie verzorgt de onboarding, wie doet support, wie
sales en wie productontwikkeling? Leg per rol ten minste een contactpersoon vast.

Suggestie voor de rolverdeling die je hier kunt invullen:

| Rol | Verantwoordelijkheid | Contactpersoon |
|---|---|---|
| Data-architect | Inrichting datamodel, laadtypes, SCD2-historie | _In te vullen_ |
| Onboarding / consultancy | Klant-installatie, eerste bronnen, kennisoverdracht | _In te vullen_ |
| Support | Health checks, troubleshooting, releases | _In te vullen_ |
| Sales | Demo's, licenties, commerciële afspraken | _In te vullen_ |
| Productontwikkeling | Nieuwe connectoren, releases, roadmap | _In te vullen_ |

:::info In te vullen
Contactpersonen per klant zijn nog niet vastgelegd. Voeg per actieve klant een
accountverantwoordelijke toe.
:::

## Hoe het team klanten ondersteunt

Een aantal supportbouwstenen is rechtstreeks in het product verankerd en hoeft niet apart te
worden ingevuld:

- **Feedbackformulier (in app):** klanten dienen vanuit de webapp een **Bug report**, **Feature
  request** of **Feedback** in; antwoorden gaan naar het account-e-mailadres. Dit is de officiële
  productfeedbackstroom.
- **Health checks:** de gezondheid van een omgeving wordt gecontroleerd via de view
  `[Maintenance].[vwYresChecks]` (bronbestand `vwIrisChecks.sql`). Zie de admin-documentatie voor de
  controles die hierop draaien.
- **Announcements:** beheerders sturen organisatie-brede of globale aankondigingen (bijvoorbeeld
  voor onderhoud of downtime), met Markdown-tekst, prioriteit en een start-/einddatum.
- **Update-advies:** test een nieuwe Yres-versie altijd eerst op de **dev**-omgeving voordat je
  productie bijwerkt.

:::info In te vullen
SLA's, reactietijden, escalatiepaden en de salesfunnel (ICP, contractvoorwaarden) staan niet in de
productdocumentatie. Vul deze aan vanuit het team.
:::

## Partners

Plainwater levert kant-en-klare connectoren voor een aantal grote bronsystemen. De connectoren
zelf zijn geverifieerd in het product; de status als formele **partner** is een commerciële
afspraak die het team moet bevestigen.

- **Bronconnectoren (geverifieerd):** Exact Online, AFAS, SAP (SAC, S/4HANA, HANA, Datasphere en
  SAP Business Data Cloud / `SAP_BDC`).
- **Connector-toezegging:** is een gewenste applicatie een gangbaar (Standard) systeem, dan helpt
  Plainwater **kosteloos** met het koppelen ervan en wordt de connector toegevoegd aan een volgende
  release.

:::info Te bevestigen
Of Exact Online, AFAS en SAP daadwerkelijk als **officiële partners** mogen worden gepresenteerd, is
niet uit de productdocumentatie af te leiden — alleen de connectoren zijn geverifieerd. Bevestig de
partnerstatus, plus overige partnerships, resellers en BI-partners (bijvoorbeeld Kleinbar, genoemd bij
Paragon), bij het team.
:::
