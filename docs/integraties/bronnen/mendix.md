---
title: Mendix
sidebar_label: Mendix
description: Mendix koppelen aan Yres — verbindingseisen.
---

# Mendix

**Categorie:** Directe koppeling · REST

Low-code applicatieplatform. Koppelt via meerdere protocollen.

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Mendix koppelt via **REST/OData** met door de Mendix-app gepubliceerde OData-services.

- **OData-service publiceren** — Voeg in de Mendix-app (Studio Pro) een *Published OData service* toe en exposeer de gewenste entiteiten/resources. De *location* bepaalt het pad, bijv. `svc/products/v1/`.
- **Service-URL** — Een overzicht van gepubliceerde services staat op de root-URL van de app gevolgd door `/odata-doc/` (bijv. `https://<app-host>/odata-doc/`). De service zelf draait op `https://<app-host>/<location>/`.
- **Credentials** — Stel in dat de service authenticatie vereist (bv. een Mendix-gebruikersrol of API-key/Basic-auth, afhankelijk van de app-configuratie) en lever die gebruiker/sleutel aan.

Officiële docs: [Published OData Services (Mendix Documentation)](https://docs.mendix.com/refguide/published-odata-services/).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
