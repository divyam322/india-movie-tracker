const GATEWAY = "https://connector-gateway.lovable.dev/google_maps/places/v1/places:searchText";

/** Best-effort in-memory cache; one Places lookup per cinema + city per server instance. */
const cache = new Map<string, string | null>();

export async function lookupCinemaAddress(name: string, city: string): Promise<string | null> {
  const key = `${city}:${name}`.toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const mapsKey = process.env["GOOGLE_MAPS_API_KEY"];
  if (!lovableKey || !mapsKey) throw new Error("Google Maps is not connected");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": mapsKey,
      "X-Goog-FieldMask": "places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: `${name}, ${city}`, pageSize: 1, languageCode: "en" }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error(`Places lookup failed [${res.status}]: ${body}`);
    throw new Error(`Address lookup failed (${res.status})`);
  }
  const json = (await res.json()) as { places?: { formattedAddress?: string }[] };
  const address = json.places?.[0]?.formattedAddress ?? null;
  cache.set(key, address);
  return address;
}
