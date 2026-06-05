---
title: File Server
sidebar_label: File Server
description: File Server koppelen aan Yres — verbindingseisen.
---

# File Server

**Categorie:** Bestand

Bestanden vanaf een (lokale) file server, bereikt via een Integration Runtime.

## Verbindingseisen

- Host / bestandspad op de integration runtime
- Username
- Password

## Gegevens ophalen

Een file server wordt bereikt via een **self-hosted Integration Runtime (IR)**: een agent die je installeert op een machine binnen het netwerk waar de bestanden staan. Deze IR is verplicht voor on-premises / netwerk-fileshares.

- **Host / bestandspad** — het UNC-pad naar de share of het pad op de machine waarop de IR draait, bijv. `\\server\share\map` of een lokaal pad als de IR op die machine staat. Te bepalen samen met je systeem-/netwerkbeheerder.
- **Username** — een Windows-/fileshare-account met leesrechten op die map, meestal in de vorm `DOMEIN\gebruiker`.
- **Password** — het wachtwoord van dat account.

Zorg dat het opgegeven account daadwerkelijk leestoegang heeft tot het pad vanaf de machine waarop de Integration Runtime is geïnstalleerd.

> Officiële documentatie: [Kopiëren van/naar een file system (Azure Data Factory)](https://learn.microsoft.com/en-us/azure/data-factory/connector-file-system)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
