# Yres webapp capture (Playwright)

Documenteert **elk scherm** van de Yres-webapp (yres-web.app) als markdown-basis voor de wiki: per route een full-page screenshot + een lijst van alle koppen, tabbladen, knoppen, formuliervelden, dropdown-opties en tabelkolommen.

## Waarom handmatig inloggen?

De webapp gebruikt waarschijnlijk **Azure SSO** (en mogelijk MFA). Die laten zich slecht automatiseren én je wilt geen wachtwoorden in scripts. Daarom: het script opent een zichtbare browser, **jij logt in**, en daarna crawlt het automatisch. (Auto-login via `.env` kan, maar werkt niet met SSO.)

## Gebruik

```bash
cd tools/playwright-capture
cp .env.example .env          # vul YRES_URL in (en evt. credentials)
npm install                   # installeert playwright + chromium-browser
npm run capture
```

1. Er opent een browser op de login-pagina.
2. Log in (e-mail/wachtwoord of SSO).
3. Druk **Enter** in de terminal → de crawl start.
4. Output verschijnt in `output/`:
   - `output/_index.md` — overzicht van alle schermen
   - `output/<scherm>/screenshot.png`
   - `output/<scherm>/page.md` — gestructureerde inhoud

## Routes aanpassen

`routes.json` bevat een eerste set routes, afgeleid uit de productdocumentatie. **De echte paden kunnen afwijken** — kijk in de adresbalk van de webapp en pas `path` aan. Voeg schermen toe die ontbreken.

## Daarna

De `page.md`-bestanden zijn **ruwe basis**, geen eindtekst. Reviewen, redigeren en samenvoegen met de bestaande wiki-pagina's onder `docs/frontend/`. De screenshots kunnen (na review op gevoelige data) als illustratie in de wiki.

> ⚠️ Output kan klantdata / secrets bevatten (bv. op admin-secrets, data-sources). `output/` staat in `.gitignore`. Controleer screenshots vóór je ze in de wiki zet.
