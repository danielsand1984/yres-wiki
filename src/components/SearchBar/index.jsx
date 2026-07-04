import React, {useEffect, useRef, useState} from 'react';
import {useHistory} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {fetchIndex, searchPages, highlightParts} from '@site/src/lib/wikiSearch';
import styles from './styles.module.css';

const STR = {
  nl: {
    placeholder: 'Zoek in de wiki…',
    label: 'Zoeken',
    all: (n) => `Alle ${n} resultaten tonen`,
    none: 'Geen pagina gevonden',
    askAi: 'Vraag het de AI-assistent',
  },
  en: {
    placeholder: 'Search the wiki…',
    label: 'Search',
    all: (n) => `Show all ${n} results`,
    none: 'No page found',
    askAi: 'Ask the AI assistant',
  },
};

// Navbar-zoekbalk met live dropdown. Enter of "alle resultaten" gaat naar de
// resultatenpagina (/{lang}/wiki/search?q=). Zowel de dropdown als de pagina
// gebruiken dezelfde index + ranking (src/lib/wikiSearch.js).
export default function SearchBar({mobile}) {
  const {siteConfig} = useDocusaurusContext();
  const lang = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';
  const t = STR[lang];
  const indexUrl = useBaseUrl('/wiki-index.json');
  const searchUrl = useBaseUrl('/search');
  const history = useHistory();

  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const pagesRef = useRef(null);
  const rootRef = useRef(null);
  const debounceRef = useRef(0);

  // Lazy-load de index bij de eerste focus/typ-actie.
  async function ensureIndex() {
    if (pagesRef.current) return pagesRef.current;
    try {
      pagesRef.current = await fetchIndex(indexUrl);
    } catch {
      pagesRef.current = [];
    }
    return pagesRef.current;
  }

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setActive(-1);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const pages = await ensureIndex();
      setResults(searchPages(pages, query).slice(0, 6));
      setActive(-1);
    }, 140);
    return () => clearTimeout(debounceRef.current);
  }, [q]);

  // Klik buiten de balk sluit de dropdown.
  useEffect(() => {
    function onDoc(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function goToResults(query) {
    const query2 = (query ?? q).trim();
    if (!query2) return;
    setOpen(false);
    history.push(`${searchUrl}?q=${encodeURIComponent(query2)}`);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (open && active >= 0 && active < results.length) history.push(results[active].url);
      else goToResults();
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  function renderSnippet(r) {
    return highlightParts(r.snippet, r.terms).map((part, i) =>
      part.hit ? <mark key={i} className={styles.mark}>{part.text}</mark> : <span key={i}>{part.text}</span>,
    );
  }

  return (
    <div className={`${styles.root} ${mobile ? styles.mobile : ''}`} ref={rootRef}>
      <div className={styles.inputWrap}>
        <svg className={styles.icon} width="15" height="15" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M8.5 3a5.5 5.5 0 1 0 3.4 9.8l4.1 4.2 1.4-1.4-4.2-4.1A5.5 5.5 0 0 0 8.5 3Z"
          />
        </svg>
        <input
          type="search"
          className={styles.input}
          placeholder={t.placeholder}
          aria-label={t.label}
          value={q}
          onFocus={() => {
            ensureIndex();
            if (results.length) setOpen(true);
          }}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && q.trim().length >= 2 && (
        <div className={styles.dropdown} role="listbox">
          {results.length === 0 ? (
            <div className={styles.empty}>
              <span>{t.none}</span>
              <button
                type="button"
                className={styles.askAiInline}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToResults()}
              >
                ✨ {t.askAi}
              </button>
            </div>
          ) : (
            <>
              {results.map((r, i) => (
                <a
                  key={r.url}
                  href={r.url}
                  role="option"
                  aria-selected={i === active}
                  className={`${styles.item} ${i === active ? styles.itemActive : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setOpen(false)}
                >
                  <span className={styles.itemTitle}>{r.title}</span>
                  <span className={styles.itemSnippet}>{renderSnippet(r)}</span>
                </a>
              ))}
              <button
                type="button"
                className={styles.allResults}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goToResults()}
              >
                {t.all(results.length >= 6 ? '6+' : results.length)}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
