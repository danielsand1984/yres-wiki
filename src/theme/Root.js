import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Docusaurus rendert <Root> rond de hele app, op elke pagina.
// De AI-assistent draait uitsluitend in de browser (eigen API-key, fetch, localStorage),
// dus laden we 'm via BrowserOnly — zo raakt SSR de component (en marked/dompurify) nooit.
export default function Root({children}) {
  return (
    <>
      {children}
      <BrowserOnly>
        {() => {
          const WikiAssistant = require('@site/src/components/WikiAssistant').default;
          return <WikiAssistant />;
        }}
      </BrowserOnly>
    </>
  );
}
