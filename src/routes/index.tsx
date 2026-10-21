import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useState } from "react";
import { moviesQuery } from "@/lib/queries";
import { CITIES, cityName, type BmsMovie } from "@/lib/bms-types";

const search = z.object({
  city: z.string().catch("mumbai").default("mumbai"),
  tab: z.enum(["now", "soon"]).catch("now").default("now"),
});

export const Route = createFileRoute("/")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "DivCineDekho — Movies & showtimes in Indian theatres" },
      { name: "description", content: "Live showtimes, theatres near you, approximate ticket prices and audience reviews across India." },
      { property: "og:title", content: "DivCineDekho — Movies & showtimes in Indian theatres" },
      { property: "og:description", content: "Find where and when your next movie is playing, city by city." },
    ],
  }),
  component: Index,
});

function Index() {
  const { city, tab } = Route.useSearch();
  const upcoming = tab === "soon";
  const { data, isLoading } = useQuery(moviesQuery(city, upcoming));
  const [lang, setLang] = useState("All");
  const movies = data?.movies ?? [];
  const langs = ["All", ...new Set(movies.flatMap((m) => m.languages))].slice(0, 9);
  const list = movies.filter((m) => lang === "All" || m.languages.includes(lang));
  const hero = movies[0];

  return (
    <main className="pb-24">
      <section className="relative overflow-hidden border-b border-border">
        {hero && (
          <img src={hero.poster} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-3xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-10 px-4 py-14 md:grid-cols-[1fr_260px] md:py-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Live from the box office · {cityName(city)}</p>
            <h1 className="mt-4 font-display text-6xl leading-[0.9] text-foreground md:text-8xl">
              What's playing,<br />where & <span className="text-primary">when</span>.
            </h1>
            <p className="mt-5 max-w-lg text-muted-foreground">
              Real showtimes from theatres across {cityName(city)}, rough ticket prices, and honest reviews from fellow movie-goers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CITIES.map((c) => (
                <Link
                  key={c.slug}
                  to="/"
                  search={{ city: c.slug, tab }}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    c.slug === city ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
          {hero && !upcoming && (
            <Link to="/movies/$city/$slug/$code" params={{ city, slug: hero.slug, code: hero.code }} className="group hidden md:block">
              <p className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Trending now</p>
              <img src={hero.poster} alt={hero.title} className="aspect-[2/3] w-full rounded-xl object-cover shadow-2xl ring-1 ring-border transition-transform group-hover:-rotate-1 group-hover:scale-[1.02]" />
            </Link>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <div className="flex rounded-full border border-border bg-card p-1">
            {(["now", "soon"] as const).map((t) => (
              <Link
                key={t}
                to="/"
                search={{ city, tab: t }}
                onClick={() => setLang("All")}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "now" ? "Now showing" : "Coming soon"}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {langs.length > 2 &&
              langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-md px-3 py-1 text-xs transition-colors ${lang === l ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l}
                </button>
              ))}
          </div>
        </div>

        {data?.error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
            {data.error}. Please try again in a minute.
          </p>
        )}

        <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading && Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          {list.map((m) => (
            <MovieCard key={m.code} movie={m} city={city} upcoming={upcoming} />
          ))}
        </div>
        {!isLoading && !data?.error && list.length === 0 && <p className="py-16 text-center text-muted-foreground">No movies found.</p>}
        <p className="mt-16 text-center text-xs text-muted-foreground">Listings sourced from BookMyShow. Prices are estimates.</p>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-card" />
      <div className="mt-3 h-4 w-3/4 rounded bg-card" />
      <div className="mt-2 h-3 w-1/2 rounded bg-card" />
    </div>
  );
}

function MovieCard({ movie, city, upcoming }: { movie: BmsMovie; city: string; upcoming: boolean }) {
  return (
    <Link to="/movies/$city/$slug/$code" params={{ city, slug: movie.slug, code: movie.code }} className="group block">
      <div className="relative overflow-hidden rounded-xl ring-1 ring-border">
        <img src={movie.poster} alt={movie.title} loading="lazy" className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/70 to-transparent p-3 pt-10">
          <span className="text-xs font-semibold text-primary">
            {upcoming ? `Releases ${movie.buzz ?? "soon"}` : movie.rating ? `★ ${movie.rating}` : movie.buzz}
          </span>
        </div>
        {movie.certificate && (
          <span className="absolute left-2 top-2 rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground">{movie.certificate}</span>
        )}
      </div>
      <h3 className="mt-3 font-medium leading-tight text-foreground group-hover:text-primary">{movie.title}</h3>
      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{movie.languages.join(", ")}</p>
    </Link>
  );
}
