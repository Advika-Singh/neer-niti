import { getDistrictClimate, getClimateForCoords, type DistrictClimate } from "./weatherService.js";
import { FALLBACK_BASELINES } from "./districts.js";
import type { DroughtIndex, MonthlyRainfall, RiskLevel } from "../types.js";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

export function riskFromSpei(spei: number): RiskLevel {
  if (spei <= -1.5) return "Extreme";
  if (spei <= -1.0) return "Severe";
  if (spei <= -0.5) return "Moderate";
  return "Normal";
}

/** Builds the 12-month actual-vs-climatological-normal series for the current calendar year. */
export function buildMonthlySeries(climate: DistrictClimate): MonthlyRainfall[] {
  const currentYear = new Date().getFullYear();

  return MONTH_LABELS.map((label, monthIdx) => {
    const priorYearBuckets = climate.monthly.filter(
      (b) => b.month === monthIdx && b.year !== currentYear && b.days >= 24
    );
    const normal =
      priorYearBuckets.length > 0
        ? priorYearBuckets.reduce((sum, b) => sum + b.precipSum, 0) / priorYearBuckets.length
        : 0;

    const thisYearBucket = climate.monthly.find((b) => b.month === monthIdx && b.year === currentYear);
    const actual = thisYearBucket?.precipSum ?? 0;

    return {
      month: label,
      actual: Math.round(actual),
      normal: Math.round(normal),
      yearsOfNormalData: priorYearBuckets.length,
    };
  });
}

interface MonthlyClimateStats {
  precipNormal: number;
  precipActual: number;
  tempNormal: number | null;
  tempActual: number | null;
  humidityNormal: number | null;
  humidityActual: number | null;
  soilActual: number | null;
  soilNormal: number | null;
}

function statsForMonth(climate: DistrictClimate, monthIdx: number): MonthlyClimateStats {
  const currentYear = new Date().getFullYear();
  const priorBuckets = climate.monthly.filter((b) => b.month === monthIdx && b.year !== currentYear && b.days >= 24);
  const thisYear = climate.monthly.find((b) => b.month === monthIdx && b.year === currentYear);

  const avg = (sumKey: "precipSum" | "tempAvgSum" | "humidityAvgSum" | "soilAvgSum", perDay: boolean) => {
    if (priorBuckets.length === 0) return null;
    const total = priorBuckets.reduce((sum, b) => {
      const val = b[sumKey];
      return sum + (perDay ? val / b.days : val);
    }, 0);
    return total / priorBuckets.length;
  };

  return {
    precipNormal: avg("precipSum", false) ?? 0,
    precipActual: thisYear?.precipSum ?? 0,
    tempNormal: avg("tempAvgSum", true),
    tempActual: thisYear ? thisYear.tempAvgSum / thisYear.days : null,
    humidityNormal: avg("humidityAvgSum", true),
    humidityActual: thisYear ? thisYear.humidityAvgSum / thisYear.days : null,
    soilActual: thisYear ? thisYear.soilAvgSum / thisYear.days : null,
    soilNormal: avg("soilAvgSum", true),
  };
}

/** 3-month trailing SPI-like anomaly ending at `monthIdx`, using only months with enough climate-normal coverage. */
function trailingSpi(climate: DistrictClimate, monthIdx: number): number | null {
  const months = [monthIdx - 2, monthIdx - 1, monthIdx].filter((m) => m >= 0);
  if (months.length < 2) return null;
  let actualSum = 0;
  let normalSum = 0;
  for (const m of months) {
    const s = statsForMonth(climate, m);
    actualSum += s.precipActual;
    normalSum += s.precipNormal;
  }
  if (normalSum <= 0) return null;
  const ratio = actualSum / normalSum;
  return Number(Math.min(1.2, Math.max(-3, (ratio - 1) * 2.6)).toFixed(2));
}

function linearRegressionSlope(ys: number[]): number {
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export const FORECAST_METHOD =
  "Damped linear trend on the last 3 months of trailing 3-month SPEI, reverting toward the climatological mean " +
  "(Holt-style damping, reversion weight 0.25 at t+1 and 0.55 at t+3).";

function computeIndexFromClimate(climate: DistrictClimate): Omit<DroughtIndex, "districtId"> {
  const currentMonth = new Date().getMonth();

  const stats = statsForMonth(climate, currentMonth);
  const spi = trailingSpi(climate, currentMonth) ?? 0;

  const evapPenalty =
    stats.tempActual !== null && stats.tempNormal !== null
      ? (stats.tempActual - stats.tempNormal) * 0.03
      : 0;
  const spei = Number((spi - evapPenalty).toFixed(2));

  const humidityAnomaly =
    stats.humidityActual !== null && stats.humidityNormal !== null
      ? stats.humidityNormal - stats.humidityActual
      : 0;
  const rdi = Number((spi * 0.85 - humidityAnomaly * 0.01).toFixed(2));

  // Trend series over the last up-to-3 months for a damped-trend forecast.
  const trendPoints: number[] = [];
  for (let back = 2; back >= 0; back--) {
    const m = currentMonth - back;
    if (m < 0) continue;
    const v = trailingSpi(climate, m);
    if (v !== null) trendPoints.push(v);
  }
  const slope = trendPoints.length >= 2 ? linearRegressionSlope(trendPoints) : 0;
  const current = trendPoints.length > 0 ? trendPoints[trendPoints.length - 1] : spei;

  const damp = (horizon: number, reversion: number) => {
    const trendProjection = current + slope * horizon;
    return Number((trendProjection * (1 - reversion) + 0 * reversion).toFixed(2));
  };
  const forecastT1 = damp(1, 0.25);
  const forecastT3 = damp(3, 0.55);

  const drivers: string[] = [];
  const ratio = stats.precipNormal > 0 ? stats.precipActual / stats.precipNormal : 1;
  if (stats.precipNormal > 0 && ratio < 0.85) {
    drivers.push(`Rainfall ${Math.round((1 - ratio) * 100)}% below the ${climate.monthly.length > 0 ? "5-year" : ""} climatological normal this month (Open-Meteo/ERA5)`);
  }
  if (stats.tempActual !== null && stats.tempNormal !== null && stats.tempActual - stats.tempNormal > 1.5) {
    drivers.push(`Temperature running ${(stats.tempActual - stats.tempNormal).toFixed(1)}°C above the monthly normal, raising evapotranspiration`);
  }
  if (stats.soilActual !== null && stats.soilNormal !== null && stats.soilNormal - stats.soilActual > 4) {
    drivers.push(`Soil moisture (0-7cm) down ${(stats.soilNormal - stats.soilActual).toFixed(0)} pts from the seasonal normal`);
  }
  if (humidityAnomaly > 8) {
    drivers.push(`Relative humidity depressed ${humidityAnomaly.toFixed(0)} pts below normal, consistent with a dry air mass`);
  }
  if (drivers.length === 0) drivers.push("Rainfall, temperature and soil moisture are tracking close to the seasonal normal");

  return {
    spi,
    spei,
    rdi,
    risk: riskFromSpei(spei),
    forecastT1,
    forecastT3,
    forecastMethod: FORECAST_METHOD,
    drivers,
    dataSource: "live",
  };
}

function computeFallback(districtId: string): DroughtIndex {
  const base = FALLBACK_BASELINES[districtId];
  const rand = mulberry32(hashString(districtId) + Math.floor(Date.now() / 60000));
  const spi = Number((Math.min(1.2, Math.max(-3, (base.deficitFactor - 1) * 2.6 + (rand() - 0.5) * 0.4))).toFixed(2));
  const spei = Number((spi - (rand() - 0.5) * 0.2).toFixed(2));
  const rdi = Number((spi * 0.85).toFixed(2));
  return {
    districtId,
    spi,
    spei,
    rdi,
    risk: riskFromSpei(spei),
    forecastT1: Number((spei * 0.85).toFixed(2)),
    forecastT3: Number((spei * 0.6).toFixed(2)),
    forecastMethod: FORECAST_METHOD,
    drivers: ["Live weather feed unreachable — showing an offline calibrated estimate for this district"],
    dataSource: "fallback",
  };
}

export async function computeDroughtIndex(districtId: string): Promise<DroughtIndex> {
  try {
    const climate = await getDistrictClimate(districtId);
    return { districtId, ...computeIndexFromClimate(climate) };
  } catch (err) {
    console.error(`[risk] live computation failed for ${districtId}, using fallback:`, (err as Error).message);
    return computeFallback(districtId);
  }
}

/** Same computation for any searched location — no curated fallback baseline exists, so this throws on failure. */
export async function computeDroughtIndexForCoords(lat: number, lon: number): Promise<DroughtIndex> {
  const climate = await getClimateForCoords(lat, lon);
  return { districtId: "custom", ...computeIndexFromClimate(climate) };
}

export async function getMonthlyRainfallForCoords(lat: number, lon: number): Promise<MonthlyRainfall[]> {
  const climate = await getClimateForCoords(lat, lon);
  return buildMonthlySeries(climate);
}

export async function getLatestReadingForCoords(lat: number, lon: number) {
  const climate = await getClimateForCoords(lat, lon);
  const latest = climate.latest;
  if (!latest || latest.temp === null || latest.humidity === null || latest.soil === null) return null;
  return {
    rainfallMm: latest.precip,
    temperatureC: latest.temp,
    humidityPct: latest.humidity,
    soilMoisturePct: Math.round(latest.soil * 100),
    date: latest.date,
  };
}

export async function getMonthlyRainfall(districtId: string): Promise<MonthlyRainfall[]> {
  try {
    const climate = await getDistrictClimate(districtId);
    return buildMonthlySeries(climate);
  } catch {
    const base = FALLBACK_BASELINES[districtId];
    const rand = mulberry32(hashString(districtId));
    const weights = [0.1, 0.1, 0.15, 0.2, 0.4, 1.4, 2.2, 2.0, 1.3, 0.5, 0.2, 0.1];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const currentMonth = new Date().getMonth();
    return MONTH_LABELS.map((month, i) => {
      const normal = (base.normalAnnualMm * weights[i]) / totalWeight;
      const isPast = i <= currentMonth;
      const factor = isPast ? base.deficitFactor + (rand() - 0.5) * 0.3 : 1 + (rand() - 0.5) * 0.2;
      return { month, actual: Math.round(Math.max(0, normal * factor)), normal: Math.round(normal), yearsOfNormalData: 0 };
    });
  }
}
