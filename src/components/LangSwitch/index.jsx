import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Taalwissel die op DEZELFDE pagina blijft: vervangt alleen het locale-segment
// in het huidige pad (/nl/wiki/... <-> /en/wiki/...). Gewone <a> = zelfde tabblad,
// volledige navigatie (de twee talen zijn aparte statische builds).
export default function LangSwitch({mobile, onClick}) {
  const {siteConfig} = useDocusaurusContext();
  const cur = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';
  const other = cur === 'en' ? 'nl' : 'en';

  // Fallback (SSR / vóór mount): home van de andere taal.
  const [target, setTarget] = useState(`/${other}/wiki/`);

  useEffect(() => {
    const p = window.location.pathname;
    setTarget(p.replace(`/${cur}/wiki`, `/${other}/wiki`));
  }, [cur, other]);

  // Mobile: Docusaurus hides desktop navbar items and renders the hamburger
  // menu separately, so custom items must return menu markup here.
  if (mobile) {
    return (
      <li className="menu__list-item">
        <a className="menu__link" href={target} onClick={onClick} aria-label={`Switch to ${other.toUpperCase()}`}>
          🌐 {cur.toUpperCase()} → {other.toUpperCase()}
        </a>
      </li>
    );
  }

  return (
    <a className="navbar__item navbar__link" href={target} aria-label={`Switch to ${other.toUpperCase()}`}>
      {other.toUpperCase()}
    </a>
  );
}
