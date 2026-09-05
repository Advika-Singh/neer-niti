import { DISTRICTS, FALLBACK_BASELINES } from "./districts.js";
import { getDistrictClimate } from "./weatherService.js";
import type { SensorReading } from "../types.js";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

interface Anchor {
  rainfallMm: number;
  temperatureC: number;
  humidityPct: number;
  soilMoisturePct: number;
}

const state = new Map<string, SensorReading>();
const anchors = new Map<string, Anchor>();
let tick = 0;

/**
 * Field hardware (ESP32 mesh) isn't deployed yet — battery/uptime telemetry is simulated.
 * Rainfall/temperature/humidity/soil-moisture anchors come from real Open-Meteo/ERA5 data
 * where available; the tick loop only adds small jitter around that real anchor so the
 * dashboard still feels "live" between daily data refreshes.
 */
export async function refreshAnchor(districtId: string): Promise<Anchor> {
  try {
    const climate = await getDistrictClimate(districtId);
    const latest = climate.latest;
    if (latest && latest.temp !== null && latest.humidity !== null && latest.soil !== null) {
      const anchor: Anchor = {
        rainfallMm: latest.precip,
        temperatureC: latest.temp,
        humidityPct: latest.humidity,
        soilMoisturePct: latest.soil * 100, // fraction (m³/m³) -> percent
      };
      anchors.set(districtId, anchor);
      return anchor;
    }
    throw new Error("incomplete live data");
  } catch {
    const base = FALLBACK_BASELINES[districtId];
    const anchor: Anchor = {
      rainfallMm: base.normalAnnualMm / 12,
      temperatureC: base.tempBase,
      humidityPct: base.humidityBase,
      soilMoisturePct: base.soilBase,
    };
    anchors.set(districtId, anchor);
    return anchor;
  }
}

export async function initSensorSim(): Promise<void> {
  for (const d of DISTRICTS) {
    const anchor = await refreshAnchor(d.id);
    const rand = mulberry32(hashString(d.id) + 1);
    state.set(d.id, {
      districtId: d.id,
      rainfallMm: Math.round(anchor.rainfallMm * 10) / 10,
      temperatureC: Number(anchor.temperatureC.toFixed(1)),
      humidityPct: Math.round(anchor.humidityPct),
      soilMoisturePct: Math.round(anchor.soilMoisturePct),
      batteryPct: Math.round(70 + rand() * 30),
      lastUpdated: new Date().toISOString(),
    });
  }
}

export function stepSensors(): SensorReading[] {
  tick += 1;
  const updated: SensorReading[] = [];
  for (const d of DISTRICTS) {
    const anchor = anchors.get(d.id);
    const prev = state.get(d.id);
    if (!anchor || !prev) continue;
    const rand = mulberry32(hashString(d.id) + tick);
    const drift = rand() - 0.5;

    // Jitter around the real anchor with mean reversion so long uptime never drifts away from reality.
    const reading: SensorReading = {
      districtId: d.id,
      rainfallMm: Math.max(0, Number((anchor.rainfallMm + drift * 0.8).toFixed(1))),
      temperatureC: Number((anchor.temperatureC + drift * 0.6).toFixed(1)),
      humidityPct: Math.min(100, Math.max(0, Math.round(anchor.humidityPct + drift * 3))),
      soilMoisturePct: Math.min(100, Math.max(0, Math.round(anchor.soilMoisturePct + drift * 2))),
      batteryPct: Math.min(100, Math.max(15, Math.round(prev.batteryPct + (rand() - 0.55) * 1))),
      lastUpdated: new Date().toISOString(),
    };
    state.set(d.id, reading);
    updated.push(reading);
  }
  return updated;
}

export function getLiveReading(districtId: string): SensorReading | undefined {
  return state.get(districtId);
}

export function getAllLiveReadings(): SensorReading[] {
  return DISTRICTS.map((d) => state.get(d.id)).filter((r): r is SensorReading => Boolean(r));
}
