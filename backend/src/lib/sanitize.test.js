import { describe, expect, it } from "vitest";

import { escapeHtml, excerpt, stripTags, toSafeParagraphs } from "./sanitize.js";

/**
 * `toSafeParagraphs` is what makes `dangerouslySetInnerHTML` defensible on the
 * article page: member prose is the one body of text on the site that reaches
 * that call, and it reaches it through here.
 */

describe("escapeHtml", () => {
  it("escapes every character with meaning in HTML", () => {
    expect(escapeHtml(`<>&"'`)).toBe("&lt;&gt;&amp;&quot;&#39;");
  });

  it("escapes ampersands once, not twice", () => {
    // A naive implementation that replaces "<" before "&" turns "&lt;" into
    // "&amp;lt;" and renders the entity as literal text.
    expect(escapeHtml("a & b")).toBe("a &amp; b");
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("leaves ordinary prose untouched", () => {
    expect(escapeHtml("A perfectly normal sentence.")).toBe(
      "A perfectly normal sentence.",
    );
  });
});

describe("toSafeParagraphs", () => {
  it("wraps blank-line-separated blocks in paragraphs", () => {
    expect(toSafeParagraphs("First para.\n\nSecond para.")).toBe(
      "<p>First para.</p>\n<p>Second para.</p>",
    );
  });

  it("collapses runs of more than two newlines into one break", () => {
    expect(toSafeParagraphs("One.\n\n\n\nTwo.")).toBe(
      "<p>One.</p>\n<p>Two.</p>",
    );
  });

  it("drops empty and whitespace-only blocks", () => {
    expect(toSafeParagraphs("Real.\n\n   \n\nAlso real.")).toBe(
      "<p>Real.</p>\n<p>Also real.</p>",
    );
  });

  it("keeps single newlines inside a paragraph", () => {
    expect(toSafeParagraphs("Line one\nline two")).toBe(
      "<p>Line one\nline two</p>",
    );
  });

  it("returns an empty string for empty input", () => {
    expect(toSafeParagraphs("")).toBe("");
    expect(toSafeParagraphs("\n\n\n")).toBe("");
  });

  // ── The part that matters ──

  it("strips tags a member types", () => {
    expect(toSafeParagraphs("<b>bold</b>")).toBe("<p>bold</p>");
  });

  it("neutralises a script tag", () => {
    const output = toSafeParagraphs("<script>alert(1)</script>");
    expect(output).not.toContain("<script");
    expect(output).toBe("<p>alert(1)</p>");
  });

  it("neutralises an event handler on a surviving fragment", () => {
    const output = toSafeParagraphs(`<img src=x onerror="alert(1)">`);
    expect(output).not.toContain("<img");
    expect(output).not.toContain("onerror=");
  });

  /**
   * Nested and malformed tags are the classic way past a strip-only filter:
   * removing the inner tag can splice the outer one back into something valid.
   * The escape pass is what makes that harmless, so assert on the output
   * containing no live angle bracket at all.
   */
  it("cannot be tricked into reassembling a tag", () => {
    for (const hostile of [
      "<scr<script>ipt>alert(1)</scr</script>ipt>",
      "<<script>script>alert(1)<</script>/script>",
      "<img/src=x/onerror=alert(1)>",
      "<svg onload=alert(1)>",
      "</p><script>alert(1)</script><p>",
    ]) {
      const output = toSafeParagraphs(hostile);
      // Only our own wrapper tags may appear.
      expect(output.replace(/<\/?p>/g, "")).not.toMatch(/[<>]/);
    }
  });

  it("cannot break out of the paragraph it is placed in", () => {
    const output = toSafeParagraphs('</p><div onclick="x">escaped?</div><p>');
    const withoutWrappers = output.replace(/<\/?p>/g, "");
    expect(withoutWrappers).not.toContain("<div");
    expect(withoutWrappers).not.toMatch(/[<>]/);
  });

  it("escapes quotes, so text can never close an attribute", () => {
    expect(toSafeParagraphs(`say "hi" and 'bye'`)).toBe(
      "<p>say &quot;hi&quot; and &#39;bye&#39;</p>",
    );
  });
});

describe("stripTags", () => {
  it("removes markup and collapses the whitespace left behind", () => {
    expect(stripTags("<p>One</p>\n<p>Two</p>")).toBe("One Two");
  });

  it("tolerates empty input", () => {
    expect(stripTags("")).toBe("");
  });
});

describe("excerpt", () => {
  it("returns short text unchanged", () => {
    expect(excerpt("<p>Short enough.</p>")).toBe("Short enough.");
  });

  it("decodes entities so a summary reads as prose", () => {
    expect(excerpt("<p>Tanjiro &amp; Nezuko</p>")).toBe("Tanjiro & Nezuko");
    expect(excerpt("<p>She said &quot;hi&quot;</p>")).toBe('She said "hi"');
  });

  it("cuts on a word boundary and marks the truncation", () => {
    const body = `<p>${"alpha bravo ".repeat(40)}</p>`;
    const result = excerpt(body, 40);

    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(41);
    // No half-words: everything before the ellipsis is a complete token.
    expect(result.slice(0, -1).trim().split(" ").at(-1)).toMatch(
      /^(alpha|bravo)$/,
    );
  });

  it("still truncates when there is no space to cut on", () => {
    const result = excerpt(`<p>${"x".repeat(100)}</p>`, 20);
    expect(result).toBe(`${"x".repeat(20)}…`);
  });
});
