#!/usr/bin/env node
/**
 * Generate static/admin/wiki-tree.json: the real folder tree of the wiki (from
 * nl/docs) with each page's title + the CMS collection/slug, so the custom tree
 * page (static/admin/tree.html) can deep-link into the editor. Collection names
 * match scripts/build-cms-config.mjs (one collection per folder). Run in build:all.
 */
import fs from 'node:fs';
import path from 'node:path';
import { NL_DOCS, ROOT, collName, folderLabel } from './wiki-sections.mjs';

function readTitle(file, fallback) {
  try {
    const c = fs.readFileSync(file, 'utf8');
    const m = c.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (m) {
      const t = m[1].match(/^(?:title|sidebar_label):\s*["']?(.+?)["']?\s*$/m);
      if (t) return t[1];
    }
    const h = c.match(/^#\s+(.+)$/m);
    if (h) return h[1].trim();
  } catch {
    /* ignore */
  }
  return fallback;
}

function posOf(file) {
  try {
    const m = fs.readFileSync(file, 'utf8').match(/^sidebar_position:\s*(\d+)/m);
    if (m) return parseInt(m[1], 10);
  } catch {
    /* ignore */
  }
  return 1e9;
}

function walk(absDir, rel) {
  const folders = [];
  const files = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) {
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      const node = walk(abs, childRel);
      folders.push({
        type: 'folder',
        label: folderLabel(childRel),
        rel: childRel,
        collection: collName(childRel),
        children: [...node.folders, ...node.files],
      });
    } else if (entry.name.endsWith('.md') && entry.name !== '_category_.json') {
      const slug = entry.name.replace(/\.md$/, '');
      files.push({
        type: 'file',
        label: readTitle(abs, slug),
        collection: collName(rel),
        slug,
        path: rel ? `${rel}/${slug}` : slug,
        folder: rel,
        pos: posOf(abs),
      });
    }
  }
  folders.sort((a, b) => a.label.localeCompare(b.label));
  files.sort((a, b) => a.pos - b.pos || a.label.localeCompare(b.label));
  return { folders, files };
}

const root = walk(NL_DOCS, '');
const tree = [...root.folders, ...root.files];
const out = path.join(ROOT, 'static', 'admin', 'wiki-tree.json');
fs.writeFileSync(out, JSON.stringify(tree, null, 2));
const count = (JSON.stringify(tree).match(/"type":"file"/g) || []).length;
console.log(`wiki-tree.json: ${count} pages`);
