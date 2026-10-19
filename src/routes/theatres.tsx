import { createFileRoute } from "@tanstack/react-router";
import { THEATRES } from "@/lib/movies";
import { useCity } from "@/components/CitySelect";

export const Route = createFileRoute("/theatres")({
  head: () => ({
    meta: [
      { title: "Theatres near you & ticket prices | ReelDekho" },
      { name: "description", content: "Browse cinemas in your city with formats and approximate ticket prices." },
      { property: "og:title", content: "Theatres near you | ReelDekho" },
      { property: "og:description", content: "Cinemas across India with approximate ticket prices." },
    ],
  }),
  component: Theatres,
});

function Theatres() {
  const { city } = useCity();
  const list = THEATRES.filter((t) => t.city === city);
  return (
    <main className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-6xl text-foreground">Theatres in {city}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {list.map((t) => (
          <div key={t.id} className="rounded-lg border border-border bg-card p-6">
            <p className="font-display text-2xl text-card-foreground">{t.name}</p>
            <p className="text-sm text-muted-foreground">{t.area}, {t.city}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.formats.map((f) => <span key={f} className="rounded bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">{f}</span>)}
            </div>
            <p className="mt-4 text-lg font-semibold text-primary">₹{t.priceMin} – ₹{t.priceMax}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
