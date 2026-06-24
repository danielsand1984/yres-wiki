---
sidebar_position: 2
title: Admin
description: Het Admin-paneel — gebruikers, rollen, omgevingen, DWH-instellingen, health checks en logs.
---

# Admin

Het Admin-paneel is de plek waar organisatiebeheerders Yres besturen: gebruikers en rollen, mededelingen,
beveiliging (firewall, secrets), het bijwerken van omgevingen en — per omgeving — de DWH-instellingen,
health checks en datawarehouse-logs.

De Admin-sectie kent twee niveaus:

- **Applicatiebreed** — geldt voor de hele organisatie en al haar omgevingen (bijv. gebruikers, rollen,
  mededelingen, firewall, applicatie-instellingen).
- **Environment admin** — instellingen en overzichten die per omgeving (dev / test / acc / prod) verschillen
  (bijv. DWH settings, health checks, DWH logs, Azure resources). Wissel van omgeving met de
  omgevingsschakelaar rechtsboven.

:::note Permissies
Niet elke gebruiker ziet alle Admin-schermen. De zichtbaarheid hangt af van de rol-permissies (zie
[Users & Roles](#panel--users--roles)). Organisatie-admins werken altijd binnen hun eigen organisatie.
:::

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in
[Webapp-schermen](../referentie/webapp-schermen.md).
:::

## Panel — Users & Roles

Route: `/admin/panel`. Het centrale beheerscherm met links een **Users**-tabel en rechts een **Roles**-tabel.

![Admin-paneel met een Users-tabel (naam, e-mail, rol, SSO) links en een Roles-tabel rechts.](/img/screens/admin-panel.svg)

Het scherm bestaat uit:

1. **Users-tabel** — toont per gebruiker `name`, `email`, `role` en of SSO actief is (`sso`).
2. **Add user** — maak een gebruiker aan met e-mail, rol en de keuze of Microsoft Azure single sign-on (SSO)
   verplicht is. Nieuwe gebruikers ontvangen een e-mail met een standaardwachtwoord, dat ze (samen met hun
   naam) zelf wijzigen in [Account settings](../frontend/account.md).
3. **Roles-tabel** — naast de standaardrollen kun je eigen rollen aanmaken.
4. **Permissies** — rollen volgen meestal een CRUD-structuur (Create / Read / Update / Delete) per
   permissietype. Permissies die niet in CRUD passen (zoals het bouwen van ADF-code) staan onder **"Other"**.
   Een aangemaakte rol koppel je aan een gebruiker via het rol-dropdown.

### Users
- Aanmaken met **e-mail**, **rol** en of **SSO** verplicht is.
- De nieuwe gebruiker krijgt een mail met standaardwachtwoord.

### Roles
- Standaardrollen plus eigen rollen, doorgaans **CRUD per permissietype**.
- Permissies buiten CRUD staan onder **"Other"**.

## Announcements

Route: `/admin/announcements`. Stuur berichten naar alle gebruikers of alleen die van een specifieke
organisatie (organisatie-admins bereiken alleen hun eigen organisatie). Mededelingen verschijnen op de
homepage en zijn handig voor bijvoorbeeld gepland onderhoud of een aankomende release.

![Announcements: lijst met titel, prioriteit en periode, plus een Create-formulier met Markdown-body.](/img/screens/admin-announcements.svg)

1. **Create** — open het formulier om een nieuwe mededeling op te stellen.
2. **Body (Markdown)** — de tekst ondersteunt Markdown (headers, lijsten, links).
3. **Start- en einddatum** — beide optioneel. Leeg gelaten = direct zichtbaar tot de mededeling wordt
   verwijderd.
4. **Notify Users** — toont de melding ook in de notificatie-tab bovenin de topbar.
5. **Priority** — zet de mededeling bovenaan de lijst op de homepage.

:::info Bereik
Announcements zijn ook bereikbaar via het Superadmin-paneel. Een Yres-superadmin kan een mededeling naar
álle organisaties sturen; een organisatie-admin alleen naar de eigen organisatie.
:::

## Audit Logs

Route: `/admin/auditlogs`. Monitor acties van organisatiegebruikers: user-agent, client-IP en extra
eigenschappen per logtype. Filterbaar op datumrange, severity of gebruiker.

## Database overview

Route: `/admin/databases`. Bekijk alle databases die de organisatie gebruikt. Heb je een eigen (custom)
database toegevoegd, dan werk je die hier direct bij.

## Firewall

Route: `/admin/firewall`. Sta toe of weiger toegang per IP-adres, zodat admins bepalen vanaf waar Yres
benaderd mag worden. Dit verhoogt de beveiliging door netwerktoegang te beperken.

![Firewall: tabel met IP-regels (label, IP/CIDR, Allow of Deny) en een Create-formulier.](/img/screens/admin-firewall.svg)

1. **Create** — voeg een IP-regel toe.
2. **IP-adres / CIDR + label** — leg het bereik vast en geef het een herkenbare naam.
3. **Allow of Deny** — bepaal of het bereik toegang krijgt of geblokkeerd wordt.

## PowerBI Models

Route: `/admin/powerBiCredentials` (en de modellen-weergave). Beheer unified models per omgeving, zodat de
juiste modellen worden aangeroepen — bijvoorbeeld bij een refresh via de master pipeline.

**Setup:** voeg eerst een databron van type **PowerBI** toe (zie
[databron-vereisten](../referentie/databron-vereisten.md)). Daarna verschijnt de tenant in de
tenants-sectie en kun je de bijbehorende workspaces en modellen ophalen. Per credential-set wordt de
vervaldatum getoond.

## Rebuild

Route: `/admin/rebuild`. Reset data naar fabrieksinstellingen — voor de hele organisatie óf alleen de Azure
Data Factory.

:::warning Onomkeerbaar
Rebuild **overschrijft alle configuratie die niet via de Yres-frontend is gedaan**. Gebruik dit met grote
voorzichtigheid.
:::

## Settings (hele applicatie)

Route: `/admin/settings`. Geldt voor **álle omgevingen** van de organisatie. Bevat onder andere het aantal
**parallelle processen** waarmee bronnen in de database en/of de Data Lake geladen worden (een geheel getal
tussen **1 en 50**).

Onder de instellingen staat de **Danger Zone**. Hier zeg je het abonnement op door de organisatie te
verwijderen. Dit raakt je Azure-omgeving niet — het verwijdert alleen de organisatie uit de Yres-portal.

:::caution Verschil met DWH settings
"Settings" hier is applicatiebreed. De per-omgeving DWH-instellingen (servicetier, schema-namen, paginatie)
staan onder [Environment Settings](#environment-settings) en gelden alleen voor de gekozen omgeving.
:::

## Secrets

Route: `/admin/secrets`. Bekijk de secrets in de bijbehorende Azure Key Vault, met hun scope en eventuele
vervaldatum. Met de juiste permissie kun je een waarde bijwerken. Yres bewaart credentials nooit in de
frontend; ze staan altijd in de Key Vault van de klant.

## Shared integration runtimes

Route: `/admin/shared-integration-runtimes` (beschikbaar vanaf versie **1.55**). Beheer self-hosted
integration runtimes voor ADF. Een IR vereist een **naam** en **beschrijving**. Na het aanmaken download je
via het info-icoon de Microsoft IR-tool en registreer je de runtime met de getoonde keys.

:::warning Onomkeerbaar
Het aanmaken van een shared integration runtime kan niet ongedaan gemaakt worden.
:::

## Update Environment

Route: `/admin/environments`. Werk elke omgeving bij naar de laatste Yres-versie. Dit start een deployment
(CI/CD-pipeline) voor de gekozen omgeving.

![Update environments: één kaart per omgeving (dev/test/prod) met versie, laatste CI/CD-resultaat en een deploy-bevestiging.](/img/screens/admin-environments.svg)

1. **Kaart per omgeving** — elke omgeving (Development, Test, Production) heeft een eigen kaart.
2. **Versie + laatste CI/CD** — toont de huidige DWH-versie en de State / Result / Ran-datum van de laatste
   deployment.
3. **Ordening** — werk in volgorde bij: een niet-dev-omgeving toont "werk eerst de vorige omgeving bij"
   totdat de eerdere omgevingen actueel zijn.
4. **Deploy-bevestiging** — bij het bijwerken zet Yres de database-servicetier tijdelijk terug naar de
   standaardtier; na bevestiging volgt het deployment-statusscherm.

:::tip Advies
Test een nieuwe versie eerst op `dev` (en eventueel `test`) voordat je `prod` bijwerkt. Zie de
[release notes](../referentie/release-notes.md) voor de inhoud van een update.
:::

## Environment admin (omgevingsspecifiek)

De volgende schermen gelden per omgeving. Wissel van omgeving met de omgevingsschakelaar rechtsboven voordat
je iets aanpast.

### Azure Resources

Route: `/admin/azure/resources`. Overzicht van de gekoppelde Azure-resources: naam, type, locatie en een
directe hyperlink naar de resource.

### Change deployment rules (Change overwrites)

Route: `/admin/changeoverwrites` (alleen voor organisaties met meerdere omgevingen). Vertaal objectnamen
tussen omgevingen, bijvoorbeeld `ERP_DEV.Product` (dev) → `ERP_TST.Product` (test) → `ERP.Product` (prod).

Pas deze regels toe **vóór** het importeren van een change in de doelomgeving. Vaak gecombineerd met
Source/Schema/Table-overwrite zodat de tabelnaam in alle omgevingen stabiel blijft.

### Data Warehouse Logs

Route: `/admin/dwhlogs`. Bekijk en filter de logs met stap-voor-stap acties van uitgevoerde stored
procedures, op datumrange, type stored procedure en severity. De logregels komen uit `[Config].[ProcessLog]`
in het datawarehouse.

![DWH logs: filterrij (datum, procedure, log-level), een logtabel en een stappen-modal met de mislukte stap en een ADF-link.](/img/screens/admin-dwhlogs.svg)

1. **Datumfilter** — beperk de logregels tot een periode.
2. **Procedure- en log-levelfilters** — filter op een specifieke stored procedure en op severity
   (Information / Warning / Error / System Error / Dump), met een operator `equal` of `equal and worse`.
3. **Clear error count** — wist de rode foutteller-badge die naast "DWH logs" in de sidebar verschijnt
   zodra er DWH-fouten zijn.
4. **Info-icoon** — opent een stappen-modal met de stap-voor-stap-uitvoering van de procedure.
5. **Mislukte stap** — de modal toont per stap de status en de foutmelding, met een link naar de bijbehorende
   run in Azure Data Factory.

:::note Niet op Development
Data Warehouse Logs zijn **niet beschikbaar op de Development-omgeving**. Gebruik op dev de logs onder
[Monitoring](../frontend/load-management.md) en de DWH-processen.
:::

### Environment Settings

Route: `/admin/dbsettings`. Per omgeving instelbare DWH-instellingen.

![DWH settings: tabel met setting-naam en waarde per omgeving, met een edit-modal met een veld per setting.](/img/screens/admin-dwhsettings.svg)

1. **Settings-tabel** — toont per setting de naam en een leesbare waarde voor de gekozen omgeving.
2. **Edit-modal** — per setting het juiste invoerveld (combobox voor tiers, vrije tekst voor schema-namen,
   getal voor opslag, alleen-lezen voor versies).
3. **Tier + opslag** — de min/max opslag (GiB) hangt af van de gekozen servicetier (S0–P15).
4. **UsePagination-waarschuwing** — het scherm waarschuwt bij paginatie-gerelateerde instellingen.

:::caution Configureer vóór de eerste bron
Stel deze instellingen in **voordat je de eerste bron toevoegt**, voor consistentie. De **Stage- en
HIS-schema-instellingen moeten in sync zijn tussen omgevingen** — anders sluiten changes niet op elkaar aan.
:::

De belangrijkste instellingen. De namen in de tabel zijn de werkelijke namen zoals opgeslagen in
`[Config].[Settings]` (de Yres-documentatie hanteert plaatselijk een afwijkende hoofdletterschrijfwijze; die
staat tussen haakjes vermeld).

| Setting (opgeslagen naam) | Default | Betekenis |
|---|---|---|
| `DefaultStore` | `ROW` | Row- (default) of column-georiënteerde opslag voor STAGE. Row = efficiënt lezen/schrijven, column = queries. |
| `DefaultKeepStage` | `0` | De staging-tabel na een delta-load truncaten (`0` = No) of de records bewaren (`1` = Yes). De load-engine leest per tabel de kolom `keepStage`; deze setting bepaalt vooral de standaard bij het toevoegen van een tabel. |
| `DefaultOdsMemOptimized` _(doc: DefaultODSMemOptimized)_ | `0` | Bedoeld om ODS/HIS-tabellen memory-optimized op te slaan. Zie de waarschuwing onder de tabel. |
| `DefaultStageMemOptimized` _(doc: DefaultStageMemOptimize)_ | `0` | STAGE-tabellen memory-optimized opslaan. |
| `DefaultServiceTier` / `HighServiceTier` | `Standard_S0` / `standard_S1` | Basis-Azure-SQL-servicetier en de tier waarnaar opgeschaald wordt onder hoge load. |
| `AutomaticDatabaseScaling` | `1` | Database automatisch schalen voor managed loads. Op `0` wordt opschalen overgeslagen. |
| `DefaultSurrogate` | `0` | Automatisch surrogate keys aanmaken voor de natuurlijke sleutel (opgeslagen in `[LoadManagement].[SurrogateKeys]`; per tabel te overschrijven). |
| `UsePagination` / `PageSize` | `1` / `10000` | Grote STAGE→HIS-merges in pagina's verwerken. Bij `PageSize = OPTIMAL` bepaalt Yres de paginagrootte zelf. |
| `retryCount` _(doc: RetryCount)_ | `1` | Aantal keren dat een mislukte pagina opnieuw geprobeerd wordt (in de proc valt een lege waarde terug op 3). |
| `SchemaHIS` / `SchemaStage` | `ODS` / `STAGE` | Namen van het HIS- en STAGE-schema. `SchemaHIS` staat standaard op `ODS`, niet op `HIS`. |
| `storageSize` _(doc: StorageSize)_ | `5` | Maximale opslag in GiB (afhankelijk van de servicetier). |
| `BiDashboardUrl` / `BiDashboardHeight` _(doc: BIDashboardUrl/Height)_ | `NULL` / `400` | Embed-URL en hoogte van het PowerBI-dashboard. |
| `AllowUpdatesInIrisSchemas`, `AllowDeletesFromDB`, `AllowSettingsUpdates`, `AllowLogManipulation` | `0` | Of gebruikers direct in de database mogen wijzigen / verwijderen / instellen / logs bewerken. |
| `EnvironmentType` | — | DTAP-type van deze omgeving (DEV / TST / ACC / SND / PRE / PRD). |

:::info Te bevestigen — twee codeafwijkingen
Twee instellingen gedragen zich in de huidige DWH-code anders dan de documentatie suggereert; controleer dit
met een Yres-admin vóór je erop vertrouwt:

- **`DefaultOdsMemOptimized`** wordt door de fallback-functie `fxGetOptimized` effectief niet gelezen (beide
  takken verwijzen naar de STAGE-setting). De per-tabel-kolom `odsMemOptimized` werkt wél. Of dit een bug is
  of bewust uitgeschakeld, is niet uit de repository af te leiden.
- De setting wordt geseed als **`AllowUpdatesInIrisSchemas`** (met "Iris"), terwijl de health-check de naam
  **`AllowUpdatesInYresSchemas`** (met "Yres") verwacht. Zolang de namen niet gelijk getrokken zijn, kan de
  health-check deze setting zowel als *ontbrekend* (9.03) als *onbekend* (9.04) markeren.
:::

### Health Checks

Route: `/admin/healthchecks` (beschikbaar vanaf versie **1.51**). Toont de status van de DWH-kant van Yres
vanuit de webapp. De controles zijn gebaseerd op de view **`[Maintenance].[vwYresChecks]`** (het bronbestand
heet nog `vwIrisChecks.sql`). De view bevat de verwachte lijst objecten en instellingen en markeert
veelvoorkomende issues, vaak met een foutmelding en soms met een SQL-script om het te herstellen.

![Health checks: overzicht met geslaagde, waarschuwings- en foutchecks, plus een uitgeklapte fout met een SQL-fixscript.](/img/screens/admin-healthchecks.svg)

1. **Status per check** — elke controle is OK, Warning of Error.
2. **Foutmelding** — bij een afwijking toont de check een omschrijving van het probleem.
3. **SQL-fixscript** — sommige checks bieden een kant-en-klaar script om de issue op te lossen.
4. **Run met voorzichtigheid** — voer een script alleen uit als je het begrijpt.

:::warning Wees voorzichtig met scripts
Een gegenereerd fixscript wijzigt rechtstreeks de database. Voer het alleen uit als je zeker weet wat het
doet en **overleg bij twijfel met een Yres-admin**.
:::

### PowerBI Dashboard

Route: `/admin/powerBiDashboard`. Toont een PowerBI-rapport binnen de webapp via een embed-URL (ingesteld
met de setting `BiDashboardUrl`).

## Meer admin-schermen

Naast bovenstaande bevat de Admin-sectie ook:

- **Global type mapping** (`/admin/globaltypemapping`) — de org-brede standaard datatype-mapping
  (`LoadManagement.GlobalTypeMapping`).
- **Theme** (`/admin/theme`) — upload logo en achtergrond, blur, primary color en de standaard licht/donker-modus.
- **Power BI credentials** (`/admin/powerBiCredentials`) — beheer de PowerBI-tenantcredentials.

Zie [Webapp-schermen](../referentie/webapp-schermen.md) voor de volledige lijst routes en velden.
