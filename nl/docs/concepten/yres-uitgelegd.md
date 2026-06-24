---
slug: /yres-uitgelegd
sidebar_position: 1
title: Yres uitgelegd
description: Yres in begrijpelijke taal — elevator pitch, het probleem dat het oplost en de 10 unique selling points.
---

# Yres uitgelegd

> Bedoeld om Yres uit te leggen aan iemand zonder Azure- of datawarehouse-kennis — handig voor sales en onboarding.

## In gewone taal

Zie Yres als de **centrale controlekamer** voor alle data van een organisatie. In plaats van informatie verspreid over losse systemen, brengt Yres alles samen op één veilige, overzichtelijke plek. Je hoeft geen techneut te zijn om bronnen te koppelen, data actueel te houden en beschikbaar te maken voor analyse — Yres automatiseert het zware werk, zonder dat je één regel code hoeft te schrijven.

- **Data enabler** — maakt data makkelijk vindbaar, koppelbaar en veilig bruikbaar.
- **Smart data organizer** — verzamelt informatie uit meerdere systemen op één plek.
- **Reliable transporter** — verplaatst data veilig en automatisch naar waar die nodig is.

## Zonder vs. met Yres

| Zonder Yres | Met Yres |
|---|---|
| Data verspreid over plekken en formaten | Alles op één veilige, centrale plek |
| Rapporten duren dagen of weken | Sneller, met actuele informatie |
| Fouten door verouderde of inconsistente data | Geautomatiseerd, minder menselijke fouten |
| Afhankelijk van een paar technische experts | Iedereen krijgt de data die hij nodig heeft |

## Praktijkvoorbeeld

Een middelgroot retailbedrijf had klantdata verspreid over meerdere systemen: sales in de ene database, marketingcampagnes in een andere en voorraad in spreadsheets. IT was maandelijks dagen kwijt aan het handmatig combineren en opschonen van die data. Managers wachtten op rapporten en werkten met verouderde cijfers. En er werd betaald voor grote VM's voor de verwerking — óók in rustige periodes.

**Na Yres** waren binnen enkele dagen alle bronnen gekoppeld: sales, marketing en voorraad werden automatisch bijgewerkt en stonden klaar voor de dashboards. Managers kregen near-real-time inzicht en konden direct bijsturen. Door automatische database-scaling werd alleen tijdens zware verwerking extra capaciteit betaald, en de architectuur verwerkte grote volumes zonder dure VM's.

**Resultaat:** de rapportagetijd ging van dagen naar minuten, beslissingen werden sneller genomen en de maandelijkse Azure-rekening daalde — en dat alles zonder extra technisch personeel.

:::note Illustratief voorbeeld
Dit is een algemeen, hypothetisch voorbeeld uit de Yres-cursusmaterialen — geen specifieke, met naam genoemde klant.
:::

## 10 Unique Selling Points

1. **No-code data management** — bronnen en pipelines beheren zonder code.
2. **Naadloze Azure-integratie** — Azure Data Factory, Azure SQL en Blob Storage werken automatisch samen.
3. **Automatisch schalen voor kostenbesparing** — je betaalt alleen voor de capaciteit die je tijdens piekverwerking echt gebruikt.
4. **Efficiënte architectuur** — verwerkt grote datavolumes zonder grote, dure VM's.
5. **Snelle implementatie** — pipelines en bronnen staan in uren, niet weken.
6. **Centrale zichtbaarheid** — loads, logs en lifecycle in één interface.
7. **Flexibele opslag** — kies database, Data Lake of beide.
8. **Enterprise-grade security** — Azure RBAC + SSO.
9. **No vendor lock-in** — draait volledig in de eigen Azure-omgeving van de klant.
10. **100% Azure-based** — alle processen blijven werken binnen de Azure-omgeving van de klant, óók als je Yres niet langer gebruikt.

## Hoe Yres werkt (zonder jargon)

Yres laat je **bronnen, tabellen en laadtypes configureren in eenvoudige wizards**. Op basis daarvan **genereert Yres automatisch de pipelines** in Azure Data Factory die de data ophalen, verplaatsen en bijwerken. Je ontwerpt dus geen pipelines visueel met de hand — je vult een paar stappen in en Yres bouwt de rest. Daardoor is een nieuwe bron koppelen een kwestie van configureren, niet van programmeren.

## Elevator pitch

> "Yres is een cloud-platform dat al je data verbindt, automatisch up-to-date houdt en makkelijk bruikbaar maakt — zonder technische kennis. Het draait volledig in je eigen Azure-omgeving, bespaart kosten door slim te schalen, en geeft je volledige controle over je data zonder vendor lock-in."

## "Yres heeft nooit directe toegang" — wat dat precies betekent

Dit is het sterkste, meest herhaalde verkooppunt van Yres, maar het verdient één belangrijke nuance.

- **Het Yres-platform (de webapplicatie) zelf heeft nooit directe toegang tot je databronnen.** De centrale webapp van Yres beheert en configureert je omgeving, maar slaat zelf nooit klantdata of brongegevens op. Hij stuurt aan; hij leest je bronnen niet uit.
- **De dataverwerking draait volledig in jouw eigen Azure-omgeving.** De pipelines die je data daadwerkelijk verplaatsen, draaien binnen jouw Azure-tenant. De inloggegevens voor je bronnen staan veilig in jouw **Azure Key Vault** — niet bij Yres. Het zijn deze pipelines in jouw omgeving die, met die inloggegevens, verbinding maken met je bronnen om data op te halen.

Met andere woorden: niet het Yres-bedrijf reikt in je systemen, maar de automatisering die in jouw eigen Azure-omgeving draait. En omdat alle configuratie en pipelines daar staan, blijft alles werken — **ook als je Yres niet meer gebruikt**. Dat is de kern van "no vendor lock-in".

:::tip Belangrijk verkooppunt
Het Yres-platform heeft **nooit directe toegang tot de databronnen** van de klant; de data verlaat de eigen Azure-omgeving niet. Alle geconfigureerde dataflows blijven daar werken — ook zonder Yres.
:::

:::info Te bevestigen
Sommige verkoopmaterialen noemen een door Yres gehoste optie naast "eigen Azure-tenant". Dat staat op gespannen voet met de centrale boodschap dat alles 100% in de eigen Azure-omgeving van de klant draait. Laat de producteigenaar de exacte hostingopties en bewoording bevestigen voordat dit extern wordt gecommuniceerd.
:::
