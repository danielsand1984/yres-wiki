---
sidebar_position: 3
title: Support
description: Support and incident process — feedback, health checks, troubleshooting, and announcements.
---

# Support

:::info To be confirmed
No formal support process (SLAs, channels, escalation paths) has been recorded in the product documentation yet. The building blocks below have been verified from Yres; the commercial arrangements around them (response times, on-call, ticketing) still need to be confirmed by the owner.
:::

Yres delivers four verified building blocks that together support the support and incident process: **Feedback** from within the app, **Health Checks**, **Troubleshooting**, and **Announcements**.

## Building blocks

### Feedback from within the app

The web app includes a **Feedback** form that is split into three categories:

- **Bug report** — a reported defect.
- **Feature request** — a desired enhancement.
- **Feedback** — general comments.

Replies are sent to the **account email address** of the user who submitted the report. See [Account](../frontend/account.md) for the user-facing side.

:::info To be confirmed
The central address `feedback@yres.app` only appears in the wiki, not in the product documentation. The feedback flow itself (three categories, reply to the account email address) has been verified. Confirm the literal address with the owner.
:::

### Health Checks

The web app runs **Health Checks** against the DWH to detect known issues — often with an accompanying fix script. The expected checks and settings are enforced by the view `[Maintenance].[vwYresChecks]` (source file `vwIrisChecks.sql`). See [Admin](../frontend/admin.md) for operating the health checks.

### Troubleshooting

The product documentation explicitly describes two recurring issues:

- **Deployment rights error** — insufficient permissions during deployment.
- **Unable to load local files** — local files cannot be loaded (almost always a missing self-hosted integration runtime).

See [Troubleshooting](../troubleshooting.md) for the resolutions and more extensive error handling.

### Announcements

Administrators can publish **Announcements** to communicate maintenance, downtime, or releases. An announcement is org-wide or global, has Markdown text, a priority, an option to notify users, and a start and end date.

## Onboarding new sources (free-connector promise)

Is the desired application a **standard source** but not yet available in Yres? Then Yres will help connect that source **free of charge** and add the application to a future release. This is a verified, citable support promise (Yres Learning, p.107).

## What customers describe as ideal support

:::info To be confirmed
The points below come from customer interviews/marketing, not from the product documentation. Confirm with the owner before publishing them as a commitment.
:::

- Proactive, daily checks.
- Incident management through a dedicated point of contact.
- Regular (strategic) sessions and sprint reviews.

## Still to be documented

:::info To be confirmed
The following items have not been recorded yet and need to be filled in by the owner:
:::

- **SLAs and response times** — the marketing site mentions "a response within one business day" for contact inquiries; this has not yet been recorded as a formal SLA.
- **Support channels and hours**, ticketing, escalation, on-call.
- **Maintenance/release calendar** and the associated communication via Announcements.
