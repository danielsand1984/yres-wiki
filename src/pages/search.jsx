import React, {useEffect, useRef, useState} from 'react';
import Layout from '@theme/Layout';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {fetchIndex, searchPages, highlightParts} from '@site/src/lib/wikiSearch';
import {ASSISTANT_ASK_EVENT} from '@site/src/lib/assistantBridge';
import styles from './search.module.css';

const STR = {
  nl: {
    heading: 'Zoeken in de wiki',
    placeholder: 'Zoek in de wiki…',
    button: 'Zoeken',
    counting: 'Zoeken…',
    resultsFor: (n, q) => `${n} ${n === 1 ? 'resultaat' : 'resultaten'} voor “${q}”`,
    noResults: (q) => `Geen resultaten voor “${q}”.`,
    emptyPrompt: 'Typ een zoekterm om de wiki te doorzoeken.',
    askTitle: 'Niet gevonden wat je zocht?',
    askBody: 'Laat de AI-assistent je vraag beantwoorden op basis van de volledige wiki-inhoud.',
    askButton: 'Vraag het de AI-assistent',
    askHint: 'De assistent opent rechtsonder en beantwoordt je vraag meteen.',
  },
  en: {
    heading: 'Search the wiki',
    placeholder: 'Search the wiki…',
    button: 'Search',
    counting: 'Searching…',
    resultsFor: (n, q) => `${n} ${n === 1 ? 'result' : 'results'} for “${q}”`,
    noResults: (q) => `No results for “${q}”.`,
    emptyPrompt: 'Type a search term to search the wiki.',
    askTitle: 'Didn’t find what you were looking for?',
    askBody: 'Let the AI assistant answer your question from the full wiki content.',
    askButton: 'Ask the AI assistant',
    askHint: 'The assistant opens at the bottom-right and answers your question right away.',
  },
};

function parseQuery(search) {
  const m = /[?&]q=([^&]*)/.exec(search || '');
  return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
}

// Vraagt de AI-assistent te openen en de vraag te beantwoorden.
function askAssistant(question) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ASSISTANT_ASK_EVENT, {detail: {question, autoSend: true}}));
}

function SearchInner() {
  const {siteConfig} = useDocusaurusContext();
  const lang = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';
  const t = STR[lang];
  const indexUrl = useBaseUrl('/wiki-index.json');
  const searchUrl = useBaseUrl('/search');
  const history = useHistory();
  const location = useLocation();

  const urlQuery = parseQuery(location.search);
  const [input, setInput] = useState(urlQuery);
  const [results, setResults] = useState(null); // null = nog niet gezocht
  const [loading, setLoading] = useState(false);
  const pagesRef = useRef(null);

  // Houd het invoerveld in sync met de URL (bv. via de navbar-balk of back/forward).
  useEffect(() => {
    setInput(urlQuery);
  }, [urlQuery]);

  // Voer de zoekopdracht uit zodra de URL-query verandert.
  useEffect(() => {
    let cancelled = false;
    const q = urlQuery.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    (async () => {
      if (!pagesRef.current) {
        try {
          pagesRef.current = await fetchIndex(indexUrl);
        } catch {
          pagesRef.current = [];
        }
      }
      if (cancelled) return;
      setResults(searchPages(pagesRef.current, q));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [urlQuery, indexUrl]);

  function submit(e) {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    history.push(`${searchUrl}?q=${encodeURIComponent(q)}`);
  }

  function renderSnippet(r) {
    return highlightParts(r.snippet, r.terms).map((part, i) =>
      part.hit ? <mark key={i} className={styles.mark}>{part.text}</mark> : <span key={i}>{part.text}</span>,
    );
  }

  const hasQuery = urlQuery.trim().length >= 2;
  const noResults = hasQuery && !loading && results && results.length === 0;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.heading}>{t.heading}</h1>

      <form className={styles.searchForm} onSubmit={submit} role="search">
        <input
          className={styles.searchInput}
          type="search"
          autoFocus
          placeholder={t.placeholder}
          aria-label={t.heading}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className={styles.searchButton} type="submit">
          {t.button}
        </button>
      </form>

      {!hasQuery && <p className={styles.meta}>{t.emptyPrompt}</p>}

      {hasQuery && loading && <p className={styles.meta}>{t.counting}</p>}

      {hasQuery && !loading && results && results.length > 0 && (
        <>
          <p className={styles.meta}>{t.resultsFor(results.length, urlQuery.trim())}</p>
          <ul className={styles.results}>
            {results.map((r) => (
              <li key={r.url} className={styles.result}>
                <a href={r.url} className={styles.resultTitle}>
                  {r.title}
                </a>
                <p className={styles.resultSnippet}>{renderSnippet(r)}</p>
                <span className={styles.resultUrl}>{r.url}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {noResults && <p className={styles.meta}>{t.noResults(urlQuery.trim())}</p>}

      {/* AI-handoff: altijd zichtbaar bij een zoekopdracht, nadrukkelijk bij 0 resultaten. */}
      {hasQuery && !loading && (
        <div className={`${styles.askBox} ${noResults ? styles.askBoxPrimary : ''}`}>
          <div className={styles.askText}>
            <strong className={styles.askTitle}>{t.askTitle}</strong>
            <span className={styles.askBody}>{t.askBody}</span>
          </div>
          <div className={styles.askAction}>
            <button type="button" className={styles.askButton} onClick={() => askAssistant(urlQuery.trim())}>
              ✨ {t.askButton}
            </button>
            <span className={styles.askHint}>{t.askHint}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const {siteConfig} = useDocusaurusContext();
  const lang = siteConfig.baseUrl.startsWith('/en/') ? 'en' : 'nl';
  const title = lang === 'en' ? 'Search' : 'Zoeken';
  return (
    <Layout title={title} description={lang === 'en' ? 'Search the Yres wiki' : 'Zoek in de Yres-wiki'}>
      <SearchInner />
    </Layout>
  );
}
