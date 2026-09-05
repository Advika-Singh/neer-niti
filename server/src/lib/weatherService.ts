import { db } from "../db.js";
import { config } from "../config.js";
import { DISTRICTS } from "./districts.js";
import type { District } from "../types.js";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const YEARS_OF_HISTORY = 5;

interface DailyRecord {
  date: string;
  precip: number;
  temp: number | null;
  humidity: number | null;
  soil: number | null;
}

export interface MonthBucket {
  year: number;
  month: number; // 0-11
  precipSum: number;
  tempAvgSum: number;
  humidityAvgSum: number;
  soilAvgSum: number;
  days: number;
}

export interface DistrictClimate {
  districtId: string;
  fetchedAt: string;
  daily: DailyRecord[];
  monthly: MonthBucket[];
  latest: DailyRecord | null;
  source: "open-meteo";
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function fetchOpenMeteo(district: District): Promise<DailyRecord[]> {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - YEARS_OF_HISTORY, 0, 1);

  const params = new URLSearchParams({
    latitude: String(district.lat),
    longitude: String(district.lon),
    start_date: isoDate(start),
    end_date: isoDate(end),
    daily: "precipitation_sum,temperature_2m_mean,relative_humidity_2m_mean,soil_moisture_0_to_7cm_mean",
    timezone: "auto",
  });

  const res = await fetch(`${ARCHIVE_URL}?${params.toString()}`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Open-Meteo request failed: ${res.status}`);
  const json = (await res.json()) as {
    daily: {
      time: string[];
      precipitation_sum: (number | null)[];
      temperature_2m_mean: (number | null)[];
      relative_humidity_2m_mean: (number | null)[];
      soil_moisture_0_to_7cm_mean: (number | null)[];
    };
  };

  return json.daily.time.map((date, i) => ({
    date,
    precip: json.daily.precipitation_sum[i] ?? 0,
    temp: json.daily.temperature_2m_mean[i] ?? null,
    humidity: json.daily.relative_humidity_2m_mean[i] ?? null,
    soil: json.daily.soil_moisture_0_to_7cm_mean[i] ?? null,
  }));
}

function bucketByMonth(daily: DailyRecord[]): MonthBucket[] {
  const map = new Map<string, MonthBucket>();
  for (const rec of daily) {
    const [yStr, mStr] = rec.date.split("-");
    const year = Number(yStr);
    const month = Number(mStr) - 1;
    const key = `${year}-${month}`;
    let bucket = map.get(key);
    if (!bucket) {
      bucket = { year, month, precipSum: 0, tempAvgSum: 0, humidityAvgSum: 0, soilAvgSum: 0, days: 0 };
      map.set(key, bucket);
    }
    bucket.precipSum += rec.precip;
    if (rec.temp !== null) bucket.tempAvgSum += rec.temp;
    if (rec.humidity !== null) bucket.humidityAvgSum += rec.humidity;
    if (rec.soil !== null) bucket.soilAvgSum += rec.soil * 100; // fraction -> percent
    bucket.days += 1;
  }
  return [...map.values()];
}

function readCache(districtId: string): DistrictClimate | null {
  const row = db
    .prepare(`SELECT payload_json, fetched_at FROM weather_cache WHERE district_id = ?`)
    .get(districtId) as { payload_json: string; fetched_at: string } | undefined;
  if (!row) return null;
  const ageMinutes = (Date.now() - new Date(row.fetched_at).getTime()) / 60000;
  if (ageMinutes > config.weatherCacheTtlMinutes) return null;
  return JSON.parse(row.payload_json) as DistrictClimate;
}

function writeCache(districtId: string, climate: DistrictClimate) {
  db.prepare(
    `INSERT INTO weather_cache (district_id, payload_json, fetched_at)
     VALUES (?, ?, ?)
     ON CONFLICT(district_id) DO UPDATE SET payload_json = excluded.payload_json, fetched_at = excluded.fetched_at`
  ).run(districtId, JSON.stringify(climate), new Date().toISOString());
}

export async function getDistrictClimate(districtId: string): Promise<DistrictClimate> {
  const cached = readCache(districtId);
  if (cached) return cached;

  const district = DISTRICTS.find((d) => d.id === districtId);
  if (!district) throw new Error(`Unknown district: ${districtId}`);

  const daily = await fetchOpenMeteo(district);
  const monthly = bucketByMonth(daily);
  const latest = daily.length > 0 ? daily[daily.length - 1] : null;

  const climate: DistrictClimate = {
    districtId,
    fetchedAt: new Date().toISOString(),
    daily,
    monthly,
    latest,
    source: "open-meteo",
  };
  writeCache(districtId, climate);
  return climate;
}

export async function warmAllDistrictsClimate(): Promise<void> {
  for (const d of DISTRICTS) {
    try {
      await getDistrictClimate(d.id);
    } catch (err) {
      console.error(`[weather] failed to warm cache for ${d.id}:`, (err as Error).message);
    }
  }
}
