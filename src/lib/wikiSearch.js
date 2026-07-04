// Client-side zoeklogica voor de wiki. Leest de statische index
// (static/wiki-index.json, per taal gebouwd door scripts/build-wiki-index.mjs)
// en scoort pagina's tegen een zoekopdracht. Gedeeld door de navbar-zoekbalk
// (live dropdown) en de resultatenpagina (src/pages/search.jsx).

let _cache = null;
let _cacheUrl = null;

// Haalt de index één keer op en cachet 'm per URL binnen de sessie.
export async function fetchIndex(indexUrl) {
  if (_cache && _cacheUrl === indexUrl) return _cache;
  const res = await fetch(indexUrl, {headers: {accept: 'application/json'}});
  if (!res.ok) throw new Error(`wiki-index ${res.status}`);
  const data = await res.json();
  _cache = Array.isArray(data.pages) ? data.pages : [];
  _cacheUrl = indexUrl;
  return _cache;
}

function normalize(s) {
  // Diakriet-ongevoelig + lowercase, zodat "datawarehouse" ook "datawarehouse"
  // matcht en accenten in bv. "gé" geen match missen.
  const lowered = (s || '').toLowerCase().normalize('NFD');
  let out = '';
  for (const ch of lowered) {
    const c = ch.codePointAt(0);
    if (c >= 0x300 && c <= 0x36f) continue; // combining diacritics
    out += ch;
  }
  return out;
}

function terms(query) {
  return normalize(query).split(/[^a-z0-9$]+/).filter((w) => w.length >= 2);
}

// Bouwt een kort fragment rond de eerste match, met de matchende termen gemarkeerd
// als [[..]] zodat de UI ze kan highlighten zonder HTML te hoeven injecteren.
function snippet(text, qTerms) {
  const norm = normalize(text);
  let at = -1;
  for (const term of qTerms) {
    const i = norm.indexOf(term);
    if (i > -1 && (at === -1 || i < at)) at = i;
  }
  if (at === -1) return text.slice(0, 160).trim() + (text.length > 160 ? '…' : '');
  const start = Math.max(0, at - 70);
  const end = Math.min(text.length, at + 110);
  let frag = (start > 0 ? '…' : '') + text.slice(start, end).trim() + (end < text.length ? '…' : '');
  return frag;
}

// Scoort en sorteert alle pagina's tegen de query. Retourneert
// {title, url, snippet, terms} voor pagina's met score > 0, hoogste eerst.
export function searchPages(pages, query) {
  const qTerms = terms(query);
  const phrase = normalize(query).trim();
  if (!qTerms.length) return [];

  const scored = [];
  for (const p of pages) {
    const title = normalize(p.title);
    const headings = normalize((p.headings || []).join(' \n '));
    const body = normalize(p.text || '');
    let score = 0;

    for (const term of qTerms) {
      if (title.includes(term)) score += title.split(/\s+/).includes(term) ? 12 : 7;
      if (headings.includes(term)) score += 4;
      const hits = body.split(term).length - 1;
      if (hits > 0) score += Math.min(hits, 5);
    }
    // Hele-zin-bonus: exacte frase in titel/body weegt zwaar.
    if (phrase.length >= 3) {
      if (title.includes(phrase)) score += 30;
      else if (body.includes(phrase)) score += 8;
    }
    // Alle termen aanwezig ergens op de pagina → relevanter dan een deelmatch.
    const all = title + ' ' + headings + ' ' + body;
    if (qTerms.every((t) => all.includes(t))) score += 6;

    if (score > 0) {
      scored.push({
        title: p.title,
        url: p.url,
        snippet: snippet(p.text || '', qTerms),
        terms: qTerms,
        score,
      });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return scored;
}

// Splitst een fragment in stukjes {text, hit} zodat de UI de matchende
// termen kan vetten. Case-insensitief, diakriet-ongevoelig op de vergelijking.
export function highlightParts(text, qTerms) {
  if (!qTerms || !qTerms.length) return [{text, hit: false}];
  const escaped = qTerms
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'gi');
  const normText = normalize(text);
  // We matchen op de genormaliseerde tekst, maar knippen uit de originele tekst
  // op dezelfde indices (NFD houdt de lengte gelijk voor de meeste Latijnse tekens).
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(normText)) !== null) {
    if (m.index > last) parts.push({text: text.slice(last, m.index), hit: false});
    parts.push({text: text.slice(m.index, m.index + m[0].length), hit: true});
    last = m.index + m[0].length;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < text.length) parts.push({text: text.slice(last), hit: false});
  return parts;
}
