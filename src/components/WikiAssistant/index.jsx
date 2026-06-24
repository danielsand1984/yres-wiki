import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {marked} from 'marked';
import DOMPurify from 'dompurify';
import styles from './styles.module.css';

// De assistent praat met een CENTRAAL endpoint op de marketingsite
// (/api/wiki-assistant) dat de Claude-key server-side bewaart. Geen key in de browser.
// Lokaal testen met een aparte Next-server: zet localStorage['yres-ai-endpoint']
// op bv. "http://localhost:3001/api/wiki-assistant".
const DEFAULT_ENDPOINT = '/api/wiki-assistant';

// UX-grenzen (de server dwingt de echte limieten af)
const MAX_QUESTIONS_PER_SESSION = 30;
const MAX_INPUT_CHARS = 600;
const COOLDOWN_MS = 1500;
const HISTORY_MESSAGES = 6;
const COUNT_STORAGE = 'yres-ai-count';
// Bewaar het gesprek tijdelijk binnen de sessie (per tab, gewist bij sluiten),
// zodat je je chat-historie niet kwijt bent als je een link in een antwoord volgt.
const MSGS_STORAGE = 'yres-ai-messages';
const OPEN_STORAGE = 'yres-ai-open';

const STR = {
  nl: {
    open: 'Vraag het de wiki',
    title: 'Wiki-assistent',
    intro: 'Stel een vraag over de Yres-wiki. Ik antwoord op basis van de wiki-inhoud en verwijs naar de juiste pagina\'s.',
    ask: 'Vraag…',
    send: 'Vraag stellen',
    thinking: 'Aan het zoeken in de wiki…',
    limitReached: `Je hebt het maximum van ${MAX_QUESTIONS_PER_SESSION} vragen voor deze sessie bereikt. Begin een nieuw gesprek om opnieuw te beginnen.`,
    newChat: 'Nieuw gesprek',
    cooldown: 'Even wachten tussen vragen…',
    tooLong: `Houd je vraag onder ${MAX_INPUT_CHARS} tekens.`,
    rate: 'Te veel vragen gesteld. Probeer het later opnieuw.',
    unavailable: 'De wiki-assistent is momenteel niet beschikbaar.',
    err: 'Er ging iets mis. Probeer het later opnieuw.',
    remaining: (n) => `${n} vragen over deze sessie`,
    disclaimer: 'Antwoorden zijn AI-gegenereerd op basis van de wiki — controleer bij twijfel de bronpagina.',
  },
  en: {
    open: 'Ask the wiki',
    title: 'Wiki assistant',
    intro: 'Ask a question about the Yres wiki. I answer from the wiki content and link to the relevant pages.',
    ask: 'Ask…',
    send: 'Ask',
    thinking: 'Searching the wiki…',
    limitReached: `You reached the limit of ${MAX_QUESTIONS_PER_SESSION} questions for this session. Start a new chat to begin again.`,
    newChat: 'New chat',
    cooldown: 'Please wait between questions…',
    tooLong: `Keep your question under ${MAX_INPUT_CHARS} characters.`,
    rate: 'Too many questions. Try again later.',
    unavailable: 'The wiki assistant is currently unavailable.',
    err: 'Something went wrong. Try again later.',
    remaining: (n) => `${n} questions left this session`,
    disclaimer: 'Answers are AI-generated from the wiki — verify on the source page when in doubt.',
  },
};

export default function WikiAssistant() {
  const baseUrl = useBaseUrl('/');
  const lang = /\/en\//.test(baseUrl) ? 'en' : 'nl';
  const t = STR[lang];

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // {role:'user'|'assistant', text}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [count, setCount] = useState(0);
  const lastSentRef = useRef(0);
  const scrollRef = useRef(null);

  // Hydrateer count + gesprek + open-status uit de sessie (na een navigatie/herlaad).
  useEffect(() => {
    try {
      setCount(Number(sessionStorage.getItem(COUNT_STORAGE) || 0));
      const saved = sessionStorage.getItem(MSGS_STORAGE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
      if (sessionStorage.getItem(OPEN_STORAGE) === '1') setOpen(true);
    } catch {}
  }, []);

  // Bewaar het gesprek + open-status zodat ze een navigatie overleven.
  useEffect(() => {
    try {
      if (messages.length) sessionStorage.setItem(MSGS_STORAGE, JSON.stringify(messages));
      else sessionStorage.removeItem(MSGS_STORAGE);
    } catch {}
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem(OPEN_STORAGE, open ? '1' : '0');
    } catch {}
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  function clearConversation() {
    setMessages([]);
    setError('');
    setCount(0);
    try {
      sessionStorage.removeItem(MSGS_STORAGE);
      sessionStorage.removeItem(COUNT_STORAGE);
    } catch {}
  }

  function endpoint() {
    try {
      return localStorage.getItem('yres-ai-endpoint') || DEFAULT_ENDPOINT;
    } catch {
      return DEFAULT_ENDPOINT;
    }
  }

  async function ask() {
    const q = input.trim();
    setError('');
    if (!q) return;
    if (q.length > MAX_INPUT_CHARS) return setError(t.tooLong);
    if (count >= MAX_QUESTIONS_PER_SESSION) return setError(t.limitReached);
    if (Date.now() - lastSentRef.current < COOLDOWN_MS) return setError(t.cooldown);
    lastSentRef.current = Date.now();

    const history = messages.slice(-HISTORY_MESSAGES).map((m) => ({role: m.role, content: m.text}));
    setMessages((m) => [...m, {role: 'user', text: q}]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({question: q, lang, history}),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.error) {
        setLoading(false);
        setMessages((m) => m.slice(0, -1));
        if (res.status === 429 || data.code === 'RATE_LIMITED') setError(t.rate);
        else if (res.status === 503 || data.code === 'NO_API_KEY') setError(t.unavailable);
        else setError(data.message || t.err);
        return;
      }

      setMessages((m) => [...m, {role: 'assistant', text: data.answer || '…'}]);
      const next = count + 1;
      setCount(next);
      try {
        sessionStorage.setItem(COUNT_STORAGE, String(next));
      } catch {}
    } catch (e) {
      setMessages((m) => m.slice(0, -1));
      setError(t.err);
    } finally {
      setLoading(false);
    }
  }

  function renderMd(md) {
    return {__html: DOMPurify.sanitize(marked.parse(md, {breaks: true}))};
  }

  return (
    <>
      <button className={styles.fab} aria-label={t.open} onClick={() => setOpen((o) => !o)} data-open={open}>
        {open ? '✕' : '✨'}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label={t.title}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>✨ {t.title}</span>
            <span className={styles.remaining}>{t.remaining(Math.max(0, MAX_QUESTIONS_PER_SESSION - count))}</span>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearConversation}
                title={t.newChat}
                aria-label={t.newChat}
                style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '15px', opacity: 0.85, padding: '0 4px', lineHeight: 1}}
              >
                ↻
              </button>
            )}
          </div>

          <div className={styles.messages} ref={scrollRef}>
            {messages.length === 0 && <p className={styles.intro}>{t.intro}</p>}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? styles.userMsg : styles.botMsg}>
                {m.role === 'assistant' ? (
                  <div className={styles.md} dangerouslySetInnerHTML={renderMd(m.text)} />
                ) : (
                  <span>{m.text}</span>
                )}
              </div>
            ))}
            {loading && <div className={styles.botMsg}><em>{t.thinking}</em></div>}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputRow}>
            <textarea
              className={styles.input}
              rows={2}
              maxLength={MAX_INPUT_CHARS + 50}
              placeholder={t.ask}
              value={input}
              disabled={loading || count >= MAX_QUESTIONS_PER_SESSION}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  ask();
                }
              }}
            />
            <button className={styles.primaryBtn} onClick={ask} disabled={loading || count >= MAX_QUESTIONS_PER_SESSION}>
              {t.send}
            </button>
          </div>

          <div className={styles.footer}>
            <span className={styles.disclaimer}>{t.disclaimer}</span>
          </div>
        </div>
      )}
    </>
  );
}
