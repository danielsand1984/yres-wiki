---
sidebar_position: 2
title: Use-cases
description: De vier problemen die Yres oplost voor data teams, plus een praktijkvoorbeeld van voor en na Yres.
---

# Use-cases

> **Waarom teams kiezen voor Yres.** De vier knelpunten die we het vaakst tegenkomen bij data teams — en een praktijkvoorbeeld dat laat zien wat er verandert wanneer je ze met Yres oplost.

## 1. Onbetrouwbare dashboards

Rapportages lopen achter of kloppen niet, en veel tijd gaat naar controleren en corrigeren.

**Met Yres:** data wordt automatisch geladen en blijft consistent. De laad-engine houdt per tabel volledige SCD2-historie bij (via `KeyHash`/`RowHash` en `IsCurrent`), zodat wijzigingen netjes als nieuwe versie worden weggeschreven in plaats van bestaande records te overschrijven.

## 2. Fragiele pipelines

Scripts breken en niemand weet precies wat er gebeurt bij wijzigingen.

**Met Yres:** vaste structuren en inzichtelijke afhankelijkheden. Je beschrijft *wat* je wilt laden als metadata; Yres genereert de bijbehorende ADF-pipelines en linked services. Object-niveau lineage (tabellen, views, procedures, functies, gematerialiseerde views) maakt zichtbaar wat een wijziging raakt.

## 3. Te veel handmatig werk

Elke nieuwe databron kost tijd en maatwerk.

**Met Yres:** nieuwe bronnen aansluiten via wizards, zonder opnieuw te bouwen. Een bron toevoegen is in de kern het wegschrijven van metadata-regels — Yres vertaalt die naar de ADF-pipelines die het werk doen.

## 4. Afhankelijk van één persoon

Kennis zit bij één engineer of consultant.

**Met Yres:** een transparant en overdraagbaar data platform. De configuratie staat in de webapp en in de database, niet in de hoofden van losse engineers.

---

## Praktijkvoorbeeld: voor en na Yres

> Onderstaand voorbeeld is **illustratief en hypothetisch** — een middelgroot retailbedrijf, geen bestaande klant. Het komt uit het Yres-lesmateriaal en laat herkenbaar zien wat er verandert.

### Vóór Yres

Een middelgroot retailbedrijf had zijn data verspreid zitten:

- **verkoop** in de ene database;
- **marketingcampagnes** in een andere;
- **voorraad** in spreadsheets.

De gevolgen:

- IT was elke maand **dagen** bezig om de data handmatig samen te voegen en op te schonen.
- Managers moesten op rapportages wachten en werkten met verouderde informatie.
- Het bedrijf betaalde voor **grote VM's** om de verwerking te draaien — ook in rustige periodes.

### Na Yres

Binnen enkele dagen waren alle bronnen gekoppeld:

- verkoop, marketing en voorraad werden **automatisch bijgewerkt** en stonden klaar voor dashboards;
- managers kregen vrijwel **realtime** inzicht en konden campagnes meteen bijsturen of voorraad direct aanvullen;
- door database-schaling betaalde het bedrijf **alleen tijdens zware verwerking** voor extra capaciteit;
- de architectuur van Yres verwerkt grote volumes **zonder grote, dure VM's**.

### Het resultaat

| Aspect | Vóór Yres | Na Yres |
|---|---|---|
| Rapportagetijd | dagen | minuten |
| Besluitvorming | wachten op rapporten | sneller, op actuele data |
| Maandelijkse Azure-kosten | hoog (constante grote VM's) | lager (schalen op gebruik) |
| Extra technisch personeel | nodig | niet nodig |

De rapportagetijd ging dus terug **van dagen naar minuten**, de besluitvorming werd sneller en de maandelijkse Azure-rekening lager — *"all without adding technical staff."*

:::tip Waarom dit werkt
De kostenbesparing komt uit **automatische database-schaling** (instellingen `AutomaticDatabaseScaling`, `DefaultServiceTier`, `HighServiceTier`): de database schaalt op tijdens een zware laadrun en weer terug daarna. Yres draait daarbij **volledig in je eigen Azure-omgeving**.
:::

---

## Herkenbaar uit de praktijk

:::info Te bevestigen
De onderstaande klantvoorbeelden zijn aangeleverd door Yres/Plainwater en komen **niet** uit de officiële productdocumentatie. Controleer namen, details en toestemming (privacy/consent) voordat je ze extern publiceert.
:::

- **Paragon** migreerde van een on-premise datawarehouse naar Azure en moest de volledige koppelingsstructuur opnieuw inrichten. Voorheen werd elke applicatie anders aangesloten; met Yres is dit gestandaardiseerd. → [Lees de case](../klanten/paragon.md)
- **Woonstichting 'thuis** worstelde met rapportages die niet goed werkten en een lange "time to repair". Met Yres: snellere foutopsporing, kortere oplostijd en altijd actuele data. → [Lees de case](../klanten/thuis.md)
