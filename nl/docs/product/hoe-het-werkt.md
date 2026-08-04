---
sidebar_position: 4
title: Hoe het werkt
description: Eén platform, van databron tot dashboard — bronnen en tabellen leg je vast in wizards, Yres genereert de Azure Data Factory-pipelines.
---

# Hoe het werkt

> Eén platform, van databron tot dashboard. Je legt *wat* er geladen moet worden vast in wizards; Yres genereert daar de Azure Data Factory-pipelines van. Je schrijft geen code.

Yres draait volledig binnen je **eigen Azure-omgeving** en automatiseert de hele keten van bron naar betrouwbaar dashboard. Onder de motorkap is alles **metadata-gestuurd**: een bron toevoegen betekent metadata-rijen invoegen, geen pipeline bouwen. Hoe één load precies van trigger tot gehistoriseerde data loopt, lees je in [Gegevensstroom](../concepten/gegevensstroom.md).

## 1. Koppel je bronnen zonder code

Native connectoren met Exact Online, AFAS, SAP, Salesforce, databases (SQL Server, MySQL, PostgreSQL, Oracle, Snowflake, DB2), OData, REST API's en meer. Je voegt een bron toe via een wizard — geen maatwerk. Zie de [integratiecatalogus](../integraties/catalogus.md).

![Create source-wizard: stap 1 van 2 met velden voor bronnaam, type, integration runtime en credentials](/img/screens/source-create-wizard.png)

*De "Create source"-wizard. Je vult in *welke* bron je koppelt; de credentials gaan rechtstreeks naar je eigen Azure Key Vault, niet naar Yres.*

(1) **Bronnaam** — uniek (2–45 tekens); wordt de naam van de linked service en de bijbehorende Key Vault-secretgroep.
(2) **Type** — kies het brontype (database, ERP, REST, OData, bestandsbron, …).
(3) **Integration runtime** — `AutoResolveIntegrationRuntime` voor cloud-bereikbare bronnen, of een self-hosted IR voor on-prem en achter-de-firewall bronnen.
(4) **Credentials** — gelden ze voor alle omgevingen of per omgeving? De frontend slaat zelf nooit geheimen op: ze worden in je **Azure Key Vault** gezet en de linked service verwijst ernaar.

## 2. Configureer in wizards, Yres genereert de ADF-pipelines

Yres heeft **geen visuele pipeline-designer** waarin je componenten op een canvas tekent. In plaats daarvan leg je in wizards vast *wat* er moet gebeuren — bronnen, tabellen, laadtypes en sleutelkolommen — en Yres genereert daar automatisch de bijbehorende **Azure Data Factory (ADF)**-pipelines en linked services van.

- Je voegt tabellen toe en kiest per tabel een [laadtype](../concepten/load-types.md) (zoals FULL, DELTA of IMAGE).
- Op basis van die metadata genereert Yres de ADF-objecten; de generieke `Dynamic Workflow YRES`-pipeline voert de loads uit en roept de SQL-laadengine aan.
- Bestaande, handmatig gebouwde ADF-pipelines kunnen naast Yres in dezelfde Azure-omgeving blijven draaien.

:::tip Metadata-gestuurd, niet visueel ontworpen
Een bron of tabel toevoegen is metadata invoeren. Yres vertaalt die metadata naar ADF-pipelines — jij hoeft geen pipeline te bouwen of te onderhouden. De rode draad onder dit alles staat in [Gegevensstroom](../concepten/gegevensstroom.md).
:::

:::note Eigen ADF-pipelines blijven werken
Bestaande, handmatig gemaakte ADF-pipelines blijven naast Yres draaien. Voor eigen pipelines is er in de factory de map **`PW - Yres/Custom`** waarin klanten hun eigen pipelines onderhouden.
:::

## 3. Automatische health checks en monitoring

Yres geeft inzicht in je laadprocessen: per-pipeline timelines, per-stap status en foutmeldingen worden gelogd in het datawarehouse en zijn zichtbaar in de webapp. Daarnaast draaien er **automatische health checks** die de inrichting en instellingen van je omgeving controleren (gedreven door de view `[Maintenance].[vwYresChecks]`).

- **Monitoring** — laadstatus, doorlooptijden en aantallen verwerkte rijen, per run en per stap. Zie [Load Management](../frontend/load-management.md).
- **Health checks** — periodieke controles op je omgeving en instellingen, zodat afwijkingen vroeg zichtbaar worden.

:::note Kostenmonitoring
Yres heeft **geen ingebouwde kostenmonitoring**. Omdat elke organisatie × omgeving een **eigen Azure-resourcegroup** heeft, volg je de kosten eenvoudig **per resourcegroup** in Azure.
:::

---

## De demo

Geen standaard sales-demo. In een vrijblijvend gesprek met een data-architect kijken we samen naar je huidige Azure-omgeving, bespreken we knelpunten en laten we zien hoe Yres helpt.

**Wat je kunt verwachten:**

1. **Analyse van je huidige data-omgeving** — hoe is je platform ingericht, welke bronnen gebruik je, waar zitten de uitdagingen?
2. **Demonstratie van Yres** — een live demo van hoe bronnen, tabellen, laadtypes en workflows binnen Azure worden geconfigureerd en geautomatiseerd.
3. **Toepassing op jouw situatie** — waar valt winst te behalen in stabiliteit, beheer en schaalbaarheid?

> Binnen 30 minuten weet je of Yres bij je past.

