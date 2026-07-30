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

De grootste release tot nu toe: naast de webapp is ook het complete dataplatform (database + ADF)
onder handen genomen. Hieronder de hoofdlijnen per thema; de gelinkte wiki-pagina's beschrijven de
details van elk onderwerp.

### Upgrade & breaking changes

- **Upgraden kan alleen vanaf v1.50.** Oudere omgevingen upgraden eerst naar 1.50.
- **IRIS → Yres, ook in de database en ADF.** De upgrade hernoemt het maatwerkschema `CustomIris` naar
  `CustomYres` (eigen objecten verhuizen mee), kolommen `Iris*` naar `Yres*` (zoals `YresLastUpdated`),
  de databaserol naar `Yres_MANAGED_USERS` en de versiesetting naar `YRES_VERSION`. In ADF heten alle
  pipelines voortaan `… YRES` in plaats van `… IRIS`, de linked service `IrisDwh` werd `YresDwh` en het
  data lake gebruikt de container `datalake-yres`. **Eigen rapporten, SQL of scripts die de oude namen
  gebruiken moeten worden aangepast.**
- **Surrogate keys worden bij de upgrade opnieuw opgebouwd** volgens een nieuw, botsingsvrij sleutelmodel
  (`intKey` als doorlopende teller per tabel; `jsonKey` blijft beschikbaar voor eigen uitbreidingen).
  → [Historie & SCD2](../concepten/historie-scd2.md)
- **Deployvolgorde:** de database-upgrade hoort altijd vóór de ADF-publish — de nieuwe pipelines
  gebruiken procedures die oudere databases nog niet hebben.
- **De Data Lake bevat voortaan mutaties in plaats van momentopnames.** Wie data uit de lake leest,
  moet mee: de bestanden staan op een nieuw pad, bevatten alleen de gewijzigde rijen van die run en
  dragen een `I`/`U`/`D`-markering. Bestaande bestanden blijven staan, maar er komt niets meer bij op
  het oude pad. → [Lake feed](../concepten/lake-feed.md)
- **Eerder gewijzigde doelnamen worden alsnog doorgevoerd.** Tot nu toe veranderde het aanpassen van
  een doelnaam of doelschema (de *Overwrite*-velden) niets aan de database: de tabel bleef onder zijn
  oorspronkelijke naam staan. Vanaf 1.56 hernoemt Yres de fysieke tabellen wél — ook voor wijzigingen
  die je in het verleden maakte en die nooit effect hadden. Loop daarom vóór de upgrade je gewijzigde
  tabellen na en zet een naam terug als je de oude wilt houden.
  → [Doelnamen wijzigen](../setup/databron-koppelen.md#doelnamen-wijzigen-na-aanmaken)
- **SharePoint-bronnen hebben nieuwe rechten nodig.** Microsoft heeft de app-only-flow via Azure ACS
  uitgezet, waardoor SharePoint-loads faalden. Yres gebruikt nu Microsoft Graph; geef de geregistreerde
  app daarom **application permissions** op Microsoft Graph (minimaal `Sites.Read.All`) met admin
  consent. De oude machtiging via `appinv.aspx` volstaat niet meer.
  → [SharePoint](../integraties/bronnen/sharepoint.md)

### Webapp

- **Branding:** IRIS heet voortaan **Yres** in de hele webapp (e-mails, UI, vertalingen); bij de update naar 1.56 worden oude triggers met de legacy-merknaam opgeruimd.
- **Projects & changes:** herontworpen changes-tabel met environment-entries per change; gerelateerde changes zichtbaar vanuit de object viewer. → [Wijzigingsproces](../concepten/wijzigingsproces.md), [Projecten & changes](../frontend/projecten-changes.md)
- **Multi-tenancy:** subdomein per organisatie, Azure SSO-redirect naar de juiste organisatie, en het aantal omgevingen gekoppeld aan het abonnement. → [Admin](../frontend/admin.md)
- **Oracle & MySQL vernieuwd:** de linked services zijn bijgewerkt naar de nieuwste connectorversies — property-gebaseerd in plaats van een connection string, MySQL met SSL. → [Oracle](../integraties/bronnen/oracle.md), [MySQL](../integraties/bronnen/mysql.md)
- **Bronnen & connectiviteit:** nieuwe REST-service-presets, verfijnde REST-paginering, en **Test connectivity** vanuit de webapp. → [Integraties](../integraties/overzicht.md)
- **Monitoring & health:** nieuwe health bar met DWH-statistieken; pipeline-runs met filters. → [Monitoring & logging](./monitoring-logging.md)
- **Data engineering & object viewer:** git-diff en syntax highlighting, uitgebreidere mapping van scripted objects, en wizard-verbeteringen. → [Data engineering](../frontend/data-engineering.md)
- **Triggers met meerdere dagen én tijdstippen:** één trigger kan nu bijvoorbeeld elke maandag én zaterdag om 01:00, 05:00 en 09:00 draaien. Uren, minuten, weekdagen en maanddagen kies je als meervoudige selectie, aangevuld met terugkerende voorkomens als "laatste vrijdag van de maand"; een samenvatting toont vooraf alle uitvoermomenten. Voorheen was elk dag/tijd-paar een aparte trigger. → [Triggers](../frontend/load-management.md#meerdere-dagen-en-tijdstippen-in-één-trigger)
- **Archiveringspipeline uit de doos:** bij het bijwerken van een omgeving naar 1.56 wordt de `Dynamic Archiving Workflow YRES` automatisch aangemaakt, inclusief de bijbehorende archiefopslag. Je kunt hem daarna gewoon vanuit **Run pipelines** starten en met een trigger inplannen. Elke pipeline met Source/Schema/Table-parameters krijgt bovendien die drie als kolommen én filters in de runhistorie — dus ook de archiveringsworkflow. → [Load management](../frontend/load-management.md)
- **Beheer & beveiliging:** admin secrets-view, credential-vervalnotificaties, encryptie van credentials en jobs, Azure Redis-cache, en robuustere Azure DevOps-integratie.
- **Opgeloste fouten:** het handmatig starten van een pipeline en het aanmaken van een trigger gebruikten soms een verouderde merknaam, waardoor de actie op een niet-bestaande pipelinenaam stukliep; het rechtermuisknop-menu in **Changes** en **Used tables** opende op de verkeerde plek zodra de pagina gescrold was; en het bijwerken van een grote organisatie kon voortijdig afbreken en daardoor dubbel draaien.

### Dataplatform — nieuw

- **Lake feed: de Data Lake als change feed.** De Data-Lake-uitvoer is herbouwd. In plaats van elke run
  de volledige stagingtabel te dumpen, schrijft Yres nu per run één Parquet-bestand met **alleen de
  mutaties**, elk gemarkeerd als insert, update of delete — inclusief expliciete tombstones voor
  verwijderde rijen, die voorheen onzichtbaar waren. Daarmee is uit de lake zowel de actuele stand als de
  volledige historie af te leiden, en is de feed direct bruikbaar als invoer voor een Delta-tabel. Runs
  zonder wijzigingen schrijven niets, een herstart overschrijft zijn eigen bestand, en de lake-stap loopt
  parallel aan het laden van het datawarehouse. Aanzetten doe je per tabel met `DataPlatform = DL`.
  → [Lake feed](../concepten/lake-feed.md)
- **De testsuite wordt meegeleverd.** De regressietestsuite die elk databaseobject doorlicht, zit nu in
  de DACPAC en komt dus met elke versie mee. Na een deploy of bij twijfel draai je hem zelf met
  `EXEC Test.spRunAll` — hij is veilig op productie, ruimt bewijsbaar op en draait nooit uit zichzelf.
  → [Testsuite](./testsuite.md)
- **Workload-administratie:** workflows plannen hun volledige werklast vooraf in
  (`LoadManagement.LoadLog`) en werken die per load bij. De monitor toont daardoor ook **geplande en
  overgeslagen loads**, statussen komen uit de administratie zelf en looptijden kloppen. Een nieuwe
  `ADFLoadMonitor`-pipeline en een herbouwde garbage collection spiegelen de ADF-runstatussen terug naar
  de database, zodat een weggevallen run niet blijvend op "RUNNING" staat.
  → [Monitoring & logging](./monitoring-logging.md)
- **Retentiebeleid voor de logtabellen:** instelbaar per tabel via `Monitoring.RetentionPolicy`
  (standaard 90–365 dagen); de wekelijkse ADF-pipeline `Maintenance Retention YRES` schoont gebatcht op
  met vaste integriteitsgaranties (de laatste run per load en lopende loads blijven altijd staan) en een
  dry-run-modus; de trigger staat na installatie bewust uit. Voorheen groeiden de logtabellen onbegrensd.
  → [Retentie van de logtabellen](./monitoring-logging.md#retentie-van-de-logtabellen)
- **Metadata verversen is atomair:** alle GetMetaData-pipelines stagen de metadata en wisselen die in
  één transactie in — bij bronnen met meerdere services per onderdeel. Een mislukte of gelijktijdige
  refresh kan de kolomadministratie niet meer half leeg achterlaten.
  → [Metadata verversen](../frontend/data-sources.md#metadata-verversen-refresh-metadata), [Stored procedures](./sql/stored-procedures.md)
- **Delta-loads uitgebreid:** twee deltakolommen werken nu op alle SQL-/databasebronnen én op
  Salesforce, SAP SAC en AFAS; Exact Online kreeg datumdelta's, het loadtype ADDITIONAL delta-append,
  AFAS datatype-bewuste filters en **Oracle** volwaardige delta-ondersteuning.
  → [Load-types](../concepten/load-types.md), [Meerdere deltakolommen](../concepten/load-types.md#meerdere-deltakolommen)
- **REST-bronnen:** de request-URL wordt voortaan in de pipeline opgebouwd uit de basis-URL in Key Vault
  plus het endpoint (inclusief querystring-merge). → [REST-service](../integraties/bronnen/restservice.md)
- **Snowflake:** staging herschreven naar één Parquet-bestand met een instelbare stagingcontainer.
  → [Snowflake](../integraties/bronnen/snowflake.md)
- **Doelnamen wijzigen werkt nu echt.** Pas je bij een geregistreerde tabel de doelnaam of het
  doelschema aan, dan hernoemt Yres voortaan de fysieke tabellen: STAGE, HIS en — bij
  `DataPlatform = DL` — de lake-boekhoudtabel verhuizen mee, net als de surrogate keys van die tabel.
  Voorheen bleef de database op de oude naam staan terwijl de configuratie de nieuwe toonde. De
  hernoeming gebeurt bij de eerstvolgende *Update tables from dictionary* (de stap die ook in elke load
  meedraait) en is atomair: mislukt hij, dan staat alles nog op de oude naam. Wijst de nieuwe naam al
  naar een bestaand object, dan weigert Yres en logt dat.
  → [Doelnamen wijzigen](../setup/databron-koppelen.md#doelnamen-wijzigen-na-aanmaken)
- **Health checks:** de checkview is opgesplitst in modulaire groepen en uitgebreid met ~24 nieuwe
  configuratie-integriteitschecks. → [Admin → Health checks](../frontend/admin.md)
- **Wijzigingsproces gehard:** veertien fouten in release/import/install opgelost, plus een leesbare
  release-historie per change (`Change.vwLogs`). → [Wijzigingsproces](../concepten/wijzigingsproces.md)
- **DB-tier-scaling:** naast de "Default"-tier is nu ook een "High"-tier configureerbaar waarnaar
  workflows tijdens zware loads kunnen opschalen.
- **Archivering:** per tabel kiezen tussen `CLOSED` (afgesloten SCD2-versies) en `BUSINESS` (data ouder dan X jaar op een datumkolom); de workflow kopieert naar een eigen `archive/`-pad in de Data Lake, verifieert de rowcount en schoont pas daarna op (dubbel gegate, standaard copy-only); gearchiveerde data wordt bij het laden geblokkeerd zodat ze niet terugkeert; per tabel een automatische `_IncArchive`-unionview (live + archief); nieuwe health checks bewaken de configuratie. De archiveringsworkflow wordt bij de update automatisch aangemaakt en is vanuit de webapp te starten en in te plannen; welke tabellen archiveren stel je in deze versie nog in de database in, niet in de webapp. → [Archivering](../concepten/archivering.md)

### Dataplatform — stabiliteit & performance

- **Stabiliteitsfixes:** een brede reeks fixes in het laadmechanisme (typemappings, delta-filters,
  paginering, monitoring-statussen en foutafhandeling) en in de CI/CD-mechanismes (wijzigingsproces,
  release/import/install en deployment). → [Monitoring & logging](./monitoring-logging.md),
  [Wijzigingsproces](../concepten/wijzigingsproces.md)
- **Performance-verbeteringen:** de SCD2-merge is op zijn hotspots herschreven en de workflow-planning
  schaalt niet meer mee met de monitoringhistorie of het aantal tabellen — vooral merkbaar op grote
  omgevingen. Daarnaast blokkeren de **logstappen het echte werk niet meer**: ze draaien voortaan naast
  de laadactiviteiten in plaats van ervoor, wat per tabel wachttijd scheelt. Er verdwijnt geen logregel;
  wel kunnen regels binnen dezelfde load in een iets andere volgorde in de monitoring verschijnen.
- **SharePoint werkt weer:** de bestandsophaal is overgezet op Microsoft Graph nu Microsoft de oude
  app-only-authenticatie heeft uitgezet. Yres zoekt het bestand nu via site → documentbibliotheek →
  bestand en haalt het op via een tijdelijke kopie in de Blob Storage van de omgeving. Let op de
  gewijzigde rechten en de betekenis van de bestandslocatie.
  → [SharePoint](../integraties/bronnen/sharepoint.md)
- **Bestandsbronnen — deltavenster gecorrigeerd:** meervoudsvormen als `DAYS` en `HOURS` werden niet
  herkend en vielen stil terug op seconden, en `YEAR` rekende met 365 uur in plaats van 365 dagen.
  Beide zijn opgelost; een tabel met zo'n instelling pakt na de update een breder en correct venster op.
  → [Deltavenster bij bestandsbronnen](../concepten/load-types.md#deltavenster-bij-bestandsbronnen)
- **Datatype-mappings opgeschoond:** een brede correctieronde op de standaard type-mapping. Kolommen die
  als `rowversion` in het datawarehouse belandden (SQL Server, DB2, MySQL, OneStream) worden nu correct
  als binaire waarde of datum aangemaakt, mappings naar typen die SQL Server niet kent (`blob`, `bool`,
  `byte`) zijn vervangen, Salesforce-adreskolommen worden niet meer op één teken afgekapt, Snowflake
  `VARIANT` mag weer lange waarden bevatten, en dubbele mappingregels — die willekeurig gedrag gaven —
  zijn verwijderd. Ontbrekende regels worden bij de deploy hersteld.
- **Automatisch remodelleren robuuster:** een bronwijziging die meerdere tabellen tegelijk raakte, liep
  na de eerste tabel vast, en een `rowversion`-kolom kon helemaal niet geremodelleerd worden. Beide
  zijn opgelost. → [Wijzigingsproces](../concepten/wijzigingsproces.md)
- **DB2-metadata:** het ophalen van de kolomstructuur van een DB2-bron leverde een onvolledige
  administratie op, waardoor tabel- en kolomlijsten in de webapp leeg of incompleet bleven. Opgelost.
- **Minder valse meldingen in de health checks:** de check op verweesde metadata markeerde de hele nog
  niet gebruikte broncatalogus als dode metadata. Hij slaat nu alleen nog aan op metadata van bronnen
  die niet meer bestaan of inactief zijn. → [Admin → Health checks](../frontend/admin.md)
- **Bestandsbronnen — compressie:** de compressievorm van een bronbestand blijft nu behouden wanneer de
  tabelconfiguratie wordt bijgewerkt; voorheen ging die instelling bij elke wijziging verloren.

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
