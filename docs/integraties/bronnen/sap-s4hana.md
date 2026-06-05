---
title: SAP S/4HANA
sidebar_label: SAP S/4HANA
description: SAP S/4HANA koppelen aan Yres — verbindingseisen.
---

# SAP S/4HANA

**Categorie:** OData  ·  🏅 Official partner

SAP S/4HANA ERP. Official partner. Koppelt via OData én een directe ODBC/BDC-verbinding.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

S/4HANA koppelt via **OData** (en eventueel een directe ODBC/BDC-verbinding).

- **OData-service activeren** — Een Basis-/SAP-beheerder activeert de gewenste OData-service in de SAP Gateway. Gebruik daarvoor transactie `/IWFND/MAINT_SERVICE` (Service Maintenance): voeg de service toe via *Add Service*, kies het systeemalias van het back-end-systeem (bv. `LOCAL`) en activeer de service. De status moet *Active* zijn.
- **Service-URL** — De aangeroepen URL heeft de vorm `https://<host>:<port>/sap/opu/odata/<namespace>/<service_name>`. Host en poort zijn die van de SAP Gateway/het ICM (vaak de HTTPS-poort `443` of `5<instance>43`). Test de service eventueel met transactie `/IWFND/GW_CLIENT`.
- **Authenticatie** — Basic authentication met een SAP-(communicatie)gebruiker, of OAuth indien de Gateway daarvoor is ingericht. De gebruiker heeft leesautorisatie nodig op de onderliggende data.

Officiële docs: [Activate OData Service in the SAP Gateway Hub (SAP Help Portal)](https://help.sap.com/docs/ABAP_PLATFORM_NEW/cc0c305d2fab47bd808adcad3ca7ee9d/1b023c1cad774eeb8b85b25c86d94f87.html).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
