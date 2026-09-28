import { afterEach, expect, it, vi } from "vitest";

import { loadPage } from "./api";

afterEach(() => vi.unstubAllGlobals());

it("loads the homepage through the Vercel-compatible API path", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ data: { title: "Home" } }), {
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);

  const result = await loadPage({
    request: new Request("https://fanhub-plus.vercel.app/?q=anime"),
  });

  expect(fetchMock.mock.calls[0][0]).toBe("/api/loader?q=anime");
  expect(result).toEqual({ title: "Home" });
});
