---
sidebar_position: 2
title: Klant-onboarding
description: Een nieuwe klant live krijgen op Yres.
---

# Klant-onboarding

> Een complete Yres-omgeving is **binnen een uur** operationeel; een nieuwe bron sluit je doorgaans aan in ~5 minuten.

## Technische checklist

1. **App Registration** in Entra met permissies Azure Service Management, Key Vault en DevOps; client secret (24 mnd) + IDs verzamelen. → [Installatie](../setup/installatie.md)
2. **Abonnement(en) & resource groups** bepalen (advies: 2–3 omgevingen, eigen resource group per omgeving). App als **Contributor** toevoegen.
3. **Organisatie aanmaken** in de webapp; omgevingen (`dev`/`prod` + optioneel), resourcenamen, Azure-IDs.
4. **Gebruikers & rollen** opzetten (SSO waar gewenst). → [Aan de slag](../setup/aan-de-slag.md)
5. **Databronnen koppelen** en metadata verversen. → [Databron koppelen](../setup/databron-koppelen.md)
6. **Loads & triggers** inrichten; eventueel master pipelines. → [Views, pipelines & triggers](../setup/views-pipelines.md)
7. **PowerBI-modellen** koppelen indien van toepassing.

## Begeleiding

Wat klanten waardeerden tijdens onboarding:
- **Productsessies** over de werking van Yres en uitleg over zelfbeheer.
- **Scrum-werkwijze** met driewekelijkse sprints en duidelijke deliverables (Woonstichting 'thuis).
- **Strategische / inspiratiesessies** rond cloudmigratie (Paragon).
- **Proactieve checks** (dagelijkse controles) en een vaste contactpersoon voor incidenten.

:::info In te vullen
Formaliseer dit tot een standaard onboarding-traject: doorlooptijd, wie-doet-wat, sjablonen, kick-off-agenda, opleverdocument.
:::
