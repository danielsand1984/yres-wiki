---
sidebar_position: 12
title: Troubleshooting
description: Veelvoorkomende fouten bij installatie, bronkoppeling en laden — met oorzaak, herkenning en oplossing.
---

# Troubleshooting

Deze pagina brengt je snel van probleem naar oplossing bij het installeren van Yres, het koppelen van
bronnen en het laden van data. Per situatie staan de **herkenning** (de melding of het symptoom), de
**oorzaak** en de **oplossing**. Voor structurele DWH-controles gebruik je het
[Health checks-scherm](#health-checks); voor het lezen van laadfouten de
[Monitoring & logging-pagina](./referentie/monitoring-logging.md).

## 1. Deployment rights error

**Herkenning** — een API-call (bijvoorbeeld tijdens provisioning of bij het aanmaken van een Azure-resource)
faalt met een melding dat een resource provider niet geregistreerd of niet toegestaan is.

**Oorzaak** — als een resourcetype op een Azure-abonnement **nog nooit door een gebruiker is aangemaakt**,
is de bijbehorende resource provider niet geregistreerd. Een API-call kan die resource dan ook niet
aanmaken.

**Oplossing** — registreer de benodigde resource providers op het abonnement vóórdat je verdergaat met de
installatie. Daarna kan de provisioning de resource alsnog aanmaken.

:::info
De app-registratie heeft de rol **Owner** nodig op het abonnement (niet alleen Contributor): Yres kent
tijdens provisioning zelf rollen toe aan managed identities. Zie de
[installatiehandleiding](./setup/installatie.md).
:::

> Zie ook de Microsoft-documentatie over resource providers.

## 2. Lokale bestanden laden lukt niet

**Herkenning** — bij het laden van een **Lokale bestanden**- of **File Server**-bron geeft ADF een fout als:

```
The value of the property '' is invalid: 'Access to serverName is denied,
resolved IP address is ::1, network type is OnPremise'.
```

**Oorzaak** — de self-hosted Integration Runtime weigert standaard toegang tot het lokale bestandssysteem
van de machine waarop hij draait. File Server en Lokale bestanden **vereisen** een self-hosted IR (de
cloud-IR `AutoResolveIntegrationRuntime` kan niet bij on-prem bestanden).

**Oplossing** — zet `-EnableLocalMachineAccess` aan op de Windows-server waar de Integration Runtime draait.
Voer in CMD of PowerShell uit:

```powershell
cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
.\dmgcmd.exe -EnableLocalMachineAccess
```

Herstart daarna de bron-load. Zie ook [Databron-vereisten](./referentie/databron-vereisten.md) voor welke
bronnen een self-hosted IR nodig hebben.

## 3. Integration Runtime offline

**Herkenning** — een load die via een self-hosted IR loopt blijft hangen, time-out, of meldt dat de
Integration Runtime niet bereikbaar/`Unavailable` is. Geldt voor on-prem databases (MySQL, DB2, SQL Server,
Oracle, PostgreSQL) en bestandsbronnen.

**Oorzaak** — de self-hosted IR-service (`pwccIntegrationRuntimeLinked`) op de gateway-machine draait niet,
heeft geen internetverbinding richting Azure, of de machine staat uit.

**Oplossing:**

1. Controleer op de gateway-machine of de **Microsoft Integration Runtime**-service draait
   (`services.msc` → start de service indien gestopt).
2. Controleer de uitgaande netwerkverbinding naar Azure Data Factory (firewall/proxy).
3. Controleer in het scherm **Integration runtimes** of de IR als online wordt getoond.
4. Bij een gedeelde IR (versie ≥ 1.55): controleer of de delende omgeving de IR niet heeft losgekoppeld.

## 4. Credentials verlopen of ongeldig

**Herkenning** — een bron die eerder werkte faalt nu met een authenticatie-/autorisatiefout (bijvoorbeeld
`401`, `403`, "invalid credentials", "token expired" of "SAS expired").

**Oorzaak** — Yres slaat geen secrets op in de webapp; ze staan in de **Azure Key Vault** van de klant
(secretgroep `adf-{sourcenaam}-…`). Bij het aanmaken van een bron kun je een **vervaldatum** opgeven
(`credentials_expiry`); na die datum kan het secret verlopen. Daarnaast verlopen tokens en SAS-handtekeningen
van bronnen vanzelf, of draait de bronbeheerder het wachtwoord/secret om.

**Oplossing:**

1. Open de bron en werk de credentials bij. Yres schrijft het nieuwe secret naar de Key Vault; de linked
   service verwijst ernaar.
2. Stel desgewenst een nieuwe **vervaldatum** in.
3. Voor OAuth2-bronnen (zoals Exact Online, Salesforce, SAC): controleer of de refresh-/access-token nog
   geldig is en autoriseer opnieuw als dat nodig is.
4. Herstart de load.

:::tip
Spreek voor bronnen met aflopende tokens een terugkerend moment af om credentials te vernieuwen, zodat een
load niet onverwacht stilvalt.
:::

## 5. Type mapping-fout bij het laden

**Herkenning** — een load faalt op een conversie- of overflowfout (bijvoorbeeld een te lange string, een
`numeric`-overflow of een datum die niet past in het doeltype). De fout verschijnt in de
[DWH logs](./referentie/monitoring-logging.md) of in het Health checks-scherm.

**Oorzaak** — het brondatatype wordt niet (correct) afgebeeld op een SQL-doeltype. De mapping wordt bepaald
door `[LoadManagement].[fxGetDataType]` op basis van `TypeMapping`/`GlobalTypeMapping`; ontbreekt een mapping,
dan kan een kolom op een te krap of verkeerd type landen.

**Oplossing:**

1. Open **Type mapping** bij de bron en controleer de afbeelding van het probleemtype.
2. Vul ontbrekende mappings aan, of stel een ruimer doeltype in (de standaard mapping-job is *additief* en
   vult alleen ontbrekende mappings — bestaande mappings worden niet overschreven).
3. Voor brede toepassing: gebruik **Global type mapping** in het Admin-paneel.
4. Voer de load opnieuw uit en controleer de logregel.

## 6. Licentielimiet bereikt

**Herkenning** — een bron of tabel laadt geen rijen meer, of een nieuwe bron/tabel wordt geweigerd. In de
`vwExtractor`-uitvoer ontbreken rijen voor over-quota tabellen.

**Oorzaak** — de licentie begrenst het aantal bronnen, tabellen en de databasegrootte. De gate zit in de
load-engine: `fxExtractor` past `Config.fxCheckLicense('DBSIZE_HIS', …)` en `('MAXSIZE_HIS', …)` toe, zodat
over-quota tabellen of databases **geen rijen retourneren** en dus niet laden. De licentie is gekoppeld aan
een eenmalige uitnodigingslink en wordt in de database afgedwongen.

**Oplossing:**

1. Controleer in welke licentietier je zit en wat je verbruik is (zie
   [Licentie & limieten](./referentie/licentie-limieten.md)).
2. Verwijder of deactiveer bronnen/tabellen die je niet meer nodig hebt, of ruim historie op.
3. Heb je structureel meer nodig, upgrade dan naar een hogere tier (meer bronnen/omgevingen).

## Health checks

Voor DWH-issues toont het [Health checks-scherm](./frontend/admin.md) (route `/admin/healthchecks`,
beschikbaar vanaf versie **1.51**) de status van de DWH-kant van Yres. De controles zijn gebaseerd op de view
**`[Maintenance].[vwYresChecks]`** (het bronbestand heet nog `vwIrisChecks.sql`). De view bevat de verwachte
lijst objecten en instellingen en markeert veelvoorkomende problemen — vaak met een kant-en-klaar
fix-script.

![Health checks-scherm: overzicht met geslaagde, waarschuwings- en foutchecks, plus een uitgeklapte fout met een SQL-fixscript.](/img/screens/admin-healthchecks.png)

*Het Health checks-scherm: bovenaan een samenvatting (OK / Warning / Error), daaronder de checks per regel; een check kun je uitklappen om de foutmelding en het voorgestelde fix-script te zien.*

1. **Status per check** — elke controle is **OK**, **Warning** of **Error**.
2. **Foutmelding** — de concrete melding (bijvoorbeeld een ontbrekende of onbekende setting).
3. **SQL-fixscript** — voor veel fouten stelt het scherm een script voor dat het probleem herstelt.
4. **Voer met voorzichtigheid uit** — een fix-script wijzigt de database; voer het pas uit als je het effect
   begrijpt.

### Veelvoorkomende settings-checks (9.0x)

`vwYresChecks` vergelijkt `[Config].[Settings]` met de verwachte roster en flagt:

| Check | Betekenis | Voorbeeld |
|---|---|---|
| **9.01** | **GodMode is actief** (Warning) | de setting `GodMode` staat op `active = 1`; de check levert een opruimscript dat de rij verwijdert |
| **9.02** | Waarde valt buiten `Options` | `EnvironmentType = '1'` (geen geldige DTAP-code) |
| **9.03** | Verwachte setting **ontbreekt** | een setting uit de roster, bijvoorbeeld `DefaultSurrogate`, staat niet in `[Config].[Settings]` |
| **9.04** | **Onbekende** setting aanwezig | een handmatig toegevoegde of verouderde setting die niet (meer) in de roster staat |

:::note Oudere versies: dubbelmelding rond `AllowUpdatesInIrisSchemas`
Deze setting heet tegenwoordig **`AllowUpdatesInYresSchemas`** (met "Yres"); oudere versies seedden
hem als **`AllowUpdatesInIrisSchemas`** (met "Iris"), terwijl de roster van `vwYresChecks` de
Yres-naam kon verwachten. Daardoor werd hij tegelijk als *ontbrekend* (9.03) én *onbekend* (9.04)
gemeld. De upgrade hernoemt de instelling automatisch naar `AllowUpdatesInYresSchemas`, met behoud
van de ingestelde waarde. Zie je de dubbelmelding nog, dan draait de database op een oudere
DWH-versie en verdwijnt hij bij de volgende deployment — het was nooit een teken van datacorruptie.
:::

:::warning
Voer health-check-scripts pas uit als je het effect begrijpt — overleg bij twijfel met een Yres-admin.
:::
