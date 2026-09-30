/* eslint-disable react-refresh/only-export-components -- server entry, not an HMR module */
import React from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import App from "./App.jsx";
import { headFor } from "./seo/head";
import { INDEXABLE_PATHS, ROUTES } from "./seo/site";

export { headFor, INDEXABLE_PATHS, ROUTES };
export { SITE_URL } from "./seo/site";

/** Render one route to an HTML string for the static prerender. */
export function render(url) {
  return renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </React.StrictMode>,
  );
}
