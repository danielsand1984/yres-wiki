---
title: Topdesk
sidebar_label: Topdesk
description: Connect Topdesk to Yres — connection requirements.
---

# Topdesk

**Category:** OData

Service management tool. Yres connects to Topdesk through the **OData reporting API** (not the `/tas/api` REST API).

## Expected input

You fill in the following fields in the **Add source** form for a Topdesk source:

| Field (label) | Input |
|---|---|
| **URL** | Read-only. Built automatically from **Domain**: `https://<domain>.topdesk.net/services/reporting/v2/odata`. |
| **Domain** | Your Topdesk subdomain, for example `myorganization` for `myorganization.topdesk.net`. Only letters, digits, dots and hyphens are allowed. |
| **Username** | The login name of the Topdesk (API) operator account. |
| **Password** | The **application password** of that operator account (see prerequisites). |

The **authentication type** (`Basic`), **pagination type** (`BodyUrl`) and the page-URL expression (`$['@odata.nextLink']`) fields are fixed and do not need to be filled in.

- **Authentication:** Basic — username + application password, sent along as Basic authentication.
- **Integration runtime:** defaults to `AutoResolveIntegrationRuntime` (cloud). Topdesk is a publicly reachable cloud service; a self-hosted integration runtime is not required.
- **Storing credentials:** you enter the details once; Yres stores them in the customer's Azure Key Vault (secret group `adf-{bronnaam}-…`). The frontend does not store any secrets.

## Prerequisites

- **API account / operator:** preferably create a dedicated API operator account with a permission group that has the "REST API" and "Use application passwords" rights. This account needs read access to the data you want to expose.
- **Application password:** log in with that operator account, open the user menu in the top right, go to Application passwords and choose Add. The password is **shown only once** — save it immediately. You use the operator login name as the **Username** and this application password as the **Password** of the connection.

## Retrieving the data

Yres retrieves data through the OData reporting endpoint of your Topdesk environment:

- **Endpoint:** `https://<domain>.topdesk.net/services/reporting/v2/odata`. Yres builds this URL itself from the **Domain** you entered; you do not need to assemble the URL manually.
- **Pagination:** large result sets are paged through automatically via the OData `@odata.nextLink` (pagination type `BodyUrl`).

See the official documentation: [Generating an application password](https://docs.topdesk.com/en/generating-an-application-password.html) and [Authorizing access to TOPdesk API](https://docs.topdesk.com/VA2023R2/en/authorizing-access-to-topdesk-api.html).

---

**See also:** [Integration catalog](../catalogus.md) · [All data source requirements](../../referentie/databron-vereisten.md) · [Integrations — overview](../overzicht.md)
