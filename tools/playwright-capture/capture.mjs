// Yres webapp capture (diep, click-gestuurd) — legt de hele app vast voor de wiki.
//
// Inzicht: deep-linken (goto) laadt wél de inhoud, maar synct de sectie-navigatie niet.
// De subpagina's van een sectie verschijnen alleen als je het sectie-icoon in de linker
// icoonbalk AANKLIKT. Daarom:
//   FASE 1 (ontdekken): klik elk icoon in de linker balk → oogst de dan-zichtbare
//                       sidebar-links (de subpagina's van die sectie).
//   FASE 2 (vastleggen): bezoek elke ontdekte URL (goto), screenshot + extract, en klik
//                       per pagina de tabs/knoppen aan voor sub-views.
// Dedup van data-ID's (/sources/:id/...). Veilig op yres.dev: uitlog/vernietigend overslaan.
//
// Autonoom: met bewaarde sessie (auth-state.json + auth-origin.txt) start hij zonder login.

import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import "dotenv/config";

const LOGIN_URL = (process.env.YRES_URL || "https://www.yres.dev").replace(/\/$/, "");
const ROOT_DOMAIN = "yres.dev";
const MAX_PAGES = Number(process.env.MAX_PAGES || 150);
const MAX_DEPTH = Number(process.env.MAX_DEPTH || 4);
const CLICKS_PER_PAGE = Number(process.env.CLICKS_PER_PAGE || 24);
const RAIL_MAX_X = 80; // px: breedte van de linker icoonbalk
const LOGIN_TIMEOUT_MS = 10 * 60 * 1000;

const OUT = fileURLToPath(new URL("./output/", import.meta.url));
const STATE = fileURLToPath(new URL("./auth-state.json", import.meta.url));
const ORIGIN_FILE = fileURLToPath(new URL("./auth-origin.txt", import.meta.url));

const SKIP_URL = /logout|log-?off|sign-?out|uitloggen/i;
const SKIP_CLICK = /^\s*(logout|log ?off|sign ?out|uitloggen|delete|verwijder|remove|rebuild|herbouw|destroy|cancel subscription|opzeggen|drop|truncate|reset|save|opslaan|submit|verzend|confirm|bevestig|run|start|execute|uitvoeren|install|installeer|release|deploy|publish|publiceer|deactivate|deactiveer|enable|disable)\b/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Na een domcontentloaded-goto: wacht kort op rust (max 8s, hangt niet) + render-buffer.
const settle = async (page) => { await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(800); };
const host = (u) => { try { return new URL(u).hostname; } catch { return ""; } };
const inApp = (u) => { const h = host(u); return h.endsWith(ROOT_DOMAIN) && h !== `www.${ROOT_DOMAIN}` && h !== ROOT_DOMAIN; };

function dedupKey(u) {
  try {
    const x = new URL(u); x.hash = ""; x.search = "";
    const path = x.pathname.replace(/\/+$/, "").split("/").map((s) => (/^\d+$/.test(s) || /^[0-9a-f-]{16,}$/i.test(s) ? ":id" : s)).join("/");
    return x.origin + (path || "/");
  } catch { return u; }
}
function slug(u) {
  const p = new URL(dedupKey(u)).pathname.replace(/\/+$/, "") || "/home";
  return p.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "home";
}
async function noVisiblePassword(page) {
  try { return await page.evaluate(() => ![...document.querySelectorAll('input[type="password"]')].some((el) => el.offsetParent !== null && el.getClientRects().length > 0)); } catch { return false; }
}
// Echt "in de app" = op een app-subdomein, NIET op /login, én de icoonbalk is gerenderd.
async function inAppReady(page) {
  try {
    if (!inApp(page.url()) || /\/(login|signin|sign-in|auth)\b/i.test(page.url())) return false;
    return (await railHandles(page)).length > 0;
  } catch { return false; }
}
async function waitForApp(page, ctx) {
  console.log("\n>> Log in en KIES een organisatie. Ik start zodra je in de app bent…\n");
  const start = Date.now(); let stable = 0;
  while (Date.now() - start < LOGIN_TIMEOUT_MS) {
    await sleep(2000);
    try { if (host(page.url()).endsWith(ROOT_DOMAIN)) await ctx.storageState({ path: STATE }); } catch {}
    if (await inAppReady(page)) { if (++stable >= 2) return; } else stable = 0;
  }
  throw new Error("App-scherm niet gedetecteerd.");
}

const harvest = (page) => page.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.href));

function extractPage() {
  const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const pick = (sel) => uniq([...document.querySelectorAll(sel)].map((e) => clean(e.textContent)));
  return {
    title: document.title,
    headings: uniq([...document.querySelectorAll("h1,h2,h3,h4")].map((e) => `${e.tagName} ${clean(e.textContent)}`)),
    tabs: pick('[role="tab"], .tab, nav a, .nav-link'),
    buttons: pick('button, [role="button"], input[type="submit"], a.btn'),
    inputs: uniq([...document.querySelectorAll("input,textarea,select")].map((e) => {
      const label = e.labels?.[0]?.textContent || e.getAttribute("placeholder") || e.getAttribute("name") || e.getAttribute("aria-label");
      return clean(`${e.tagName.toLowerCase()}${e.type ? `[${e.type}]` : ""}: ${label || "(naamloos)"}`);
    })),
    selectOptions: uniq([...document.querySelectorAll("select")].flatMap((s) => [...s.options].map((o) => clean(o.textContent)))).slice(0, 200),
    tableHeaders: pick("table th"),
    links: uniq([...document.querySelectorAll("a[href]")].map((a) => a.href)),
  };
}
function fmt(url, data, extra = "") {
  const list = (t, arr) => (arr && arr.length ? `\n### ${t}\n\n${arr.map((x) => `- ${x}`).join("\n")}\n` : "");
  return `---\ntitle: ${data.title || url}\n---\n\n# ${data.title || url}\n\n> ${dedupKey(url)} · Auto-gegenereerd met Playwright. Redigeer voor opname in de wiki.\n\n![screenshot](./screenshot.png)\n${list("Koppen", data.headings)}${list("Tabbladen / navigatie", data.tabs)}${list("Knoppen", data.buttons)}${list("Formuliervelden", data.inputs)}${list("Dropdown-opties", data.selectOptions)}${list("Tabelkolommen", data.tableHeaders)}${extra}`;
}

async function waitForRail(page) {
  for (let t = 0; t < 14; t++) { if ((await railHandles(page)).length > 0) return; await page.waitForTimeout(1000); }
}
// Element-handles in de linker icoonbalk (kleine, zichtbare, links uitgelijnd).
async function railHandles(page) {
  const els = await page.locator('a, button, [role="button"]').elementHandles();
  const out = [];
  for (const el of els) {
    try { const b = await el.boundingBox(); if (b && b.x < RAIL_MAX_X && b.width < 70 && b.height < 70 && b.y > 40) out.push(el); } catch {}
  }
  return out;
}

async function main() {
  const reuse = existsSync(STATE);
  const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...(reuse ? { storageState: STATE } : {}) });
  const page = await ctx.newPage();

  let started = false;
  if (reuse && existsSync(ORIGIN_FILE)) {
    const saved = readFileSync(ORIGIN_FILE, "utf8").trim();
    await page.goto(saved, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => {});
    await settle(page);
    await waitForRail(page);
    if (await inAppReady(page)) { started = true; console.log(`✔ Autonoom ingelogd: ${new URL(page.url()).origin}`); }
    else console.log("Bewaarde sessie verlopen — handmatige login nodig.");
  }
  if (!started) {
    if (process.env.AUTO === "1") { console.error("Sessie verlopen — handmatige login nodig."); await browser.close(); process.exit(2); }
    await page.goto(`${LOGIN_URL}/login`, { waitUntil: "domcontentloaded" }).catch(() => {});
    if (!inApp(page.url())) await waitForApp(page, ctx);
  }
  await ctx.storageState({ path: STATE });
  await writeFile(ORIGIN_FILE, new URL(page.url()).origin).catch(() => {});

  const APP = new URL(page.url()).origin;
  const DASH = `${APP}/`;
  const sameApp = (u) => host(u) === host(APP);
  const norm = (u) => { try { const x = new URL(u, APP); x.hash = ""; return x.origin + x.pathname; } catch { return null; } };

  const discovered = new Set();
  const addUrl = (u) => { const n = norm(u); if (n && sameApp(n) && !SKIP_URL.test(n)) discovered.add(n); };

  // FASE 1 — ontdekken: klik elk icoon in de linker balk en oogst de zichtbare links.
  await page.goto(DASH, { waitUntil: "domcontentloaded" }).catch(() => {});
  await settle(page);
  await waitForRail(page);
  (await harvest(page)).forEach(addUrl);
  const railCount = (await railHandles(page)).length;
  console.log(`Icoonbalk: ${railCount} knoppen. Ontdekken…`);
  for (let i = 0; i < railCount; i++) {
    try {
      await page.goto(DASH, { waitUntil: "domcontentloaded", timeout: 30000 });
      await settle(page);
      await waitForRail(page);
      const rail = await railHandles(page);
      if (!rail[i]) continue;
      await rail[i].click({ timeout: 4000 }).catch(() => {});
      await page.waitForTimeout(1200);
      (await harvest(page)).forEach(addUrl);          // sectie-landing + sidebar-links
      addUrl(page.url());
      // klik ook de nu-zichtbare sidebar-links (secundaire nav) om hun URLs te oogsten
      const subLinks = await page.locator("a[href]").elementHandles();
      for (const a of subLinks) { try { const href = await a.getAttribute("href"); if (href) addUrl(href); } catch {} }
    } catch {}
  }
  console.log(`Ontdekt: ${discovered.size} URLs.`);

  // FASE 2 — vastleggen: bezoek elke ontdekte URL (BFS verdiept verder via links).
  await mkdir(OUT, { recursive: true });
  // Ontdubbel op template (één /sources/:id i.p.v. tientallen instanties).
  const queue = [], seen = new Set();
  for (const u of discovered) { const k = dedupKey(u); if (!seen.has(k)) { seen.add(k); queue.push({ url: u, depth: 0 }); } }
  const index = [`# Yres webapp capture\n\nGegenereerd van ${APP}.\n`];
  let done = 0;

  while (queue.length && done < MAX_PAGES) {
    const { url, depth } = queue.shift();
    const name = slug(url);
    const dir = join(OUT, name);
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await settle(page);
      await mkdir(dir, { recursive: true });
      await page.screenshot({ path: join(dir, "screenshot.png"), fullPage: true });
      const data = await page.evaluate(extractPage);
      if (depth < MAX_DEPTH) for (const link of data.links) { const n = norm(link); const k = n && dedupKey(n); if (n && sameApp(n) && !SKIP_URL.test(n) && !seen.has(k)) { seen.add(k); queue.push({ url: n, depth: depth + 1 }); } }

      // in-page tabs/knoppen → sub-views (zelfde URL)
      let extra = "", clickNo = 0;
      const cands = (await page.evaluate(() => {
        const clean = (s) => (s || "").replace(/\s+/g, " ").trim();
        return [...document.querySelectorAll('[role="tab"], [role="menuitem"], button')].map((e) => ({ text: clean(e.innerText || e.getAttribute("aria-label") || ""), vis: e.offsetParent !== null && e.getClientRects().length > 0 }));
      })).map((c, i) => ({ ...c, i })).filter((c) => c.vis && c.text && !SKIP_CLICK.test(c.text)).slice(0, CLICKS_PER_PAGE);
      for (const cand of cands) {
        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForTimeout(700);
          const loc = page.locator('[role="tab"], [role="menuitem"], button').nth(cand.i);
          const before = page.url();
          await loc.click({ timeout: 4000 });
          await page.waitForTimeout(1100); // modal/paneel laten renderen
          if (dedupKey(page.url()) !== dedupKey(before)) { const n = norm(page.url()); const k = n && dedupKey(n); if (n && sameApp(n) && !seen.has(k)) { seen.add(k); queue.push({ url: n, depth: depth + 1 }); } continue; }
          clickNo++;
          const shot = `view-${clickNo}.png`;
          await page.screenshot({ path: join(dir, shot), fullPage: true });
          const sub = await page.evaluate(extractPage);
          const safe = cand.text.slice(0, 60);
          extra += `\n---\n\n## ${safe}\n\n![${safe}](./${shot})\n` +
            (sub.inputs.length ? `\nVelden: ${sub.inputs.join(" · ")}\n` : "") +
            (sub.buttons.length ? `\nKnoppen: ${sub.buttons.slice(0, 25).join(" · ")}\n` : "") +
            (sub.tableHeaders.length ? `\nTabelkolommen: ${sub.tableHeaders.join(" · ")}\n` : "");
          await page.keyboard.press("Escape").catch(() => {});
        } catch {}
      }

      await writeFile(join(dir, "page.md"), fmt(url, data, extra));
      index.push(`- [${name}](./${name}/page.md) — \`${new URL(dedupKey(url)).pathname}\` — ${data.headings.length} koppen, ${data.buttons.length} knoppen, ${data.inputs.length} velden, ${clickNo} sub-views`);
      console.log(`✔ [${++done}/${seen.size}] ${name} (+${clickNo})`);
    } catch (e) {
      index.push(`- ${name} — ⚠️ ${e.message}`);
      console.log(`✘ ${name}: ${e.message}`);
    }
  }

  await writeFile(join(OUT, "_index.md"), index.join("\n") + "\n");
  console.log(`\nKlaar. ${done} schermen → output/_index.md`);
  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
