// @ts-check
// Yres kennisbank — Docusaurus config.
//
// Tweetalig via één config + de env-var WIKI_LANG (nl | en):
//   WIKI_LANG=nl → docs/    op baseUrl /nl/wiki/   (default)
//   WIKI_LANG=en → docs-en/ op baseUrl /en/wiki/
// Bouw beide met `npm run build:all`. nginx serveert /nl/wiki en /en/wiki
// als subpaden van de marketingsite (oogopdata.nl). Zie DEPLOY.md.

import {themes as prismThemes} from 'prism-react-renderer';

const LANG = process.env.WIKI_LANG === 'en' ? 'en' : 'nl';
const isEN = LANG === 'en';

const t = (nl, en) => (isEN ? en : nl);

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: t('Yres kennisbank', 'Yres knowledge base'),
  tagline: t('Het Azure data platform — concepten, functies, resources', 'The Azure data platform — concepts, features, resources'),
  favicon: 'img/yres-icon.png',

  url: 'https://oogopdata.nl',
  baseUrl: isEN ? '/en/wiki/' : '/nl/wiki/',

  organizationName: 'yres',
  projectName: 'yres-wiki',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: LANG,
    locales: [LANG],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: isEN ? 'en/docs' : 'nl/docs',
          routeBasePath: '/', // docs op de baseUrl-root → schone URL's, bv. /nl/wiki/concepten/load-types
          sidebarPath: './sidebars.js',
          editUrl: undefined,
          // Extra admonition-keyword `:::accent` (merk-oranje blok), naast de
          // standaard note/tip/info/warning/danger. Gerenderd via
          // src/theme/Admonition/Types.js.
          admonitions: {
            keywords: ['accent'],
            extendDefaults: true,
          },
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/yres-social-card.png',
      colorMode: {
        defaultMode: 'light',
        // false: stabiel light-default met een gewone light↔dark-toggle. true gaf
        // de OS-voorkeur ("auto") mee in de cyclus en botste bij hydration met
        // defaultMode → zichtbaar theme-geflikker bij laden/navigeren.
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: '',
        logo: {
          alt: t('Yres kennisbank', 'Yres knowledge base'),
          src: 'img/yres-logo.png',
          // geen vaste width/height: het thema zet de hoogte (2rem) en breedte = auto,
          // zodat de beeldverhouding van het logo behouden blijft.
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'wikiSidebar',
            position: 'left',
            label: 'Wiki',
            // Verborgen in het mobiele hamburger-menu (de categorieën staan daar
            // al inline); op desktop + landingspagina blijft het zichtbaar.
            className: 'navbar-item--wiki',
          },
          {
            // Taalwissel: blijft op dezelfde pagina, zelfde tabblad (custom component).
            type: 'custom-langSwitch',
            position: 'right',
          },
          {
            // Naar de marketingsite-home in de geselecteerde taal, zelfde tabblad (custom component).
            type: 'custom-siteHome',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Product',
            items: [
              {label: t('Overzicht', 'Overview'), to: '/product/overzicht'},
              {label: 'Features', to: '/product/features'},
              {label: t('Integraties', 'Integrations'), to: '/integraties/overzicht'},
              {label: t('Prijzen', 'Pricing'), to: '/prijzen'},
            ],
          },
          {
            title: 'Wiki',
            items: [
              {label: t('Yres uitgelegd', 'Yres explained'), to: '/yres-uitgelegd'},
              {label: 'Load types', to: '/concepten/load-types'},
              {label: t('Installatie', 'Installation'), to: '/setup/installatie'},
              {label: t('Begrippenlijst', 'Glossary'), to: '/glossary'},
            ],
          },
          {
            title: 'Yres',
            items: [
              {label: 'yres.app', href: 'https://www.yres.app'},
              {label: 'info@yres.app', href: 'mailto:info@yres.app'},
            ],
          },
        ],
        copyright: 'Yres — Friesestraatweg 219, 9743 AD Groningen · +31 85 130 3905.',
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
