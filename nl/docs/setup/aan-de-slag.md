---
sidebar_position: 2
title: Aan de slag
description: Inloggen, registreren via uitnodiging, organisaties, gebruikers, rollen en omgevingen in Yres.
---

# Aan de slag

Deze pagina beschrijft de eerste stappen in de Yres-webapp: **inloggen** (of je account aanmaken via een
uitnodiging), de structuur van **organisaties**, het beheren van **gebruikers** en **rollen**, en hoe
**omgevingen** werken.

## Inloggen

Je logt in op de Yres-webapp op het scherm **`/login`**. Het is een gecentreerde inlogkaart zonder
zijbalk (front-scope, niet-geauthenticeerd). Vul je **e-mailadres** en **wachtwoord** in en klik op
**"Sign in"**.

![Yres-inlogscherm met e-mail- en wachtwoordveld](/img/screens/auth-login.png)

*Gecentreerde authenticatiekaart op `/login`: e-mail, wachtwoord en een "Sign in"-knop, met onderaan een
"Forgot password?"-link.*

1. **Logo / themed achtergrond** — toont het Yres-logo of, als de organisatie een eigen thema heeft, het
   organisatiethema.
2. **E-mailveld** — verplicht en moet een geldig e-mailadres zijn (validatie via Yup).
3. **Wachtwoordveld** — verplicht (`type=password`).
4. **"Sign in"** — verstuurt de inlog (`POST /api/v1/login`) en navigeert bij succes naar de homepagina (`/`).
5. **"Forgot password?"** — link naar het wachtwoord-vergeten-scherm (`/forgot-password`).
6. **Foutmelding** — bij onjuiste gegevens verschijnt de melding *"Onjuiste inloggegevens"*.

Ben je je wachtwoord kwijt? Volg dan de stappen op de pagina
[Account & gebruikersinstellingen](../frontend/account.md#wachtwoord-vergeten-en-herstellen).

## Registreren via uitnodiging

Een Yres-account maak je niet zelf aan; je wordt **uitgenodigd**. De installatie van Yres vereist een
**uitnodigingslink van Plainwater** die is gekoppeld aan één Microsoft-account, **eenmalig bruikbaar** is en
is geconfigureerd voor de aangeschafte Yres-versie (zie [Licentietiers](#licentietiers-en-omgevingen)).
De link opent het registratiescherm op **`/register`**.

![Registratiescherm via uitnodiging met één stap "Account"](/img/screens/auth-register.png)

*Gecentreerde kaart met een meerstapsformulier dat slechts één zichtbare stap ("Account") toont. Het
e-mailadres is vooringevuld vanuit de uitnodiging en staat vast.*

1. **Stap-voortgang** — het formulier is opgezet als meerstapsformulier, maar er is maar één stap
   ("Account") zichtbaar.
2. **Uitnodigingsnotitie** — toont de organisatie, het hostingtype en het plan zoals vastgelegd in de
   uitnodiging.
3. **E-mail** — vooringevuld vanuit de uitnodiging en alleen-lezen (gekoppeld aan de uitnodiging).
4. **Naam** — je eigen naam (verplicht).
5. **Wachtwoord** — minimaal 12 tekens, met hoofd- en kleine letters, een cijfer en een speciaal teken.
6. **"Continue"** — maakt het account aan en logt je in op de Yres-webapp.

## Organisaties

Organisaties zijn de basis van Yres: een afgeschermde ruimte met één of meer omgevingen, zodat ontwikkeling
(**dev**) gescheiden blijft van productie (**prod**). Elke organisatie heeft een **unieke, vrij te kiezen
naam**; daarnaast wordt een **secundaire naam** automatisch gegenereerd met alleen toegestane tekens voor de
naamgeving van Azure- en DevOps-resources. Organisatienamen mogen **geen niet-alfanumerieke tekens**
bevatten.

## Gebruikers beheren

Gebruikers van je eigen organisatie beheer je in het **Admin-paneel** (`/admin/panel`). Hier staan twee
tabellen naast elkaar: **Users** (zichtbare kolommen: naam, e-mail, rol, SSO) en **Roles**.

Gebruikers worden uitgenodigd via een e-mail; de uitgenodigde maakt zelf een account aan via
[`/register`](#registreren-via-uitnodiging).

### Niveaus

| Niveau | Rechten |
|---|---|
| **User** | Geen toegang tot het Admin-paneel; alleen de functies die via rollen zijn toegekend. |
| **Organization Admin** | Adminrechten binnen de eigen organisatie; toegang tot het Admin-paneel. |

## Rollen beheren

In het [Admin-paneel](../frontend/admin.md#panel--users--roles) maak je in de **Roles**-tabel rollen aan
voor fijnmazige (CRUD-)permissies. Bewerken doe je via `MaintainRole`; verwijderen vraagt een
bevestigingsdialoog. Wijs een rol toe aan een gebruiker via het bewerk-icoon naast de gebruiker in de
**Users**-tabel.

Naast de standaardrollen kun je dus **eigen rollen** definiëren, gecombineerd met Azure-SSO (per gebruiker
af te dwingen) voor de authenticatie.

## Omgevingen

Omgevingen zijn afgeschermde versies van een organisatie; wijzigingen in de ene omgeving raken de andere
niet. De **eerste omgeving heet altijd `dev`** — deze naam is vast en komt terug in de technische
resourcenamen (bijvoorbeeld `sqlsrv-xxx-dwh-dev`), ook als je intern een andere conventie hanteert.

### Licentietiers en omgevingen

Hoeveel omgevingen (en bronnen) je mag inrichten, hangt af van je licentietier. De **structuur** van de
tiers is:

| Tier | Bronnen (source systems) | Omgevingen |
|---|---|---|
| **Essentials** | 2 | **1** |
| **Advanced** | 5 | 2 |
| **Ultimate** | Onbeperkt | **max. 6** |

Belangrijke gevolgen:

- **Essentials heeft maar één omgeving** (`dev`). De vaak gehoorde regel "minimaal dev én prod" geldt dus
  **niet** universeel — alleen vanaf **Advanced** zijn er twee of meer omgevingen.
- Voor organisaties op een hogere tier is **2 tot 4 omgevingen** een verstandige keuze (bijvoorbeeld
  dev → test → prod).

De licentie is gekoppeld aan één Microsoft-account, eenmalig bruikbaar en wordt in de database afgedwongen.

### Omgevingen bijwerken en beheren

- **Bijwerken** doe je via de Admin-tab **Update environments** (`/admin/environments`). Per omgeving zie je
  een kaart met de **DWH-versie** en de status, het resultaat en de datum van de laatste CI/CD-run. Klik op
  een kaart om de upgrade te bevestigen; niet-`dev`-omgevingen kun je pas bijwerken nadat de voorgaande
  omgeving up-to-date is. Test een nieuwe versie altijd eerst op `dev` voordat je `prod` bijwerkt.
- **Wisselen** tussen omgevingen doe je met de **omgevingsschakelaar** in de bovenbalk. Die is alleen
  zichtbaar als de organisatie meer dan één omgeving heeft.
- **Projecten & changes** categoriseren werk en transporteren content van `dev` → `prod`. Deze functie is
  **alleen beschikbaar bij organisaties met meerdere omgevingen** (dus niet op Essentials). Zie
  [Projecten & Changes](../frontend/projecten-changes.md).
