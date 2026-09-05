import type {
  DroughtIndex,
  LoanApplication,
  MonthlyRainfall,
  NewsArticle,
  PayoutEvent,
  SensorReading,
} from "./types";

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8787";
export const WS_URL = API_URL.replace(/^http/, "ws");

const TOKEN_KEY = "neer-niti-token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // ignore parse failure
    }
    throw new ApiError(message, res.status);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  role: "farmer" | "admin";
}

export function apiRegister(name: string, phone: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, phone, password }),
  });
}

export function apiLogin(phone: string, password: string) {
  return request<{ token: string; user: AuthUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
}

export function apiMe() {
  return request<AuthUser>("/api/auth/me");
}

export function apiGetRisk(districtId: string) {
  return request<DroughtIndex>(`/api/districts/${districtId}/risk`);
}

export function apiGetRainfall(districtId: string) {
  return request<MonthlyRainfall[]>(`/api/districts/${districtId}/rainfall`);
}

export function apiGetSensor(districtId: string) {
  return request<SensorReading>(`/api/districts/${districtId}/sensor`);
}

export function apiGetNews() {
  return request<NewsArticle[]>("/api/news");
}

export function apiCreateLoan(input: {
  farmerName: string;
  phone: string;
  districtId: string;
  village: string;
  landSizeAcres: number;
  cropType: string;
  loanAmount: number;
  purpose: string;
}) {
  return request<LoanApplication>("/api/loans", { method: "POST", body: JSON.stringify(input) });
}

export function apiMyLoans() {
  return request<LoanApplication[]>("/api/loans/mine");
}

export interface AdminLoansResponse {
  applications: LoanApplication[];
  stats: {
    total: number;
    priorityCount: number;
    parametricCount: number;
    totalRequested: number;
    totalEstPayout: number;
    byDistrict: { districtId: string; appCount: number; requested: number }[];
  };
}

export function apiAdminAllLoans() {
  return request<AdminLoansResponse>("/api/loans/admin/all");
}

export function apiRecentPayouts() {
  return request<PayoutEvent[]>("/api/payouts");
}

export function apiPayoutsForDistrict(districtId: string) {
  return request<PayoutEvent[]>(`/api/payouts/${districtId}`);
}

export interface ApiKeyRecord {
  id: string;
  key: string;
  owner_name: string;
  owner_type: "insurer" | "government" | "research";
  created_at: string;
  revoked: 0 | 1;
}

export function apiListApiKeys() {
  return request<ApiKeyRecord[]>("/api/admin/api-keys");
}

export function apiCreateApiKey(ownerName: string, ownerType: ApiKeyRecord["owner_type"]) {
  return request<ApiKeyRecord>("/api/admin/api-keys", {
    method: "POST",
    body: JSON.stringify({ ownerName, ownerType }),
  });
}

export function apiRevokeApiKey(id: string) {
  return request<void>(`/api/admin/api-keys/${id}`, { method: "DELETE" });
}
