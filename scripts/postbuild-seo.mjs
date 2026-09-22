// Draait NA `build:nl` en `build:en`, over beide build-mappen tegelijk.
//
// Doet twee dingen die geen van beide builds zelf kan, omdat elke taal een
// aparte single-locale Docusaurus-build is die niets van de andere weet:
//
// 1. hreflang NL<->EN. Docusaurus zet met één locale in `i18n.locales` alleen
//    een alternate naar zichzelf, én allebei de builds claimen x-default. Voor
//    Google zijn het dan twee losse sites in plaats van twee talen van dezelfde
//    pagina. We vervangen het hele alternate-blok door de juiste drie:
//    nl, en, en x-default op nl (Nederlands is de brontaal).
//
// 2. Een Markdown-variant per pagina op <route>.md, met een
//    `<link rel="alternate" type="text/markdown">` in de HTML. LLM's en
//    crawlers halen zo de schone tekst op in plaats van hem uit de HTML te
//    moeten peuteren.
//
// Idempotent: twee keer draaien geeft hetzelfde resultaat.

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SITE_URL = (process.env.WIKI_SITE_URL ?? "https://yres.eu").replace(/\/+$/, "");
const LANGS = ["nl", "en"];

const exists = (p) => stat(p).then(() => true, () => false);

async function walk(dir, test) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full, test)));
    else if (test(e.name)) out.push(full);
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

// Zelfde regel als scripts/build-wiki-index.mjs: een custom `slug:` wint van het
// bestandspad, anders belandt de pagina op een URL die nergens bestaat.
function routeFor(relPath, slug) {
  if (slug) {
    const s = slug.trim();
    if (s === "/") return "";
    if (s.startsWith("/")) return s.replace(/^\/+/, "");
    const dir = dirname(relPath).replace(/\\/g, "/");
    return (dir === "." ? "" : dir + "/") + s.replace(/\.mdx?$/, "");
  }
  return relPath.replace(/\\/g, "/").replace(/\.mdx?$/, "");
}

/** Route van een gebouwde pagina, afgeleid van waar het HTML-bestand staat. */
function routeOfHtml(buildDir, file) {
  const rel = relative(buildDir, file).replace(/\\/g, "/");
  return rel === "index.html" ? "" : rel.replace(/\/index\.html$/, "").replace(/\.html$/, "");
}

const ALTERNATE_RE = /<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>/g;
const MARKDOWN_LINK_RE = /<link[^>]*rel="alternate"[^>]*type="text\/markdown"[^>]*>/g;

let patched = 0;
let written = 0;
let skippedNoCounterpart = 0;

// ---------------------------------------------------------------- 1. hreflang
for (const lang of LANGS) {
  const buildDir = join(ROOT, "build", lang);
  const other = lang === "nl" ? "en" : "nl";
  const otherBuild = join(ROOT, "build", other);
  if (!(await exists(buildDir))) {
    console.error(`postbuild-seo: build/${lang} ontbreekt — draai eerst npm run build:all`);
    process.exit(1);
  }

  for (const file of await walk(buildDir, (n) => n.endsWith(".html"))) {
    const route = routeOfHtml(buildDir, file);
    const suffix = route ? `${route}` : "";

    // Alleen koppelen als de tegenhanger echt bestaat; een hreflang naar een
    // 404 is schadelijker dan geen hreflang.
    const counterpart = suffix
      ? join(otherBuild, suffix, "index.html")
      : join(otherBuild, "index.html");
    const counterpartFlat = suffix ? join(otherBuild, `${suffix}.html`) : null;
    const hasCounterpart =
      (await exists(counterpart)) || (counterpartFlat ? await exists(counterpartFlat) : false);

    let html = await readFile(file, "utf8");
    const before = html;

    const url = (l) => `${SITE_URL}/${l}/wiki/${suffix}`.replace(/\/+$/, suffix ? "" : "/");
    const mdUrl = `${SITE_URL}/${lang}/wiki/${suffix || "index"}.md`;

    const block = hasCounterpart
      ? [
          `<link rel="alternate" href="${url("nl")}" hreflang="nl"/>`,
          `<link rel="alternate" href="${url("en")}" hreflang="en"/>`,
          `<link rel="alternate" href="${url("nl")}" hreflang="x-default"/>`,
        ].join("")
      : `<link rel="alternate" href="${url(lang)}" hreflang="${lang}"/>`;

    if (!hasCounterpart) skippedNoCounterpart++;

    // Gooi wat Docusaurus zelf neerzette weg en zet er één correct blok voor terug.
    let replaced = false;
    html = html.replace(ALTERNATE_RE, () => {
      if (replaced) return "";
      replaced = true;
      return block;
    });
    if (!replaced) html = html.replace("</head>", `${block}</head>`);

    // Markdown-variant aankondigen (idempotent: eerst de oude weghalen).
    html = html.replace(MARKDOWN_LINK_RE, "");
    html = html.replace(
      "</head>",
      `<link rel="alternate" type="text/markdown" href="${mdUrl}"/></head>`,
    );

    if (html !== before) {
      await writeFile(file, html, "utf8");
      patched++;
    }
  }
}

// -------------------------------------------------------- 2. Markdown-varianten
for (const lang of LANGS) {
  const docsDir = join(ROOT, lang, "docs");
  const buildDir = join(ROOT, "build", lang);
  const files = await walk(docsDir, (n) => n.endsWith(".md") || n.endsWith(".mdx"));

  // Eerst bestandspad -> route voor álle pagina's, zodat we links kunnen
  // omzetten naar de URL waar de doelpagina echt staat (custom slugs incluis).
  const routeOf = new Map();
  const parsed = new Map();
  for (const file of files) {
    const raw = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
    const fm = parseFrontmatter(raw);
    parsed.set(file, fm);
    const rel = relative(docsDir, file).replace(/\\/g, "/");
    routeOf.set(rel, routeFor(rel, fm.data.slug));
  }

  /** Los een relatieve .md-link op tegen de map van de bronpagina. */
  function absolutise(fromRel, href) {
    const [pathPart, hash = ""] = href.split("#");
    if (!/\.mdx?$/.test(pathPart)) return null;
    const segs = (dirname(fromRel) === "." ? [] : dirname(fromRel).split("/")).concat(
      pathPart.split("/"),
    );
    const stack = [];
    for (const s of segs) {
      if (s === "." || s === "") continue;
      else if (s === "..") stack.pop();
      else stack.push(s);
    }
    const target = routeOf.get(stack.join("/"));
    if (target === undefined) return null;
    return `${SITE_URL}/${lang}/wiki/${target}${hash ? "#" + hash : ""}`;
  }

  for (const file of files) {
    const { data, body } = parsed.get(file);
    const rel = relative(docsDir, file).replace(/\\/g, "/");
    const route = routeOf.get(rel);
    const canonical = `${SITE_URL}/${lang}/wiki/${route}`;

    // Relatieve bestandslinks ("../setup/databron-koppelen.md") zijn buiten
    // Docusaurus betekenisloos; wie de .md los ophaalt moet er iets aan hebben.
    const text = body
      .trim()
      .replace(/\]\(([^)\s]+\.mdx?(?:#[^)\s]*)?)\)/g, (m, href) => {
        const abs = absolutise(rel, href);
        return abs ? `](${abs})` : m;
      })
      // Docusaurus lost "/img/..." op tegen de baseUrl; buiten de build zou het
      // naar de marketingsite wijzen.
      .replace(/\]\(\/(img|files)\//g, `](${SITE_URL}/${lang}/wiki/$1/`);

    const head = [
      `<!-- ${data.title ?? route} -->`,
      `<!-- canonical: ${canonical} -->`,
      "",
    ].join("\n");

    const target = join(buildDir, `${route || "index"}.md`);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, head + text + "\n", "utf8");
    written++;
  }
}

console.log(
  `postbuild-seo: ${patched} HTML-pagina's van hreflang voorzien, ` +
    `${written} Markdown-varianten geschreven` +
    (skippedNoCounterpart ? `, ${skippedNoCounterpart} zonder tegenhanger (alleen eigen taal)` : ""),
);
