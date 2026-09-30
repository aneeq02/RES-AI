import { ROUTES, SITE_NAME, DEFAULT_OG_IMAGE, absoluteUrl } from "./site";
import { schemaFor } from "./schema";

/** Head tags for a route, shared by the client component and the prerenderer. */
export function headFor(path) {
  const known = Boolean(ROUTES[path]);
  const meta = known ? ROUTES[path] : ROUTES["/404"];
  const url = absoluteUrl(known ? path : "/404");
  const indexable = known && meta.index !== false;
  return {
    title: meta.title,
    description: meta.description,
    canonical: indexable ? url : null,
    robots: indexable ? "index, follow, max-image-preview:large" : "noindex, follow",
    og: {
      "og:type": "website",
      "og:site_name": SITE_NAME,
      "og:locale": "en_US",
      "og:title": meta.title,
      "og:description": meta.description,
      "og:url": url,
      "og:image": absoluteUrl(DEFAULT_OG_IMAGE),
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": "res — AI employees that never sleep",
    },
    twitter: {
      "twitter:card": "summary_large_image",
      "twitter:title": meta.title,
      "twitter:description": meta.description,
      "twitter:image": absoluteUrl(DEFAULT_OG_IMAGE),
    },
    schema: indexable ? schemaFor(path) : null,
  };
}
