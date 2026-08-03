---
sidebar_position: 6
title: Testsuite (DWH)
description: De meegeleverde regressietestsuite voor de Yres-database — sinds v1.56 onderdeel van de DACPAC; wanneer je hem draait, hoe je hem start met Test.spRunAll, hoe je de resultaten leest en waarom hij veilig is op productie.
---

# Testsuite (DWH)

De Yres data-plane database (`IRIS_DWH`) wordt geleverd met een **regressietestsuite** die het complete SQL-framework doorlicht: elk in-scope object (stored procedures, functions, views en triggers) heeft precies één testprocedure. Die ene procedure toetst sinds v1.56 wél meerdere scenario's: per objecttype doorloopt hij een vaste matrix — naast het happy path ook lege invoer, `NULL`, grensgevallen, ongeldige invoer, ontbrekende afhankelijkheden en meerdere rijen tegelijk. In totaal gaat het om circa **1665 controles over 194 objecten**.

Vanaf **v1.56** hoort de suite bij de database zelf: hij zit in de DACPAC als het schema **`[Test]`** en wordt dus **met elke Yres-versie meegeïnstalleerd**. Er valt niets te installeren — elke omgeving op de actuele versie heeft alle `Test.*`-objecten al staan. Er draait ook **niets automatisch**: de suite komt alleen in actie als je er zelf een procedure voor aanroept.

Deze pagina beschrijft het **gebruik** van de suite.

## Waarvoor gebruik je hem

- **Na een deploy of upgrade** — bevestigen dat alle databaseobjecten zich na een DACPAC-publish nog gedragen zoals verwacht (de belangrijkste use-case).
- **Bij troubleshooting** — een volledige run wijst direct het object aan dat afwijkend gedrag vertoont, inclusief verwachte vs. werkelijke waarde per assertion.
- **Als periodieke gezondheidscontrole** — de suite is idempotent (twee keer achter elkaar draaien geeft twee keer hetzelfde groene resultaat) en houdt per run historie bij, zodat trends terug te lezen zijn.

:::tip Aanvulling op de health checks
De testsuite is gedragsgericht ("doet dit object wat het moet doen?") en vult daarmee de configuratiegerichte [health checks](../frontend/admin.md) (`Maintenance.vwYresChecks`) aan, die de *inrichting* controleren. Voor dagelijkse bewaking volstaan de health checks; de testsuite draai je rond wijzigingen.
:::

## Veilig op productie

De suite is ontworpen om op **elke** Yres-omgeving te kunnen draaien — ontwikkel, acceptatie én productie — zonder data of operatie te raken:

- **Alles is genamespaced.** Alle testfixtures zijn `ZZTEST*`-objecten en -rijen. De tests lezen of schrijven geen klantdata, geen echte metadatarijen en geen echte instellingen.
- **Geen omgevingsmutaties.** De suite wijzigt nooit instellingen, service-tiers of beveiligingsprincipals (anders dan `ZZTEST*`-fixtures). Procedures die dat wél zouden doen worden alleen statisch gecontroleerd (signatuur en definitie) of in dry-run-modus uitgevoerd, met een expliciete SKIP voor de rest.
- **Omgevingsadaptief.** Tests lezen de live gates (zoals `AllowSettingsUpdates` en de licentie) en toetsen het gedrag dat bij *deze* omgeving hoort — ze zetten nooit een gate om om een codepad af te dwingen.
- **Opruimen wordt bewezen, niet beloofd.** Elke run begint met een preflight die restanten van een eerder gecrashte run opruimt, en eindigt met een globale sweep plus een residucontrole die per categorie als PASS/FAIL in het resultaat staat.

:::info Wat er kan achterblijven op een vergrendeld systeem
Waar `AllowSettingsUpdates = 0` staat, zijn de auditlogs (`Config.EventLog`, `Config.ProcessLog`) append-only. Het enige spoor van een run is dan een handvol auditregels gemarkeerd met `ZZTEST`/`ZZTESTFN` — audittrails verwijderen op productie zou zelf een risico zijn, dus dit telt bewust niet als residu.
:::

## Draaien

Je draait de suite vanuit SSMS, Azure Data Studio of elke andere SQL-client:

```sql
DECLARE @id int;
EXEC Test.spRunAll @Round = 'ticket-123', @FailIfBusy = 1, @RunId = @id OUTPUT;
```

`spRunAll` doorloopt de hele cyclus: preflight → tests → cleanup + residucontrole. De parameters:

| Parameter | Betekenis |
|---|---|
| `@Round` | Eigen label voor de run (bijvoorbeeld een ticketnummer), terug te vinden in de historie. Laat je hem leeg, dan krijgt de run automatisch een label met het tijdstip. |
| `@Schema` | Draai alleen de tests van één schema (bijvoorbeeld `LoadManagement`). Leeg = alle schema's. |
| `@FailIfBusy` | **Aanbevolen op productie:** `1` breekt af als er lopende loads zijn. Bij `0` (standaard) is de bezet-controle alleen een advies — een SKIP-regel in het resultaat. |
| `@RunId` | OUTPUT: het runnummer waarmee je het resultaat later terugvindt. |

Voor één schema is er de kortere wrapper:

```sql
EXEC Test.spRunSuite @Schema = 'LoadManagement', @Round = 'ticket-123';
```

Het gebruikte account heeft lees-/schrijfrechten op de frameworkschema's nodig plus DDL-rechten op `STAGE`, het HIS-schema en `Test`.

Daarnaast is er een zelfstandige **load-engine-suite** (`Test.spRunLoadEngineTests`) die alle laadtypen (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL) tegen een synthetische bron doorloopt en het [SCD2-resultaat](../concepten/historie-scd2.md) controleert:

```sql
EXEC Test.spRunLoadEngineTests @Round = 'ticket-123';
```

### Eén volledige run tegelijk — je uitslag is altijd van jouw eigen run

De suite zorgt er zelf voor dat er maximaal één volledige run (`Test.spRunAll`, `Test.spRunSuite` of
`Test.spRunLoadEngineTests`) tegelijk actief is. Dat is geen beperking maar een garantie: alle
testfixtures leven in één gedeelde `ZZTEST`-naamruimte, dus zonder die bescherming zou een tweede,
gelijktijdig gestarte run de fixtures van de eerste kunnen opruimen terwijl die ze nog gebruikt — met een
**foute uitslag** als gevolg, niet met een foutmelding. Juist die stille faalmodus is wat de vergrendeling
voorkomt: elke uitslag die je terugkrijgt komt gegarandeerd van een eigen, ongestoorde run.

Start je een run terwijl er al één loopt (bijvoorbeeld twee collega's die kort na elkaar op de
testsuite-knop in de webapp klikken), dan hoor je dat direct — er wordt niet gewacht en niet stilzwijgend
overschreven:

```
Msg 50110, ...
Test.spRunAll: another full test run is already in progress -- concurrent runs share one ZZTEST fixture
namespace and would corrupt each other's results. Held by RunId 1160 [ALL/ticket-123], started
2026-08-03T17:40:37 by gebruiker@host. Wait for it to finish (or check Test.RunLog), then retry.
```

Waar dat te achterhalen is, noemt de melding meteen wélke run de vergrendeling vasthoudt (`RunId`,
suite/label, starttijd, gebruiker) — zo zie je in `Test.RunLog` in één oogopslag wanneer je opnieuw kunt
starten, zonder te hoeven gissen. Een losse testprocedure (`tst_*`) handmatig draaien tijdens ontwikkeling
wordt hierdoor nooit geblokkeerd: alleen een *volledige* run wacht op deze vergrendeling.

## Resultaten lezen

- **Console/directe output:** per assertion een regel (PASS/FAIL/SKIP met verwachte en werkelijke waarde), een samenvatting per object, de dekkingssamenvatting en een afsluitende `ALL PASSED`- of `FAILURES`-banner.
- **Persistent** (elke run wordt bewaard, historie is bevraagbaar):

| Object | Inhoud |
|---|---|
| `Test.RunLog` | Eén rij per run: aantallen, duur, ronde-label. |
| `Test.RunResult` | Eén rij per assertion: PASS/FAIL/SKIP met verwachte vs. werkelijke waarde. |
| `Test.vwRunSummary` | Eén rij per run met totalen en eindstatus. |
| `Test.vwCoverageSummary` | Geteste vs. in-scope objecten per schema — het doel is overal **100%**. |
| `Test.CoverageExclusion` | Wat bewust buiten de dekkingsmeting valt, met de reden erbij. |

- **SKIP-regels dragen altijd een reden** — bijvoorbeeld een licentiegate, een bewust niet-uitgevoerde onveilige actie, of het bezet-advies. Een SKIP is dus gedocumenteerd gedrag, geen gemiste test.

De dekkingsmeting gaat over **Yres-eigen** objecten. Buiten scope vallen daarom de meegeleverde
diagnostiekpakketten van derden (het `Maintenance`-schema met de sp\_Blitz-familie, `sp_WhoIsActive` en
AdaptiveIndexDefrag) en alles wat per klant gegenereerd wordt (het `Exposed`-schema en je eigen
`Custom…`-schema's). Die uitzonderingen staan met reden in `Test.CoverageExclusion` en worden bij elke
deploy opnieuw gezet.

:::tip Licentie eerst controleren
De tests rond `fxExtractor`/`vwExtractor` slaan zichzelf over (SKIP) als de licentie de testfixture uit het extractieoverzicht filtert. Zie je onverwacht veel SKIP's in `LoadManagement`, controleer dan eerst de licentie.
:::

## Wanneer is de suite geslaagd?

Het criterium is **niet** "alles groen" maar **"geen onverklaarde mislukking"**.

Elke mislukte controle (`Outcome = 'FAIL'`) die een bekende, geregistreerde fout beschrijft, draagt
een verwijzing daarnaar in haar omschrijving (`Label`, herkenbaar aan `KNOWN BUG:`). Zo'n regel wordt
vanzelf groen zodra die fout is verholpen — tot die tijd hoort hij bij de verwachte uitkomst. Een
mislukking **zónder** zo'n verwijzing is het signaal waar het om gaat: dat is een regressie.

Met deze query zie je precies dat: de onverklaarde mislukkingen van de laatste run.

```sql
SELECT ObjSchema, ObjName, Label, Got, Expected
FROM Test.RunResult
WHERE RunId = (SELECT MAX(RunId) FROM Test.RunLog)
  AND Outcome = 'FAIL'
  AND (Label IS NULL OR Label NOT LIKE '%KNOWN BUG%');
```

Komt hier een rij uit, dan is dat een probleem dat om actie vraagt. Een lege resultaatset betekent
dat de suite geslaagd is, ook als er (verwachte) FAIL-regels tussen de losse resultaten staan.

### Overgeslagen controles dragen een gestructureerde reden

Naast de vrije-tekstreden in `SkipReason` heeft `Test.RunResult` een kolom `SkipCategory` die elke
SKIP in één van vijf vaste categorieën indeelt:

| Categorie | Betekenis |
|---|---|
| `NOT_APPLICABLE` | Bestaat op geen enkele omgeving — bijvoorbeeld een controle op een kolom die per definitie nooit leeg kan zijn. |
| `ENVIRONMENT` | Hangt af van déze omgeving en draait vanzelf elders — bijvoorbeeld een controle die een hoofdlettergevoelige sortering vereist. |
| `WOULD_MUTATE` | Zou de draaiende omgeving wijzigen (servicetier, beveiligingsrollen, alle stagingtabellen legen) en wordt daarom nooit automatisch uitgevoerd. |
| `SUITE_CONSTRAINT` | Geblokkeerd door een regel van de testsuite zelf, niet door de omgeving. |
| `KNOWN_BUG` | Nevensymptoom van een bekende, geregistreerde fout. |

`Test.vwRunSummary` telt de SKIP's per categorie voor je op, zodat je in één oogopslag ziet *waarom*
een run minder controles heeft uitgevoerd dan er in scope zijn — zonder elke `SkipReason` los te lezen.

:::warning Een percentage is geen zinnig getal
Vergelijk nooit een "percentage voltooid" tussen omgevingen: welke controles worden overgeslagen
verschilt per omgeving (licentie, service-tier, ingestelde gates), dus het percentage is per
installatie anders en dus onvergelijkbaar. Het getal dat wél betekenis heeft, is **het aantal
uitgevoerde controles ten opzichte van de vorige run** op dezelfde omgeving. Daalt dat zonder
verklaring, dan is er een controle weggevallen — en dát is precies wat je wilt kunnen zien.
:::

## Verwijderen

De testresultaten en het framework leven in een eigen `Test`-schema, dat na een run bewust blijft staan zodat de historie bevraagbaar is. Werd een run onderbroken, dan ruimt `EXEC Test.spCleanupAll;` de achtergebleven fixtures op.

:::note Het `Test`-schema hoort bij de database
Omdat de suite sinds v1.56 in de DACPAC zit, komt het `Test`-schema bij de eerstvolgende versie-update
gewoon terug als je het handmatig verwijdert. Het schema kost vrijwel niets zolang je geen runs start:
zonder run staan `Test.RunLog` en `Test.RunResult` leeg.
:::
