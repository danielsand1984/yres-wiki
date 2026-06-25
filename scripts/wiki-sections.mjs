// Shared wiki structure helpers — used by build-cms-config, build-cms-tree and
// the category-json generator. The folder structure under nl/docs is the single
// source of truth; this only adds nice labels + ordering for the KNOWN folders.
// New (CMS-created) folders fall back to their folder name + end position.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const NL_DOCS = path.join(ROOT, 'nl', 'docs');

// relative-folder (under <locale>/docs) -> { nl, en, position }
export const SECTIONS = {
  product: { nl: 'Product', en: 'Product', position: 2 },
  concepten: { nl: 'Concepten', en: 'Concepts', position: 3 },
  architectuur: { nl: 'Architectuur', en: 'Architecture', position: 4 },
  frontend: { nl: 'Gebruik (frontend)', en: 'Using the app (frontend)', position: 5 },
  setup: { nl: 'Setup & installatie', en: 'Setup & installation', position: 6 },
  integraties: { nl: 'Integraties & databronnen', en: 'Integrations & data sources', position: 7 },
  'integraties/bronnen': { nl: 'Bronnen (A–Z)', en: 'Sources (A–Z)', position: 3 },
  referentie: { nl: 'Referentie', en: 'Reference', position: 8 },
  'referentie/sql': { nl: 'SQL Interaction', en: 'SQL Interaction', position: 9 },
};

/** Stable CMS collection name for a folder (relative to <locale>/docs). */
export function collName(rel) {
  if (!rel) return 'algemeen';
  return rel.replace(/\//g, '__').replace(/[^a-z0-9_]+/gi, '-').toLowerCase();
}

/** Human label for a folder: known section label, else prettified folder name. */
export function folderLabel(rel, lang = 'nl') {
  const s = SECTIONS[rel];
  if (s) return s[lang] || s.nl;
  const base = rel.split('/').pop() || rel;
  return base.charAt(0).toUpperCase() + base.slice(1).replace(/[-_]/g, ' ');
}

/** All folders (recursive, incl. '' root) under nl/docs. */
export function allFolders() {
  const out = [''];
  const walk = (abs, rel) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (e.isDirectory()) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        out.push(r);
        walk(path.join(abs, e.name), r);
      }
    }
  };
  walk(NL_DOCS, '');
  return out;
}
