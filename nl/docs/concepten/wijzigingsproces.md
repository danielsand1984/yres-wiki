---
sidebar_position: 6
title: Het wijzigingsproces (DTAP)
sidebar_label: Wijzigingsproces
description: Hoe je als klant je datawarehouse veilig aanpast en wijzigingen van dev via test naar productie brengt — het CI/CD- en changeproces vanuit jouw perspectief.
---

# Het wijzigingsproces (DTAP)

Je datawarehouse staat nooit stil: er komen bronnen bij, tabellen veranderen, je bouwt nieuwe views. Yres
zorgt dat je die wijzigingen **veilig** kunt doorvoeren — je test alles eerst in een aparte omgeving en
brengt pas naar productie wat klopt. Deze pagina beschrijft dat proces **vanuit jouw perspectief als
klant**: wat je zelf doet, en wat Yres automatisch voor je regelt.

> Voor de schermen en knoppen, zie [Projecten & Changes](../frontend/projecten-changes.md). Voor de
> techniek eronder (DACPAC, ADF-publish, Azure DevOps), zie [CI/CD & DTAP](../architectuur/cicd-dtap.md).

## Het idee: dev → test → prod

Yres richt je omgeving in volgens het **DTAP-model**: gescheiden omgevingen die elk hun eigen rol hebben.

| Omgeving | Waarvoor | Wie werkt hier |
|---|---|---|
| **Development (dev)** | Hier bouw en wijzig je. De eerste omgeving is altijd dev. | Jij / je data-team |
| **Test (test)** | Hier controleer je of een wijziging klopt vóór productie. | Jij / acceptatie |
| **Productie (prod)** | De stabiele omgeving waar je rapportages op draaien. | Niemand bewerkt hier rechtstreeks |

Het uitgangspunt: **je bouwt alleen in dev en je bewerkt nooit rechtstreeks in productie.** Een wijziging
reist als één pakket gecontroleerd van dev → test → prod, zodat je omgevingen gelijk blijven lopen en er
nooit half werk in productie belandt.

:::note Eén omgeving? Dan is er geen transport
Heb je maar **één omgeving**, dan is dit hele proces niet zichtbaar: er valt niets te promoten. Je
wijzigingen worden direct toegepast en de sectie *Projects* verschijnt niet. De rest van deze pagina gaat
over organisaties met **meerdere** omgevingen. Zie de [licentietiers](../referentie/licentie-limieten.md)
voor wie hoeveel omgevingen heeft.
:::

## De twee eenheden: Project en Change

Al je werk bundel je in twee eenheden, zodat het als geheel reist en traceerbaar blijft:

- Een **Project** is een container met een naam, omschrijving en einddatum — bijvoorbeeld *"AFAS-uitbreiding Q3"*.
- Een **Change** is de eenheid die je daadwerkelijk releaset en promoot. Elke bewerking die je in dev
  doet — een bron koppelen, tabellen toevoegen, een view persisteren, een scripted object toevoegen via de
  Object Explorer — wordt **automatisch onder een Change geboekt**. Een Change hoort altijd bij een
  Project.

Je hoeft dus niet handmatig bij te houden wat er veranderd is: Yres verzamelt het in de Change, en die
Change is straks je transporteenheid naar test en prod.

## De reis van een wijziging — stap voor stap

```
   DEV                         TEST                        PROD
 ┌───────────┐   release    ┌───────────┐   installeren  ┌───────────┐
 │  bouwen   │ ───────────▶ │ valideren │ ─────────────▶ │  live     │
 │  (Change) │   (vergrendeld)│         │                │           │
 └───────────┘              └───────────┘                └───────────┘
      1–3            4            5                6
```

Je doorloopt deze hele reis **vanuit de change zelf**: op het **Changes**-scherm kies je een project en een
change, en de knoppen die je ziet zijn **afhankelijk van de status** van die change. Een open change toont
**Release**; een gereleasede change toont **Import** en **Install** samen met de omgeving-hop. Je hoeft dus
niet naar aparte release- of install-schermen.

1. **Plan je werk — maak een Project.** Geef het een naam, omschrijving en einddatum. Onder dit project
   verzamel je je changes.
2. **Bouw in dev.** Koppel bronnen, voeg tabellen toe, maak persisted views, en voeg scripted objects toe
   via de **Object Explorer** (de objectboom onder Data Engineering). Alles wat je doet wordt onder je
   **Change** vastgelegd. Je laadt en test hier vrij — dit raakt test en prod niet.
3. **Bekijk en controleer de Change.** Je ziet de inhoud als **diagram** (bron → schema → tabel) of als
   **tabel** (per object het load type, de delta-kolom, en wat er gebeurt als het object al bestaat). Zo
   weet je precies wat er straks meereist.
4. **Release de Change.** Op de open change klik je **Release**. Hiermee **vergrendel** je de change: er kan
   niets meer aan worden bewerkt en hij wordt een verzegeld, promoteerbaar pakket. Yres controleert eerst de
   **afhankelijkheden** — bevat je change iets dat steunt op een andere, nog niet vrijgegeven change, dan
   blokkeert Yres de release en noemt die andere change(s). Zo neem je nooit per ongeluk half werk mee.
5. **Promoot naar test en valideer.** Op de gereleasede change kies je de omgeving-hop **dev → test** en
   klik je **Install**. Yres brengt je wijziging naar test en je controleert daar of de loads en structuren
   kloppen.
6. **Promoot naar productie.** Klopt het in test? Dan installeer je dezelfde change van **test → prod**.
   Daarmee staat je wijziging live — getest en wel.

![De change-detail met inline Release / Import / Install: de DTAP-flowstrip, de status-badge van de change, de change-inhoud (diagram/tabel), de omgeving-hop (van → naar) en de knoppen Import change en Install change.](/img/screens/changes-release-install.svg)

*Je releaset en promoot een change vanuit de change zelf: op een gereleasede change kies je de
omgeving-hop en klik je Import of Install. De voortgang verschijnt als melding, omdat het publiceren van de
pipelines op de achtergrond doorloopt.*

### Importeren vs. installeren

Op een gereleasede change heb je twee acties — beide werk je uit **op de change zelf**, met de omgeving-hop
(van → naar) ernaast:

- **Import change** — haalt de change alleen in het **datawarehouse** van de doelomgeving binnen. De
  ADF-pipelines worden hierbij **niet** vernieuwd. Handig als je alleen de DWH-structuur wilt klaarzetten.
- **Install change** — doet het volledige werk: de change in het datawarehouse **én** het opnieuw
  publiceren van de ADF-pipelines, zodat ook je nieuwe bron-pijplijnen in de doelomgeving landen. Dit is
  de stap die DWH en ADF synchroon brengt.

In de meeste gevallen kies je **Install change**. Op een al geïnstalleerde change kun je via dezelfde
knoppen opnieuw importeren of installeren.

## Wat Yres automatisch voor je regelt

Het mooie: bij stap 5 en 6 hoef je zelf niets technisch te doen. Achter één knop regelt Yres:

- **De databasestructuur** uitrollen in de doelomgeving (nieuwe/aangepaste tabellen, views, procedures).
- **De ADF-pipelines** opnieuw publiceren zodat je bronladingen in de doelomgeving werken.
- **Namen vertalen** tussen omgevingen. Een bron die in dev `ERP_DEV.Product` heet, wordt in test
  `ERP_TST.Product` en in prod `ERP.Product` — Yres past de change automatisch aan op de juiste fysieke
  objecten per omgeving (de *change deployment rules*).
- **Versies bewaken** (zie hieronder).

> Onder de motorkap draaien hiervoor `[Change].[spRelease]`, `[Change].[spImport]` en `[Change].[spInstall]`,
> plus de Azure DevOps-pipeline `publish-datafactory`. De volledige techniek staat in
> [CI/CD & DTAP](../architectuur/cicd-dtap.md).

## De vangrails — waarom dit veilig is

Yres bouwt een aantal controles in zodat je productie niet kunt breken:

- **Versies moeten overeenkomen.** Vóór een install controleert Yres of de **DWH-versies** van bron- en
  doelomgeving gelijk zijn. Zo niet, dan krijg je *"Environment versions do not match, please update"* en
  wordt er niets geïnstalleerd — werk eerst de achterlopende omgeving bij via
  [Update environments](../frontend/admin.md).
- **Afhankelijkheden worden gecontroleerd** bij het releasen: je kunt geen change vrijgeven die steunt op
  werk dat nog niet is vrijgegeven.
- **Een gereleasede change is vergrendeld** — niemand kan er na vrijgave nog stilletjes iets aan
  veranderen.
- **Een project kun je niet verwijderen** zolang het nog open changes bevat, en de einddatum van een
  change moet op of vóór die van het project liggen.
- **Niets gaat ongetest naar prod**, omdat je altijd eerst via test promoot.
- **Je historie blijft behouden.** De load-engine versioneert je data (SCD2), dus een structuurwijziging
  gooit bestaande historie niet weg. Zie [Historie & SCD2](./historie-scd2.md).

Gaat er onverhoopt toch iets mis, dan kun je een load of wijziging terugdraaien — zie
[Rollback & reset](./rollback-reset.md).

## Een voorbeeld uit de praktijk

*Illustratief — een typische gang van zaken, geen specifieke klant.*

Acme wil hun AFAS-administratie ontsluiten:

1. Een data-engineer maakt het project **"AFAS-koppeling"** aan met een einddatum.
2. In **dev** koppelt ze de AFAS-bron, ververst de metadata en voegt de gewenste tabellen toe — alles
   wordt geboekt onder de change **"AFAS tabellen v1"**.
3. Ze laat de eerste loads in dev draaien en controleert de data.
4. Ze **bekijkt de change-inhoud** (klopt het load type per tabel?), en **releaset** de change.
5. Ze **installeert** de change van **dev → test**, draait de loads in test en laat een collega de
   rapportage valideren.
6. Akkoord? Dan **installeert** ze dezelfde change van **test → prod**. De AFAS-data staat live, en dev,
   test en prod lopen weer gelijk.

Voor een **nieuwe bron van een bestaand type** (zoals hierboven) is er meestal **geen** codewijziging
nodig — het zijn metadata-rijen die de install-flow netjes tussen je omgevingen promoot.

## Verder lezen

- [Projecten & Changes](../frontend/projecten-changes.md) — de schermen, knoppen en velden
- [CI/CD & DTAP](../architectuur/cicd-dtap.md) — de techniek: DACPAC, `adf_publish`, Azure DevOps
- [Rollback & reset](./rollback-reset.md) — een wijziging of load terugdraaien
- [Gegevensstroom](./gegevensstroom.md) en [Historie & SCD2](./historie-scd2.md) — wat een load met je data doet
