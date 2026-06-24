---
title: Lokale bestanden (CSV, Excel)
sidebar_label: Lokale bestanden (CSV, Excel)
description: Lokale bestanden (CSV, Excel) koppelen aan Yres — verbindingseisen.
---

# Lokale bestanden (CSV, Excel)

**Categorie:** Bestand

CSV- en Excel-bestanden die op een lokale machine of netwerk-share staan. Lokale bestanden worden via een **self-hosted Integration Runtime** ingelezen op de machine waar de bestanden staan. Er zijn geen inloggegevens nodig.

## Verwachte input

Lokale bestanden vragen **geen verbindingsgegevens** (geen host, gebruikersnaam of wachtwoord). In de wizard **Bron toevoegen** vul je de standaardvelden in (bronnaam, type, integration runtime, credentials gelijk voor alle omgevingen?, vervaldatum credentials, tags). Daarna wijs je de bestanden zelf aan.

**Verbindingsvelden:**

| Veld | Beschrijving |
|---|---|
| _(geen)_ | Voor lokale bestanden zijn geen aanvullende verbindings- of inloggegevens nodig. Je uploadt de bestanden rechtstreeks, of laat ze inlezen via de self-hosted IR op de machine waar ze staan. |

- **Authenticatie:** geen (geen gebruikersnaam/wachtwoord, geen token, geen SAS).
- **Integration runtime:** een **self-hosted Integration Runtime is verplicht**. Lokale paden zijn niet vanuit de cloud bereikbaar, dus `AutoResolveIntegrationRuntime` (cloud) werkt hier niet. Selecteer in de IR-dropdown de gepubliceerde self-hosted IR die op de machine met de bestanden draait.

## Vereisten vooraf

- **Self-hosted Integration Runtime geïnstalleerd** op de Windows-machine waar de bestanden staan, en gepubliceerd zodat hij in de IR-dropdown verschijnt. Zonder deze IR kun je lokale bestanden niet koppelen.
- **`-EnableLocalMachineAccess`** (alleen nodig wanneer de IR onder een serviceaccount draait): standaard weigert de Integration Runtime toegang tot lokale paden op de eigen host. Bij het laden van lokale bestanden geeft ADF dan een foutmelding zoals *"Access to serverName is denied, resolved IP address is ::1, network type is OnPremise"*. Voer eenmalig op de Windows-server die de IR-software draait het volgende uit in CMD of PowerShell:

  ```powershell
  cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
  .\dmgcmd.exe -EnableLocalMachineAccess
  ```

  Zie ook de [troubleshooting-pagina](../../troubleshooting.md) (onderwerp *"Unable to load local files"*).
- **Leestoegang** tot de map met de bestanden vanaf het account waaronder de IR draait.

## Gegevens ophalen

De self-hosted IR is een agent die je installeert op de machine waar de bestanden staan; Yres benadert de bestanden via die agent. Je hoeft geen credentials in te voeren — je wijst de bestanden aan en stelt de parse-opties (CSV/Excel) in bij het toevoegen van de bestanden aan de bron.

> **Let op:** lokale bestanden vormen een **bestandsbron**. Voor bestandsbronnen wordt de metadata-stap (`GetMetaData`) overgeslagen; je definieert de bestanden en het parsen rechtstreeks bij het toevoegen van de bestanden, in plaats van via een metadata-refresh.

> Officiële documentatie: [Een self-hosted Integration Runtime maken](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
