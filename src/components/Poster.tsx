import type { Movie } from "@/lib/movies";

export function Poster({ movie, className = "" }: { movie: Movie; className?: string }) {
  return (
    <div
      className={`relative flex aspect-[2/3] flex-col justify-end overflow-hidden rounded-lg p-4 ${className}`}
      style={{
        background: `linear-gradient(160deg, oklch(0.55 0.18 ${movie.hue}) 0%, oklch(0.2 0.08 ${movie.hue}) 70%, oklch(0.12 0.02 ${movie.hue}) 100%)`,
      }}
    >
      <span className="absolute right-3 top-3 rounded bg-background/70 px-2 py-0.5 text-xs font-semibold text-foreground">
        {movie.certificate}
      </span>
      <p className="text-xs uppercase tracking-widest text-foreground/70">{movie.language}</p>
      <h3 className="font-display text-3xl leading-none text-foreground">{movie.title}</h3>
    </div>
  );
}
