# Deploy — wiki als subpad van de marketingsite

De wiki draait **niet** op een eigen domein, maar als statisch subdeel van de marketingsite:

| Taal | URL | baseUrl | Build-output |
|---|---|---|---|
| NL | `oogopdata.nl/nl/wiki/` | `/nl/wiki/` | `build/nl/` |
| EN | `oogopdata.nl/en/wiki/` | `/en/wiki/` | `build/en/` |

De marketingsite (Next.js) draait gewoon door op `/`; nginx onderschept alleen `/nl/wiki` en `/en/wiki` en serveert daar de statische Docusaurus-builds.

## 1. Bouwen (lokaal)

```bash
cd yres-wiki
npm install
npm run build:all      # → build/nl/  en  build/en/
```

`build:all` draait twee builds met de juiste `WIKI_LANG` + `baseUrl` (zie `package.json` / `docusaurus.config.js`).

## 2. Naar de server kopiëren

De wiki is statisch — geen Node/PM2 nodig op de server, alleen bestanden. Plaats ze los van de Next.js-app, bv. in `/var/www/yres-wiki/`:

```bash
# vanuit yres-wiki/, via tar-over-ssh (geen rsync op de VPS)
tar czf - -C build nl en | ssh root@<server> \
  'rm -rf /var/www/yres-wiki && mkdir -p /var/www/yres-wiki && tar xzf - -C /var/www/yres-wiki'
```

Resultaat op de server:
```
/var/www/yres-wiki/nl/   (index.html, assets/, concepten/, ...)
/var/www/yres-wiki/en/
```

> De marketing-VPS (Greenhost) is `root@185.88.142.48`. **Let op:** `oogopdata.nl` moet met een A-record naar dezelfde host wijzen die deze nginx draait, anders zie je de wiki niet op dat domein. (Zie het projectgeheugen over DNS-status.)

## 3. nginx — wiki vóór de Next.js-proxy

Voeg deze blocks toe in de `server { ... }` van de marketingsite, **boven** de bestaande `location / { proxy_pass ... }`. Het `^~`-prefix zorgt dat nginx deze paden zelf afhandelt i.p.v. door te sturen naar Next.js (dat `/nl/*` en `/en/*` anders via de `[locale]`-route zou afvangen).

```nginx
# --- Wiki (statische Docusaurus-builds) ---
location ^~ /nl/wiki/ {
    alias /var/www/yres-wiki/nl/;
    try_files $uri $uri/ /nl/wiki/404.html;
}
location = /nl/wiki { return 308 /nl/wiki/; }

location ^~ /en/wiki/ {
    alias /var/www/yres-wiki/en/;
    try_files $uri $uri/ /en/wiki/404.html;
}
location = /en/wiki { return 308 /en/wiki/; }

# --- Marketingsite (Next.js) ---
location / {
    proxy_pass http://localhost:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Toepassen:

```bash
nginx -t && systemctl reload nginx
```

## 4. Verifiëren

```bash
curl -sI https://oogopdata.nl/nl/wiki/        | head -1   # 200
curl -s  https://oogopdata.nl/nl/wiki/         | grep -o '<title>[^<]*'
curl -sI https://oogopdata.nl/en/wiki/concepten/load-types/ | head -1   # 200
```

De footer-link op de marketingsite (`yres-site/src/components/Footer.tsx`) wijst al naar `/{locale}/wiki`, dus zodra nginx staat werkt die automatisch.

## AI-assistent (centrale key)

De ✨-assistent in de wiki praat met een **centrale endpoint op de marketingsite**: `POST /api/wiki-assistant` (`yres-site/src/app/api/wiki-assistant/route.ts`). De Claude-key blijft server-side (`ANTHROPIC_API_KEY`, staat al in de server-`.env.local`).

- Geen extra nginx-config nodig: `/api/*` valt al onder `location /` en gaat dus naar de Next.js-app. De wiki (`/nl/wiki`) en de API (`/api/...`) delen origin `oogopdata.nl`, dus de browser doet een same-origin call.
- De route doet **server-side retrieval**: hij haalt `https://oogopdata.nl/{lang}/wiki/wiki-index.json` op (en cachet die 10 min). Daardoor is het endpoint niet als algemene Claude-proxy te misbruiken — alleen wiki-content gaat als context mee.
- Begrenzing: 40 vragen/IP/uur, max 600 tekens/vraag, max 1024 tokens/antwoord, model `claude-haiku-4-5`.
- Optioneel: `WIKI_INDEX_BASE` env op de Next-app om de index-URL te overschrijven (bv. interne host i.p.v. de loop via nginx).

**Lokaal testen** vereist dat de marketingsite (met echte key) draait; zet dan in de browser `localStorage['yres-ai-endpoint']` op `http://localhost:<next-poort>/api/wiki-assistant`. Zonder draaiende marketingsite werkt de assistent lokaal niet (de Docusaurus-devserver heeft geen `/api`).

## Updaten

Wiki-inhoud gewijzigd? `npm run build:all` + stap 2 opnieuw. Geen herstart nodig (statische bestanden).

## Let op — gevoelige inhoud

De `team/`-pagina's (organisatie, sales, support) zijn intern bedoeld maar staan in beide builds en zijn dus **publiek bereikbaar** zodra dit live staat. Wil je die afschermen, zet dan een `location ^~ /nl/wiki/team/ { auth_basic ... }` block erboven, of haal de team-pagina's uit de productie-build.
