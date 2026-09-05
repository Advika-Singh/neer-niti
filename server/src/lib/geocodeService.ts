const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export interface GeocodeResult {
  name: string;
  admin1: string | null;
  country: string | null;
  lat: number;
  lon: number;
}

export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const params = new URLSearchParams({ name: query, count: "8", language: "en", format: "json" });
  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Geocoding request failed: ${res.status}`);

  const json = (await res.json()) as {
    results?: Array<{ name: string; admin1?: string; country?: string; latitude: number; longitude: number }>;
  };

  return (json.results ?? []).map((r) => ({
    name: r.name,
    admin1: r.admin1 ?? null,
    country: r.country ?? null,
    lat: r.latitude,
    lon: r.longitude,
  }));
}
