---
sidebar_position: 1
title: Dashboard
description: The home screen of the Yres web app.
---

# Dashboard

After logging in you land on the **Dashboard**: the key metrics for your environment. Click the logo in the top left (this can be your own company logo) to return to this screen at any time.

![The web app: the icon rail on the left (the sections), the section cards, and the environment switcher at the top.](/img/screens/dashboard-nav.png)

## Components

| Component | What you see |
|---|---|
| **Jobs** | All jobs in the selected environment with status and logs. Actions performed via ADF include a direct link to the ADF monitor. |
| **Error logs** | All database errors from the last **3 days** — when creating tables, installing changes, updating sources, and detailed load steps. |
| **Announcements** | Messages from your admin as well as general announcements from Yres (releases, downtime, info). |
| **Load statusses** | Loads grouped per source system; only the latest result per source object. The period can be set in the top right. The log icon shows the detail steps, and the link icon jumps to the ADF monitor. |
| **Non-source-specific processes** | E.g. loading Power BI models and writing views to tables. |
| **PowerBI Model refreshes** | Status of model refreshes. |
| **Persisted Views** | Status of persisted views. |

## Switching environments

Does your installation have multiple environments? Switch between them using the **dropdown in the top left**. The active environment (Development / Test / Production) has been displayed prominently in the top left since v1.53.
