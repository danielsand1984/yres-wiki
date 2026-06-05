---
sidebar_position: 2
title: Admin
description: Het Admin-paneel — gebruikers, rollen, omgevingen en instellingen.
---

# Admin

Het Admin-paneel beheert gebruikers en omgevingen: rolbeheer, datawarehouse-logs en mededelingen.

:::tip Alle schermen & routes
De volledige lijst schermen van de app met hun route en velden staat in [Webapp-schermen](../referentie/webapp-schermen.md).
:::

## Announcements
Stuur berichten naar alle gebruikers of alleen die van een specifieke organisatie (organisatie-admins kunnen alleen hun eigen organisatie bereiken). Verschijnt op de homepage.

![Announcements: lijst met titel, prioriteit, periode en de Create-knop.](/img/screens/admin-announcements.png)

- **Start- en einddatum** zijn optioneel; leeg = direct zichtbaar tot verwijderd.
- **Notify Users** toont de melding ook in de notificatie-tab bovenin.
- **Priority** zet een mededeling bovenaan.
- De body ondersteunt **Markdown** (headers, lijsten, links).

## Audit Logs
Monitor acties van organisatiegebruikers: user agent, client-IP en extra eigenschappen per logtype. Filterbaar op datumrange, severity of gebruiker.

## Database overview
Bekijk alle databases die de organisatie gebruikt. Een eigen (custom) database werk je hier direct bij.

## Firewall
Geef of weiger toegang per IP-adres, zodat admins bepalen vanaf waar Yres benaderd mag worden.

![Firewall: IP-regels beheren met Create.](/img/screens/admin-firewall.png)

## PowerBI Models
Beheer unified models per omgeving, zodat de juiste modellen worden aangeroepen (bv. bij refresh via de master pipeline). **Setup:** voeg eerst een databron van type **PowerBI** toe (zie [databron-vereisten](../referentie/databron-vereisten.md)); daarna verschijnt de tenant en kun je workspaces/modellen ophalen.

## Rebuild
Reset data naar fabrieksinstellingen — voor de hele organisatie óf alleen de Azure Data Factory.

## Settings (hele applicatie)
Geldt voor álle omgevingen. Bevat o.a. het aantal **parallelle processen** waarmee bronnen in de database/datalake geladen worden (integer 1–50). De **Danger Zone** laat je het abonnement opzeggen door de organisatie te verwijderen (raakt je Azure-omgeving niet, verwijdert alleen de organisatie uit de Yres-portal).

## Secrets
Bekijk secrets in de bijbehorende key vault, met scope en eventuele vervaldatum. Met de juiste permissie kun je een waarde bijwerken.

## Shared integration runtimes
Beheer self-hosted integration runtimes voor ADF. Een IR vereist naam + beschrijving; na aanmaken download je via het info-icoon de Microsoft IR-tool en registreer je met de getoonde keys. **Kan niet ongedaan gemaakt worden.**

## Update Environment
Werk een omgeving bij naar de laatste Yres-versie. **Advies:** test een nieuwe versie eerst op `dev` voordat je `prod` bijwerkt. Zie [release notes](../referentie/release-notes.md).

## Users & Roles
- **Users** — aanmaken met e-mail, rol en of SSO verplicht is. Nieuwe gebruikers krijgen een mail met standaardwachtwoord (zelf te wijzigen in account settings).
- **Roles** — standaardrollen plus eigen rollen, meestal volgens CRUD per permissietype. Permissies buiten CRUD (zoals ADF-code bouwen) staan onder "Other".

## Environment admin (omgevingsspecifiek)

### Azure Resources
Overzicht van gekoppelde Azure-resources: naam, type, locatie en directe hyperlink.

### Change deployment rules
Vertaal objectnamen tussen omgevingen, bv. `ERP_DEV.Product` (dev) → `ERP_TST.Product` (test) → `ERP.Product` (prod). Toepassen **vóór** het importeren van een change; vaak gecombineerd met Source/Schema/Table-overwrite zodat de tabelnaam in alle omgevingen stabiel blijft.

### Data Warehouse Logs
Bekijk en filter logs met stap-voor-stap acties van uitgevoerde stored procedures (op datum, type sproc, severity). **Niet beschikbaar op Development.**

### Environment Settings
Per omgeving instelbare DWH-instellingen. **Configureer deze vóórdat de eerste bron wordt toegevoegd**, voor consistentie. De **Stage- en HIS-schema-instellingen moeten gelijk (in sync) zijn tussen omgevingen**. Belangrijkste:

| Setting | Betekenis |
|---|---|
| `DefaultStore` | Row- (default) of column-oriented opslag. Row = lezen/schrijven, column = queries. |
| `DefaultKeepStage` | Staging-tabel na delta-load truncaten (NO) of records bewaren (YES). |
| `DefaultODSMemOptimized` / `DefaultStageMemOptimized` | ODS-/STAGE-tabellen memory-optimized opslaan. |
| `DefaultServiceTier` / `HighServiceTier` | Azure database service tier (en waarnaar opschalen onder hoge load). |
| `AutomaticDatabaseScaling` | Database automatisch schalen voor managed loads. |
| `DefaultSurrogate` | Automatisch surrogate keys maken (opgeslagen in `[LoadManagement].[SurrogateKeys]`; per tabel te overschrijven). |
| `UsePagination` / `PageSize` | Grote datasets in pagina's verwerken (override `DefaultKeepStage`). |
| `RetryCount` | Aantal retries per request. |
| `SchemaHIS` / `SchemaStage` | Namen van het HIS- en STAGE-schema. |
| `StorageSize` | Opslag in GB (afhankelijk van service tier). |
| `BIDashboardUrl` / `BIDashboardHeight` | Embed-URL en hoogte van het PowerBI-dashboard. |
| `AllowUpdatesInYresSchemas`, `AllowDeletesFromDB`, `AllowSettingsUpdates`, `AllowLogManipulation` | Of gebruikers direct in de database mogen wijzigen/verwijderen/instellen/logs bewerken. |

### Health Checks
Status van de DWH-kant van Yres. Gebaseerd op `[Maintenance].[vwYresChecks]`; toont veelvoorkomende issues, vaak met een foutmelding en soms een SQL-script om te fixen. **Wees voorzichtig met scripts — overleg bij twijfel met een Yres-admin.**

![Health checks: gevonden issues met omschrijving, type en acties.](/img/screens/admin-healthchecks.png)

### PowerBI Dashboard
Toont een PowerBI-rapport in de webapp via een embed-URL.

## Meer admin-schermen

De app bevat naast bovenstaande ook: **Azure resources** (`/admin/azure/resources`), **Change overwrites** (`/admin/changeoverwrites`), **Database settings** (`/admin/dbsettings`), **Theme** (`/admin/theme`: upload icon/achtergrond, blur, primary_color) en **Power BI credentials** (`/admin/powerBiCredentials`). Zie [Webapp-schermen](../referentie/webapp-schermen.md) voor alle routes.
