import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { MOVIES, THEATRES, SEED_REVIEWS, formatDate, type Review } from "@/lib/movies";
import { Poster } from "@/components/Poster";
import { useCity } from "@/components/CitySelect";

export const Route = createFileRoute("/movies/$id")({
  loader: ({ params }) => {
    const movie = MOVIES.find((m) => m.id === params.id);
    if (!movie) throw notFound();
    return { movie };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.movie.title} — showtimes, prices & reviews | ReelDekho` : "Movie not found | ReelDekho";
    const d = loaderData?.movie.synopsis ?? "This movie could not be found.";
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: MoviePage,
});

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} stars`}
          className={`text-xl ${n <= value ? "text-primary" : "text-muted-foreground/40"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function MoviePage() {
  const { movie } = Route.useLoaderData();
  const { city } = useCity();
  const theatres = THEATRES.filter((t) => t.city === city);
  const [reviews, setReviews] = useState<Review[]>(SEED_REVIEWS.filter((r) => r.movieId === movie.id));
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    setReviews([{ id: crypto.randomUUID(), movieId: movie.id, author: name.trim() || "Guest", rating, text: text.trim(), date: new Date().toISOString() }, ...reviews]);
    setRating(0); setText(""); setName("");
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← All movies</Link>
      <div className="mt-6 grid gap-10 md:grid-cols-[280px_1fr]">
        <Poster movie={movie} />
        <div>
          <h1 className="font-display text-6xl leading-none text-foreground">{movie.title}</h1>
          <p className="mt-3 text-muted-foreground">
            {movie.language} · {movie.genre.join(", ")} · {movie.duration} · {movie.certificate}
          </p>
          <p className="mt-2 text-sm text-primary">Releases {formatDate(movie.releaseDate)} · ★ {movie.rating} ({movie.votes.toLocaleString("en-IN")} ratings)</p>
          <p className="mt-6 max-w-2xl text-lg text-foreground/90">{movie.synopsis}</p>

          <h2 className="mt-10 font-display text-3xl text-foreground">Theatres in {city}</h2>
          <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
            {theatres.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-medium text-card-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.area} · {t.formats.join(" · ")}</p>
                </div>
                <p className="font-semibold text-primary">₹{t.priceMin} – ₹{t.priceMax}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Prices are approximate and vary by seat and showtime.</p>
        </div>
      </div>

      <section className="mt-16 grid gap-10 md:grid-cols-[1fr_1.4fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-3xl text-card-foreground">Rate & review</h2>
          <Stars value={rating} onChange={setRating} />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="What did you think?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
          <button className="w-full rounded-md bg-primary py-2 font-semibold text-primary-foreground hover:bg-primary/90">Post review</button>
        </form>
        <div>
          <h2 className="font-display text-3xl text-foreground">Reviews ({reviews.length})</h2>
          {reviews.length === 0 && <p className="mt-4 text-muted-foreground">No reviews yet — be the first.</p>}
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-foreground">{r.author}</p>
                  <span className="text-xs text-muted-foreground">{formatDate(r.date)}</span>
                </div>
                <Stars value={r.rating} />
                <p className="mt-1 text-foreground/90">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
