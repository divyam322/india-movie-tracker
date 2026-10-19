import type { BmsMovie, CinemaShows, ShowtimesResult } from "./bms-types";

const GATEWAY = "https://connector-gateway.lovable.dev/firecrawl/v2/scrape";

export async function scrapeMarkdown(url: string): Promise<string> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const fcKey = process.env["FIRECRAWL_API_KEY"];
  if (!lovableKey || !fcKey) throw new Error("Firecrawl is not connected");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": fcKey,
    },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, maxAge: 3600000 }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Firecrawl failed [${res.status}]: ${body}`);
    throw new Error(`Could not reach BookMyShow right now (${res.status})`);
  }
  const json = (await res.json()) as { data?: { markdown?: string }; markdown?: string };
  return json.data?.markdown ?? json.markdown ?? "";
}

function decodeOverlay(url: string): string | undefined {
  const m = url.match(/ie-([A-Za-z0-9%+/=_-]+),/);
  if (!m) return undefined;
  try {
    return atob(decodeURIComponent(m[1])).replace(/\s+/g, " ").trim();
  } catch {
    return undefined;
  }
}

export function parseListing(md: string): BmsMovie[] {
  const re =
    /\[!\[([^\]]*)\]\((https:\/\/assets-in\.bmscdn\.com\/discovery-catalog\/events\/[^)\s]+)\)([\s\S]*?)\*\*([^*]+)\*\*\]\(https:\/\/in\.bookmyshow\.com\/movies\/[^/]+\/([^/]+)\/(ET\d+)\)/g;
  const out: BmsMovie[] = [];
  const seen = new Set<string>();
  for (const m of md.matchAll(re)) {
    const [, , img, middle, title, slug, code] = m;
    if (seen.has(code)) continue;
    seen.add(code);
    const parts = middle
      .split(/\\+|\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => s !== title.trim());
    const certificate = parts.find((p) => /^(U|UA|A|S)(\d+\+)?$|^UA\s?\d+\+$/.test(p));
    const languages = parts.find((p) => p !== certificate && /^[A-Za-z ,]+$/.test(p));
    const file = img.split("/").pop()!;
    const overlay = decodeOverlay(img);
    out.push({
      code,
      slug,
      title: title.trim(),
      certificate,
      languages: languages ? languages.split(",").map((s) => s.trim()) : [],
      poster: `https://assets-in.bmscdn.com/discovery-catalog/events/tr:w-400,h-600/${file}`,
      rating: overlay && overlay.includes("/10") ? overlay.split(" ")[0] : undefined,
      buzz: overlay,
    });
  }
  return out;
}

const TIME = /^\d{2}:\d{2} [AP]M$/;

export function parseShowtimes(md: string): ShowtimesResult {
  const runtime = md.match(/Movie runtime:\s*([0-9hm ]+?)(?=[A-Z]{1,2}\d|U\b|A\b|\s\[|$)/)?.[1]?.trim();
  const genres = [...md.matchAll(/\[([A-Za-z -]+)\]\(https:\/\/in\.bookmyshow\.com\/explore\/movies\?genres=/g)].map((m) => m[1]);
  const formats = [...new Set([...md.matchAll(/\n\n([A-Za-z]+ - (?:2D|3D|IMAX 2D|IMAX 3D|4DX|4DX 3D|MX4D|ICE|[A-Z0-9 ]+))\n\n/g)].map((m) => m[1]))];

  const cinemaRe =
    /\]\(https:\/\/in\.bookmyshow\.com\/cinemas\/[^/]+\/([^/]+)\/buytickets\/([A-Z0-9]+)\/\d+\)\n\n([^\n!]+)/g;
  const marks = [...md.matchAll(cinemaRe)];
  const cinemas: CinemaShows[] = marks.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < marks.length ? (marks[i + 1].index ?? md.length) : md.length;
    const lines = md.slice(start, end).split("\n").map((l) => l.trim()).filter(Boolean);
    const shows: { time: string; format?: string }[] = [];
    let cancellable: boolean | undefined;
    for (const line of lines) {
      if (/^Cancellation available/i.test(line)) cancellable = true;
      else if (/^Non-cancellable/i.test(line)) cancellable = false;
      else if (TIME.test(line)) shows.push({ time: line });
      else if (shows.length && !line.includes("![") && !line.includes("[") && /^[A-Z0-9 .+\-]+$/.test(line) && !shows[shows.length - 1].format) {
        shows[shows.length - 1].format = line;
      }
    }
    return { code: m[2], name: m[3].trim(), cancellable, shows };
  }).filter((c) => c.shows.length > 0);

  return { runtime, genres: [...new Set(genres)], formats, cinemas };
}
