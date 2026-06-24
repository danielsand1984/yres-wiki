---
title: Simplicate
sidebar_label: Simplicate
description: Simplicate koppelen aan Yres — verbindingseisen.
---

# Simplicate

**Categorie:** Directe koppeling

Project- en CRM-software. Yres koppelt aan de Simplicate REST API; onder water wordt
deze bron als type **RestService** weggeschreven (een vaste Simplicate-basis-URL met
Offset-paginering en twee authenticatie-headers).

## Verwachte input

Bij het toevoegen van de bron (wizard **Bron toevoegen**) vul je naast de gedeelde
velden (bronnaam, type, integration runtime, credentials-instellingen, tags) de
volgende Simplicate-specifieke velden in:

| Veld | Toelichting |
|---|---|
| **Domain name** | De naam van je Simplicate-omgeving. Yres bouwt hiermee de basis-URL `https://{domain}.simplicate.app/api/v2/`. |
| **Authentication key** | De Authentication-Key uit Simplicate. Wordt als HTTP-header `Authentication-Key` meegestuurd. |
| **Authentication secret** | De bijbehorende Authentication-Secret uit Simplicate. Wordt als HTTP-header `Authentication-Secret` meegestuurd. |

- **Authenticatie:** twee custom HTTP-headers (`Authentication-Key` + `Authentication-Secret`).
  De linked service zelf staat op `Anonymous`; de key en het secret worden als headers
  meegestuurd. Yres bewaart de key en het secret niet in de frontend — ze worden opgeslagen
  in de **Azure Key Vault** van je eigen omgeving (secrets in de groep `adf-{bronnaam}-…`),
  waar de linked service ernaar verwijst.
- **Integration runtime:** de standaard **`AutoResolveIntegrationRuntime`** (cloud). Simplicate
  is via HTTPS bereikbaar, dus een self-hosted integration runtime is niet nodig.
- **Paginering:** Offset-paginering (`offset` / `limit`) — dit staat vast en hoef je niet zelf in te vullen.

### Vereisten

- Een Simplicate-account met rechten om een API-key aan te maken.
- Een aangemaakte **Authentication-Key + Authentication-Secret** (zie Setup hieronder).

## Setup

Maak in Simplicate een API-key + secret aan en geef beide waarden, samen met je domeinnaam,
door aan Yres.

## Gegevens ophalen

- **Domain name** — dit is de naam van je eigen Simplicate-omgeving. Je vindt deze terug in de
  adresbalk wanneer je bent ingelogd (bijvoorbeeld `mijnorganisatie` in `https://mijnorganisatie.simplicate.nl`).
  Vul alleen de naam in; Yres bouwt zelf de API-URL `https://{domain}.simplicate.app/api/v2/`.
- **Authentication key + Authentication secret** — ga in Simplicate naar **Instellingen (Settings) → API**
  en klik rechtsboven op **Nieuw (New)** om een API-key aan te maken. Je ontvangt een **Authentication-Key**
  en een bijbehorende **Authentication-Secret**. Een API-key is gekoppeld aan een gebruiker en erft diens
  rechten; geef beide waarden door aan Yres.

Officiële documentatie: [Simplicate — Een API-key aanmaken](https://support.simplicate.nl/en/articles/6693108-creating-and-deleting-an-api-key).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
