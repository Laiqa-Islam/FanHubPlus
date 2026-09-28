import { useEffect } from "react";

export const SITE_NAME = "Fan Hub Plus";
export const DEFAULT_TITLE = "Fan Hub Plus — The city glows louder after dark";
export const DEFAULT_DESCRIPTION =
  "Anime, gaming, film, television, K-Pop, comics, manga and cosplay — eight channels lit in neon. Stream the drops, open the character files, and save what you love.";

function setMeta(selector, attr, value) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [, key, name] = /\[(\w+)="([^"]+)"\]/.exec(selector) ?? [];
    if (key) tag.setAttribute(key, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
}

/**
 * Per-page document metadata: `<Meta title="Explore" />` gives
 * "Explore · Fan Hub Plus"; no title gives the site default.
 */
export function Meta({ title, description, image }) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE;
    setMeta('meta[name="description"]', "content", description || DEFAULT_DESCRIPTION);
    setMeta('meta[property="og:title"]', "content", title || DEFAULT_TITLE);
    setMeta('meta[property="og:description"]', "content", description || DEFAULT_DESCRIPTION);
    if (image) setMeta('meta[property="og:image"]', "content", image);
  }, [title, description, image]);

  return null;
}
