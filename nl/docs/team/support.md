---
sidebar_position: 3
title: Support
description: Support- en incidentproces — feedback, health checks, troubleshooting en announcements.
---

# Support

:::info Te bevestigen
Er is nog geen formeel supportproces (SLA's, kanalen, escalatiepaden) vastgelegd in de productdocumentatie. De bouwstenen hieronder zijn geverifieerd vanuit Yres; de commerciële afspraken eromheen (reactietijden, on-call, ticketing) moeten door de eigenaar worden bevestigd.
:::

Yres levert vier geverifieerde bouwstenen die samen het support- en incidentproces ondersteunen: **Feedback** vanuit de app, **Health Checks**, **Troubleshooting** en **Announcements**.

## Bouwstenen

### Feedback vanuit de app

In de webapp zit een **Feedback**-formulier dat is opgesplitst in drie categorieën:

- **Bug report** — een gemelde fout.
- **Feature request** — een gewenste uitbreiding.
- **Feedback** — algemene opmerkingen.

Antwoorden gaan naar het **account-e-mailadres** van de gebruiker die de melding instuurde. Zie [Account](../frontend/account.md) voor de gebruikerskant.

:::info Te bevestigen
Het centrale adres `feedback@yres.app` staat alleen in de wiki, niet in de productdocumentatie. De feedback-flow zelf (drie categorieën, antwoord naar het account-e-mailadres) is wel geverifieerd. Bevestig het literal adres bij de eigenaar.
:::

### Health Checks

De webapp draait **Health Checks** tegen het DWH om bekende problemen op te sporen — vaak met een meegeleverd fix-script. De verwachte controles en instellingen worden afgedwongen door de view `[Maintenance].[vwYresChecks]` (bronbestand `vwIrisChecks.sql`). Zie [Admin](../frontend/admin.md) voor het bedienen van de health checks.

### Troubleshooting

De productdocumentatie beschrijft expliciet twee terugkerende problemen:

- **Deployment rights error** — onvoldoende rechten bij het uitrollen.
- **Unable to load local files** — lokale bestanden kunnen niet worden geladen (vrijwel altijd een ontbrekende self-hosted integration runtime).

Zie [Troubleshooting](../troubleshooting.md) voor de oplossingen en uitgebreidere foutafhandeling.

### Announcements

Beheerders kunnen **Announcements** publiceren om onderhoud, downtime of releases te communiceren. Een announcement is org-breed of globaal, heeft een Markdown-tekst, een prioriteit, een optie om gebruikers te notificeren en een start- en einddatum.

## Onboarding van nieuwe bronnen (free-connector-belofte)

Is de gewenste applicatie een **standaardbron** maar nog niet beschikbaar in Yres? Dan helpt Yres die bron **kosteloos** aansluiten en voegt de applicatie toe aan een volgende release. Dit is een geverifieerde, citeerbare support-belofte (Yres Learning, p.107).

## Wat klanten als ideale support noemen

:::info Te bevestigen
De punten hieronder komen uit klantinterviews/marketing, niet uit de productdocumentatie. Bevestig met de eigenaar voordat je ze als toezegging publiceert.
:::

- Proactieve, dagelijkse controles.
- Incidentbeheer via een vaste contactpersoon.
- Regelmatige (strategische) sessies en sprint-reviews.

## Nog te documenteren

:::info Te bevestigen
De volgende items zijn nog niet vastgelegd en moeten door de eigenaar worden ingevuld:
:::

- **SLA's en reactietijden** — de marketingsite noemt "reactie binnen één werkdag" op contactvragen; dit is nog niet als formele SLA vastgelegd.
- **Supportkanalen en -uren**, ticketing, escalatie, on-call.
- **Onderhouds-/release-kalender** en de bijbehorende communicatie via Announcements.
