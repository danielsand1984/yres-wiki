---
title: Lokale bestanden (CSV, Excel)
sidebar_label: Lokale bestanden (CSV, Excel)
description: Lokale bestanden (CSV, Excel) koppelen aan Yres — verbindingseisen.
---

# Lokale bestanden (CSV, Excel)

**Categorie:** Bestand

CSV- en Excel-bestanden. Lokale bestanden worden via een Integration Runtime geladen (zie troubleshooting voor `-EnableLocalMachineAccess`).

## Verbindingseisen

_Geen aanvullende verbindingsgegevens nodig in deze opzet._

## Gegevens ophalen

Geen inloggegevens nodig. Je uploadt CSV- of Excel-bestanden rechtstreeks, of ze worden ingelezen via een **self-hosted Integration Runtime** op de machine waar de bestanden staan. Draait de IR onder een serviceaccount, dan moet je voor toegang tot lokale paden eenmalig `-EnableLocalMachineAccess` instellen (zie de troubleshooting-pagina).

> Officiële documentatie: [Een self-hosted Integration Runtime maken](https://learn.microsoft.com/en-us/azure/data-factory/create-self-hosted-integration-runtime)

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
