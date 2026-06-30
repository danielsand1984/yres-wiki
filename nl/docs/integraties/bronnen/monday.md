---
title: Monday
sidebar_label: Monday
description: Monday koppelen aan Yres — verbindingseisen.
---

# Monday

**Categorie:** Directe koppeling · REST

monday.com is een platform voor werk- en projectmanagement. Yres koppelt eraan via de
monday.com REST API (API v2) en haalt de gegevens op met een persoonlijk API-token.

## Verwachte input

In de wizard **Bron toevoegen** vult u eerst de gedeelde velden in (bronnaam, type,
integration runtime, of de credentials voor alle omgevingen gelijk zijn, eventuele
verloopdatum en tags). Voor het type **Monday** zijn daarnaast de volgende velden vereist:

| Veld | Toelichting |
|---|---|
| **url** | De basis-URL van de monday.com API. Moet beginnen met `https://api.monday.com/`; de standaardwaarde is `https://api.monday.com/v2`. Dit is **niet** de URL van uw eigen account-portal, maar het vaste API-endpoint. |
| **API token** | Uw persoonlijke monday.com API v2-token. Wordt door Yres als HTTP-header `Authorization` meegestuurd bij elke aanroep. |

**Authenticatie:** API-token als `Authorization`-header. In de gegenereerde linked service
staat de Monday-bron als `RestService` met `authenticationType: Anonymous`; het token wordt
toegevoegd als `authHeaders.Authorization` en verwijst naar een Key Vault-secret.

**Integration runtime:** de standaard **`AutoResolveIntegrationRuntime`** (cloud). monday.com
is een publiek bereikbare SaaS-API, dus een self-hosted integration runtime is niet nodig.

## Vereisten

- **API-token in monday.com aanmaken.** Maak in monday.com een persoonlijk API v2-token aan en
  bewaar dit voordat u de bron in Yres toevoegt (zie *Gegevens ophalen* hieronder).
- **Key Vault-secret.** Yres slaat het token nooit in de frontend op. Het wordt geschreven naar
  de Azure Key Vault van uw eigen omgeving en vandaaruit door de linked service als
  `Authorization`-header opgehaald. De secret volgt de naamgeving `adf-{bronnaam}-...` (in de
  meegeleverde template `adf-MONDAY-ClientSecret`).

:::tip Token-rechten
Het token erft de rechten van de gebruiker waarmee het is aangemaakt in monday.com. Maak het
token aan onder een account met voldoende leesrechten op de borden die u wilt ontsluiten, en
houd rekening met een eventuele verloopdatum van het token.
:::

## Gegevens ophalen

- **url** — vul het vaste API-endpoint in: `https://api.monday.com/v2`. De waarde moet beginnen
  met `https://api.monday.com/`.
- **API token** — log in op monday.com en klik rechtsboven op uw avatar (profielfoto) →
  **Developers** → **My Access Tokens**. Kopieer hier uw persoonlijke API v2-token (klik op
  *Show*). Beheerders kunnen het ook vinden via **Administration → Connections → Personal API
  token**. Het token erft uw eigen rechten in monday.

Officiële documentatie: [monday.com API authentication](https://developer.monday.com/api-reference/docs/authentication).

---

**Zie ook:** [Integratiecatalogus](../catalogus.md) · [Alle databron-vereisten](../../referentie/databron-vereisten.md) · [Integraties — overzicht](../overzicht.md)
