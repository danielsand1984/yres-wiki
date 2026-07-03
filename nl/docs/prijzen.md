---
sidebar_position: 9
title: Prijzen
description: Essentials, Advanced en Ultimate — licentiepakketten op basis van bronnen en omgevingen.
---

# Prijzen

> De grootste datakosten zitten zelden in de tooling zelf. Ze zitten in onderhoud, storingen en de uren die engineers kwijt zijn aan het draaiend houden van maatwerk. Yres vervangt die complexiteit door een gestandaardiseerde Azure-omgeving: voorspelbare kosten, minder afhankelijkheid, meer controle.

## Hoe de licentie werkt

Een Yres-licentie wordt niet per los onderdeel afgerekend, maar bepaalt **hoeveel bronsystemen** en **hoeveel omgevingen** je mag inrichten. Het pakket dat je kiest, legt die twee grenzen vast:

- **Bronsystemen** — het aantal databronnen (SQL Server, Exact Online, AFAS, REST-API's, enzovoort) dat je mag koppelen.
- **Omgevingen** — het aantal DTAP-omgevingen (bijvoorbeeld `dev`, `test`, `productie`). De eerste omgeving heet altijd **dev**.

De licentie zelf is gebonden aan een **eenmalig te gebruiken uitnodigingslink** van Plainwater: gekoppeld aan één Microsoft-account, geconfigureerd voor het gekochte pakket, en na installatie niet opnieuw bruikbaar. De licentie wordt in de database vastgelegd en begrenst het gebruik volgens het gekozen pakket.

## Pakketten

| | **Essentials** | **Advanced** ⭐ | **Ultimate** |
|---|---|---|---|
| **Prijs** | €350/mnd | €674/mnd | €997/mnd |
| **Voor** | Kleine teams & opstartende omgevingen | De meeste data teams | Grote, complexe omgevingen |
| **Omgevingen** | 1 | 2 | Onbeperkt |
| **Bronsystemen** | Max. 2 | Max. 5 | Alle ondersteunde bronnen |
| **Tabellen** | Onbeperkt | Onbeperkt | Onbeperkt |
| **Hosting** | Eigen Azure tenant | Eigen Azure tenant | Eigen Azure tenant |
| **Changes-systeem** | — | ✅ | ✅ |
| **Automatisch schalen databases** | — | ✅ | ✅ |
| **Web application firewall** | — | ✅ | ✅ |
| **Lokale netwerken (via IR)** | ✅ | ✅ | ✅ |
| **Site-to-site VPN** | — | — | ✅ |

⭐ Advanced = **meest gekozen**.

De verdeling **bronsystemen / omgevingen** per pakket (2 / 1 · 5 / 2 · onbeperkt / onbeperkt) ligt vast in de licentie. Tabellen zijn niet gelimiteerd: dat zijn configuratierijen, geen gelicentieerde objecten.


:::note Feature-toewijzing per pakket
Yres dwingt feature-gating op dit moment **niet actief af**; de toewijzing hierboven is de bedoelde indeling en kan via de **licentie** worden afgedwongen. Twee bijzonderheden:

- De **web application firewall** zit in **alle** pakketten.
- **Site-to-site VPN** is mogelijk tegen een **meerprijs**; de exacte prijs hangt af van je wensen — dus niet pakketgebonden.
:::


## Wat zit er in elk pakket?

### Essentials
Voor kleine teams en opstartende omgevingen. Eén omgeving, maximaal twee bronsystemen, en een onbeperkt aantal tabellen. Lokale netwerken zijn bereikbaar via een self-hosted integration runtime.

### Advanced ⭐
Het meest gekozen pakket. Naast een tweede omgeving — zodat je veilig kunt doorontwikkelen op `dev` zonder bestaande dashboards op productie te raken — krijg je toegang tot het **changes-systeem**, **automatisch schalen** van databases en de **web application firewall**.

### Ultimate
Voor grote, complexe omgevingen: onbeperkt aantal bronsystemen en omgevingen, plus de mogelijkheid tot een **site-to-site VPN** (tegen meerprijs) voor afgeschermde netwerken.

## Veelgestelde prijsvragen

**Wat is het verschil tussen Essentials en Advanced?**
Met Essentials werk je in één omgeving. Advanced geeft je een aparte development- en productieomgeving, zodat je veilig kunt doorontwikkelen zonder bestaande dashboards te raken. Volgens de huidige (nog te bevestigen) tier-indeling zijn ook het changes-systeem en automatisch schalen voorbehouden aan Advanced en Ultimate.

**Hebben we minimaal een dev- en een productieomgeving nodig?**
De eerste omgeving heet altijd **dev** en is verplicht. Een tweede omgeving (bijvoorbeeld productie) hoort bij Advanced en hoger; Essentials biedt slechts één omgeving. Voor grotere teams adviseren we doorgaans twee tot vier omgevingen.

**Kunnen we later opschalen?**
Ja. Je stapt op elk moment over naar een groter pakket. We regelen de migratie zonder dat je omgeving offline gaat.

:::note Schalen zonder downtime
Opschalen gebeurt **zonder downtime**. Lopende query's kunnen er wel **kortstondig hinder** van ondervinden.
:::

**Draaien onze data en pipelines op jullie infrastructuur?**
Standaard niet: Yres draait binnen jouw eigen Azure tenant en je data verlaat jouw omgeving niet. Yres heeft nooit directe toegang tot je bronnen, en je processen blijven werken ook als je Yres niet meer gebruikt — er is geen vendor lock-in.

Zie de volledige [FAQ](./faq.md).
