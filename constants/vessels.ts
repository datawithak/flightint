import { NavyKey, Vessel, VesselCategory } from "@/types/vessel";

// ─── AIS Ship Type Codes ─────────────────────────────────────────────────────
// Type 35 = Military ops — this is the most reliable signal
export const MILITARY_AIS_TYPES = new Set([35, 58]); // 58 = medical transport

// ─── Vessel name prefixes by navy ────────────────────────────────────────────
// These are the standard designations used in AIS broadcasts.
// Not every warship uses them (especially Russia/China), but many do.

export const NAVY_NAME_PREFIXES: Array<{ prefix: string; navy: NavyKey }> = [
  // United States
  { prefix: "USS ",   navy: "us" },    // US Navy warships
  { prefix: "USNS ",  navy: "us" },    // Military Sealift Command (most visible on AIS)
  { prefix: "USCGC ", navy: "us" },    // Coast Guard cutters

  // United Kingdom
  { prefix: "HMS ",   navy: "uk" },    // Royal Navy
  { prefix: "RFA ",   navy: "uk" },    // Royal Fleet Auxiliary (supply, tankers — often visible)
  { prefix: "HMCS ",  navy: "uk" },    // Royal Canadian Navy

  // Russia
  { prefix: "RFS ",   navy: "russia" }, // Russian Federation Ship
  { prefix: "BSF ",   navy: "russia" }, // Black Sea Fleet vessels

  // China
  { prefix: "CNS ",   navy: "china" },  // Chinese Naval Ship
  { prefix: "PLAN ",  navy: "china" },  // People's Liberation Army Navy

  // India
  { prefix: "INS ",   navy: "india" },  // Indian Naval Ship
  { prefix: "ICGS ",  navy: "india" },  // Indian Coast Guard Ship

  // Israel
  { prefix: "INS ",   navy: "israel" }, // note: overlaps with India — use MMSI to disambiguate
  { prefix: "INSS ",  navy: "israel" },

  // France
  { prefix: "FS ",    navy: "france" }, // French Navy (Frégate)
  { prefix: "BSAM ",  navy: "france" }, // Base de Soutien et d'Assistance Métropolitaine

  // Other NATO
  { prefix: "HDMS ",  navy: "nato-other" }, // Danish Navy
  { prefix: "KNM ",   navy: "nato-other" }, // Norwegian Navy
  { prefix: "HNLMS ", navy: "nato-other" }, // Netherlands Navy
  { prefix: "ESPS ",  navy: "nato-other" }, // Spanish Navy
  { prefix: "ITS ",   navy: "nato-other" }, // Italian Navy
  { prefix: "FGS ",   navy: "nato-other" }, // German Navy (Fregattengeschwader)
  { prefix: "TCG ",   navy: "nato-other" }, // Turkish Navy
  { prefix: "ROKS ",  navy: "nato-other" }, // Republic of Korea Ship
  { prefix: "JS ",    navy: "nato-other" }, // Japan Maritime SDF
  { prefix: "HMAS ",  navy: "nato-other" }, // Royal Australian Navy
  { prefix: "HMNZS ", navy: "nato-other" }, // Royal New Zealand Navy
];

// ─── MMSI country code prefixes (first 3 digits) ─────────────────────────────
// MMSI format: MIDXXXXXX where MID = Maritime Identification Digit (country)
export const MMSI_NAVY_MAP: Record<string, NavyKey> = {
  "338": "us",      // United States
  "303": "us",      // United States (alternate)
  "366": "us",      // United States (Coast Guard)
  "367": "us",
  "368": "us",
  "369": "us",
  "232": "uk",      // United Kingdom
  "233": "uk",
  "234": "uk",
  "235": "uk",
  "273": "russia",  // Russia
  "412": "china",   // China
  "413": "china",
  "414": "china",
  "419": "india",   // India
  "428": "israel",  // Israel
  "226": "france",  // France
  "227": "france",
  "228": "france",
};

// ─── Vessel category detection ────────────────────────────────────────────────

export function categorizeVessel(name: string, aisType: number): VesselCategory {
  const u = name.toUpperCase();

  if (u.includes("CARRIER") || /\bCVN\b/.test(u) || /\bCV\b/.test(u))
    return "carrier";
  if (u.includes("DESTROYER") || /\bDDG\b/.test(u) || /\bDD\b/.test(u))
    return "destroyer";
  if (u.includes("CRUISER") || /\bCG\b/.test(u))
    return "cruiser";
  if (u.includes("SUBMARINE") || /\bSSN\b/.test(u) || /\bSSBN\b/.test(u) || /\bSS\b/.test(u))
    return "submarine";
  if (u.includes("SUPPLY") || u.includes("REPLENISHMENT") || u.includes("USNS") ||
      u.includes("TANKER") || u.includes("OILER") || u.startsWith("RFA"))
    return "supply";
  if (u.includes("AMPHIB") || /\bLHA\b/.test(u) || /\bLHD\b/.test(u) ||
      /\bLPD\b/.test(u) || /\bLSD\b/.test(u))
    return "amphibious";
  if (u.includes("FRIGATE") || /\bFFG\b/.test(u) || /\bFF\b/.test(u))
    return "frigate";
  if (u.includes("PATROL") || /\bPC\b/.test(u))
    return "patrol";

  return "military-other";
}

// ─── Navy detection from name + MMSI ─────────────────────────────────────────

export function detectNavy(name: string, mmsi: string): NavyKey {
  const mid = mmsi.substring(0, 3);
  const mapped = MMSI_NAVY_MAP[mid];
  if (mapped) {
    // Israel and India both use "INS " prefix — MMSI disambiguates
    return mapped;
  }
  // Fall back to name prefix
  const upper = name.toUpperCase();
  for (const { prefix, navy } of NAVY_NAME_PREFIXES) {
    if (upper.startsWith(prefix.toUpperCase())) return navy;
  }
  return "other";
}

// ─── Military vessel check ────────────────────────────────────────────────────

export function isMilitaryVessel(name: string, aisType: number): boolean {
  if (MILITARY_AIS_TYPES.has(aisType)) return true;
  const upper = name.toUpperCase().trim();
  return NAVY_NAME_PREFIXES.some(({ prefix }) =>
    upper.startsWith(prefix.toUpperCase())
  );
}

// ─── Navy display config ──────────────────────────────────────────────────────

export const NAVY_CONFIG: Record<NavyKey, { label: string; color: string; flag: string }> = {
  us:         { label: "US Navy",         color: "#1d4ed8", flag: "🇺🇸" },
  uk:         { label: "Royal Navy",      color: "#dc2626", flag: "🇬🇧" },
  russia:     { label: "Russian Navy",    color: "#b91c1c", flag: "🇷🇺" },
  china:      { label: "PLAN",            color: "#d97706", flag: "🇨🇳" },
  india:      { label: "Indian Navy",     color: "#ea580c", flag: "🇮🇳" },
  israel:     { label: "Israeli Navy",    color: "#0284c7", flag: "🇮🇱" },
  france:     { label: "French Navy",     color: "#7c3aed", flag: "🇫🇷" },
  "nato-other": { label: "NATO Ally",     color: "#0891b2", flag: "🌐" },
  other:      { label: "Unknown Navy",    color: "#6b7280", flag: "⚓" },
};

export const VESSEL_CATEGORY_ICONS: Record<VesselCategory, string> = {
  carrier:        "✈",   // carries aircraft
  destroyer:      "⚔",
  cruiser:        "⚔",
  submarine:      "▼",
  supply:         "⛽",
  amphibious:     "🚤",
  frigate:        "⚓",
  patrol:         "👁",
  "military-other": "⚓",
};
