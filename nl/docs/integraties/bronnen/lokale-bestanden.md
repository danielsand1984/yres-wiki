---
title: Lokale bestanden (CSV, Excel)
sidebar_label: Lokale bestanden (CSV, Excel)
description: Lokale bestanden (CSV, Excel) koppelen aan Yres — via Azure Blob Storage of File Server.
---

# Lokale bestanden (CSV, Excel)

**Categorie:** Bestand

Er bestaat **geen apart brontype "Lokale bestanden"** in Yres. CSV- en Excel-bestanden
die op je eigen machine of een netwerk-share staan, koppel je via een van deze twee
routes:

## Route A — uploaden naar Azure Blob Storage (aanbevolen)

Voeg een **[Azure Blob Storage](azure-blob-storage.md)**-bron toe en upload je
bestanden daarnaartoe met de **Upload File**-knop bij het toevoegen van bestanden aan
de bron. De bestanden staan daarna in de blob-container en worden vanuit de cloud
gelezen — er is **geen self-hosted Integration Runtime nodig**.

Dit is de eenvoudigste route voor bestanden die je eenmalig of handmatig aanlevert.

## Route B — File Server-bron met een lokaal pad

Blijven de bestanden op de machine of share staan (bijvoorbeeld omdat een ander proces
ze daar neerzet), gebruik dan een **[File Server](file-server.md)**-bron met het
lokale pad of UNC-pad. Deze route vereist:

- een **self-hosted Integration Runtime** op (of met toegang tot) de machine waar de
  bestanden staan;
- **host + gebruikersnaam + wachtwoord** van een account met leestoegang tot het pad.

:::tip Lokaal pad op de IR-machine zelf
Wijst het pad naar de eigen host van de Integration Runtime, dan weigert de IR dat
standaard (foutmelding *"Access to serverName is denied, resolved IP address is ::1,
network type is OnPremise"*). Voer dan eenmalig op die machine uit:

```powershell
cd "C:\Program Files\Microsoft Integration Runtime\5.0\Shared\"
.\dmgcmd.exe -EnableLocalMachineAccess
```

Zie ook de [troubleshooting-pagina](../../troubleshooting.md) (onderwerp *"Unable to
load local files"*).
:::

> **Let op:** beide routes zijn **bestandsbronnen**. Voor bestandsbronnen wordt de
> metadata-stap (`GetMetaData`) overgeslagen; je definieert de bestanden en de
> parse-opties (CSV/Excel) rechtstreeks bij het toevoegen van de bestanden aan de bron.

---

**Zie ook:** [Azure Blob Storage](azure-blob-storage.md) · [File Server](file-server.md) · [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
