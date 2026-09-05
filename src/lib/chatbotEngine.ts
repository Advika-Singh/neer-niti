import { DISTRICTS } from "./districts";
import { apiGetRisk, apiGetSensor, apiPayoutsForDistrict } from "./api";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
}

function findDistrictInText(text: string) {
  const lower = text.toLowerCase();
  return DISTRICTS.find((d) => lower.includes(d.name.toLowerCase()));
}

interface Intent {
  name: string;
  patterns: RegExp[];
  respond: (text: string) => Promise<string> | string;
}

const INTENTS: Intent[] = [
  {
    name: "district_risk",
    patterns: [/risk/i, /drought/i, /spi/i, /spei/i, /forecast/i, /status/i],
    respond: async (text) => {
      const district = findDistrictInText(text);
      if (!district) {
        const names = DISTRICTS.map((d) => d.name).join(", ");
        return `I can check live drought risk for: ${names}. Which district would you like?`;
      }
      const [idx, reading] = await Promise.all([apiGetRisk(district.id), apiGetSensor(district.id)]);
      return (
        `${district.name}, ${district.state} is currently at **${idx.risk}** drought risk` +
        `${idx.dataSource === "live" ? " (computed from live Open-Meteo/ERA5 data)" : ""}.\n\n` +
        `• SPI: ${idx.spi} · SPEI: ${idx.spei} · RDI: ${idx.rdi}\n` +
        `• Forecast (t+1 month): ${idx.forecastT1}, (t+3 months): ${idx.forecastT3}\n` +
        `• Soil moisture: ${reading.soilMoisturePct}% · Rainfall today: ${reading.rainfallMm}mm\n\n` +
        `Main driver: ${idx.drivers[0]}`
      );
    },
  },
  {
    name: "payout_status",
    patterns: [/payout/i, /parametric/i, /index insurance/i, /trigger/i, /auto.?pay/i],
    respond: async (text) => {
      const district = findDistrictInText(text);
      if (!district) {
        return (
          `Neer-Niti runs an **index-based (parametric) payout engine**: the moment a district's live SPEI crosses ` +
          `-1.0 (severe drought), every pending loan in that district is automatically fast-tracked and flagged ` +
          `payout-eligible — no claims adjuster, no waiting for harvest failure to be proven. Ask about a specific ` +
          `district to see if it's currently triggered.`
        );
      }
      const events = await apiPayoutsForDistrict(district.id);
      if (events.length === 0) {
        return `${district.name} has no parametric payout triggers on record — drought risk hasn't crossed the severe threshold yet.`;
      }
      const latest = events[0];
      return (
        `${district.name} has an active parametric payout trigger (SPEI ${latest.spei}, ${latest.risk} risk), ` +
        `fired ${new Date(latest.triggeredAt).toLocaleString()}. ${latest.note}`
      );
    },
  },
  {
    name: "loan_apply",
    patterns: [/loan/i, /insurance/i, /apply/i, /claim/i, /pmfby/i, /money/i, /fund/i],
    respond: () =>
      `You can apply for crop financing and insurance support on the **Farmer Loan Portal** page. ` +
      `Applications from districts with elevated drought risk are automatically fast-tracked, and districts with an ` +
      `active parametric payout trigger get flagged payout-eligible immediately. ` +
      `You'll need your name, phone number, village/district, land size, crop type, and the amount you're requesting.`,
  },
  {
    name: "sensor_explain",
    patterns: [/sensor/i, /esp32/i, /rain gauge/i, /dht22/i, /bme280/i, /how.*work/i, /iot/i],
    respond: () =>
      `Neer-Niti's field stations use an ESP32 microcontroller connected to a tipping-bucket rain gauge plus a DHT22/BME280 sensor for temperature and humidity. ` +
      `Today, before the pilot hardware mesh is deployed, rainfall/temperature/humidity/soil-moisture readings are pulled from real Open-Meteo/ERA5 data per district, ` +
      `and fused with a statistical model that projects SPI/SPEI drought severity 1 and 3 months ahead.`,
  },
  {
    name: "spi_explain",
    patterns: [/what is spi/i, /what.*spei/i, /what.*rdi/i, /index mean/i, /meteorological drought/i],
    respond: () =>
      `SPI (Standardized Precipitation Index) measures how far recent rainfall deviates from the long-term normal. ` +
      `SPEI adds temperature/evapotranspiration sensitivity, and RDI is a cross-check index. ` +
      `Values below -1.0 generally indicate severe drought, below -1.5 is extreme — and -1.0 is exactly the threshold that fires an automatic parametric payout.`,
  },
  {
    name: "pricing",
    patterns: [/price/i, /cost/i, /pay/i, /free/i, /subscription/i],
    respond: () =>
      `The farmer-facing app and district risk dashboard are **always free** for farmers. ` +
      `Insurers and government departments access the same live risk data via a per-district B2B API (X-API-Key header) or annual SaaS license.`,
  },
  {
    name: "contact",
    patterns: [/contact/i, /help/i, /support/i, /human/i, /agent/i, /call/i],
    respond: () =>
      `For urgent support, contact your nearest Krishi Vigyan Kendra or the PMFBY toll-free helpline: 14447. ` +
      `For questions about this platform, use the feedback link in the footer.`,
  },
  {
    name: "greeting",
    patterns: [/^hi\b/i, /^hello/i, /^hey/i, /namaste/i, /^good (morning|afternoon|evening)/i],
    respond: () =>
      `Namaste! I'm SukhaRakshak, your drought and crop-finance assistant. ` +
      `Ask me about drought risk in your district, whether a parametric payout has triggered, how to apply for a loan, or how our sensors work.`,
  },
];

const FALLBACK =
  `I'm not sure about that yet. Try asking about drought risk in a specific district (e.g. "risk in Latur"), ` +
  `whether a payout has triggered, how to apply for a loan, or how the sensor network works.`;

export async function getBotResponse(userText: string): Promise<string> {
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => p.test(userText))) {
      try {
        return await intent.respond(userText);
      } catch {
        return "I couldn't reach the live risk service just now — please try again in a moment.";
      }
    }
  }
  return FALLBACK;
}

export function suggestedPrompts(): string[] {
  return [
    "What's the drought risk in Latur?",
    "Has a payout triggered anywhere?",
    "How do I apply for a crop loan?",
    "What is SPEI?",
  ];
}
