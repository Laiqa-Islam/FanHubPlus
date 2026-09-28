/**
 * Turning member prose into storable HTML.
 *
 * Extracted from `app/actions/submissions.ts` in v2 so it can be unit tested —
 * a `"use server"` module may only export async functions, which makes the
 * functions inside one untestable in isolation. Given this is the boundary that
 * lets `dangerouslySetInnerHTML` be safe on the article page, being able to
 * assert its behaviour matters more than keeping it beside its caller.
 *
 * Contract: the output contains no markup originating from the input. Tags are
 * stripped for readability, then every remaining `&`, `<`, `>`, `"` and `'` is
 * escaped, so no sequence of member input can close our `<p>` and open an
 * element of its own.
 */

const ENTITIES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapes text for use in HTML. `&` must be handled first or it double-escapes. */
export function escapeHtml(input) {
  return input.replace(/[&<>"']/g, (character) => ENTITIES[character]);
}

/**
 * Splits prose on blank lines into escaped `<p>` paragraphs.
 *
 * Tags are removed before escaping so a member who types `<b>bold</b>` sees
 * "bold" rather than a literal `&lt;b&gt;` — a cosmetic step. The escape that
 * follows is the part doing the security work, and it runs unconditionally.
 */
export function toSafeParagraphs(input) {
  return (input ?? "")
    .split(/\n{2,}/)
    .map((block) => block.replace(/<[^>]*>/g, "").trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block)}</p>`)
    .join("\n");
}

/**
 * Flattens submitted HTML back to plain text, for summaries and search.
 * Entities are left encoded — this feeds text nodes, not markup.
 */
export function stripTags(html) {
  return (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * First `limit` characters of a body, cut on a word boundary so a summary
 * doesn't end mid-word.
 */
export function excerpt(html, limit = 180) {
  const text = stripTags(html)
    // Undo the escaping applied on the way in, so a summary reads as prose.
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
