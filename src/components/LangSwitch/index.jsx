import React, {useEffect, useState} from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Taalwissel die op DEZELFDE pagina blijft: vervangt alleen het locale-segment
// in het huidige pad (/nl/wiki/... <-> /en/wiki/...). Gewone <a> = zelfde tabblad,
// volledige navigatie (de twee talen zijn aparte statische builds).
export default function LangSwitch() {
  const {siteConfig} = useDocusaurusContext();
  const cur = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';
  const other = cur === 'en' ? 'nl' : 'en';

  // Fallback (SSR / vóór mount): home van de andere taal.
  const [target, setTarget] = useState(`/${other}/wiki/`);

  useEffect(() => {
    const p = window.location.pathname;
    setTarget(p.replace(`/${cur}/wiki`, `/${other}/wiki`));
  }, [cur, other]);

  return (
    <a className="navbar__item navbar__link" href={target} aria-label={`Switch to ${other.toUpperCase()}`}>
      {other.toUpperCase()}
    </a>
  );
}
