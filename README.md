# Yres kennisbank (Docusaurus)

Eén centrale wiki voor Yres — het Azure data platform (voorheen **Iris**). Legt alle concepten, functies, load types, Azure-resources, frontend-schermen, setup en SQL-referentie uit.

## Waar draait dit?

**Nog nergens live.** Het is bedoeld als **subdeel van de marketingsite**: `oogopdata.nl/nl/wiki` en `oogopdata.nl/en/wiki`, geserveerd door nginx als statische builds. Zie **[DEPLOY.md](./DEPLOY.md)** voor de nginx-route + build-stappen.

```bash
npm install
npm start          # NL dev-server op http://localhost:3000
npm run start:en   # EN dev-server
npm run build:all  # → build/nl/  en  build/en/  (twee talen)
npm run serve      # build lokaal serveren
```

Tweetalig via één config + de env-var `WIKI_LANG` (nl/en): zelfde sidebar en doc-ids, NL-content in `docs/`, EN-content in `docs-en/`.

## Inhoud

Eén docs-tree (`docs/`, sidebar `sidebars.js`). Secties: Product · Concepten (incl. **Load types**) · Architectuur · Gebruik (frontend) · Setup & installatie · Integraties & databronnen · Referentie (incl. volledige **SQL Interaction**: 64 procedures, 35 functions, 17 views) · Prijzen · Klanten · FAQ · Troubleshooting · Team.

## Bronnen

- `WIKI Sources/Yres Documentation 1.55.pdf` — officiële productdocumentatie (179 p, gezaghebbend)
- `WIKI Sources/Yres Learning.pdf` — trainingscursus (213 p; secties 11–13 zijn generiek/onaf → niet gebruikt)
- `WIKI Sources/_text/` — geëxtraheerde tekst (PyMuPDF; gitignored)
- `../Branding/Texts/Final/`, `../Branding/Interviews/` — marketing-copy en klantinterviews

### SQL-referentie regenereren

De pagina's onder `docs/referentie/sql/` zijn **gegenereerd** uit de PDF-tekst (§7). Bij een nieuwe documentatieversie: tekst opnieuw extraheren met PyMuPDF en het generatiescript herdraaien (zie projectgeheugen).

## Screenshots / step-by-step uit de webapp

`tools/playwright-capture/` bevat een Playwright-crawler die elk webapp-scherm documenteert (screenshots + knoppen/opties/velden) als extra basis. Zie de README daar.

## Huisstijl

`src/css/custom.css` — primair oranje `#FBAF42`, ink-50 `#F6F9F9`, body Open Sans. Koppen vallen terug op systeemfont (Franie is commercieel, niet meegeleverd).
