export interface NewsArticle {
  id: string;
  category: "Alert" | "Scheme" | "Advisory" | "Market" | "Research";
  title: string;
  summary: string;
  date: string;
  districtId?: string;
}

export const STATIC_NEWS: NewsArticle[] = [
  {
    id: "n1",
    category: "Scheme",
    title: "PMFBY enrollment window extended for Kharif 2026",
    summary:
      "The government has extended the Pradhan Mantri Fasal Bima Yojana enrollment deadline by two weeks for Kharif crops following requests from state agriculture departments.",
    date: "2026-08-30",
  },
  {
    id: "n2",
    category: "Advisory",
    title: "IMD forecasts below-normal August rainfall for central India",
    summary:
      "The India Meteorological Department's monthly outlook flags a likely rainfall deficit across parts of Maharashtra and Telangana, with a weak monsoon trough expected to persist.",
    date: "2026-08-28",
  },
  {
    id: "n3",
    category: "Research",
    title: "Study: hyper-local SPEI forecasts cut insurance claim disputes by 40%",
    summary:
      "A field study across three drought-prone blocks found that publishing explainable, block-level drought indices reduced disputed crop insurance claims significantly.",
    date: "2026-08-22",
  },
  {
    id: "n4",
    category: "Market",
    title: "Soybean and cotton prices firm up on tighter kharif supply outlook",
    summary:
      "Mandi prices for soybean and cotton have risen over the past fortnight as traders price in lower expected yields from drought-affected belts.",
    date: "2026-08-18",
  },
  {
    id: "n5",
    category: "Scheme",
    title: "State disaster relief funds released for four drought-hit districts",
    summary:
      "Following block-level drought risk assessments, the state disaster management authority has released emergency relief funds ahead of the usual post-harvest timeline.",
    date: "2026-08-10",
  },
  {
    id: "n6",
    category: "Advisory",
    title: "Water-saving irrigation advisory issued for groundnut and bajra belts",
    summary:
      "Agriculture extension officers are advising drip irrigation and mulching for groundnut and bajra farmers in low-rainfall zones to conserve topsoil moisture.",
    date: "2026-08-05",
  },
];
