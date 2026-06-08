#!/usr/bin/env node
/**
 * Move a wiki page to another (sub)folder, for BOTH locales (nl/docs + en/docs),
 * while keeping its public URL identical (via a `slug` frontmatter) and fixing
 * every relative Markdown link — both the moved page's own outbound links and
 * all inbound links from other pages. Runs in a real checkout (the move-page
 * GitHub Action), where filesystem moves + scans are trivial.
 *
 * Usage: node scripts/move-page.mjs "<fromRel>" "<toFolder>"
 *   fromRel  = doc path without .md, e.g. "concepten/load-types"
 *   toFolder = target folder (relative to docs), "" = root, e.g. "concepten/advanced"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const P = path.posix;

const fromRel = (process.argv[2] || '').replace(/^\/+|\/+$|\.md$/g, '').trim();
const toFolder = (process.argv[3] || '').replace(/^\/+|\/+$/g, '').trim();
if (!fromRel) {
  console.error('Usage: move-page.mjs <fromRel> <toFolder>');
  process.exit(1);
}

const basename = fromRel.split('/').pop();
const newRel = toFolder ? `${toFolder}/${basename}` : basename;

if (newRel === fromRel) {
  console.log('Source and target are the same — nothing to do.');
  process.exit(0);
}

const linkRe = /\]\(([^)\s]+?\.md)((?:#[^)\s]*)?)\)/g;

/** Resolve a relative link from `linkerRel` to a doc-rel path (no ext). */
function resolveTarget(linkerRel, linkPath) {
  return P.normalize(P.join(P.dirname(linkerRel), linkPath.replace(/\.md$/, '')));
}
function relLink(fromDir, targetRel) {
  let r = P.relative(fromDir, targetRel);
  if (!r.startsWith('.')) r = `./${r}`;
  return r;
}

/** Rewrite links in `content`; mapFn(targetRel, linkerRel) -> newTargetRel|null. */
function rewrite(content, linkerRel, mapFn) {
  return content.replace(linkRe, (m, lp, anchor) => {
    if (/^(https?:)?\/\//.test(lp) || lp.startsWith('/')) return m; // external/absolute
    const target = resolveTarget(linkerRel, lp);
    const newTarget = mapFn(target, linkerRel);
    if (!newTarget) return m;
    return `](${relLink(P.dirname(linkerRel), newTarget)}.md${anchor})`;
  });
}

function ensureSlug(content, slug) {
  const nl = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  if (lines[0].trim() === '---') {
    let end = -1;
    for (let i = 1; i < lines.length; i++) if (lines[i].trim() === '---') { end = i; break; }
    if (end > 0) {
      if (!lines.slice(1, end).some((l) => /^slug:/.test(l))) lines.splice(1, 0, `slug: ${slug}`);
      return lines.join(nl);
    }
  }
  return `---${nl}slug: ${slug}${nl}---${nl}${nl}${content}`;
}

function allMd(dir, base, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) allMd(abs, base, out);
    else if (e.name.endsWith('.md')) out.push(P.normalize(path.relative(base, abs).split(path.sep).join('/').replace(/\.md$/, '')));
  }
  return out;
}

let moved = 0;
for (const locale of ['nl/docs', 'en/docs']) {
  const base = path.join(ROOT, locale);
  const oldFile = path.join(base, `${fromRel}.md`);
  const newFile = path.join(base, `${newRel}.md`);
  if (!fs.existsSync(oldFile)) {
    console.log(`[${locale}] source not found, skipping: ${fromRel}.md`);
    continue;
  }

  // 1) Read + keep URL stable via slug (= current URL when no slug yet).
  let content = fs.readFileSync(oldFile, 'utf8');
  content = ensureSlug(content, `/${fromRel}`);

  // 2) Re-base the moved page's OWN outbound links (its folder changed).
  content = content.replace(linkRe, (m, lp, anchor) => {
    if (/^(https?:)?\/\//.test(lp) || lp.startsWith('/')) return m;
    const target = resolveTarget(fromRel, lp);
    return `](${relLink(P.dirname(newRel), target)}.md${anchor})`;
  });

  // 3) Write new, remove old.
  fs.mkdirSync(path.dirname(newFile), { recursive: true });
  fs.writeFileSync(newFile, content, 'utf8');
  fs.rmSync(oldFile);

  // 4) Fix every INBOUND link in the other docs.
  for (const rel of allMd(base, base)) {
    if (rel === newRel) continue;
    const f = path.join(base, `${rel}.md`);
    const before = fs.readFileSync(f, 'utf8');
    const after = rewrite(before, rel, (target) => (target === fromRel ? newRel : null));
    if (after !== before) fs.writeFileSync(f, after, 'utf8');
  }

  moved++;
  console.log(`[${locale}] moved ${fromRel}.md -> ${newRel}.md (public URL preserved via slug)`);
}

if (moved === 0) {
  console.error('Nothing moved (source not found in any locale).');
  process.exit(1);
}
console.log('Done.');
