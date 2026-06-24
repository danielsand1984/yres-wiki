---
sidebar_position: 1
title: Integraties — overzicht
description: Yres koppelt databases, ERP-systemen, API's en cloudapplicaties binnen je eigen Azure omgeving.
---

# Integraties

**Yres koppelt databases, ERP-systemen, API's en cloudapplicaties binnen je eigen Azure omgeving. Zonder maatwerk, zonder scripts.**

Voeg nieuwe databronnen toe zonder extra handwerk. Je doorloopt per bron een wizard waarin je het brontype, de verbindingsgegevens en de integration runtime invult; Yres genereert daarna automatisch de bijbehorende Azure Data Factory-pipelines. Zo standaardiseert Yres hoe data wordt geladen en gestructureerd, zodat je opzet consistent blijft terwijl die groeit.

## Categorieën

Bronnen vallen onder één of meer koppeltypes. Deze categorieën komen overeen met de indeling in de [integratiecatalogus](./catalogus.md).

| Categorie | Wat het is |
|---|---|
| **Directe koppelingen** | Native connectoren naar databases en applicaties (o.a. SQL Server, MySQL, Oracle, Exact Online, AFAS) |
| **OData** | Koppeling via het OData-protocol (o.a. SAP, CBS, Microsoft Graph) |
| **REST** | Koppeling via REST API's (generiek, plus o.a. Monday, Salesforce, Mendix) |
| **Custom** | Maatwerk op basis van de database-, OData- en REST-integraties |

Sommige bronnen (Mendix, Monday, Salesforce, Microsoft Graph) koppelen via meerdere protocollen en staan daarom onder meerdere categorieën.

➡️ Bekijk de volledige [integratiecatalogus](./catalogus.md).

## Hoe een bron koppelt

Elke bron volgt hetzelfde patroon, ongeacht de categorie:

- **Wizard-gestuurd.** Je voegt een bron toe via de "Bron toevoegen"-wizard. Je geeft een unieke **bronnaam** op (2–45 tekens, begint met een letter), kiest het **type**, selecteert de **integration runtime** en vult de verbindingsgegevens en eventuele inloggegevens in.
- **Inloggegevens blijven in je eigen Azure.** De webapp slaat zelf geen geheimen op. Wachtwoorden, tokens en sleutels worden weggeschreven naar de **Azure Key Vault** in je eigen tenant (per bron onder `adf-{bronnaam}-…`). De gegenereerde linked service in Data Factory verwijst alleen naar die secrets.
- **Integration runtime — cloud of self-hosted.** Voor bronnen die vanuit de cloud bereikbaar zijn, gebruik je de standaard **`AutoResolveIntegrationRuntime`**. Voor bronnen achter een firewall of in een lokaal netwerk (on-premises databases, bestandsservers, lokale bestanden) selecteer je een **self-hosted integration runtime**.

:::note Lokale netwerken
Bronnen in een lokaal netwerk worden vanuit Azure Data Factory bereikt via een **self-hosted Integration Runtime (IR)**. Beschikbaar in alle pakketten.
:::

De exacte verbindingsvelden, het authenticatietype en de vereisten verschillen per bron. Zie de individuele bronpagina's onder **Bronnen (A–Z)** of de [integratiecatalogus](./catalogus.md) voor de details per bron.

## Staat jouw bron er niet tussen?

Via onze database-, OData- en REST-integraties ondersteunen we veel meer dan we kunnen tonen. Neem contact op en we kijken samen of we jouw scenario kunnen ondersteunen en hoe snel dat gerealiseerd kan worden.
