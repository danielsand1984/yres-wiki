---
title: Topdesk
sidebar_label: Topdesk
description: Connect Topdesk to Yres — connection requirements.
---

# Topdesk

**Category:** Direct connection

Service management tool. Direct connection.

## Connection requirements

_No additional connection details needed in this setup._

## Where to find these

Topdesk connects through its **REST API**. You need a username and an **application password**; these are sent using Basic authentication.

- **Base URL**: your Topdesk instance API has the form `https://<organization>.topdesk.net/tas/api`. Replace `<organization>` with your own Topdesk subdomain.
- **API account / operator**: preferably create a dedicated API operator account with a permission group that has the "REST API" and "Use application passwords" permissions.
- **Application password**: log in with that operator account, open the user menu in the top right, go to Application passwords and choose Add. The password is shown **only once** — save it immediately. You use the operator login name + this application password as the connection's username/password.

See the official documentation: [Generating an application password](https://docs.topdesk.com/en/generating-an-application-password.html) and [Authorizing access to TOPdesk API](https://docs.topdesk.com/VA2023R2/en/authorizing-access-to-topdesk-api.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
