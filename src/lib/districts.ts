import type { District } from "./types";

export const DISTRICTS: District[] = [
  {
    id: "latur",
    name: "Latur",
    state: "Maharashtra",
    lat: 18.4,
    lon: 76.58,
    population: "24.5 lakh",
    primaryCrops: ["Soybean", "Tur (Pigeon Pea)", "Sugarcane"],
  },
  {
    id: "beed",
    name: "Beed",
    state: "Maharashtra",
    lat: 18.99,
    lon: 75.76,
    population: "26.3 lakh",
    primaryCrops: ["Cotton", "Soybean", "Jowar"],
  },
  {
    id: "barmer",
    name: "Barmer",
    state: "Rajasthan",
    lat: 25.75,
    lon: 71.39,
    population: "26.0 lakh",
    primaryCrops: ["Bajra", "Guar", "Moong"],
  },
  {
    id: "anantapur",
    name: "Anantapur",
    state: "Andhra Pradesh",
    lat: 14.68,
    lon: 77.6,
    population: "40.8 lakh",
    primaryCrops: ["Groundnut", "Cotton", "Sunflower"],
  },
  {
    id: "yavatmal",
    name: "Yavatmal",
    state: "Maharashtra",
    lat: 20.39,
    lon: 78.13,
    population: "27.7 lakh",
    primaryCrops: ["Cotton", "Soybean", "Tur"],
  },
  {
    id: "kalahandi",
    name: "Kalahandi",
    state: "Odisha",
    lat: 19.91,
    lon: 83.16,
    population: "16.0 lakh",
    primaryCrops: ["Paddy", "Maize", "Cotton"],
  },
];

export function getDistrict(id: string): District | undefined {
  return DISTRICTS.find((d) => d.id === id);
}
