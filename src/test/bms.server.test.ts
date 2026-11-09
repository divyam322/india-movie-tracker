import { afterEach, describe, expect, it, vi } from "vitest";
import { scrapeMarkdown } from "@/lib/bms.server";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("BookMyShow scraping cache", () => {
  it("does not cache an empty listing over a later successful response", async () => {
    vi.stubEnv("FIRECRAWL_API_KEY", "fc-test-key");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { markdown: "" } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { markdown: "# Fresh listing" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const url = "https://in.bookmyshow.com/explore/movies-cache-empty-test";
    await expect(scrapeMarkdown(url)).resolves.toBe("");
    await expect(scrapeMarkdown(url)).resolves.toBe("# Fresh listing");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});