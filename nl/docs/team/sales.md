---
sidebar_position: 4
title: Sales
description: Interne salesnotities — positionering, demo-aanpak, concurrentie en koopcriteria voor Yres.
---

# Sales

:::info In te vullen
Er is nog **geen formeel salesproces** vastgelegd. Hieronder staan bruikbare interne notities; vul ze
aan met het echte proces (zie [Nog te documenteren](#nog-te-documenteren) onderaan).
:::

## Positionering

- Yres positioneert zich **onder Power BI** — als het data-platform dat de dashboards voedt, niet als
  vervanger of concurrent ervan.
- De gevalideerde kernboodschap (Yres Learning): *"Yres is een cloudplatform dat al je data verbindt,
  automatisch up-to-date houdt en makkelijk bruikbaar maakt — zonder dat je technische kennis nodig hebt.
  Het draait volledig in je **eigen Azure-omgeving**, bespaart kosten door slim schalen en geeft volledige
  controle over je data, zonder vendor lock-in."*
- Alles draait standaard in de **eigen Azure tenant** van de klant (USP "100% Azure", "geen vendor
  lock-in"). Dit is het sterkste en meest herhaalde verkoopargument: data verlaat de omgeving van de klant
  niet, en de pipelines blijven draaien ook als Yres niet langer gebruikt wordt.

:::info Te bevestigen
De optie *"hosting door Yres"* (in plaats van de eigen Azure tenant) staat in oudere salesnotities, maar
komt **niet** voor in de officiële productdocumentatie en staat op gespannen voet met de kernboodschap
"100% in je eigen tenant". Bevestig met de eigenaar of, en op welke voorwaarden, een door-Yres-gehoste
variant wordt aangeboden voordat dit als verkoopargument wordt gebruikt.
:::

- **No-code**: bronnen, tabellen en laadtypes worden geconfigureerd in **wizards**; Yres genereert
  vervolgens de Azure Data Factory (ADF) linked services en pipelines automatisch. (Let op: dit is
  metadata-gedreven generatie, geen visuele drag-and-drop pipeline-ontwerper — vermijd die claim in een
  demo.)
- Native **Nederlandse ERP-koppelingen** (Exact Online, AFAS) en voorgeconfigureerde NL-bronnen
  (o.a. CBS, Tweede Kamer, Simplicate) als onderscheidend punt tegenover internationale tooling.
- Snelle implementatie: een typische installatie duurt **ongeveer 20 minuten** (afhankelijk van het aantal
  omgevingen) — niet weken.

:::info Te bevestigen
De **vaste prijsstelling** en de losse claims "binnen een uur live" en "nieuwe bron in ~5 minuten" zijn
commercieel/marketing van aard en niet terug te vinden in de officiële documentatie. De
licentie-*structuur* (aantal bronnen + omgevingen per tier) is wel bevestigd; de euro-bedragen en exacte
doorlooptijden niet. Zie [Prijzen](../prijzen.md).
:::

## Demo

Geen standaard self-service trial of vaste sales-demo. De aanpak is een **vrijblijvend gesprek met een
data-architect**, gericht op de bestaande Azure-omgeving van de prospect. Pitch: *"Binnen 30 minuten weet
je of Yres past."* → [Hoe het werkt](../product/hoe-het-werkt.md)

:::info In te vullen
De demo-belofte ("binnen 30 minuten weet je of Yres past") is interne salesframing en nog niet formeel
vastgelegd. Leg het demoscript en de kwalificatievragen vast.
:::

## Concurrenten

| Concurrent | Context |
|---|---|
| **TimeXtender** | Vergelijkbare data-warehouse-automatisering. |
| **AnalyticsCreator** | Vergelijkbare tooling. |
| **Blue Mountain** | Sector woningcorporaties. |
| **ZIG** | Sector woningcorporaties. |

:::info Te bevestigen
De aantekening dat Blue Mountain en ZIG door een woningcorporatie-klant als *"te duur / te weinig waarde"*
zijn ervaren, komt uit een klantinterview en is **niet** uit de officiële documentatie afkomstig.
Verifieer (en zorg voor toestemming) voordat dit, of de betrokken klantnaam, extern wordt gebruikt.
:::

**Differentiatie t.o.v. TimeXtender / AnalyticsCreator** (gemengd geverifieerd):

- Native NL ERP-connectoren (Exact, AFAS) en voorgeconfigureerde NL-bronnen — **bevestigd**.
- Geautomatiseerde health checks (`[Maintenance].[vwYresChecks]`) — **bevestigd**.
- Draait 100% in de eigen Azure tenant, geen vendor lock-in — **bevestigd**.
- Transparante vaste prijsstelling — **te bevestigen** (commercieel, zie boven).

## Doorslaggevende koopcriteria

- Standaardkoppelingen (kant-en-klare connectoren).
- Azure-fit (sluit aan op de bestaande Azure-investering).
- Efficiëntie en kostenbesparing (slim schalen i.p.v. grote, dure VM's).
- Minder externe consultancy-uren.
- Eén centrale beheerplek.
- Flexibiliteit (niet vastgepind op standaardrapportages).
- Aansluiting op Lean-werkwijze.
- Prijs-kwaliteitverhouding.
- Zelfbeheer (de klant houdt zelf controle).

## Bekend verbeterpunt

Klanten ervaren Yres/Plainwater als **te bescheiden en onvoldoende zichtbaar** in de sector. Advies uit de
gesprekken: meer demo's, events en vakbladpublicaties.

:::info Te bevestigen
Dit verbeterpunt komt uit klantinterviews en is niet uit de officiële productdocumentatie afkomstig.
Bevestig vóór extern gebruik.
:::

## Nog te documenteren

- Salesfunnel en fasen.
- Kwalificatie / ICP (ideaal klantprofiel).
- Offerteproces en business-case-sjabloon.
- Prijsonderhandelingsmarges en contractvormen.
- Demoscript en standaard kwalificatievragen.
