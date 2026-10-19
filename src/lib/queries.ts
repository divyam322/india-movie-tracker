import { queryOptions } from "@tanstack/react-query";
import { getMovies, getShowtimes } from "./bms.functions";

export const moviesQuery = (city: string, upcoming: boolean) =>
  queryOptions({
    queryKey: ["movies", city, upcoming],
    queryFn: () => getMovies({ data: { city, upcoming } }),
    staleTime: 30 * 60_000,
  });

export const showtimesQuery = (city: string, slug: string, code: string, date: string) =>
  queryOptions({
    queryKey: ["shows", city, code, date],
    queryFn: () => getShowtimes({ data: { city, slug, code, date } }),
    staleTime: 10 * 60_000,
  });
