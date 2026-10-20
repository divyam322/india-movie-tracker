import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useEffect, useState } from "react";
import { cinemaAddressQuery, moviesQuery, showtimesQuery } from "@/lib/queries";
import { cityName, estimatePrice, nextDays } from "@/lib/bms-types";

const titleFromSlug = (s: string) => s.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ");

export const Route = createFileRoute("/movies/$city/$slug/$code")({
  validateSearch: z.object({ date: z.string().regex(/^\d{8}$/).optional().catch(undefined) }),
  head: ({ params }) => {
    const t = `${titleFromSlug(params.slug)} showtimes in ${cityName(params.city)} | ReelDekho`;
    const d = `Theatres, show timings, approximate ticket prices and reviews for ${titleFromSlug(params.slug)} in ${cityName(params.city)}.`;
    return { meta: [{ title: t }, { name: "description", content: d }, { property: "og:title", content: t }, { property: "og:description", content: d }] };
  },
  component: MoviePage,
});

type Review = { id: string; author: string; rating: number; text: string; date: string };

function MoviePage() {
  const { city, slug, code } = Route.useParams();
  const days = nextDays(7);
  const { date = days[0]!.key } = Route.useSearch();
  const { data: listing } = useQuery(moviesQuery(city, false));
  const { data: soon } = useQuery({ ...moviesQuery(city, true), enabled: !!listing && !listing.movies.some((m) => m.code === code) });
  const movie = [...(listing?.movies ?? []), ...(soon?.movies ?? [])].find((m) => m.code === code);
  const { data, isLoading } = useQuery(showtimesQuery(city, slug, code, date));
  const [filter, setFilter] = useState("");
  const title = movie?.title ?? titleFromSlug(slug);
  const cinemas = (data?.cinemas ?? []).filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <main className="pb-24">
      <section className="relative overflow-hidden border-b border-border">
        {movie && <img src={movie.poster} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-3xl" />}
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 to-background" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[220px_1fr] md:py-14">
          <div className="aspect-[2/3] w-40 overflow-hidden rounded-xl bg-card shadow-2xl ring-1 ring-border md:w-full">
            {movie && <img src={movie.poster} alt={title} className="h-full w-full object-cover" />}
          </div>
          <div className="self-end">
            <Link to="/" search={{ city, tab: "now" }} className="text-sm text-muted-foreground hover:text-foreground">← Movies in {cityName(city)}</Link>
            <h1 className="mt-3 font-display text-5xl leading-none text-foreground md:text-7xl">{title}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[movie?.certificate, data?.runtime, ...(data?.genres ?? []), ...(movie?.languages ?? [])].filter(Boolean).map((t) => (
                <span key={t} className="rounded-full border border-border bg-card/60 px-3 py-1 text-muted-foreground">{t}</span>
              ))}
            </div>
            {movie?.buzz && <p className="mt-4 font-semibold text-primary">{movie.rating ? `★ ${movie.buzz}` : movie.buzz}</p>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        <div className="sticky top-[57px] z-[5] -mx-4 border-b border-border bg-background/90 px-4 py-4 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto">
            {days.map((d) => (
              <Link
                key={d.key}
                to="."
                search={{ date: d.key }}
                className={`flex min-w-14 flex-col items-center rounded-lg px-3 py-2 text-center transition-colors ${
                  d.key === date ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-[10px] uppercase">{d.dow}</span>
                <span className="font-display text-2xl leading-none">{d.day}</span>
                <span className="text-[10px] uppercase">{d.mon}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl text-foreground">Shows in {cityName(city)}</h2>
            {data && !isLoading && <p className="text-sm text-muted-foreground">{data.cinemas.length} theatres · {data.formats.join(" · ")}</p>}
          </div>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search theatre or area…"
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground md:w-72"
          />
        </div>

        <div className="mt-6 space-y-3">
          {isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />)}
          {data?.error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">{data.error}</p>}
          {!isLoading && !data?.error && cinemas.length === 0 && (
            <p className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">No shows listed for this day yet. Try another date.</p>
          )}
          {cinemas.map((c) => {
            const [lo, hi] = estimatePrice(c.name, c.shows[0]?.format);
            const [chain, ...rest] = c.name.split(":");
            return (
              <div key={c.code} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-card-foreground">{rest.length ? chain : c.name}</p>
                    {rest.length > 0 && <p className="text-sm text-muted-foreground">{rest.join(":").trim()}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">≈ ₹{lo}–₹{hi}</p>
                    {c.cancellable !== undefined && (
                      <p className="text-xs text-muted-foreground">{c.cancellable ? "Cancellation available" : "Non-cancellable"}</p>
                    )}
                  </div>
                </div>
                <AddressRow name={c.name} city={city} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {c.shows.map((s, i) => (
                    <a
                      key={i}
                      href={`https://in.bookmyshow.com/movies/${city}/${slug}/buytickets/${code}/${date}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border border-primary/40 px-3 py-1.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {s.time}
                      {s.format && <span className="block text-[9px] font-normal uppercase tracking-wide opacity-70">{s.format}</span>}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Prices are rough estimates by theatre type. Tap a showtime to book on BookMyShow.</p>

        <Reviews code={code} />
      </div>
    </main>
  );
}

const chipBtn =
  "rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-foreground";

function AddressRow({ name, city }: { name: string; city: string }) {
  const [show, setShow] = useState(false);
  const { data, isLoading } = useQuery({
    ...cinemaAddressQuery(name, city),
    enabled: show,
  });
  const query = encodeURIComponent(`${name}, ${cityName(city)}`);
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setShow(true)} className={chipBtn}>
          Address
        </button>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${query}`}
          target="_blank"
          rel="noreferrer"
          className={chipBtn}
        >
          Map
        </a>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
          target="_blank"
          rel="noreferrer"
          className={chipBtn}
        >
          Directions
        </a>
      </div>
      {show && (
        <p className="mt-2 text-sm text-muted-foreground">
          {isLoading
            ? "Looking up address…"
            : (data?.address ?? data?.error ?? "Address not found")}
        </p>
      )}
    </div>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={!onChange} onClick={() => onChange?.(n)} aria-label={`${n} stars`}
          className={`text-xl ${n <= value ? "text-primary" : "text-muted-foreground/30"}`}>★</button>
      ))}
    </div>
  );
}

function Reviews({ code }: { code: string }) {
  const key = `reviews:${code}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  useEffect(() => {
    try { setReviews(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { setReviews([]); }
  }, [key]);
  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !text.trim()) return;
    const next = [{ id: crypto.randomUUID(), author: name.trim() || "Guest", rating, text: text.trim().slice(0, 1000), date: new Date().toISOString() }, ...reviews];
    setReviews(next);
    localStorage.setItem(key, JSON.stringify(next));
    setRating(0); setText(""); setName("");
  };

  return (
    <section className="mt-20 grid gap-10 md:grid-cols-[1fr_1.4fr]">
      <form onSubmit={submit} className="h-fit space-y-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-3xl text-card-foreground">Rate & review</h2>
        <Stars value={rating} onChange={setRating} />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="What did you think?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground" />
        <button className="w-full rounded-md bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90">Post review</button>
      </form>
      <div>
        <h2 className="font-display text-3xl text-foreground">Audience reviews {avg && <span className="text-primary">· ★ {avg}</span>}</h2>
        {reviews.length === 0 && <p className="mt-4 text-muted-foreground">No reviews yet — be the first.</p>}
        <ul className="mt-4 space-y-5">
          {reviews.map((r) => (
            <li key={r.id} className="border-b border-border pb-5">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{r.author}</p>
                <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("en-IN")}</span>
              </div>
              <Stars value={r.rating} />
              <p className="mt-1 text-foreground/90">{r.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
