---
sidebar_position: 6
title: Testsuite (DWH)
description: De meegeleverde regressietestsuite voor de Yres-database — wanneer je hem draait, hoe je hem start met run-all-tests.ps1 of Test.spRunAll, hoe je de resultaten leest en waarom hij veilig is op productie.
---

# Testsuite (DWH)

De Yres data-plane database (`IRIS_DWH`) wordt geleverd met een **regressietestsuite** die het complete SQL-framework doorlicht: elk in-scope object (stored procedures, functions, views en triggers) heeft precies één test. De suite staat in de DWH-repository onder **`DWH/tests/`** en is **geen onderdeel van de DACPAC** — hij wordt dus nooit automatisch mee-gedeployed. Je installeert en draait hem bewust, en je kunt hem net zo bewust weer verwijderen.

Deze pagina beschrijft het **gebruik** van de suite. De interne opzet (fixtures, testtiers, assert-framework) staat gedocumenteerd in de repository zelf (`DWH/tests/README.md`).

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

### Via de meegeleverde runner (aanbevolen)

```powershell
cd DWH/tests
.\run-all-tests.ps1 -CredentialsFile 'C:\pad\naar\omgeving-creds.txt' -FailIfBusy
```

De runner installeert (of ververst) het framework en draait daarna alle tests. Nuttige opties:

| Optie | Betekenis |
|---|---|
| `-CredentialsFile` | Tekstbestand met server/database/gebruiker/wachtwoord van de doelomgeving. |
| `-FailIfBusy` | **Aanbevolen op productie:** breekt af als er lopende loads zijn (gestart in de laatste 4 uur). Zonder deze switch is de bezet-controle alleen een advies (SKIP-regel in het resultaat). |
| `-Suite framework` / `-Suite loadengine` | Draai alleen de per-object-suite of alleen de load-engine-suite (standaard: beide). |
| `-Schema <naam>` | Draai alleen de tests van één schema (bijv. `LoadManagement`). |
| `-Round '<label>'` | Eigen label voor de run (bijv. een ticketnummer), terug te vinden in de historie. |

Het gebruikte account heeft lees-/schrijfrechten op de frameworkschema's nodig plus DDL-rechten op `STAGE`, het HIS-schema en `Test`.

### Via SQL

Als het framework al geïnstalleerd is, kun je rechtstreeks vanuit SSMS of Azure Data Studio draaien:

```sql
DECLARE @id int;
EXEC Test.spRunAll   @Round = 'ticket-123', @RunId = @id OUTPUT;  -- alles: preflight → tests → cleanup + residucontrole
EXEC Test.spRunSuite @Schema = 'LoadManagement', @Round = 'ticket-123';  -- één schema
```

Daarnaast is er een zelfstandige **load-engine-suite** (`Test.spRunLoadEngineTests`) die alle laadtypen (FULL, DELTA, DELTAIMAGE, IMAGE, OVERWRITE, RELOAD, ADDITIONAL) tegen een synthetische bron doorloopt en het [SCD2-resultaat](../concepten/historie-scd2.md) controleert:

```sql
EXEC Test.spRunLoadEngineTests @Round = 'ticket-123';
```

## Resultaten lezen

- **Console/directe output:** per assertion een regel (PASS/FAIL/SKIP met verwachte en werkelijke waarde), een samenvatting per object, de dekkingssamenvatting en een afsluitende `ALL PASSED`- of `FAILURES`-banner.
- **Persistent** (elke run wordt bewaard, historie is bevraagbaar):

| Object | Inhoud |
|---|---|
| `Test.RunLog` | Eén rij per run: aantallen, duur, ronde-label. |
| `Test.RunResult` | Eén rij per assertion: PASS/FAIL/SKIP met verwachte vs. werkelijke waarde. |
| `Test.vwRunSummary` | Eén rij per run met totalen en eindstatus. |
| `Test.vwCoverageSummary` | Geteste vs. in-scope objecten per schema — het doel is overal **100%**. |

- **SKIP-regels dragen altijd een reden** — bijvoorbeeld een licentiegate, een bewust niet-uitgevoerde onveilige actie, of het bezet-advies. Een SKIP is dus gedocumenteerd gedrag, geen gemiste test.

:::tip Licentie eerst controleren
De tests rond `fxExtractor`/`vwExtractor` slaan zichzelf over (SKIP) als de licentie de testfixture uit het extractieoverzicht filtert. Zie je onverwacht veel SKIP's in `LoadManagement`, controleer dan eerst de licentie.
:::

## Verwijderen

De testresultaten en het framework leven in een eigen `Test`-schema, dat na een run bewust blijft staan zodat de historie bevraagbaar is. Wil je een omgeving zonder enig spoor achterlaten, draai dan eerst `EXEC Test.spCleanupAll;` (als een run onderbroken werd) en verwijder daarna alle objecten in het `Test`-schema gevolgd door het schema zelf. De DWH-repository bevat hiervoor een kant-en-klaar script in de runbook bij de suite.
