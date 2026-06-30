---
sidebar_position: 7
title: Account
description: Persoonlijke instellingen (naam, e-mail, tijdzone, wachtwoord), feedback en wachtwoord-herstel.
---

# Account

Je accountinstellingen bereik je via de topbar, op het icoon met je initialen. Vanuit dat menu wissel je tussen light/dark mode, open je je **gebruikersinstellingen** (`/user/settings`) en stuur je **feedback** (`/user/feedback`). Op deze pagina staat ook hoe je je wachtwoord herstelt als je niet meer kunt inloggen.

## Gebruikersinstellingen

De pagina **Gebruikersinstellingen** (`/user/settings`) bestaat uit twee formulieren onder elkaar: je profiel bijwerken en je wachtwoord wijzigen. De pagina is in elke omgeving beschikbaar.

![Gebruikersinstellingen met profiel- en wachtwoordformulier](/img/screens/user-settings.png)

*Twee gestapelde formulieren: bovenaan je profiel (naam, tijdzone, datumformaat, taal), daaronder het wachtwoord wijzigen. De dark-mode-schakelaar zit in dezelfde container.*

1. **Profielformulier** — **Naam**, **Tijdzone**, **Datumformaat** en **Taal**.
2. **Update** — slaat je profiel op (`PUT /user/profile-information`).
3. **Wachtwoordformulier** — **Huidig wachtwoord**, **Nieuw wachtwoord** (minimaal 12 tekens) en **Bevestig wachtwoord** (moet overeenkomen).
4. **Change** — slaat het nieuwe wachtwoord op (`PUT /user/password`).
5. **Dark-mode-schakelaar** — wissel light/dark mode binnen de container.

### Profiel bijwerken

Pas de volgende velden aan en klik op **Update**:

| Veld | Beschrijving |
|---|---|
| **Naam** | Je weergavenaam. |
| **Tijdzone** | Bepaalt hoe tijdstempels worden weergegeven én welke tijdzone wordt gebruikt wanneer je een trigger inplant (zie hieronder). |
| **Datumformaat** | Hoe datums in de applicatie worden getoond; dit wordt ook in je sessie opgeslagen. |
| **Taal** | Interfacetaal: `en`, `nl` of `de`. |

:::note E-mailadres niet zelf te wijzigen
Het **e-mailadres** dat aan je account is gekoppeld, wordt gebruikt voor wachtwoord-herstel en als reply-to bij feedback. Je kunt dit adres **niet zelf** op deze pagina wijzigen: het instellingenscherm (`UserSettings`) bevat alleen naam, tijdzone, datumnotatie en taal. Een e-mailwijziging loopt via een beheerder/uitnodiging.
:::

### Wachtwoord wijzigen

In het tweede formulier wijzig je je wachtwoord:

1. Vul je **huidige wachtwoord** in.
2. Vul een **nieuw wachtwoord** in van minimaal **12 tekens**.
3. Herhaal het wachtwoord bij **Bevestig wachtwoord** (moet exact overeenkomen).
4. Klik op **Change**.

## Tijdzone en tijdstempels

Je gekozen **tijdzone** bepaalt twee dingen:

- **Weergave** — tijdstempels in logs, monitoring en overzichten worden in jouw tijdzone getoond.
- **Triggers** — wanneer je een pipeline-trigger inplant, wordt het opgegeven tijdstip geïnterpreteerd in **jouw accounttijdzone**.

:::warning Trigger-tijdzone = jouw tijdzone, niet UTC(+1)
In het inplan-scherm van een trigger staat de hint *"Timezone UTC(+1) will be used"*. Dat klopt niet met wat er feitelijk gebeurt: de backend gebruikt de **tijdzone van de ingelogde gebruiker** (`Auth::user()->timezone`) en zet die om naar de juiste Windows-tijdzone. Een trigger die je op 08:00 inplant, draait dus op 08:00 in **jouw** accounttijdzone — pas daarom je tijdzone hier correct in voordat je triggers aanmaakt.
:::

Zie [Load management](./load-management.md) voor het aanmaken en beheren van triggers.

## Feedback

Stuur feedback rechtstreeks vanuit de frontend via **Feedback** (`/user/feedback`). De reactie gaat naar het e-mailadres dat aan je account is gekoppeld.

Feedback is opgesplitst in drie categorieën:

- **Bug report** — problemen met de applicatie melden.
- **Feature request** — nieuwe of verbeterde functies aanvragen.
- **Feedback** — algemene feedback op Yres of op processen.

:::note Feedback-mailadres
Feedback uit de drie in-app categorieën gaat naar **feedback@yres.app** (vanaf versie 1.56; daarvoor `Feedback@iris-dwh.nl`), met je accountadres als reply-to.
:::

## Wachtwoord vergeten en herstellen

Kun je niet meer inloggen, gebruik dan de herstelflow. Die bestaat uit twee schermen: het aanvragen van een herstelmail (`/forgot-password`) en het instellen van een nieuw wachtwoord via de link uit die mail (`/reset-password/:token`).

![Wachtwoord-vergeten- en reset-scherm naast elkaar](/img/screens/auth-forgot-reset.png)

*Links: "Forgot password" met één e-mailveld. Rechts: "Reset password" met e-mail, nieuw wachtwoord en bevestiging.*

### Stap voor stap

1. Klik op het inlogscherm op **"Forgot password?"**.
2. Op **Forgot password** (`/forgot-password`) vul je je **e-mailadres** in en klik je op **"Reset password"**. Je ziet de melding *"Reset email sent if the account exists"*. Via **"Sign in"** ga je terug naar het inlogscherm.
3. Open de **herstelmail** en klik op de link; die brengt je naar **Reset password** (`/reset-password/:token`).
4. Vul je **e-mail**, een **nieuw wachtwoord** (minimaal 12, maximaal 50 tekens) en **Confirm Password** (moet overeenkomen) in.
5. Klik op **"Reset password"**. Bij succes word je teruggeleid naar het inlogscherm.

| Scherm | Route | Velden |
|---|---|---|
| Forgot password | `/forgot-password` | E-mail |
| Reset password | `/reset-password/:token` | E-mail, Password (min. 12, max. 50), Confirm Password |

:::note
Om beveiligingsredenen bevestigt de herstelmail-melding niet of het e-mailadres bestaat: je krijgt altijd dezelfde bevestiging. De `:token` in de reset-link is eenmalig en hoort bij de aangevraagde herstelmail.
:::
