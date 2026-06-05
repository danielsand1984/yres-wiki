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

De wiki is statisch — geen Node/PM2 nodig op de server, alleen bestanden. Dit is
geautomatiseerd in `scripts/push-to-vps.sh`, en draait automatisch bij een merge
naar `main` (post-merge hook → build + deploy + `git push origin main`).

```bash
# vanuit yres-wiki/ — bouwt build:all en deployt naar de VPS
scripts/push-to-vps.sh
```

De **live** nginx serveert de wiki met `root /var/www/yres-wiki`, dus `/nl/wiki/`
mapt naar `/var/www/yres-wiki/nl/wiki/`. Het script plaatst elke taalbuild dáár:
```
/var/www/yres-wiki/nl/wiki/   (index.html, assets/, concepten/, ...)
/var/www/yres-wiki/en/wiki/
```

> De marketing-VPS (Greenhost) is `root@185.88.142.48`. **Let op:** `oogopdata.nl` moet met een A-record naar dezelfde host wijzen die deze nginx draait, anders zie je de wiki niet op dat domein. (Zie het projectgeheugen over DNS-status.)

## 3. nginx — wiki vóór de Next.js-proxy

Voeg deze blocks toe in de `server { ... }` van de marketingsite, **boven** de bestaande `location / { proxy_pass ... }`. Het `^~`-prefix zorgt dat nginx deze paden zelf afhandelt i.p.v. door te sturen naar Next.js (dat `/nl/*` en `/en/*` anders via de `[locale]`-route zou afvangen).

> **Live config gebruikt `root` (niet `alias`).** De daadwerkelijk draaiende
> `/etc/nginx/sites-available/yres` gebruikt onderstaande `root`-variant; daarom
> deployt het script naar `…/nl/wiki/` en `…/en/wiki/` (zie §2). Niet aan deze
> nginx-config morrelen tenzij nodig — die is handmatig en heeft prod al eens platgelegd.

```nginx
# --- Wiki (statische Docusaurus-builds) — LIVE variant ---
location ^~ /nl/wiki/ { root /var/www/yres-wiki; try_files $uri $uri/ =404; }
location = /nl/wiki { return 308 /nl/wiki/; }

location ^~ /en/wiki/ { root /var/www/yres-wiki; try_files $uri $uri/ =404; }
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
