// Genereert één wiki-pagina per databron, tweetalig:
//   docs/integraties/bronnen/<slug>.md   en   docs-en/integraties/bronnen/<slug>.md
// Eenmalig draaien: `node scripts/build-source-pages.mjs`. Niet in de build gehangen,
// zodat handmatige aanpassingen aan een bronpagina niet overschreven worden.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

// categorie-codes: direct | odata | rest | file | azure
const SOURCES = [
  // --- Databases ---
  { slug: "mysql", name: "MySQL", cat: ["direct"], reqs: ["Host", "Port", "Database name", "Username", "Password"],
    nl: "Relationele database. Directe koppeling.", en: "Relational database. Direct connection." },
  { slug: "db2", name: "DB2", cat: ["direct"], reqs: ["Host", "Port", "Database name", "Username", "Password"],
    nl: "IBM Db2 relationele database. Directe koppeling.", en: "IBM Db2 relational database. Direct connection." },
  { slug: "sql-server", name: "SQL Server", cat: ["direct"], reqs: ["Host", "Port", "Database name", "Username", "Password"],
    nl: "Microsoft SQL Server. Directe koppeling.", en: "Microsoft SQL Server. Direct connection." },
  { slug: "azure-sql-database", name: "Azure SQL Database", cat: ["direct", "azure"], reqs: ["Host", "Port", "Database name", "Username", "Password"],
    nl: "Beheerde SQL-database in Azure. Directe koppeling.", en: "Managed SQL database in Azure. Direct connection." },
  { slug: "oracle", name: "Oracle", cat: ["direct"], reqs: ["Host", "Port", "Service name", "Username", "Password"],
    nl: "Oracle-database. Let op: **Service name** in plaats van Database name.", en: "Oracle database. Note: **Service name** instead of Database name." },
  { slug: "postgresql", name: "PostgreSQL", cat: ["direct"], reqs: ["Host", "Port", "Database name", "Username", "Password"],
    nl: "PostgreSQL relationele database. Directe koppeling.", en: "PostgreSQL relational database. Direct connection." },
  { slug: "snowflake", name: "Snowflake", cat: ["direct"], reqs: ["Account name", "Username", "Password", "Database", "Warehouse", "Role (optioneel)"],
    nl: "Cloud datawarehouse. Gebruikt standaard column-georiënteerde opslag.", en: "Cloud data warehouse. Uses column-oriented storage by default." },

  // --- Azure / File ---
  { slug: "azure-blob-storage", name: "Azure Blob Storage", cat: ["azure", "file"], reqs: ["Account name", "Container name", "SAS token"],
    nl: "Bestandsopslag in Azure. Upload bestanden direct en voeg ze als tabel toe.", en: "File storage in Azure. Upload files directly and add them as tables.",
    setupNl: "Maak een **SAS-token** aan via het storage-account → Security + Networking → Shared Access Signature.",
    setupEn: "Create a **SAS token** via the storage account → Security + Networking → Shared Access Signature." },
  { slug: "sharepoint", name: "SharePoint", cat: ["azure"], reqs: ["SharePoint site URL", "AD tenant name", "Postfix", "AD tenant ID", "Application ID / Service principal ID", "Application secret / Service principal key"],
    nl: "Microsoft SharePoint-lijsten en -documenten.", en: "Microsoft SharePoint lists and documents.",
    setupNl: "Registreer een app in Azure AD, sla App ID + secret op in Azure Key Vault (in je resource group) en voeg de app toe aan de SharePoint-site via `.../_layouts/15/appinv.aspx` met FullControl-permissie op de site collection.",
    setupEn: "Register an app in Azure AD, store App ID + secret in Azure Key Vault (in your resource group) and add the app to the SharePoint site via `.../_layouts/15/appinv.aspx` with FullControl permission on the site collection." },
  { slug: "azure-data-lake", name: "Azure Data Lake", cat: ["azure", "file"], reqs: [],
    nl: "Opslag voor onbewerkte data. Geïmporteerde data kan in de database, de Data Lake of beide landen; Yres voegt RowHash, KeyHash en EtlDate toe voor een medallion-architectuur.",
    en: "Storage for raw data. Imported data can land in the database, the Data Lake or both; Yres adds RowHash, KeyHash and EtlDate for a medallion architecture." },
  { slug: "file-server", name: "File Server", cat: ["file"], reqs: ["Host / bestandspad op de integration runtime", "Username", "Password"],
    nl: "Bestanden vanaf een (lokale) file server, bereikt via een Integration Runtime.", en: "Files from a (local) file server, reached via an Integration Runtime." },
  { slug: "lokale-bestanden", name: "Lokale bestanden (CSV, Excel)", cat: ["file"], reqs: [],
    nl: "CSV- en Excel-bestanden. Lokale bestanden worden via een Integration Runtime geladen (zie troubleshooting voor `-EnableLocalMachineAccess`).",
    en: "CSV and Excel files. Local files are loaded via an Integration Runtime (see troubleshooting for `-EnableLocalMachineAccess`)." },

  // --- Services & Apps ---
  { slug: "monday", name: "Monday", cat: ["direct", "rest"], reqs: ["URL", "API token"],
    nl: "Werk- en projectmanagement. Koppelt via meerdere protocollen.", en: "Work and project management. Connects via multiple protocols.",
    setupNl: "Maak een API-token aan (zie de Monday-documentatie).", setupEn: "Create an API token (see the Monday documentation)." },
  { slug: "afas", name: "AFAS", cat: ["direct"], partner: true, reqs: ["URL", "API token"],
    nl: "Nederlands ERP-systeem. Official partner.", en: "Dutch ERP system. Official partner.",
    setupNl: "Koppel via de AFAS app-connector.", setupEn: "Connect via the AFAS app connector." },
  { slug: "exact-online", name: "Exact Online", cat: ["direct"], partner: true, reqs: ["Exact-apps voor dev én prod"],
    nl: "Nederlandse boekhoud-/ERP-software. Official partner.", en: "Dutch accounting/ERP software. Official partner.",
    setupNl: "Maak Exact-apps aan voor dev én prod en stel de redirect-URL in volgens de aanwijzingen in de webapp.",
    setupEn: "Create Exact apps for dev and prod and set the redirect URL as instructed in the web app." },
  { slug: "simplicate", name: "Simplicate", cat: ["direct"], reqs: ["Domain name", "Authentication key", "Authentication secret"],
    nl: "Project- en CRM-software.", en: "Project and CRM software.",
    setupNl: "Maak een API-key + secret aan in Simplicate.", setupEn: "Create an API key + secret in Simplicate." },
  { slug: "salesforce", name: "Salesforce", cat: ["direct", "rest"], reqs: ["Environment URL", "Client ID", "Client secret"],
    nl: "CRM-platform. Koppelt via meerdere protocollen.", en: "CRM platform. Connects via multiple protocols.",
    setupNl: "Haal Consumer ID en secret op uit de App Manager.", setupEn: "Get the Consumer ID and secret from the App Manager." },
  { slug: "sac", name: "SAP Analytics Cloud (SAC)", cat: ["odata"], partner: true, reqs: ["URL", "Authentication URL", "Client ID", "Client secret"],
    nl: "SAP Analytics Cloud. Official partner.", en: "SAP Analytics Cloud. Official partner.",
    setupNl: "Stel een OAuth-client in op SAP Analytics Cloud.", setupEn: "Set up an OAuth client on SAP Analytics Cloud." },
  { slug: "sap-s4hana", name: "SAP S/4HANA", cat: ["odata"], partner: true, reqs: [],
    nl: "SAP S/4HANA ERP. Official partner. Koppelt via OData én een directe ODBC/BDC-verbinding.",
    en: "SAP S/4HANA ERP. Official partner. Connects via OData and a direct ODBC/BDC connection." },
  { slug: "sap-hana", name: "SAP HANA", cat: ["odata"], partner: true, reqs: [],
    nl: "SAP HANA in-memory database. Official partner. Koppelt via OData én een directe ODBC/BDC-verbinding.",
    en: "SAP HANA in-memory database. Official partner. Connects via OData and a direct ODBC/BDC connection." },
  { slug: "sap-datasphere", name: "SAP Datasphere", cat: ["odata"], partner: true, reqs: [],
    nl: "SAP Datasphere. Official partner. Koppelt via OData.", en: "SAP Datasphere. Official partner. Connects via OData." },
  { slug: "onestream", name: "OneStream", cat: ["rest"], reqs: ["URL", "Client ID", "Client secret", "Access token URL", "Application"],
    nl: "Corporate Performance Management. **Preview** — kan instabiel zijn.", en: "Corporate Performance Management. **Preview** — may be unstable." },
  { slug: "powerbi", name: "Power BI", cat: ["direct"], reqs: ["Tenant ID", "Client ID", "Client secret"],
    nl: "Voor unified models en het verversen van PowerBI-modellen vanuit Yres-loads.", en: "For unified models and refreshing Power BI models from Yres loads." },
  { slug: "dynamics-365", name: "Dynamics 365", cat: ["direct"], reqs: [],
    nl: "Microsoft Dynamics 365. Directe koppeling.", en: "Microsoft Dynamics 365. Direct connection." },
  { slug: "teams", name: "Microsoft Teams", cat: ["direct"], reqs: [],
    nl: "Microsoft Teams. Directe koppeling.", en: "Microsoft Teams. Direct connection." },
  { slug: "topdesk", name: "Topdesk", cat: ["direct"], reqs: [],
    nl: "Service-managementtool. Directe koppeling.", en: "Service management tool. Direct connection." },
  { slug: "mendix", name: "Mendix", cat: ["direct", "rest"], reqs: [],
    nl: "Low-code applicatieplatform. Koppelt via meerdere protocollen.", en: "Low-code application platform. Connects via multiple protocols." },

  // --- Generieke protocollen ---
  { slug: "odata", name: "OData", cat: ["odata"], reqs: ["URL", "Authentication type", "HTTP headers"],
    nl: "Generieke OData-koppeling. Basic-authenticatie vereist gebruikersnaam en wachtwoord.", en: "Generic OData connection. Basic authentication requires a username and password." },
  { slug: "odata-oauth", name: "OData OAuth", cat: ["odata"], reqs: ["URL", "Body URL", "Client ID", "Client secret", "Access token URL", "Scope", "Grant Type"],
    nl: "OData met OAuth-authenticatie. Grant Type \"Authorization Code\" vereist een refresh token.", en: "OData with OAuth authentication. Grant Type \"Authorization Code\" requires a refresh token." },
  { slug: "restservice", name: "REST API", cat: ["rest"], reqs: ["API specification URL", "Base URL", "Pagination type", "Authentication type", "Extra headers (optioneel)"],
    nl: "Generieke REST-koppeling voor elke JSON-API. OpenAPI/Swagger wordt ondersteund: kies endpoints visueel in de frontend.", en: "Generic REST connection for any JSON API. OpenAPI/Swagger is supported: select endpoints visually in the frontend." },
  { slug: "cbs", name: "Centraal Bureau voor de Statistiek (CBS)", cat: ["odata"], reqs: [],
    nl: "Officiële Nederlandse statistieken via OData.", en: "Official Dutch statistics via OData." },
  { slug: "tweede-kamer", name: "Tweede Kamer", cat: ["odata"], reqs: [],
    nl: "Open data van de Nederlandse Tweede Kamer via OData.", en: "Open data from the Dutch House of Representatives via OData." },
  { slug: "microsoft-graph", name: "Microsoft Graph", cat: ["odata", "rest"], reqs: [],
    nl: "Microsoft 365-data via Microsoft Graph. Koppelt via OData en REST.", en: "Microsoft 365 data via Microsoft Graph. Connects via OData and REST." },
];

const CAT_LABEL = {
  nl: { direct: "Directe koppeling", odata: "OData", rest: "REST", file: "Bestand", azure: "Azure" },
  en: { direct: "Direct connection", odata: "OData", rest: "REST", file: "File", azure: "Azure" },
};

const L = {
  nl: { category: "Categorie", partner: "🏅 Official partner", reqs: "Verbindingseisen", noReqs: "Geen aanvullende verbindingsgegevens nodig in deze opzet.", setup: "Setup", seeAlso: "Zie ook", catalog: "Integratiecatalogus", allReqs: "Alle databron-vereisten", overview: "Integraties — overzicht" },
  en: { category: "Category", partner: "🏅 Official partner", reqs: "Connection requirements", noReqs: "No additional connection details needed in this setup.", setup: "Setup", seeAlso: "See also", catalog: "Integration catalog", allReqs: "All data source requirements", overview: "Integrations — overview" },
};

function page(s, lang) {
  const l = L[lang];
  const cats = s.cat.map((c) => CAT_LABEL[lang][c]).join(" · ");
  const partner = s.partner ? `  ·  ${l.partner}` : "";
  const desc = lang === "nl" ? s.nl : s.en;
  const setup = lang === "nl" ? s.setupNl : s.setupEn;
  const reqs = s.reqs.length
    ? s.reqs.map((r) => `- ${r}`).join("\n")
    : `_${l.noReqs}_`;
  const fmDesc = (lang === "nl" ? `${s.name} koppelen aan Yres` : `Connect ${s.name} to Yres`);
  return `---
title: ${s.name}
sidebar_label: ${s.name}
description: ${fmDesc} — ${l.reqs.toLowerCase()}.
---

# ${s.name}

**${l.category}:** ${cats}${partner}

${desc}

## ${l.reqs}

${reqs}
${setup ? `\n## ${l.setup}\n\n${setup}\n` : ""}
---

**${l.seeAlso}:** [${l.catalog}](../catalogus.md) · [${l.allReqs}](../../referentie/databron-vereisten.md) · [${l.overview}](../overzicht.md)
`;
}

for (const lang of ["nl", "en"]) {
  const dir = join(ROOT, lang === "nl" ? "nl/docs" : "en/docs", "integraties", "bronnen");
  await mkdir(dir, { recursive: true });
  for (const s of SOURCES) {
    await writeFile(join(dir, `${s.slug}.md`), page(s, lang));
  }
}
console.log(`${SOURCES.length} bronnen × 2 talen = ${SOURCES.length * 2} pagina's gegenereerd.`);
