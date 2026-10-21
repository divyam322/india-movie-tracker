export type BmsMovie = {
  code: string;
  slug: string;
  title: string;
  certificate?: string | undefined;
  languages: string[];
  poster: string;
  rating?: string | undefined;
  buzz?: string | undefined;
};

export type CinemaShows = {
  code: string;
  name: string;
  cancellable?: boolean | undefined;
  shows: { time: string; format?: string | undefined }[];
};

export type ShowtimesResult = {
  runtime?: string | undefined;
  genres: string[];
  formats: string[];
  cinemas: CinemaShows[];
};

export const CITIES = [
  { slug: "mumbai", name: "Mumbai" },
  { slug: "ncr", name: "Delhi-NCR" },
  { slug: "bengaluru", name: "Bengaluru" },
  { slug: "hyderabad", name: "Hyderabad" },
  { slug: "chennai", name: "Chennai" },
  { slug: "kolkata", name: "Kolkata" },
  { slug: "pune", name: "Pune" },
  { slug: "ahmedabad", name: "Ahmedabad" },
  { slug: "kochi", name: "Kochi" },
  { slug: "chandigarh", name: "Chandigarh" },
  { slug: "jaipur", name: "Jaipur" },
  { slug: "lucknow", name: "Lucknow" },
  { slug: "indore", name: "Indore" },
  { slug: "bhopal", name: "Bhopal" },
  { slug: "nagpur", name: "Nagpur" },
  { slug: "surat", name: "Surat" },
  { slug: "vadodara", name: "Vadodara" },
  { slug: "nashik", name: "Nashik" },
  { slug: "goa", name: "Goa" },
  { slug: "coimbatore", name: "Coimbatore" },
  { slug: "madurai", name: "Madurai" },
  { slug: "mysore", name: "Mysuru" },
  { slug: "trivandrum", name: "Thiruvananthapuram" },
  { slug: "vizag", name: "Visakhapatnam" },
  { slug: "vijayawada", name: "Vijayawada" },
  { slug: "bhubaneswar", name: "Bhubaneswar" },
  { slug: "patna", name: "Patna" },
  { slug: "ranchi", name: "Ranchi" },
  { slug: "guwahati", name: "Guwahati" },
  { slug: "raipur", name: "Raipur" },
  { slug: "dehradun", name: "Dehradun" },
  { slug: "ludhiana", name: "Ludhiana" },
] as const;

export const cityName = (slug: string) => CITIES.find((c) => c.slug === slug)?.name ?? slug;

/** Next `n` days as yyyymmdd in India time. */
export function nextDays(n: number) {
  const out: { key: string; dow: string; day: string; mon: string }[] = [];
  const now = Date.now() + 5.5 * 3600_000;
  for (let i = 0; i < n; i++) {
    const d = new Date(now + i * 86400_000);
    out.push({
      key: d.toISOString().slice(0, 10).replace(/-/g, ""),
      dow: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "UTC" }),
      day: String(d.getUTCDate()),
      mon: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
    });
  }
  return out;
}

/** Approximate ticket price band in INR, based on the cinema chain and show format. */
export function estimatePrice(cinemaName: string, format?: string): [number, number] {
  const n = cinemaName.toLowerCase();
  let band: [number, number] = [150, 350];
  if (/pvr|inox/.test(n)) band = [220, 650];
  else if (/cinepolis|cinépolis|miraj|movietime|carnival/.test(n)) band = [180, 500];
  const f = (format ?? "").toLowerCase();
  if (/imax|4dx|mx4d|insignia|luxe|gold|director|recliner/.test(f + " " + n)) band = [band[0] + 200, band[1] + 450];
  return band;
}
