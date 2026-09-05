import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoanApplication, RiskLevel } from "./types";

export type Lang = "en" | "hi" | "ta";

interface Translations {
  nav_home: string;
  nav_dashboard: string;
  nav_map: string;
  nav_loans: string;
  nav_admin: string;
  nav_news: string;
  nav_concept: string;

  hero_badge: string;
  hero_title_1: string;
  hero_title_2: string;
  hero_tagline: string;
  hero_cta_dashboard: string;
  hero_cta_loan: string;
  home_features_heading: string;
  home_explore: string;
  home_watch_heading: string;
  home_full_dashboard: string;

  feat_dashboard_title: string;
  feat_dashboard_desc: string;
  feat_loan_title: string;
  feat_loan_desc: string;
  feat_news_title: string;
  feat_news_desc: string;
  feat_chatbot_title: string;
  feat_chatbot_desc: string;

  stat_land_label: string;
  stat_droughts_label: string;
  stat_pmfby_label: string;
  stat_payout_label: string;

  risk_normal: string;
  risk_moderate: string;
  risk_severe: string;
  risk_extreme: string;

  dash_title: string;
  dash_subtitle: string;
  dash_live: string;
  dash_current_risk: string;
  dash_forecast: string;
  dash_forecast_t1: string;
  dash_forecast_t3: string;
  dash_forecast_note: string;
  dash_live_readings: string;
  dash_battery: string;
  reading_rainfall: string;
  reading_temp: string;
  reading_humidity: string;
  reading_soil: string;
  chart_normal: string;
  chart_actual: string;
  dash_rainfall_chart: string;
  dash_why_forecast: string;
  dash_explain_note: string;
  dash_station_metadata: string;
  dash_population: string;
  dash_crops: string;
  dash_coordinates: string;

  map_title: string;
  map_subtitle: string;
  map_selected_station: string;
  map_caption: string;
  map_primary_crops: string;
  map_coordinates: string;
  map_residents: string;

  loan_title: string;
  loan_subtitle: string;
  loan_full_name: string;
  loan_phone: string;
  loan_district: string;
  loan_village: string;
  loan_land_size: string;
  loan_primary_crop: string;
  loan_amount: string;
  loan_purpose: string;
  loan_submit: string;
  loan_submitted: string;
  loan_your_applications: string;
  loan_none_yet: string;
  loan_priority_label: string;
  loan_priority: string;
  loan_requested: string;
  loan_est_payout: string;
  loan_fasttracked: string;
  loan_farmer_fallback: string;

  crop_soybean: string;
  crop_cotton: string;
  crop_bajra: string;
  crop_groundnut: string;
  crop_tur: string;
  crop_paddy: string;
  crop_jowar: string;
  crop_sugarcane: string;
  crop_other: string;

  purpose_seeds: string;
  purpose_irrigation: string;
  purpose_insurance: string;
  purpose_recovery: string;
  purpose_land: string;

  status_pending: string;
  status_under_review: string;
  status_approved: string;
  status_disbursed: string;

  admin_title: string;
  admin_subtitle: string;
  admin_total_apps: string;
  admin_priority: string;
  admin_total_requested: string;
  admin_total_payout: string;
  admin_by_status: string;
  admin_col_district: string;
  admin_col_risk: string;
  admin_col_spei: string;
  admin_col_apps: string;
  admin_col_requested: string;
  admin_empty_pre: string;
  admin_empty_link: string;
  admin_empty_post: string;

  news_title: string;
  news_subtitle: string;
  news_empty: string;
  filter_all: string;
  cat_alert: string;
  cat_scheme: string;
  cat_advisory: string;
  cat_market: string;
  cat_research: string;

  concept_kicker: string;
  concept_h1: string;
  concept_tagline: string;
  concept_eyebrow_1: string;
  concept_h_problem: string;
  concept_eyebrow_2: string;
  concept_h_solution: string;
  concept_eyebrow_3: string;
  concept_h_alignment: string;
  concept_eyebrow_4: string;
  concept_h_viability: string;
  concept_align_domain: string;
  concept_align_sdg: string;
  concept_align_gov: string;
  concept_why_six_label: string;
  concept_footer_thesis: string;

  footer_tagline: string;
  footer_helpline: string;

  bot_title: string;
  bot_subtitle: string;
  bot_greeting: string;
  bot_placeholder: string;

  sms_label: string;
  sms_note: string;
  sms_sender: string;
  sms_alert: string;
  sms_normal: string;

  listen: string;
}

export type TKey = keyof Translations;

const EN: Translations = {
  nav_home: "Home",
  nav_dashboard: "Sensor Dashboard",
  nav_map: "Risk Map",
  nav_loans: "Farmer Loans",
  nav_admin: "Policy View",
  nav_news: "News & Alerts",
  nav_concept: "Concept Note",

  hero_badge: "Satellite + IoT drought intelligence",
  hero_title_1: "From rainfall data to drought alerts —",
  hero_title_2: "in minutes, not months.",
  hero_tagline:
    "Neer-Niti replaces India's retroactive crop insurance model with an anticipatory one, flagging meteorological drought risk 1–6 months in advance at the block level.",
  hero_cta_dashboard: "View Sensor Dashboard",
  hero_cta_loan: "Apply for a Loan",
  home_features_heading: "Everything in one platform",
  home_explore: "Explore",
  home_watch_heading: "Districts to watch right now",
  home_full_dashboard: "Full dashboard",

  feat_dashboard_title: "Live Sensor Dashboard",
  feat_dashboard_desc: "ESP32 rain gauges and DHT22/BME280 stations feed real-time SPI/SPEI drought indices at block level.",
  feat_loan_title: "Farmer Loan Portal",
  feat_loan_desc: "Apply for crop financing and insurance support. High-risk districts are automatically fast-tracked.",
  feat_news_title: "News & Alerts",
  feat_news_desc: "Government schemes, monsoon advisories, and live drought alerts generated from sensor data.",
  feat_chatbot_title: "SukhaRakshak AI",
  feat_chatbot_desc: "Ask our chatbot about drought risk, loan eligibility, or how the science works — in plain language.",

  stat_land_label: "of India's land area is drought-prone (NDMA)",
  stat_droughts_label: "major droughts recorded in the last 120 years",
  stat_pmfby_label: "farmers enrolled under PMFBY in 2024–25",
  stat_payout_label: "of PMFBY applications historically received a payout",

  risk_normal: "Normal",
  risk_moderate: "Moderate",
  risk_severe: "Severe",
  risk_extreme: "Extreme",

  dash_title: "Sensor & Drought Dashboard",
  dash_subtitle: "Live rainfall, temperature, humidity & soil-moisture readings from Open-Meteo/ERA5, fused per district.",
  dash_live: "Live — updates every few seconds",
  dash_current_risk: "Current Risk Level",
  dash_forecast: "Forecast",
  dash_forecast_t1: "t+1 month",
  dash_forecast_t3: "t+3 months",
  dash_forecast_note: "SPEI-equivalent forecast index, projected from the recent trend.",
  dash_live_readings: "Live Sensor Readings",
  dash_battery: "Station battery",
  reading_rainfall: "Rainfall",
  reading_temp: "Temp",
  reading_humidity: "Humidity",
  reading_soil: "Soil Moisture",
  chart_normal: "Normal",
  chart_actual: "Actual",
  dash_rainfall_chart: "Rainfall vs. Normal —",
  dash_why_forecast: "Why this forecast?",
  dash_explain_note:
    "Each driver is computed directly from this district's real rainfall, temperature, humidity and soil-moisture readings against its 5-year climatological normal — a transparent formula, not a black-box model.",
  dash_station_metadata: "Station metadata",
  dash_population: "Population:",
  dash_crops: "Primary crops:",
  dash_coordinates: "Coordinates:",

  map_title: "District Risk Map",
  map_subtitle: "Station coordinates plotted by live drought risk tier.",
  map_selected_station: "Selected station",
  map_caption: "Positions are approximate, derived from station coordinates — not a precise map projection.",
  map_primary_crops: "Primary crops",
  map_coordinates: "Coordinates",
  map_residents: "{population} residents",

  loan_title: "Farmer Loan & Insurance Portal",
  loan_subtitle: "Always free for farmers. Districts with elevated drought risk are fast-tracked.",
  loan_full_name: "Full name",
  loan_phone: "Phone number",
  loan_district: "District",
  loan_village: "Village",
  loan_land_size: "Land size (acres)",
  loan_primary_crop: "Primary crop",
  loan_amount: "Loan amount requested (₹)",
  loan_purpose: "Purpose",
  loan_submit: "Submit Application",
  loan_submitted: "Application submitted successfully! Track its status on the right.",
  loan_your_applications: "Your Applications",
  loan_none_yet: "No applications yet. Submit the form to see it tracked here.",
  loan_priority_label: "Priority:",
  loan_priority: "{district} currently shows {risk} drought risk — your application will be expedited.",
  loan_requested: "Requested:",
  loan_est_payout: "Est. payout:",
  loan_fasttracked: "Fast-tracked — elevated drought risk",
  loan_farmer_fallback: "Farmer",

  crop_soybean: "Soybean",
  crop_cotton: "Cotton",
  crop_bajra: "Bajra",
  crop_groundnut: "Groundnut",
  crop_tur: "Tur (Pigeon Pea)",
  crop_paddy: "Paddy",
  crop_jowar: "Jowar",
  crop_sugarcane: "Sugarcane",
  crop_other: "Other",

  purpose_seeds: "Seeds & inputs",
  purpose_irrigation: "Irrigation equipment",
  purpose_insurance: "Crop insurance premium",
  purpose_recovery: "Post-drought recovery",
  purpose_land: "Land preparation",

  status_pending: "Pending",
  status_under_review: "Under Review",
  status_approved: "Approved",
  status_disbursed: "Disbursed",

  admin_title: "District Risk & Disbursement Overview",
  admin_subtitle:
    "Aggregate view for scheme administrators — the same live risk feed farmers see, plus every application submitted through the portal.",
  admin_total_apps: "Total applications",
  admin_priority: "Fast-tracked (priority)",
  admin_total_requested: "Total requested",
  admin_total_payout: "Total est. payout",
  admin_by_status: "Applications by status",
  admin_col_district: "District",
  admin_col_risk: "Risk",
  admin_col_spei: "SPEI",
  admin_col_apps: "Applications",
  admin_col_requested: "Requested",
  admin_empty_pre: "No applications submitted yet. Try the",
  admin_empty_link: "Farmer Loan Portal",
  admin_empty_post: "to populate this view.",

  news_title: "News & Drought Alerts",
  news_subtitle: "Live alerts generated from sensor data, plus curated agriculture news.",
  news_empty: "No articles in this category right now.",
  filter_all: "All",
  cat_alert: "Alert",
  cat_scheme: "Scheme",
  cat_advisory: "Advisory",
  cat_market: "Market",
  cat_research: "Research",

  concept_kicker: "Deep-Tech Summit · Round 1 — Concept Viability",
  concept_h1: "Not a better claims form — an earlier warning.",
  concept_tagline:
    "Neer-Niti fuses low-cost IoT field sensors with satellite reanalysis to flag agricultural drought risk 1–6 months out, early enough to act on rather than only file a claim against.",
  concept_eyebrow_1: "01 · The problem",
  concept_h_problem: "Drought is predictable. India's response to it isn't.",
  concept_eyebrow_2: "02 · The solution",
  concept_h_solution: "One pipeline, from a rain gauge to a fast-tracked loan.",
  concept_eyebrow_3: "03 · Domain alignment",
  concept_h_alignment: "Built at the intersection the round is scoring for.",
  concept_eyebrow_4: "04 · Conceptual viability",
  concept_h_viability: "Cheap to field, honest about what it needs to prove.",
  concept_align_domain: "Deep-tech domain",
  concept_align_sdg: "UN SDGs",
  concept_align_gov: "Government initiatives",
  concept_why_six_label: "Why these six:",
  concept_footer_thesis: "Not a better claims form — an earlier warning.",

  footer_tagline: "Neer-Niti — AI-powered meteorological drought prediction system.",
  footer_helpline: "PMFBY Helpline: 14447 · This is a prototype/demo build.",

  bot_title: "SukhaRakshak AI",
  bot_subtitle: "Drought & crop-finance assistant",
  bot_greeting: "Namaste! I'm SukhaRakshak, your drought & crop-finance assistant. Ask me anything.",
  bot_placeholder: "Ask about drought risk, loans…",

  sms_label: "Low-connectivity preview",
  sms_note:
    "The same alert, delivered as a plain-text SMS to feature phones with no data connection — no app, login, or smartphone required.",
  sms_sender: "SMS · sender ID VK-NEERNT",
  sms_alert: "NEER-NITI ALERT: {district} at {risk} drought risk (SPEI {spei}). Priority loan review: dial *555# or visit nearest CSC.",
  sms_normal: "NEER-NITI: {district} rainfall tracking near normal (SPEI {spei}). No action needed this week.",

  listen: "Listen",
};

const HI: Translations = {
  nav_home: "होम",
  nav_dashboard: "सेंसर डैशबोर्ड",
  nav_map: "जोखिम मानचित्र",
  nav_loans: "किसान ऋण",
  nav_admin: "नीति दृश्य",
  nav_news: "समाचार और चेतावनी",
  nav_concept: "संकल्पना नोट",

  hero_badge: "सैटेलाइट + IoT सूखा जानकारी",
  hero_title_1: "वर्षा के आँकड़ों से सूखे की चेतावनी तक —",
  hero_title_2: "महीनों में नहीं, मिनटों में।",
  hero_tagline:
    "नीर-नीति भारत की पुरानी फसल बीमा व्यवस्था को एक अग्रिम-चेतावनी प्रणाली से बदलती है, जो मौसम संबंधी सूखे के जोखिम को 1–6 महीने पहले, ब्लॉक स्तर पर बताती है।",
  hero_cta_dashboard: "सेंसर डैशबोर्ड देखें",
  hero_cta_loan: "ऋण के लिए आवेदन करें",
  home_features_heading: "एक ही मंच पर सब कुछ",
  home_explore: "देखें",
  home_watch_heading: "अभी ध्यान देने योग्य जिले",
  home_full_dashboard: "पूरा डैशबोर्ड",

  feat_dashboard_title: "लाइव सेंसर डैशबोर्ड",
  feat_dashboard_desc: "ESP32 वर्षामापी और DHT22/BME280 स्टेशन ब्लॉक स्तर पर वास्तविक समय में SPI/SPEI सूखा सूचकांक देते हैं।",
  feat_loan_title: "किसान ऋण पोर्टल",
  feat_loan_desc: "फसल वित्त और बीमा सहायता के लिए आवेदन करें। अधिक जोखिम वाले जिलों को स्वतः प्राथमिकता मिलती है।",
  feat_news_title: "समाचार और चेतावनी",
  feat_news_desc: "सरकारी योजनाएं, मानसून सलाह, और सेंसर डेटा से बनी लाइव सूखा चेतावनियां।",
  feat_chatbot_title: "सुखारक्षक AI",
  feat_chatbot_desc: "सूखे के जोखिम, ऋण पात्रता या विज्ञान के बारे में हमारे चैटबॉट से सरल भाषा में पूछें।",

  stat_land_label: "भारत का भूभाग सूखा-प्रवण है (NDMA)",
  stat_droughts_label: "पिछले 120 वर्षों में दर्ज बड़े सूखे",
  stat_pmfby_label: "2024–25 में PMFBY के तहत नामांकित किसान",
  stat_payout_label: "PMFBY आवेदनों में अब तक भुगतान मिला",

  risk_normal: "सामान्य",
  risk_moderate: "मध्यम",
  risk_severe: "गंभीर",
  risk_extreme: "अत्यधिक",

  dash_title: "सेंसर व सूखा डैशबोर्ड",
  dash_subtitle: "Open-Meteo/ERA5 से प्रत्येक ज़िले की लाइव वर्षा, तापमान, आर्द्रता व मिट्टी-नमी रीडिंग।",
  dash_live: "लाइव — हर कुछ सेकंड में अपडेट होता है",
  dash_current_risk: "वर्तमान जोखिम स्तर",
  dash_forecast: "पूर्वानुमान",
  dash_forecast_t1: "t+1 महीना",
  dash_forecast_t3: "t+3 महीने",
  dash_forecast_note: "हाल के रुझान से अनुमानित SPEI-समतुल्य पूर्वानुमान सूचकांक।",
  dash_live_readings: "लाइव सेंसर रीडिंग",
  dash_battery: "स्टेशन बैटरी",
  reading_rainfall: "वर्षा",
  reading_temp: "तापमान",
  reading_humidity: "आर्द्रता",
  reading_soil: "मिट्टी की नमी",
  chart_normal: "सामान्य",
  chart_actual: "वास्तविक",
  dash_rainfall_chart: "वर्षा बनाम सामान्य —",
  dash_why_forecast: "यह पूर्वानुमान क्यों?",
  dash_explain_note: "हर कारण इस ज़िले की वास्तविक वर्षा, तापमान, आर्द्रता व मिट्टी-नमी की तुलना उसके 5-वर्षीय सामान्य से करके निकाला गया है — एक पारदर्शी फ़ॉर्मूला, कोई ब्लैक-बॉक्स मॉडल नहीं।",
  dash_station_metadata: "स्टेशन जानकारी",
  dash_population: "जनसंख्या:",
  dash_crops: "मुख्य फसलें:",
  dash_coordinates: "निर्देशांक:",

  map_title: "जिला जोखिम मानचित्र",
  map_subtitle: "लाइव सूखा जोखिम स्तर के अनुसार स्टेशन निर्देशांक दिखाए गए हैं।",
  map_selected_station: "चयनित स्टेशन",
  map_caption: "स्थितियां अनुमानित हैं, स्टेशन निर्देशांकों से प्राप्त — यह सटीक मानचित्र प्रक्षेपण नहीं है।",
  map_primary_crops: "मुख्य फसलें",
  map_coordinates: "निर्देशांक",
  map_residents: "{population} निवासी",

  loan_title: "किसान ऋण एवं बीमा पोर्टल",
  loan_subtitle: "किसानों के लिए हमेशा नि:शुल्क। अधिक सूखा जोखिम वाले जिलों को प्राथमिकता दी जाती है।",
  loan_full_name: "पूरा नाम",
  loan_phone: "फ़ोन नंबर",
  loan_district: "जिला",
  loan_village: "गांव",
  loan_land_size: "भूमि का आकार (एकड़)",
  loan_primary_crop: "मुख्य फसल",
  loan_amount: "अनुरोधित ऋण राशि (₹)",
  loan_purpose: "उद्देश्य",
  loan_submit: "आवेदन जमा करें",
  loan_submitted: "आवेदन सफलतापूर्वक जमा हुआ! स्थिति दाईं ओर देखें।",
  loan_your_applications: "आपके आवेदन",
  loan_none_yet: "अभी तक कोई आवेदन नहीं। यहां देखने के लिए फ़ॉर्म जमा करें।",
  loan_priority_label: "प्राथमिकता:",
  loan_priority: "{district} वर्तमान में {risk} सूखा जोखिम दिखा रहा है — आपका आवेदन तेज़ किया जाएगा।",
  loan_requested: "अनुरोधित:",
  loan_est_payout: "अनुमानित भुगतान:",
  loan_fasttracked: "तेज़ किया गया — अधिक सूखा जोखिम",
  loan_farmer_fallback: "किसान",

  crop_soybean: "सोयाबीन",
  crop_cotton: "कपास",
  crop_bajra: "बाजरा",
  crop_groundnut: "मूंगफली",
  crop_tur: "तुअर (अरहर)",
  crop_paddy: "धान",
  crop_jowar: "ज्वार",
  crop_sugarcane: "गन्ना",
  crop_other: "अन्य",

  purpose_seeds: "बीज व सामग्री",
  purpose_irrigation: "सिंचाई उपकरण",
  purpose_insurance: "फसल बीमा प्रीमियम",
  purpose_recovery: "सूखे के बाद पुनर्वास",
  purpose_land: "भूमि तैयारी",

  status_pending: "लंबित",
  status_under_review: "समीक्षा में",
  status_approved: "स्वीकृत",
  status_disbursed: "वितरित",

  admin_title: "जिला जोखिम व वितरण अवलोकन",
  admin_subtitle: "योजना प्रशासकों के लिए समग्र दृश्य — वही लाइव जोखिम डेटा जो किसान देखते हैं, साथ ही पोर्टल के माध्यम से जमा हर आवेदन।",
  admin_total_apps: "कुल आवेदन",
  admin_priority: "तेज़ किए गए (प्राथमिकता)",
  admin_total_requested: "कुल अनुरोधित राशि",
  admin_total_payout: "कुल अनुमानित भुगतान",
  admin_by_status: "स्थिति अनुसार आवेदन",
  admin_col_district: "जिला",
  admin_col_risk: "जोखिम",
  admin_col_spei: "SPEI",
  admin_col_apps: "आवेदन",
  admin_col_requested: "अनुरोधित",
  admin_empty_pre: "अभी तक कोई आवेदन जमा नहीं हुआ। इसे देखने के लिए",
  admin_empty_link: "किसान ऋण पोर्टल",
  admin_empty_post: "आज़माएं।",

  news_title: "समाचार व सूखा चेतावनी",
  news_subtitle: "सेंसर डेटा से बनी लाइव चेतावनियां, साथ ही चुनिंदा कृषि समाचार।",
  news_empty: "इस श्रेणी में अभी कोई लेख नहीं है।",
  filter_all: "सभी",
  cat_alert: "चेतावनी",
  cat_scheme: "योजना",
  cat_advisory: "सलाह",
  cat_market: "बाज़ार",
  cat_research: "शोध",

  concept_kicker: "डीप-टेक समिट · राउंड 1 — संकल्पना व्यवहार्यता",
  concept_h1: "बेहतर दावा फॉर्म नहीं — एक पूर्व चेतावनी।",
  concept_tagline:
    "कम लागत वाले IoT फील्ड सेंसर को उपग्रह डेटा के साथ जोड़कर, नीर-नीति कृषि सूखे के जोखिम को फसल खराब होने से 1–6 महीने पहले चिन्हित करता है — कार्रवाई के लिए पर्याप्त समय के साथ।",
  concept_eyebrow_1: "01 · समस्या",
  concept_h_problem: "सूखे का अनुमान लगाया जा सकता है। भारत की प्रतिक्रिया नहीं।",
  concept_eyebrow_2: "02 · समाधान",
  concept_h_solution: "एक ही प्रक्रिया — वर्षामापी से लेकर तेज़ किए गए ऋण तक।",
  concept_eyebrow_3: "03 · क्षेत्र संरेखण",
  concept_h_alignment: "इस राउंड के मूल्यांकन मापदंडों के केंद्र में बनाया गया।",
  concept_eyebrow_4: "04 · संकल्पना व्यवहार्यता",
  concept_h_viability: "तैनात करना सस्ता, और जो साबित करना बाकी है उसके प्रति ईमानदार।",
  concept_align_domain: "डीप-टेक क्षेत्र",
  concept_align_sdg: "संयुक्त राष्ट्र सतत विकास लक्ष्य",
  concept_align_gov: "सरकारी पहल",
  concept_why_six_label: "यही छह जिले क्यों:",
  concept_footer_thesis: "बेहतर दावा फॉर्म नहीं — एक पूर्व चेतावनी।",

  footer_tagline: "नीर-नीति — AI-संचालित मौसम संबंधी सूखा पूर्वानुमान प्रणाली।",
  footer_helpline: "PMFBY हेल्पलाइन: 14447 · यह एक प्रोटोटाइप/डेमो निर्माण है।",

  bot_title: "सुखारक्षक AI",
  bot_subtitle: "सूखा व फसल-वित्त सहायक",
  bot_greeting: "नमस्ते! मैं सुखारक्षक हूं, आपका सूखा व फसल-वित्त सहायक। कुछ भी पूछें।",
  bot_placeholder: "सूखे के जोखिम, ऋण के बारे में पूछें…",

  sms_label: "कम-कनेक्टिविटी पूर्वावलोकन",
  sms_note: "वही चेतावनी, बिना डेटा कनेक्शन वाले फीचर फोन पर सादे टेक्स्ट SMS के रूप में — किसी ऐप, लॉगिन या स्मार्टफोन की ज़रूरत नहीं।",
  sms_sender: "SMS · प्रेषक ID VK-NEERNT",
  sms_alert: "NEER-NITI चेतावनी: {district} में {risk} सूखा जोखिम (SPEI {spei})। प्राथमिकता ऋण समीक्षा: *555# डायल करें या नज़दीकी CSC पर जाएं।",
  sms_normal: "NEER-NITI: {district} में वर्षा सामान्य के करीब है (SPEI {spei})। इस सप्ताह कोई कार्रवाई आवश्यक नहीं।",

  listen: "सुनें",
};

const TA: Translations = {
  nav_home: "முகப்பு",
  nav_dashboard: "சென்சார் டாஷ்போர்டு",
  nav_map: "ஆபத்து வரைபடம்",
  nav_loans: "விவசாயி கடன்கள்",
  nav_admin: "கொள்கை பார்வை",
  nav_news: "செய்திகள் & எச்சரிக்கைகள்",
  nav_concept: "கருத்துக் குறிப்பு",

  hero_badge: "செயற்கைக்கோள் + IoT வறட்சி நுண்ணறிவு",
  hero_title_1: "மழைப்பொழிவு தரவிலிருந்து வறட்சி எச்சரிக்கை வரை —",
  hero_title_2: "மாதங்களில் அல்ல, நிமிடங்களில்.",
  hero_tagline:
    "நீர்-நீதி இந்தியாவின் பிந்தைய-நடவடிக்கை பயிர் காப்பீட்டு முறையை முன்கூட்டிய எச்சரிக்கை முறையாக மாற்றுகிறது — வானிலை வறட்சி ஆபத்தை 1–6 மாதங்களுக்கு முன்பே வட்டார அளவில் கண்டறிகிறது.",
  hero_cta_dashboard: "சென்சார் டாஷ்போர்டைப் பார்க்கவும்",
  hero_cta_loan: "கடனுக்கு விண்ணப்பிக்கவும்",
  home_features_heading: "ஒரே தளத்தில் அனைத்தும்",
  home_explore: "ஆராயுங்கள்",
  home_watch_heading: "இப்போது கவனிக்க வேண்டிய மாவட்டங்கள்",
  home_full_dashboard: "முழு டாஷ்போர்டு",

  feat_dashboard_title: "நேரடி சென்சார் டாஷ்போர்டு",
  feat_dashboard_desc: "ESP32 மழை அளவீட்டாளர்களும் DHT22/BME280 நிலையங்களும் வட்டார அளவில் நேரடி SPI/SPEI வறட்சி குறியீடுகளை வழங்குகின்றன.",
  feat_loan_title: "விவசாயி கடன் போர்டல்",
  feat_loan_desc: "பயிர் நிதி மற்றும் காப்பீட்டு உதவிக்கு விண்ணப்பிக்கவும். அதிக ஆபத்துள்ள மாவட்டங்கள் தானாகவே முன்னுரிமை பெறும்.",
  feat_news_title: "செய்திகள் & எச்சரிக்கைகள்",
  feat_news_desc: "அரசு திட்டங்கள், பருவமழை ஆலோசனைகள், மற்றும் சென்சார் தரவிலிருந்து உருவாக்கப்படும் நேரடி வறட்சி எச்சரிக்கைகள்.",
  feat_chatbot_title: "சுகரக்ஷக் AI",
  feat_chatbot_desc: "வறட்சி ஆபத்து, கடன் தகுதி அல்லது இயங்குமுறை பற்றி எங்கள் சாட்பாட்டிடம் எளிய மொழியில் கேளுங்கள்.",

  stat_land_label: "இந்தியாவின் நிலப்பரப்பில் வறட்சிக்கு உட்பட்டது (NDMA)",
  stat_droughts_label: "கடந்த 120 ஆண்டுகளில் பதிவான பெரும் வறட்சிகள்",
  stat_pmfby_label: "2024–25ல் PMFBY-இல் பதிவு செய்த விவசாயிகள்",
  stat_payout_label: "PMFBY விண்ணப்பங்களில் இதுவரை பணம் பெற்றவை",

  risk_normal: "சாதாரணம்",
  risk_moderate: "மிதமானது",
  risk_severe: "கடுமையானது",
  risk_extreme: "தீவிரமானது",

  dash_title: "சென்சார் & வறட்சி டாஷ்போர்டு",
  dash_subtitle: "Open-Meteo/ERA5-இலிருந்து ஒவ்வொரு மாவட்டத்தின் நேரடி மழை, வெப்பநிலை, ஈரப்பதம் & மண் ஈரப்பத அளவீடுகள்.",
  dash_live: "நேரடி — ஒவ்வொரு சில வினாடிகளிலும் புதுப்பிக்கப்படுகிறது",
  dash_current_risk: "தற்போதைய ஆபத்து நிலை",
  dash_forecast: "முன்னறிவிப்பு",
  dash_forecast_t1: "t+1 மாதம்",
  dash_forecast_t3: "t+3 மாதங்கள்",
  dash_forecast_note: "சமீபத்திய போக்கிலிருந்து மதிப்பிடப்பட்ட SPEI-இணையான முன்னறிவிப்பு குறியீடு.",
  dash_live_readings: "நேரடி சென்சார் அளவீடுகள்",
  dash_battery: "நிலைய பேட்டரி",
  reading_rainfall: "மழைப்பொழிவு",
  reading_temp: "வெப்பநிலை",
  reading_humidity: "ஈரப்பதம்",
  reading_soil: "மண் ஈரப்பதம்",
  chart_normal: "சாதாரணம்",
  chart_actual: "உண்மையானது",
  dash_rainfall_chart: "மழைப்பொழிவு vs சாதாரணம் —",
  dash_why_forecast: "ஏன் இந்த முன்னறிவிப்பு?",
  dash_explain_note: "ஒவ்வொரு காரணமும் இந்த மாவட்டத்தின் உண்மையான மழை, வெப்பநிலை, ஈரப்பதம் மற்றும் மண் ஈரப்பதத்தை அதன் 5-வருட சராசரியுடன் ஒப்பிட்டு நேரடியாகக் கணக்கிடப்படுகிறது — இது ஒரு வெளிப்படையான சூத்திரம், ப்ளாக்-பாக்ஸ் மாடல் அல்ல.",
  dash_station_metadata: "நிலைய தகவல்கள்",
  dash_population: "மக்கள் தொகை:",
  dash_crops: "முக்கிய பயிர்கள்:",
  dash_coordinates: "ஆயத்தொலைவுகள்:",

  map_title: "மாவட்ட ஆபத்து வரைபடம்",
  map_subtitle: "நேரடி வறட்சி ஆபத்து நிலைப்படி நிலைய ஆயத்தொலைவுகள் காட்டப்பட்டுள்ளன.",
  map_selected_station: "தேர்ந்தெடுக்கப்பட்ட நிலையம்",
  map_caption: "இடங்கள் தோராயமானவை, நிலைய ஆயத்தொலைவுகளிலிருந்து பெறப்பட்டவை — இது துல்லியமான வரைபட திட்டமிடல் அல்ல.",
  map_primary_crops: "முக்கிய பயிர்கள்",
  map_coordinates: "ஆயத்தொலைவுகள்",
  map_residents: "{population} மக்கள்",

  loan_title: "விவசாயி கடன் மற்றும் காப்பீட்டு போர்டல்",
  loan_subtitle: "விவசாயிகளுக்கு எப்போதும் இலவசம். அதிக வறட்சி ஆபத்துள்ள மாவட்டங்கள் முன்னுரிமை பெறும்.",
  loan_full_name: "முழுப் பெயர்",
  loan_phone: "தொலைபேசி எண்",
  loan_district: "மாவட்டம்",
  loan_village: "கிராமம்",
  loan_land_size: "நில அளவு (ஏக்கர்)",
  loan_primary_crop: "முக்கிய பயிர்",
  loan_amount: "கோரப்படும் கடன் தொகை (₹)",
  loan_purpose: "நோக்கம்",
  loan_submit: "விண்ணப்பத்தை சமர்ப்பிக்கவும்",
  loan_submitted: "விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது! நிலையை வலதுபுறம் காணலாம்.",
  loan_your_applications: "உங்கள் விண்ணப்பங்கள்",
  loan_none_yet: "இதுவரை விண்ணப்பங்கள் இல்லை. இங்கே பார்க்க படிவத்தை சமர்ப்பிக்கவும்.",
  loan_priority_label: "முன்னுரிமை:",
  loan_priority: "{district} தற்போது {risk} வறட்சி ஆபத்தில் உள்ளது — உங்கள் விண்ணப்பம் விரைவுபடுத்தப்படும்.",
  loan_requested: "கோரப்பட்டது:",
  loan_est_payout: "மதிப்பிடப்பட்ட கொடுப்பனவு:",
  loan_fasttracked: "விரைவுபடுத்தப்பட்டது — அதிக வறட்சி ஆபத்து",
  loan_farmer_fallback: "விவசாயி",

  crop_soybean: "சோயாபீன்",
  crop_cotton: "பருத்தி",
  crop_bajra: "கம்பு",
  crop_groundnut: "நிலக்கடலை",
  crop_tur: "துவரை",
  crop_paddy: "நெல்",
  crop_jowar: "சோளம் (ஜோவர்)",
  crop_sugarcane: "கரும்பு",
  crop_other: "மற்றவை",

  purpose_seeds: "விதைகள் & பொருட்கள்",
  purpose_irrigation: "பாசன உபகரணங்கள்",
  purpose_insurance: "பயிர் காப்பீட்டு பிரீமியம்",
  purpose_recovery: "வறட்சிக்குப் பிந்தைய மீட்பு",
  purpose_land: "நில தயாரிப்பு",

  status_pending: "நிலுவையில்",
  status_under_review: "மறுஆய்வில்",
  status_approved: "அங்கீகரிக்கப்பட்டது",
  status_disbursed: "வழங்கப்பட்டது",

  admin_title: "மாவட்ட ஆபத்து & நிதி வழங்கல் மேலோட்டம்",
  admin_subtitle:
    "திட்ட நிர்வாகிகளுக்கான ஒருங்கிணைந்த பார்வை — விவசாயிகள் காணும் அதே நேரடி ஆபத்து தரவும், போர்டல் மூலம் சமர்ப்பிக்கப்பட்ட ஒவ்வொரு விண்ணப்பமும்.",
  admin_total_apps: "மொத்த விண்ணப்பங்கள்",
  admin_priority: "முன்னுரிமை (விரைவுபடுத்தப்பட்டவை)",
  admin_total_requested: "மொத்தம் கோரப்பட்டது",
  admin_total_payout: "மொத்த மதிப்பிடப்பட்ட கொடுப்பனவு",
  admin_by_status: "நிலைப்படி விண்ணப்பங்கள்",
  admin_col_district: "மாவட்டம்",
  admin_col_risk: "ஆபத்து",
  admin_col_spei: "SPEI",
  admin_col_apps: "விண்ணப்பங்கள்",
  admin_col_requested: "கோரப்பட்டது",
  admin_empty_pre: "இதுவரை விண்ணப்பங்கள் சமர்ப்பிக்கப்படவில்லை. இந்தப் பார்வையை நிரப்ப",
  admin_empty_link: "விவசாயி கடன் போர்டலை",
  admin_empty_post: "முயற்சிக்கவும்.",

  news_title: "செய்திகள் & வறட்சி எச்சரிக்கைகள்",
  news_subtitle: "சென்சார் தரவிலிருந்து உருவாகும் நேரடி எச்சரிக்கைகள், மற்றும் தேர்ந்தெடுக்கப்பட்ட விவசாய செய்திகள்.",
  news_empty: "இந்த வகையில் தற்போது கட்டுரைகள் இல்லை.",
  filter_all: "அனைத்தும்",
  cat_alert: "எச்சரிக்கை",
  cat_scheme: "திட்டம்",
  cat_advisory: "ஆலோசனை",
  cat_market: "சந்தை",
  cat_research: "ஆய்வு",

  concept_kicker: "டீப்-டெக் மாநாடு · சுற்று 1 — கருத்து சாத்தியக்கூறு",
  concept_h1: "சிறந்த உரிமைகோரல் படிவம் அல்ல — முன்கூட்டிய எச்சரிக்கை.",
  concept_tagline:
    "குறைந்த செலவிலான IoT கள சென்சார்களையும் செயற்கைக்கோள் தரவையும் இணைத்து, விவசாய வறட்சி ஆபத்தை 1–6 மாதங்களுக்கு முன்பே நீர்-நீதி எச்சரிக்கிறது — நடவடிக்கை எடுக்க போதுமான நேரத்துடன்.",
  concept_eyebrow_1: "01 · பிரச்சனை",
  concept_h_problem: "வறட்சியை முன்கூட்டியே அறியலாம். இந்தியாவின் பதில் அவ்வாறு இல்லை.",
  concept_eyebrow_2: "02 · தீர்வு",
  concept_h_solution: "ஒரே செயல்முறை — மழை அளவீட்டாளரிலிருந்து முன்னுரிமை கடன் வரை.",
  concept_eyebrow_3: "03 · துறை பொருத்தம்",
  concept_h_alignment: "இந்த சுற்று மதிப்பிடும் தொழில்நுட்ப மற்றும் கொள்கை பரிமாணங்களில் கட்டமைக்கப்பட்டது.",
  concept_eyebrow_4: "04 · கருத்து சாத்தியக்கூறு",
  concept_h_viability: "குறைந்த செலவில் செயல்படுத்தக்கூடியது.",
  concept_align_domain: "டீப்-டெக் துறை",
  concept_align_sdg: "ஐ.நா. நிலைத்த வளர்ச்சி இலக்குகள்",
  concept_align_gov: "அரசு திட்டங்கள்",
  concept_why_six_label: "ஏன் இந்த ஆறு மாவட்டங்கள்:",
  concept_footer_thesis: "சிறந்த உரிமைகோரல் படிவம் அல்ல — முன்கூட்டிய எச்சரிக்கை.",

  footer_tagline: "நீர்-நீதி — AI-இயங்கும் வானிலை வறட்சி முன்னறிவிப்பு அமைப்பு.",
  footer_helpline: "PMFBY உதவி எண்: 14447 · இது ஒரு முன்மாதிரி/டெமோ கட்டமைப்பு.",

  bot_title: "சுகரக்ஷக் AI",
  bot_subtitle: "வறட்சி & பயிர்-நிதி உதவியாளர்",
  bot_greeting: "வணக்கம்! நான் சுகரக்ஷக், உங்கள் வறட்சி & பயிர்-நிதி உதவியாளர். எதுவும் கேளுங்கள்.",
  bot_placeholder: "வறட்சி ஆபத்து, கடன்கள் பற்றி கேளுங்கள்…",

  sms_label: "குறைந்த இணைப்புள்ள முன்னோட்டம்",
  sms_note: "இதே எச்சரிக்கை, தரவு இணைப்பு இல்லாத சாதாரண போன்களுக்கு எளிய உரை SMS ஆக அனுப்பப்படுகிறது — ஆப் அல்லது ஸ்மார்ட்போன் தேவையில்லை.",
  sms_sender: "SMS · அனுப்புநர் ID VK-NEERNT",
  sms_alert: "NEER-NITI எச்சரிக்கை: {district} இல் {risk} வறட்சி ஆபத்து (SPEI {spei}). முன்னுரிமை கடன் மறுஆய்வு: *555# ஐ அழைக்கவும் அல்லது அருகிலுள்ள CSC-ஐ அணுகவும்.",
  sms_normal: "NEER-NITI: {district} இல் மழைப்பொழிவு சாதாரண நிலையில் உள்ளது (SPEI {spei}). இந்த வாரம் நடவடிக்கை தேவையில்லை.",

  listen: "கேளுங்கள்",
};

const DICT: Record<Lang, Translations> = { en: EN, hi: HI, ta: TA };

export const RISK_KEY: Record<RiskLevel, TKey> = {
  Normal: "risk_normal",
  Moderate: "risk_moderate",
  Severe: "risk_severe",
  Extreme: "risk_extreme",
};

export const STATUS_KEY: Record<LoanApplication["status"], TKey> = {
  Pending: "status_pending",
  "Under Review": "status_under_review",
  Approved: "status_approved",
  Disbursed: "status_disbursed",
};

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TKey) => string;
  tf: (key: TKey, vars: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = "neer-niti-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === "hi" || stored === "ta" ? stored : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    setLang: setLangState,
    t: (key) => DICT[lang][key],
    tf: (key, vars) => DICT[lang][key].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? "")),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
