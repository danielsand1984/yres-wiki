---
title: SAP HANA
sidebar_label: SAP HANA
description: SAP HANA koppelen aan Yres — verbindingseisen.
---

# SAP HANA

**Categorie:** OData  ·  🏅 Official partner

SAP HANA in-memory database. Official partner. Koppelt via OData én een directe ODBC/BDC-verbinding.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

SAP HANA koppelt via een **directe ODBC**-verbinding of via een **XS OData**-service.

- **Host en SQL-poort** — Bij een ODBC-verbinding heb je de hostnaam van de HANA-server en de SQL-poort nodig. De SQL-poort volgt het patroon `3<instance>15` (bv. `30015` voor instance `00`); bij een tenant-database (MDC) is dit `3<instance>13` voor de system-DB of een tenant-specifieke poort. Een SAP-/HANA-beheerder kan deze bevestigen.
- **Databasegebruiker** — Een HANA-DB-gebruiker met wachtwoord en leesautorisatie (`SELECT`) op de betreffende schema's/objecten.
- **OData-alternatief** — Als data via een XS OData-service is gepubliceerd, gebruik je de service-URL `https://<host>:<port>/<path>.xsodata`.

Officiële docs: [Connect to SAP HANA via ODBC (SAP Help Portal)](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/66a4169b84b2466892e1af9781049836.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
