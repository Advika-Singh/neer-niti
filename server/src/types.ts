export type RiskLevel = "Normal" | "Moderate" | "Severe" | "Extreme";

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  population: string;
  primaryCrops: string[];
}

export interface MonthlyRainfall {
  month: string;
  actual: number;
  normal: number;
  yearsOfNormalData: number;
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

export type LoanStatus = "Pending" | "Under Review" | "Approved" | "Disbursed";

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
  status: LoanStatus;
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

export interface ApiKeyRecord {
  id: string;
  key: string;
  ownerName: string;
  ownerType: "insurer" | "government" | "research";
  createdAt: string;
  revoked: boolean;
}

export type UserRole = "farmer" | "admin";

export interface UserRecord {
  id: string;
  name: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}
