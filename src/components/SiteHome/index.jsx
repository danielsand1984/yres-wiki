import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Link naar de marketingsite-home in de geselecteerde taal (/nl of /en).
// Rauwe <a> zodat Docusaurus 'm niet met de wiki-baseUrl prefixt; root-relatief
// zodat het op elk host werkt (IP of oogopdata.nl). Zelfde tabblad.
export default function SiteHome({mobile, onClick}) {
  const {siteConfig} = useDocusaurusContext();
  const lang = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';

  // Mobile menu markup (desktop navbar items are hidden on mobile).
  if (mobile) {
    return (
      <li className="menu__list-item">
        <a className="menu__link" href={`/${lang}`} onClick={onClick}>
          ← Site
        </a>
      </li>
    );
  }

  return (
    <a className="navbar__item navbar__link" href={`/${lang}`}>
      ← Site
    </a>
  );
}
