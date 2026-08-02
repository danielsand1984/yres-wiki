---
sidebar_position: 5
title: Licentie & limieten
description: Hoe de Yres-licentie werkt — de tiers (Essentials/Advanced/Ultimate), het LicenseKey-veld in de database en de fxCheckLicense/fxCheckSystem-functies die bron-, tabel- en groottelimieten afdwingen.
---

# Licentie & limieten

Een Yres-licentie bepaalt **wat** je in een omgeving mag draaien: hoeveel bronnen, hoeveel tabellen, welke brontypes, en hoe groot de HIS-tabellen mogen worden. Deze limieten worden niet in de webapp bewaakt maar **in de database zelf** — de data-plane dwingt ze af, zodat ze blijven gelden ook als je rechtstreeks via een SQL-endpoint werkt.

Deze pagina legt twee dingen uit:

1. De **commerciële tiers** (Essentials, Advanced, Ultimate) en hoe een licentie wordt uitgegeven.
2. De **technische afdwinging** in `IRIS_DWH`: het `LicenseKey`-veld en de functies `Config.fxCheckLicense` en `Config.fxCheckSystem`.


## De tiers

De licentiestructuur is geverifieerd uit de officiële Yres-cursus (Learning p.39). Een licentie is altijd gekoppeld aan een **aantal bronnen** (source systems) en een **aantal omgevingen**:

| Yres-versie | Bronnen (source systems) | Omgevingen |
|---|---|---|
| **Essentials** | 2 bronnen | 1 omgeving |
| **Advanced** | 5 bronnen | 2 omgevingen |
| **Ultimate** | Onbeperkt | Onbeperkt |

Een paar consequenties die hier direct uit volgen:

- De eerste omgeving heet altijd **dev**. Bij **Essentials** is dat ook meteen de enige omgeving — "minimaal dev + prod" geldt dus **niet** voor Essentials. Voor hogere tiers adviseert Yres 2 tot 4 omgevingen.
- "Bronnen" telt het aantal **actieve source systems** (`LoadManagement.SourceSystems` met `active = 1`), niet het aantal tabellen. Tabellen zelf zijn metadata-rijen en worden — afhankelijk van je licentie — afzonderlijk begrensd (zie [Waar de limieten worden afgedwongen](#waar-de-limieten-worden-afgedwongen)).

## Hoe een licentie wordt uitgegeven

Een Yres-installatie start altijd met een **uitnodigingslink** (invitation link) van Plainwater. Die link:

- is **gekoppeld aan één Microsoft-account**;
- is **éénmalig bruikbaar** (single-use) — na voltooide installatie vervalt de link;
- is geconfigureerd voor de **aangeschafte versie** en geeft toegang tot het aantal omgevingen dat bij die licentie hoort.

Je mag de link zo vaak openen en heropenen als nodig **tot de installatie klaar is**; daarna is hij niet meer geldig.

Vanaf release v1.52 wordt de licentie **in de database opgeslagen**, zodat Yres het gebruik kan begrenzen. Bestaande klanten kregen bij die release automatisch een volledige licentie toegekend.

:::tip Verband met installatie
De licentie wordt tijdens de installatie ingericht. Zie de installatie-/onboarding-pagina's voor de stappen rond de uitnodigingslink, de App Registration en het kiezen van omgevingen.
:::

## Waar de licentie technisch leeft: `Config.Settings.LicenseKey`

De licentie zelf is één rij in de instellingen-tabel:

```sql
SELECT [Value] FROM Config.Settings WHERE Setting = 'LicenseKey';
```

De waarde is **geen leesbare tekst** maar een versleutelde JSON-blob. Yres ontsleutelt hem met `DECRYPTBYPASSPHRASE`, waarbij de passphrase deels uit de **servernaam** (`@@SERVERNAME`) is opgebouwd. Daardoor is een licentie **gebonden aan precies deze installatie** en kan een sleutel niet zomaar naar een andere server worden gekopieerd.

Wil je de inhoud (ontsleuteld) bekijken zonder de limieten te raken, gebruik dan de read-only helperfunctie:

```sql
SELECT * FROM Config.fxViewLicense();
```

Die geeft de licentie terug als sleutel/waarde-paren. De belangrijkste sleutels:

| Sleutel | Betekenis |
|---|---|
| `INSTALLATION` | `HASHBYTES('SHA2_512', server + database)` — bindt de licentie aan deze exacte installatie. |
| `ENDDATE` | Vervaldatum; na deze datum is de licentie niet meer geldig. |
| `TYPE` | `RESTRICTIVE` (limiet blokkeert) of `MONITORING` (limiet wordt alleen gerapporteerd). Onbekend/leeg → behandeld als `RESTRICTIVE`. |
| `FLEXIBILITY` | Speling in **procent** boven een limiet (bv. limiet 100 tabellen + 10% = 110 toegestaan voordat het systeem afkapt). |
| `SOURCES` | Max. aantal actieve bronnen. |
| `#SOURCETYPES` | Max. aantal **unieke** brontypes. |
| `SOURCETYPES` | De toegestane brontypes (pipe-gescheiden lijst, bv. `MSSQL\|AZSQL\|OData`). |
| `TABLES` | Max. aantal Yres-beheerde tabellen (`LoadManagement.UsedTables` met `active = 1`). |
| `DBSIZE_HIS` | Max. totale grootte (MB) van alle Yres-beheerde HIS-tabellen samen. |
| `MAXSIZE_HIS` | Max. grootte (MB) van één enkele HIS-tabel. |
| `SURROGATE` | `0` = surrogate keys niet toegestaan onder deze licentie. |

:::info Code zegt nog "IRIS"
Het product heet **Yres**, maar de health-check-view die de licentiestatus toont, heeft als bronbestand nog `vwIrisChecks.sql`. Het aangemaakte object is **`[Maintenance].[vwYresChecks]`** — gebruik die objectnaam.
:::

## De controlefuncties

### `Config.fxCheckLicense` — de afdwinger

```sql
Config.fxCheckLicense(@feature, @value, @check = 'SYSTEM', @checkvalue)
```

`fxCheckLicense` ontsleutelt `LicenseKey`, controleert eerst de **geldigheid** en daarna de gevraagde **limiet**:

1. **Geldigheid** (altijd, ongeacht `@feature`):
   - is de sleutel überhaupt geldig (bevat hij een `INSTALLATION`-waarde)?
   - is de licentie bedoeld voor **déze** installatie (de `INSTALLATION`-hash moet matchen met `SHA2_512` van server + database)?
   - is de `ENDDATE` nog niet verstreken?
2. **Limiet** voor de meegegeven `@feature` (`SOURCES`, `#SOURCETYPES`, `SOURCETYPES`, `TABLES`, `DBSIZE_HIS`, `MAXSIZE_HIS`, `SURROGATE`). Met `@feature = NULL` worden **alle** limieten gecontroleerd.

Wat er gebeurt bij een overschrijding hangt af van het licentie-`TYPE`:

- **`RESTRICTIVE`** → de functie geeft direct een **foutmelding** terug (bv. *"The number of sources has reached its limit of 5"*). De aanroepende procedure breekt de actie af.
- **`MONITORING`** → de overschrijding wordt **gerapporteerd** maar blokkeert niet.

De `FLEXIBILITY`-speling wordt **alleen** toegepast bij de systeemcheck (`@check = 'SYSTEM'`); bij een expliciete `'CHECK'` (zoals de health checks) is de speling 0, zodat je de werkelijke licentiegrenzen ziet.

### `Config.fxCheckSystem` — de anti-manipulatie-controle

```sql
Config.fxCheckSystem(@value)
```

`fxCheckSystem` geeft een `SHA2_512`-hash terug over **servernaam + databasenaam + `@value`**. Dit is de tegenhanger waarmee de afdwinging **manipulatiebestendig** is gemaakt:

- Als alles in orde is, geeft `fxCheckLicense` **niet** "OK" terug maar **dezelfde hash** als `fxCheckSystem` (een waarde die bovendien elke minuut verandert).
- Een aanroeper concludeert "licentie in orde" **alleen** wanneer `fxCheckSystem(@value) = fxCheckLicense(@feature, …, @value)`.

Daardoor kan een klant `fxCheckLicense` niet vervangen door een eigen versie die altijd "true" teruggeeft: zonder de juiste, per-minuut-roterende hash matcht het resultaat nooit. Omdat de hash op de grens van een minuut kan verspringen, controleren aanroepers tegen de hash van **deze** én de **vorige** minuut.

:::note Extra slot op de functie
Een database-trigger (`dtrEventLog`) houdt wijzigingen aan het object `fxCheckLicense` in de gaten. Pogingen om de licentiecontrole te herschrijven worden dus ook nog vastgelegd in de audit-log.
:::

## Waar de limieten worden afgedwongen

De licentiecontrole zit ingebouwd op de plekken waar je iets toevoegt of laadt:

| Actie | Procedure / object | Gecontroleerde features |
|---|---|---|
| Bron toevoegen | `LoadManagement.spMaintainSource` | `SOURCES`, `SOURCETYPES` |
| Tabel toevoegen | `LoadManagement.spMaintainTable` | `TABLES` |
| Bestandsbron-tabel toevoegen | `LoadManagement.spMaintainFiles` | `TABLES` |
| Bepalen wat geladen wordt | `LoadManagement.fxExtractor` (achter `vwExtractor`) | `DBSIZE_HIS`, `MAXSIZE_HIS` |
| Gezondheidschecks | `[Maintenance].[vwYresChecks]`, groep `6 License` | alle bovenstaande + `#SOURCETYPES`, `SURROGATE`, `INSTALLATION` |

Twee gevolgen die goed zijn om te kennen:

- **Over de limiet → geen extractie.** `fxExtractor` is de view (`vwExtractor`) die ADF leest om te weten wát het moet laden. Tabellen of databases die de `DBSIZE_HIS`/`MAXSIZE_HIS`-grens overschrijden, worden door deze gate **uit het resultaat gefilterd** en dus niet meer geladen. Bestaande data blijft staan, maar groeit niet verder.
- **Toevoegen wordt geweigerd.** Bij een `RESTRICTIVE`-licentie geeft `spMaintainSource`/`spMaintainTable` een foutmelding zodra je de bron- of tabellimiet bereikt, en wordt de bron of tabel niet aangemaakt.

## De licentie controleren

De snelste manier om de status te zien is de **gezondheidschecks** in de webapp (of de view direct in SQL). De licentiechecks zitten in groep `6 License` van `[Maintenance].[vwYresChecks]`:

| Check | Onderwerp |
|---|---|
| `6.01` | System — is de licentie geldig en voor deze installatie bedoeld? |
| `6.02` | Aantal tabellen binnen de limiet. |
| `6.03` | Aantal bronnen binnen de limiet. |
| `6.04` | Alle bestaande bronnen zijn toegestane brontypes. |
| `6.05` | Aantal unieke brontypes binnen de limiet. |
| `6.06` | Gebruik van surrogate keys toegestaan. |
| `6.07` | Totale DB-grootte (alleen Yres-beheerde HIS-tabellen) binnen de limiet. |
| `6.08` | Maximale grootte van één HIS-tabel binnen de limiet. |

Stap voor stap zelf controleren via SQL:

1. **Bekijk de licentie-inhoud** (ontsleuteld, read-only):
   ```sql
   SELECT * FROM Config.fxViewLicense();
   ```
2. **Controleer een specifieke limiet** — vergelijk de uitkomst met `fxCheckSystem`; zijn ze gelijk, dan zit je binnen de licentie:
   ```sql
   SELECT
     Config.fxCheckSystem('check')                                   AS systemHash,
     Config.fxCheckLicense('SOURCES', NULL, 'CHECK', 'check')        AS licenseResult;
   -- gelijk = OK; afwijkende tekst = melding/overschrijding
   ```
3. **Bekijk alle licentiechecks in één keer** via de health-check-view:
   ```sql
   SELECT * FROM [Maintenance].[vwYresChecks] WHERE [Group] = '6 License';
   ```

Krijg je een foutmelding (bv. dat het aantal bronnen of de DB-grootte de limiet heeft bereikt), neem dan contact op met je Yres-supportpartner. Bij surrogate-keys die niet meer onder je licentie vallen, geeft check `6.06` zelfs een opruimscript mee.

## Samengevat

- Een Yres-licentie begrenst **bronnen, brontypes, tabellen en HIS-grootte** per omgeving — afgedwongen in de **database**, niet alleen in de webapp.
- De licentie staat versleuteld in `Config.Settings.LicenseKey`, gebonden aan **deze** server/database.
- `Config.fxCheckLicense` controleert de limieten; `Config.fxCheckSystem` maakt die controle **manipulatiebestendig** via een per-minuut-roterende hash.
- De drie tiers (Essentials/Advanced/Ultimate) bepalen het aantal bronnen en omgevingen; **prijzen en per-tier feature-gating zijn commerciële afspraken** ([Prijzen](../prijzen.md)).

Zie ook: [SQL Interaction](./sql-interaction.md) voor de volledige objectcatalogus en [Webapp-schermen](./webapp-schermen.md) voor de routes waar je deze functies via de UI raakt.
