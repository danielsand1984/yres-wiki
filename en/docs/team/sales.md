---
sidebar_position: 4
title: Sales
description: Internal sales notes — positioning, demo approach, competition and buying criteria for Yres.
---

# Sales

:::info To be filled in
There is **no formal sales process** documented yet. The notes below are usable internal material;
extend them with the real process (see [Still to be documented](#still-to-be-documented) at the bottom).
:::

## Positioning

- Yres positions itself **beneath Power BI** — as the data platform that feeds the dashboards, not as a
  replacement for or competitor to it.
- The validated core message (Yres Learning): *"Yres is a cloud platform that connects all your data,
  keeps it automatically up to date and makes it easy to use — without requiring any technical knowledge.
  It runs entirely in your **own Azure environment**, saves costs through smart scaling and gives you full
  control over your data, with no vendor lock-in."*
- Everything runs by default in the customer's **own Azure tenant** (USP "100% Azure", "no vendor
  lock-in"). This is the strongest and most frequently repeated selling point: data never leaves the
  customer's environment, and the pipelines keep running even if Yres is no longer used.

:::info To be confirmed
The option of *"hosting by Yres"* (instead of the customer's own Azure tenant) appears in older sales
notes, but does **not** appear in the official product documentation and sits in tension with the core
message "100% in your own tenant". Confirm with the owner whether, and under what conditions, a
Yres-hosted variant is offered before using this as a selling point.
:::

- **No-code**: sources, tables and load types are configured through **wizards**; Yres then generates
  the Azure Data Factory (ADF) linked services and pipelines automatically. (Note: this is
  metadata-driven generation, not a visual drag-and-drop pipeline designer — avoid that claim in a
  demo.)
- Native **Dutch ERP connectors** (Exact Online, AFAS) and preconfigured NL sources
  (including CBS, Tweede Kamer, Simplicate) as a differentiator against international tooling.
- Fast implementation: a typical installation takes **around 20 minutes** (depending on the number of
  environments) — not weeks.

:::info To be confirmed
The **fixed pricing** and the standalone claims "live within an hour" and "new source in ~5 minutes" are
commercial/marketing in nature and cannot be found in the official documentation. The licensing
*structure* (number of sources + environments per tier) is confirmed; the euro amounts and exact
lead times are not. See [Pricing](../prijzen.md).
:::

## Demo

No standard self-service trial or fixed sales demo. The approach is a **no-obligation conversation with a
data architect**, focused on the prospect's existing Azure environment. Pitch: *"Within 30 minutes you'll
know whether Yres is a fit."* → [How it works](../product/hoe-het-werkt.md)

:::info To be filled in
The demo promise ("within 30 minutes you'll know whether Yres is a fit") is internal sales framing and
not yet formally documented. Document the demo script and the qualification questions.
:::

## Competitors

| Competitor | Context |
|---|---|
| **TimeXtender** | Comparable data-warehouse automation. |
| **AnalyticsCreator** | Comparable tooling. |
| **Blue Mountain** | Housing-corporation sector. |
| **ZIG** | Housing-corporation sector. |

:::info To be confirmed
The note that a housing-corporation customer found Blue Mountain and ZIG *"too expensive / too little
value"* comes from a customer interview and is **not** drawn from the official documentation.
Verify (and obtain permission) before using this, or the customer name involved, externally.
:::

**Differentiation versus TimeXtender / AnalyticsCreator** (partially verified):

- Native NL ERP connectors (Exact, AFAS) and preconfigured NL sources — **confirmed**.
- Automated health checks (`[Maintenance].[vwYresChecks]`) — **confirmed**.
- Runs 100% in the customer's own Azure tenant, no vendor lock-in — **confirmed**.
- Transparent fixed pricing — **to be confirmed** (commercial, see above).

## Decisive buying criteria

- Standard connectors (ready-made connectors).
- Azure fit (builds on the existing Azure investment).
- Efficiency and cost savings (smart scaling instead of large, expensive VMs).
- Fewer external consultancy hours.
- A single central management location.
- Flexibility (not locked into standard reports).
- Alignment with a Lean way of working.
- Price-quality ratio.
- Self-management (the customer keeps control).

## Known area for improvement

Customers perceive Yres/Plainwater as **too modest and insufficiently visible** in the sector. Advice from
the conversations: more demos, events and trade-publication articles.

:::info To be confirmed
This area for improvement comes from customer interviews and is not drawn from the official product
documentation. Confirm before external use.
:::

## Still to be documented

- Sales funnel and stages.
- Qualification / ICP (ideal customer profile).
- Quotation process and business-case template.
- Price-negotiation margins and contract types.
- Demo script and standard qualification questions.
