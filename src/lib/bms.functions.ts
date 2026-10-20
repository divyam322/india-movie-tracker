import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseListing, parseShowtimes, scrapeMarkdown } from "./bms.server";
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
      return { movies: parseListing(await scrapeMarkdown(url)), error: null as string | null };
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
