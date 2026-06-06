---
sidebar_position: 1
title: Dashboard
description: Het startscherm van de Yres-webapp.
---

# Dashboard

Na inloggen kom je op het **Dashboard**: de belangrijkste metrics van je omgeving. Klik linksboven op het logo (dit kan je eigen bedrijfslogo zijn) om altijd terug te keren naar dit scherm.

![De webapp: icoonbalk links (de secties), de sectiekaarten en de omgevingsschakelaar bovenin.](/img/screens/dashboard-nav.png)

## Onderdelen

| Onderdeel | Wat je ziet |
|---|---|
| **Jobs** | Alle jobs in de geselecteerde omgeving met status en logs. Acties via ADF bevatten een directe link naar de ADF-monitor. |
| **Error logs** | Alle databasefouten van de laatste **3 dagen** — bij het maken van tabellen, installeren van changes, updaten van bronnen, en gedetailleerde load-stappen. |
| **Announcements** | Mededelingen van je admin én algemene mededelingen van Yres (releases, downtime, info). |
| **Load statusses** | Loads gegroepeerd per bronsysteem; alleen het laatste resultaat per bronobject. Periode rechtsboven instelbaar. Via het log-icoon zie je de detailstappen, via het link-icoon spring je naar de ADF-monitor. |
| **Niet-bronspecifieke processen** | Bv. PowerBI-modellen laden en views naar tabellen wegschrijven. |
| **PowerBI Model refreshes** | Status van modelvernieuwingen. |
| **Persisted Views** | Status van gepersisteerde views. |

## Omgeving wisselen

Heeft je installatie meerdere omgevingen? Wissel ze via de **dropdown linksboven**. Het actieve milieu (Development / Test / Production) staat sinds v1.53 prominent linksboven.
