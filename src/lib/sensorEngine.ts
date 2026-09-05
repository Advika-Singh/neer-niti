import type { RiskLevel } from "./types";

export const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; ring: string; dot: string }> = {
  Normal: { bg: "bg-brand-50", text: "text-brand-700", ring: "ring-brand-200", dot: "bg-brand-500" },
  Moderate: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", dot: "bg-amber-500" },
  Severe: { bg: "bg-drought-50", text: "text-drought-700", ring: "ring-drought-100", dot: "bg-drought-500" },
  Extreme: { bg: "bg-red-50", text: "text-red-700", ring: "ring-red-200", dot: "bg-red-600" },
};

export const RISK_HEX: Record<RiskLevel, string> = {
  Normal: "#357a35",
  Moderate: "#f59e0b",
  Severe: "#ea7c2b",
  Extreme: "#dc2626",
};

export const RISK_ORDER: Record<RiskLevel, number> = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Normal: 3,
};
