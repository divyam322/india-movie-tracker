import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseLanguageFilters, parseListing, parseShowtimes, scrapeMarkdown } from "./bms.server";
import { lookupCinemaAddress } from "./places.server";
import { cityName } from "./bms-types";

const slug = z.string().regex(/^[a-z0-9-]+$/).max(80);

export const getMovies = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ city: slug, upcoming: z.boolean() }).parse(d))
  .handler(async ({ data }) => {
    const url = data.upcoming
      ? `https://in.bookmyshow.com/explore/upcoming-movies-${data.city}`
      : `https://in.bookmyshow.com/explore/movies-${data.city}`;
    try {
      // BookMyShow only renders the first ~16 cards (local language first), so also
      // load each language's filtered page and merge, to cover every language.
      const base = await scrapeMarkdown(url);
      const langs = parseLanguageFilters(base).slice(0, 10);
      const pages = await Promise.allSettled(
        langs.map((l) => scrapeMarkdown(`${url}?languages=${encodeURIComponent(l.toLowerCase())}`)),
      );
      const seen = new Set<string>();
      const movies = [base, ...pages.map((p) => (p.status === "fulfilled" ? p.value : ""))]
        .flatMap(parseListing)
        .filter((m) => !seen.has(m.code) && seen.add(m.code));
      return { movies, error: null as string | null };
    } catch (e) {
      return { movies: [], error: e instanceof Error ? e.message : "Failed to load" };
    }
  });

export const getShowtimes = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ city: slug, slug, code: z.string().regex(/^ET\d+$/), date: z.string().regex(/^\d{8}$/) }).parse(d),
  )
  .handler(async ({ data }) => {
    const url = `https://in.bookmyshow.com/movies/${data.city}/${data.slug}/buytickets/${data.code}/${data.date}`;
    try {
      return { ...parseShowtimes(await scrapeMarkdown(url)), error: null as string | null };
    } catch (e) {
      return { runtime: undefined, genres: [], formats: [], cinemas: [], error: e instanceof Error ? e.message : "Failed to load" };
    }
  });

export const getCinemaAddress = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ name: z.string().min(2).max(120), city: slug }).parse(d))
  .handler(async ({ data }) => {
    try {
      return { address: await lookupCinemaAddress(data.name, cityName(data.city)), error: null as string | null };
    } catch (e) {
      return { address: null, error: e instanceof Error ? e.message : "Lookup failed" };
    }
  });
