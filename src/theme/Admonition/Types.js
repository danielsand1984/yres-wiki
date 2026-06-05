import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';

/**
 * Brand-orange accent admonition. Use in Markdown as:
 *
 *   :::accent Optionele titel
 *   Inhoud van het accent-blok.
 *   :::
 *
 * Registered as a custom admonition type (keyword `accent` is added in
 * docusaurus.config.js). Styling lives in src/css/custom.css
 * (`.theme-admonition-accent`).
 */
function AccentAdmonition(props) {
  return (
    <div className="theme-admonition theme-admonition-accent admonition alert alert--accent">
      {props.title && (
        <div className="admonition-heading">
          <h5>{props.title}</h5>
        </div>
      )}
      <div className="admonition-content">{props.children}</div>
    </div>
  );
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,
  accent: AccentAdmonition,
};

export default AdmonitionTypes;
