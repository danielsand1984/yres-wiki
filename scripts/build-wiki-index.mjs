// Genereert static/wiki-index.json: alle wiki-pagina's (titel, URL, koppen, tekst)
// zodat de AI-assistent client-side relevante pagina's kan ophalen als context.
// Draait per taal via WIKI_LANG (nl → docs/, en → docs-en/), vóór elke build/start.

import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LANG = process.env.WIKI_LANG === "en" ? "en" : "nl";
const DOCS_DIR = join(ROOT, LANG === "en" ? "docs-en" : "docs");
const BASE_URL = `/${LANG}/wiki/`;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) out.push(full);
  }
  return out;
}

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { data: {}, body: raw };
  const data = {};
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (mm) data[mm[1]] = mm[2].replace(/^["']|["']$/g, "").trim();
  }
  return { data, body: raw.slice(m[0].length) };
}

function routeFor(relPath, slug) {
  if (slug === "/") return "";
  return relPath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
}

function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, (b) => b.replace(/```/g, "")) // houd codetekst, weg met fences
    .replace(/^import .*$/gm, "")
    .replace(/:::\w+\s?/g, "")
    .replace(/:::/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_>#`|]/g, " ")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const files = await walk(DOCS_DIR);
const pages = [];
for (const file of files) {
  const raw = await readFile(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const rel = relative(DOCS_DIR, file);
  const route = routeFor(rel, data.slug);
  const firstH1 = body.match(/^#\s+(.+)$/m);
  const title = data.title || (firstH1 && firstH1[1]) || rel;
  const headings = [...body.matchAll(/^#{1,4}\s+(.+)$/gm)].map((m) => m[1].replace(/[`*]/g, "").trim());
  pages.push({
    title,
    url: BASE_URL + route,
    headings,
    text: plainText(body),
  });
}

const outDir = join(ROOT, "static");
await mkdir(outDir, { recursive: true });
await writeFile(
  join(outDir, "wiki-index.json"),
  JSON.stringify({ lang: LANG, baseUrl: BASE_URL, generatedPages: pages.length, pages }),
);
console.log(`wiki-index.json: ${pages.length} pagina's (${LANG})`);
