---
sidebar_position: 1
title: Dashboard
description: Het startscherm van de Yres-webapp — jobs, foutmeldingen, laadstatussen en de omgevingsschakelaar.
---

# Dashboard

Na het inloggen kom je op het **Dashboard**: het overzicht met de belangrijkste metrics van de geselecteerde omgeving. Je ziet hier in één blik welke jobs draaien, welke fouten er recent zijn opgetreden en hoe de loads per bronsysteem ervoor staan. Klik linksboven op het **logo** (dit kan je eigen bedrijfslogo zijn) om vanuit elk scherm terug te keren naar dit Dashboard.

![Dashboard van de Yres-webapp met de quick-nav-tegels, het welkomstblok, mededelingen, de accordions voor monitored jobs en foutmeldingen, en de laadhistorie per bronsysteem.](/img/screens/dashboard.svg)

De cijfers in de schermafbeelding (1)–(6) verwijzen naar de onderdelen hieronder:

1. **Quick-nav-tegels (HomeNav)** — snelkoppelingen naar de hoofdsecties (Admin, Projects, Data sources, Load management, Data engineering). Tegels worden verborgen op basis van je rechten en bij een omgeving met één milieu.
2. **Welkomstblok** — begroeting met je naam en de actieve omgeving.
3. **Mededelingen (Announcements)** — berichten van je admin én algemene mededelingen van Yres.
4. **Monitored jobs** — uitklapbaar paneel met de lopende en zojuist afgeronde jobs in deze omgeving.
5. **Error logs (3 days)** — uitklapbaar paneel met de databasefouten van de laatste drie dagen; het badge toont het aantal.
6. **Load history** — laadhistorie gegroepeerd per bronsysteem, uitklapbaar naar de detailregels.

## Onderdelen

| Onderdeel | Wat je ziet |
|---|---|
| **Jobs** (Monitored jobs) | De lopende en recent afgeronde jobs in de geselecteerde omgeving, met status. Acties die door ADF worden uitgevoerd bevatten een directe link naar de ADF-monitor. |
| **Error logs (3 days)** | Alle databasefouten van de laatste **3 dagen** — bijvoorbeeld bij het maken van tabellen, het installeren van changes, het bijwerken van bronnen, en de gedetailleerde load-stappen. |
| **Announcements** | Mededelingen van je admin én algemene mededelingen van Yres (releases, downtime, overige informatie). |
| **Load statusses** | Loads gegroepeerd per bronsysteem; per bronobject wordt alleen het **laatste** resultaat getoond. De periode is rechtsboven instelbaar. Via het log-icoon (ⓘ) open je de detailstappen, via het link-icoon (↗) spring je naar de ADF-monitor. |
| **Niet-bronspecifieke processen** | Dataprocessen die niet aan één bronsysteem hangen, zoals het laden van Power BI-modellen en het wegschrijven van views naar tabellen. |
| **PowerBI Model refreshes** | De status van modelvernieuwingen. |
| **Persisted Views** | De status van gepersisteerde views. |

:::note Laatste resultaat per bronobject
Bij **Load statusses** zie je per bronobject uitsluitend de meest recente load. De volledige geschiedenis van eerdere runs vind je via het log-icoon (ⓘ) en op het scherm [Monitoring](./load-management.md) onder Load management.
:::

## De gedeelde chrome (kop, icoonbalk, sub-links)

Elk ingelogd scherm — niet alleen het Dashboard — wordt omlijst door dezelfde drie navigatie-elementen: de **bovenbalk**, de **icoonbalk links** (de secties) en de **contextuele sub-links** ernaast.

![De gedeelde chrome van de Yres-webapp: bovenbalk met logo, omgevingsschakelaar en help-knop, de icoonbalk met secties en de uitklapbare sub-link-zijbalk.](/img/screens/dashboard-nav.svg)

De cijfers (1)–(6) in deze schermafbeelding:

1. **Logo + organisatietitel** — klik op het logo om terug te keren naar het Dashboard (`/`).
2. **Omgevingsschakelaar** — toont de organisatienaam, een `·`-scheidingsteken en de actieve omgeving (bv. *Acme B.V. · Productie*). Wordt alleen getoond bij **meer dan één omgeving**.
3. **Help "?"** — opent de wiki op `wiki.yres-dwh.app`.
4. **Icoonbalk (secties)** — Home, Admin, Projects, Data sources, Load management, Data engineering. De zichtbaarheid hangt af van je rechten en van de DWH-versie; **Projects** is verborgen bij een organisatie met één omgeving.
5. **Sub-link-zijbalk** — de contextuele links bij de gekozen sectie (voor Home: *Dashboard* en *Power BI dashboard*). De zijbalk is in breedte versleepbaar.
6. **Acties rechtsboven** — vernieuwen, monitored jobs, notificaties en het gebruikersmenu.

:::tip Foutmelding-badge in de zijbalk
Bij de Admin-sectie verschijnt een **rood badge** met het aantal DWH-foutmeldingen naast *DWH logs* zodra er fouten zijn. Op het Dashboard zelf zie je hetzelfde aantal terug op het uitklappaneel **Error logs (3 days)**.
:::

## Omgeving wisselen

Heeft je installatie meerdere omgevingen, dan wissel je ertussen via de **omgevingsschakelaar** rechtsboven in de bovenbalk. De actieve omgeving — *Development*, *Test* of *Production* — staat sinds **v1.53** prominent naast de organisatienaam, gescheiden door een `·`.

**Zo wissel je van omgeving:**

1. Klik rechtsboven op de omgevingsschakelaar (de pil met *organisatie · omgeving ▾*).
2. Kies de gewenste omgeving uit de lijst.
3. Het scherm herlaadt de gegevens van de gekozen omgeving; titel en metrics passen mee aan.

:::note Niet op elk scherm beschikbaar
De omgevingsschakelaar werkt alleen op schermen waar omgeving-specifieke data zinvol is (zoals het Dashboard, Data sources, Run pipelines, Monitoring en de DWH-logs). Op overige schermen valt de schakelaar terug op *Development* en is hij uitgeschakeld. Bij een organisatie met één omgeving verschijnt de schakelaar helemaal niet.
:::
