---
title: File Server
sidebar_label: File Server
description: File Server koppelen aan Yres — verbindingseisen.
---

# File Server

**Categorie:** Bestand

Bestanden vanaf een (lokale) file server of netwerk-share, bereikt via een **self-hosted Integration Runtime**.

## Verwachte input

In de wizard **Bron toevoegen** vul je eerst de standaardvelden in (bronnaam, type, integration runtime, credentials gelijk voor alle omgevingen?, vervaldatum credentials, tags) en daarna het File Server-formulier.

**Verbindingsvelden (formulier File Server):**

| Veld | Beschrijving |
|---|---|
| **Host / File path on integration runtime** | Het UNC-pad naar de share of het pad op de machine waarop de IR draait. Voorbeeld (placeholder in het formulier): `\\SERVERNAME\SharedFolder`. |
| **User name** | Een Windows-/fileshare-account met leesrechten op dat pad, meestal in de vorm `DOMEIN\gebruiker`. |
| **Password** | Het wachtwoord van dat account. |

- **Authenticatie:** Windows-gebruikersnaam + wachtwoord (Basic). De bronnaam wordt de naam van de linked service; het wachtwoord wordt nooit door de frontend bewaard.
- **Integration runtime:** een **self-hosted Integration Runtime is verplicht**. Een File Server wordt via een UNC-/bestandspad gelezen, dat niet vanuit de cloud bereikbaar is. `AutoResolveIntegrationRuntime` (cloud) werkt hier niet. De gekozen IR wordt door de backend in de linked service gezet (`withConnectVia`); de template `FileServer.json` verwijst naar `pwccIntegrationRuntimeLinked`.

## Vereisten vooraf

- **Self-hosted Integration Runtime geïnstalleerd** op een machine binnen het netwerk waar de bestanden staan, en gepubliceerd zodat hij in de IR-dropdown verschijnt. Zonder deze IR kan de bron niet worden gekoppeld.
- **Een Windows-/fileshare-account** met leesrechten op het opgegeven pad, geldig vanaf de machine waarop de IR draait.
- **Netwerktoegang** vanaf de IR-machine naar de share (firewall/SMB).

:::note Key Vault-secret
Het wachtwoord wordt als secret **`adf-{bronnaam}-connectionstring`** in de Key Vault van de klant geplaatst (de moderne `FileServerSource`-builder).
:::

## Gegevens ophalen

De self-hosted IR is een agent die je installeert op een machine binnen het netwerk waar de bestanden staan. Yres benadert de bestanden via die agent.

- **Host / bestandspad** — het UNC-pad naar de share (`\\server\share\map`) of een lokaal pad als de IR op die machine draait. Te bepalen samen met je systeem-/netwerkbeheerder.
- **User name** — een account met leesrechten op die map, meestal `DOMEIN\gebruiker`.
- **Password** — het wachtwoord van dat account.

Zorg dat het opgegeven account daadwerkelijk leestoegang heeft tot het pad vanaf de machine waarop de Integration Runtime is geïnstalleerd.

> **Let op:** een File Server is een **bestandsbron**. Voor bestandsbronnen wordt de metadata-stap (`GetMetaData`) overgeslagen; je definieert de bestanden en het parsen rechtstreeks bij het toevoegen van de tabellen/bestanden.

> Officiële documentatie: [Kopiëren van/naar een file system (Azure Data Factory)](https://learn.microsoft.com/en-us/azure/data-factory/connector-file-system)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
