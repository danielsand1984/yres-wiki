---
title: Release notes
sidebar_position: 3
description: Versiehistorie van Yres DWH (v1.47 t/m v1.56), met breaking changes en nieuwe bronnen.
---

# Release notes

Versiehistorie van Yres DWH. Oudere versies kunnen niet meer ondersteund zijn; ze blijven hier staan voor
naslag. Per versie staan de nieuwe features, verbeteringen en eventuele breaking changes.

:::note Datums uit de productdocumentatie
De datums per versie hieronder komen uit _Yres Documentation 1.55_ (release-notes-sectie). Yres-versies
ordenen als decimale breuken — **1.9 staat dus na 1.55, en 1.56 ervoor** — niet als semver.
:::

## v1.56 — in test

:::note Samengesteld uit de repository-historie (release-candidate in test)
Anders dan de oudere versies (overgenomen uit _Yres Documentation 1.55_) is deze lijst samengesteld uit de
commit- en PR-historie van de **`test`-branch** van `yres_backend` en `yres_frontend` — de release-candidate
die op dit moment voor 1.56 wordt getest — vanaf **1 oktober 2025**. Groepering en formulering zijn afgeleid
uit die historie; de definitieve inhoud en releasedatum kunnen nog wijzigen.
:::

- **Branding — IRIS heet voortaan Yres:** de productbrede hernoeming **IRIS → Yres** is in de hele webapp
  doorgevoerd (e-mails, UI-teksten, vertalingen). Bij het updaten naar 1.56 worden bovendien oude triggers
  met de legacy-merknaam opgeruimd (met een waarschuwing vooraf). (In code, Azure-resources en `IRIS_DWH`
  staat op veel plaatsen nog "IRIS".)
- **Projects & changes — herontworpen changes-tabel:** de change-managementtabel is opnieuw vormgegeven, met
  o.a. **environment-entries** per change; (soft-)verwijderde changes worden niet meer getoond; vanuit de
  **object viewer** zie je de gerelateerde changes van een object en klik je door naar /changes;
  projectfilters (achter een feature flag).
- **Multi-tenancy & subdomeinen:** **subdomein per organisatie** (in 1.55 voorbereid, nu uitgerold) met
  OAuth-redirects (o.a. Exact Online) naar het juiste subdomein incl. organisatie-UUID; **Azure SSO** leidt
  door naar de juiste organisatie; het **aantal omgevingen** is gekoppeld aan het abonnement (plan type);
  melding wanneer een bron niet in een omgeving is geïnstalleerd. Organisatie-afbeeldingen in blob storage,
  **login-theming** en **favicons per omgeving**; organisaties aanmaken/bijwerken via een achtergrond-job
  met deploy-statusweergave.
- **Bronnen & connectiviteit:** **Oracle** als nieuw bronsysteem; **MySQL** koppelbaar zonder connection
  string en met afgedwongen **SSL**; nieuwe **REST-service-presets** plus help bij de API-specificatie;
  verfijnde **REST-paginering** (offset-object) en ondersteuning voor **auth-headers met underscores**;
  **Test connectivity** om een verbinding rechtstreeks vanuit de webapp te testen; Snowflake-fixes
  (auth/typemapping).
- **Monitoring & health:** nieuwe **health bar** met DWH-statistieken (waaronder het aantal actieve
  gebruikers); **pipeline-runs-UI** met filters; AdaptiveIndexDefragmentation-pipeline opgenomen in de
  pipelinelijst; optie om **rebuilding uit te schakelen**.
- **Beheer & beveiliging:** **admin secrets-view** (secrets inzien vanuit het beheer);
  **credential-vervalnotificaties** voor verlopende credentials; **encryptie** van gecachte credentials,
  cache-waarden en jobs; **Azure Redis-cache** (met TLS); robuustere **Azure DevOps-integratie** (resources
  opnieuw aanmaken als ze niet van de PAT-gebruiker zijn, DevOps-token maskeren, betere foutafhandeling);
  validatie van remote URL's; CORS-fix.
- **Feedback & internationalisatie:** het feedbackformulier stuurt naar **feedback@yres.app**; vertalingen
  via een **translations-API** voor de UI (live bij te werken).
- **Data engineering & object viewer:** **git-diff en syntax highlighting** in de object viewer;
  uitgebreidere **mapping van scripted objects**. UsedTables-wizard: **zoeken in dropdowns**, **sorteren per
  kolom**, bepaalde **kolomnamen blokkeren**, overschrijven bij edit blokkeren, alle nullable key-kolommen
  tonen bij update en extra **laadtypes voor file-bronnen**; `rowhash`-tooltip en een duidelijke
  **keepStage-waarschuwing**.
- **Data & loading (data-plane):** de metadata-refresh is **transactioneel** gemaakt — een mislukte of halve
  refresh wist je bestaande kolommen niet meer (stage → atomische swap, per onderdeel bij
  ExactOnline/AFAS/SAC). Zie [Metadata verversen](../frontend/data-sources.md#metadata-verversen-refresh-metadata).

## v1.55 — september 2025

- **Data & loading:** kolommen kiezen die meetellen bij het vergelijken van rijen om gewijzigde records
  (changed records) te bepalen.
- **Bronnen & connectiviteit:** Yres beheert Integration Runtimes nu vanuit de frontend (beter bij rebuild
  en upgrade naar een nieuwere versie); bestaande IR's zijn te "importeren" in de nieuwe opzet.
- **UI:** actieknoppen in de datasource-menu's verplaatst naar een ⫶-menu om ruimte te besparen;
  REST-bronnen kiezen voortaan default-waarden voor centraal beheerde settings (zoals `KeepStage` en
  row-/columnstore); REST-bronnen worden benoemd naar hun target in plaats van het bron-endpoint;
  File- en REST-bronnen vereisen voortaan Project + change aan het begin van de wizard.
- **Lifecycle management:** **environment comparison** — SQL-definities vergelijken tussen omgevingen, met
  volledige diff-view (tussen versies of tussen omgevingen); nieuwe setting op organisatieniveau om
  specifieke ADF-objecten uit te sluiten bij het publiceren van changes naar ADF.
- **Automation & pipelines:** main pipelines kunnen worden gekopieerd naar een nieuwe versie.
- **Security:** backend-URL's op basis van UUID's (geen voorspelbare endpoints); nieuwe installaties
  vereisen een extra property ter voorbereiding op subdomeinen per organisatie; client & secrets waarmee
  Yres bij de Azure-tenant van de organisatie komt, zijn beheerbaar door admins.

## v1.54 — juli 2025 

- **Data & loading:** tabellen deactiveren zodat ze tijdelijk buiten loads blijven; loads starten direct
  vanuit het datasource-menu; persist view direct vanuit het Persist View-menu.
- **Bronnen & connectiviteit:** refresh metadata voor 80+ bronnen; ondersteuning voor PAT-tokens in
  OneStream.
- **Monitoring & UI:** filteroptie in de pipeline-monitor; extra tijdselecties (1/4/8 uur); paging in de
  gemonitorde jobs; materialized views toegevoegd aan de monitor.
- **Projects & changes:** nieuw iteratief proces voor complexe dependencies; **naming overwrites** tussen
  dev, test en prod (voor bronnen die per omgeving andere objectnamen hebben, bijv.
  `ERP_DEV.Customers` / `ERP_TST.Customers` / `ERP.Customers`).
- **Automation & pipelines:** persist view vanuit de main pipeline; custom bronnen selecteerbaar bij het
  starten van loads; parallelisme instelbaar voor loads; alternative load volledig beschikbaar.
- **Communicatie:** announcements nu beschikbaar voor organisatie-admins.

## v1.53 — mei 2025 

- **Data & loading:** **Delta Image** load mode (selectief specifieke periodes herladen, bijv. het vorige
  jaar, met verwijdering van verouderde records én behoud van historie); uitgebreide paging in REST-bronnen
  (RFC 5988, offset-based, looped page traversal, body-result-URL); schaalbare verwerking via paging
  (100M+ records); PowerBI Models verversen binnen loads.
- **Nieuwe bronnen:** **OneStream**, **SAP Business Data Cloud** (`SAP_BDC`) en **Simplicate**;
  OpenAPI-support voor REST (`openapi.json` / `swagger.json`, endpoints visueel selecteerbaar); **custom**
\*\*  database deployment\*\* (deployen op een eigen bestaande Azure-database in plaats van de standaard embedded
  database).

  :::info SAP Business Data Cloud ≠ SAP Datasphere
  De bron die in deze release is toegevoegd is **SAP Business Data Cloud** (backend-brontype `SAP_BDC`).
  Dit is een ander SAP-product dan **SAP Datasphere**; in de ADF-templates zijn het gescheiden connectoren.
  Behandel beide als gerelateerd maar afzonderlijk.
  :::

- **Monitoring & UI:** actieve omgeving (Development/Test/Production) prominent linksboven; nieuw
  monitoring-dashboard met historie, tabelgroottes in MB en rowcounts; verbeterde upgrade- &
  rebuild-monitoring; resizable sidebar; refresh-knop in de webapp; deep links werken (een gedeelde link
  opent voortaan de juiste pagina).
- **Tabel- & schemabeheer:** vernieuwde table-creation flow (datatypes per veld instelbaar bij aanmaken);
  tags toevoegen aan bronnen boven de tabellen; column-usage-analyse (ongebruikte kolommen opsporen en hun
  gebruik traceren).
- **Projects & changes:** bestaande database-objecten uit de object-tree opnemen in changes; dependencies
  en/of content meenemen in changes; metadata van Dev standaard meenemen naar Prod; scripted objects
  zichtbaar in de change-content-overview.
- **Automation & pipelines:** **Master Pipeline**-feature (acties sequentieel/conditioneel uitvoeren op
  succes of falen van voorgaande stappen, inclusief conditionele Power BI-refresh); alternative load
  ("Run full, Image, Overwrite of Reload once" — bijv. door de week delta's en in het weekend een volledige
  reload); garbage-collection-pipeline in ADF; custom ADF-pipelines triggeren vanuit de frontend.
- **Communicatie:** admin-messaging naar alle applicatiegebruikers.
- **Installatie & configuratie:** vereenvoudigde installatie via een e-maillink; Azure-variabelen (ADF-naam,
  resource group, subscription) opgeslagen in `config.settings`.
- **Verbeteringen:** alle timestamps in **UTC** (weergave in eigen tijdzone); duidelijkere foutmeldingen;
  fix voor IMAGE-loads die in de staging-stap konden falen en alle target-records sloten.

## v1.52 — januari 2025 

:::warning Breaking change (herinnering)
De view `[Monitoring].[LoadMonitor]` is in release **1.51** vervangen door `[Monitoring].[Monitor]`. Beide
views blijven co-existeren tot versie **1.53**, waarna `[Monitoring].[LoadMonitor]` wordt verwijderd.

> Let op: dit betreft de webapp-gerichte monitoring-view. In de huidige `IRIS_DWH`-database loopt
> load-monitoring via de views `vwLoads` (pipeline-timeline) en `vwMonitor` (breder). Zie
> [SQL-interactie](sql-interaction.md).
> :::

- **Security & gebruikers:** SSO verplicht per gebruiker (admins kunnen SSO afdwingen, in het Users & Roles-menu).
- **Database object viewer:** alle database-objecten tonen (ook objecten die níét door of met Yres zijn
  aangemaakt); definities in SQL bekijken, definities over tijd vergelijken en dependencies inzien.
- **Licensing:** een licentie wordt nu aan de database toegevoegd zodat Yres het gebruik kan begrenzen waar
  van toepassing; bestaande klanten kregen automatisch een volledige licentie.
- **oData / SAP:** ondersteuning voor JSON-objecten in oData-resultaten en gZip-compressie in oData-metadata
  (specifiek nodig voor SAP-loads).
- **Database scaling:** DB-scaling beter beheerd over meerdere workstreams (voorkomt dat de ene workstream
  de server terugschaalt terwijl een andere nog draait).
- **Nieuwe datatypes in table keys:** `XML`, `TEXT`, `NTEXT`, `IMAGE`, `GEOGRAPHY`, `GEOMETRY`, `HIERARCHYID`.
- **Verder:** nieuwe health checks; herontworpen Update Tables; nieuw Feedback-formulier (Bug report /
  Feature request / Feedback); "Panel" hernoemd naar Users & Roles; upgrade van LinkedServices in ADF
  (MySQL, PostgreSQL, Snowflake, custom dispatcher); bronnen zonder key beter ondersteund.

## v1.51 — september 2024 

:::warning Breaking change
De view `[Monitoring].[LoadMonitor]` is vervangen door `[Monitoring].[Monitor]`. Beide views co-existeren
tot versie **1.52**, waarna `[Monitoring].[LoadMonitor]` wordt verwijderd. _(De v1.52-herinnering hierboven_
_noemt 1.53 als verwijderversie — de productdocumentatie is op dit punt niet helemaal consistent.)_
:::

- **UI:** nieuwe homepage met monitors voor jobs, errors en loads; nieuwe datasource-picker; resizable en
  verbeterde modal windows.
- **Nieuwe bronnen:** meerdere **Azure Blob**-bronnen tegelijk; **generieke REST API's** (elke API die JSON
  teruggeeft; headers per service; auth: anonymous, header, basic, oAuth; query-parameters ondersteund;
  alleen GET-endpoints); **Salesforce**; **SAP Analytics Cloud** (SAC).
- **oData:** oAuth-support (client credential + authorization code); verplichte `OrderBy` verwijderd
  (voor services die geen OrderBy ondersteunen).
- **Security:** standaard-publicatie van de rol `[Yres_dbreader]` (lezen uit het ingestelde HIS-schema,
  STAGE- en systeemtabellen verborgen); Key Vault API-versie 7.4.
- **Loading:** ondersteuning voor **twee delta-kolommen** voor alle SQL-gebaseerde bronnen **behalve MySQL**
  (handmatig instelbaar via het `deltaColumn`-veld in `Loadmanagement.UsedTables`, komma-gescheiden, beide
  kolommen hetzelfde datatype; het systeem neemt de hoogste waarde).

## v1.50 — augustus 2024 

- Standaard support voor **surrogate keys** (systeembreed én per tabel).
- Table settings in de web-frontend: columnstore, inMemory, loadfilters, delta-offsets, page limits en
  package sizes (voorheen alleen via het SQL-endpoint).
- **Single environment** (alleen prod) mogelijk.
- Volledige logging in **UTC**, weergave in elke tijdzone.
- Nieuw data-engineering-menu; lijsten alfabetisch gesorteerd.

## v1.49 — juni 2024 

- Nieuw topmenu; beter inzicht in actieve jobs.
- Push-berichten voor afgeronde jobs, waar je je ook in de applicatie bevindt.
- Strikt databasebeheer: geen ongevraagde wijzigingen in settings, logs of objecten.

## v1.48 — april 2024 

- Nieuw topmenu en notificaties voor afgeronde jobs.
- Firewall specifiek voor de web-frontend.
- Directe links naar bestaande Azure-resources; nieuw rolbeheer.
- Actieve monitoring op bronwijzigingen die het dataplatform raken.

## v1.47 — januari 2024

- Nieuw audit-log voor webapp-gebruik.
- PowerBI-dashboard integreerbaar in Yres (voor uitgebreide load-monitoring).
- Gebruikers kunnen lid zijn van meerdere organisaties.
