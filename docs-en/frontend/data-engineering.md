---
sidebar_position: 6
title: Data Engineering
description: Database objects and view persistence.
---

# Data Engineering

Manage database objects and view persistence directly from the frontend.

:::tip All screens & routes
The full list of app screens with their route and fields is in [Web app screens](../referentie/webapp-schermen.md).
:::

## View Persistence
Manage **persisted views**: store the result of a view query, so you see table results without rerunning the (slow) query.

![Creating a persisted view: source, destination schema/table and level.](/img/screens/dataengineering-viewpersistence.png)

In the create form you define:
- the **source** and **target table**;
- the **object and load type**;
- the **level** — determines the load order. If view B depends on view A, give A `level 0` and B `level 1`; this way A is loaded first and the data stays up to date.

The create form asks for: **DestinationSchemaName**, **DestinationTableName** and **Level** (plus source, object type and load type).

## Database Objects
View all database objects (created by a user or by Yres), with:
- the current **definition** and **version history** (compare via the dropdowns; the button in the bottom left compares the current vs. previous definition);
- **dependencies** (link icon): objects this object depends on and objects that depend on it. Click an object to highlight linked objects in large dependency trees.

### Adding objects to a change
Right-click an object in the tree for a context menu: add to a change **with or without dependencies**, **with content**, or **delete** an object **with a change**.

## Object history

Besides view persistence and database objects, the app has an **Object history** screen (`/dataengineering/objecthistory`) showing the version history of objects.

![Object history: the object tree with version comparison.](/img/screens/dataengineering-objecthistory.png)
