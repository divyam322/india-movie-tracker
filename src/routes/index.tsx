import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MOVIES, THEATRES, formatDate } from "@/lib/movies";
import { Poster } from "@/components/Poster";
import { useCity } from "@/components/CitySelect";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ReelDekho — Upcoming movies in Indian theatres" },
      { name: "description", content: "Track upcoming releases at theatres near you, compare approximate ticket prices, and read reviews." },
      { property: "og:title", content: "ReelDekho — Upcoming movies in Indian theatres" },
      { property: "og:description", content: "Upcoming releases, ticket prices and audience reviews across India." },
    ],
  }),
  component: Index,
});

const LANGS = ["All", "Hindi", "Tamil", "Telugu", "Kannada", "Bengali"];

function Index() {
  const { city } = useCity();
  const [lang, setLang] = useState("All");
  const list = MOVIES.filter((m) => lang === "All" || m.language === lang);
  const cityTheatres = THEATRES.filter((t) => t.city === city);
  const min = Math.min(...cityTheatres.map((t) => t.priceMin));
  const max = Math.max(...cityTheatres.map((t) => t.priceMax));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <section className="py-14">
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Now tracking · {city}</p>
        <h1 className="mt-3 font-display text-6xl leading-none text-foreground md:text-8xl">
          Coming soon<br />to a screen near you
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {cityTheatres.length} theatres in {city} · tickets approx ₹{min}–₹{max}
        </p>
      </section>

      <div className="mb-8 flex flex-wrap gap-2">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              lang === l ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {list.map((m) => (
          <Link key={m.id} to="/movies/$id" params={{ id: m.id }} className="group">
            <Poster movie={m} className="transition-transform group-hover:-translate-y-1" />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{formatDate(m.releaseDate)}</span>
              <span className="font-semibold text-primary">★ {m.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">{m.genre.join(" · ")}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
