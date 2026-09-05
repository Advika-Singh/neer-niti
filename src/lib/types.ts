export type RiskLevel = "Normal" | "Moderate" | "Severe" | "Extreme";

export interface MonthlyRainfall {
  month: string;
  actual: number;
  normal: number;
  yearsOfNormalData: number;
}

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: string;
  primaryCrops: string[];
}

export interface SensorReading {
  districtId: string;
  rainfallMm: number;
  temperatureC: number;
  humidityPct: number;
  soilMoisturePct: number;
  batteryPct: number;
  lastUpdated: string;
}

export interface DroughtIndex {
  districtId: string;
  spi: number;
  spei: number;
  rdi: number;
  risk: RiskLevel;
  forecastT1: number;
  forecastT3: number;
  forecastMethod: string;
  drivers: string[];
  dataSource: "live" | "fallback";
}

export interface LoanApplication {
  id: string;
  userId: string;
  farmerName: string;
  phone: string;
  districtId: string;
  village: string;
  landSizeAcres: number;
  cropType: string;
  loanAmount: number;
  purpose: string;
  submittedAt: string;
  updatedAt: string;
  status: "Pending" | "Under Review" | "Approved" | "Disbursed";
  priority: boolean;
  estimatedPayout: number;
  riskAtSubmission: RiskLevel;
  parametricEligible: boolean;
  payoutEventId: string | null;
}

export interface PayoutEvent {
  id: string;
  districtId: string;
  risk: RiskLevel;
  spei: number;
  threshold: number;
  triggeredAt: string;
  note: string;
}

export interface GeocodeResult {
  name: string;
  admin1: string | null;
  country: string | null;
  lat: number;
  lon: number;
}

export interface LocationLatestReading {
  rainfallMm: number;
  temperatureC: number;
  humidityPct: number;
  soilMoisturePct: number;
  date: string;
}

export interface NewsArticle {
  id: string;
  category: "Alert" | "Scheme" | "Advisory" | "Market" | "Research";
  title: string;
  summary: string;
  date: string;
  districtId?: string;
}
