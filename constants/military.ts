import { AircraftType } from "@/types/flight";

// ─── ICAO HEX RANGES ────────────────────────────────────────────────────────
// Each country has an allocated block; military sub-ranges sit within them.

export const MILITARY_ICAO_RANGES: Array<{ min: number; max: number; country: string }> = [
  // ── United States ──────────────────────────────────────────────
  { min: 0xae0000, max: 0xaeffff, country: "US" },          // USAF / USN / USMC / Army

  // ── UK ─────────────────────────────────────────────────────────
  { min: 0x43c000, max: 0x43cfff, country: "UK" },          // RAF
  { min: 0x400000, max: 0x40003f, country: "UK" },          // Royal Navy

  // ── France ─────────────────────────────────────────────────────
  { min: 0x393000, max: 0x393fff, country: "France" },      // Armée de l'Air
  { min: 0x396000, max: 0x396fff, country: "France" },      // Marine Nationale

  // ── Germany ────────────────────────────────────────────────────
  { min: 0x3c0000, max: 0x3cffff, country: "Germany" },     // Luftwaffe

  // ── Israel ─────────────────────────────────────────────────────
  // Israeli Air Force — full country block; IAF uses most of it
  { min: 0x738000, max: 0x73ffff, country: "Israel" },

  // ── Saudi Arabia ───────────────────────────────────────────────
  // RSAF (Royal Saudi Air Force) shares the KSA block
  { min: 0x710000, max: 0x717fff, country: "Saudi Arabia" },

  // ── UAE ────────────────────────────────────────────────────────
  // UAE Air Force & Air Defence
  { min: 0x896000, max: 0x896fff, country: "UAE" },

  // ── Jordan ─────────────────────────────────────────────────────
  // RJAF (Royal Jordanian Air Force)
  { min: 0x740000, max: 0x747fff, country: "Jordan" },

  // ── Kuwait ─────────────────────────────────────────────────────
  { min: 0x760000, max: 0x767fff, country: "Kuwait" },

  // ── Bahrain ────────────────────────────────────────────────────
  { min: 0x768000, max: 0x76ffff, country: "Bahrain" },

  // ── Qatar ──────────────────────────────────────────────────────
  // QEAF (Qatar Emiri Air Force)
  { min: 0x770000, max: 0x777fff, country: "Qatar" },

  // ── Oman ───────────────────────────────────────────────────────
  { min: 0x778000, max: 0x77ffff, country: "Oman" },

  // ── Egypt ──────────────────────────────────────────────────────
  // EAF (Egyptian Air Force)
  { min: 0x010000, max: 0x017fff, country: "Egypt" },

  // ── Turkey ─────────────────────────────────────────────────────
  // Turkish Air Force (NATO member, active in Middle East/Syria)
  { min: 0x4b8000, max: 0x4bffff, country: "Turkey" },

  // ── Italy ──────────────────────────────────────────────────────
  // AMI (Aeronautica Militare Italiana) — active in ME ops
  { min: 0x300000, max: 0x33ffff, country: "Italy" },

  // ── Netherlands ────────────────────────────────────────────────
  { min: 0x480000, max: 0x487fff, country: "Netherlands" },

  // ── Greece ─────────────────────────────────────────────────────
  { min: 0x468000, max: 0x46ffff, country: "Greece" },

  // ── Canada ─────────────────────────────────────────────────────
  { min: 0xc00000, max: 0xc3ffff, country: "Canada" },      // RCAF
];

// ─── CALLSIGN PREFIXES ───────────────────────────────────────────────────────

export const MILITARY_CALLSIGN_PREFIXES: string[] = [
  // ── US Air Mobility Command (most common in ME) ─────────────────
  "RCH",      // USAF Reach — tanker/transport workhorse callsign
  "REACH",
  "EVAC",     // Aeromedical evacuation

  // ── US CENTCOM / regional ops ──────────────────────────────────
  "TOPCAT",   // USAF strike package lead
  "SHELL",    // US KC-135/KC-46 tanker (heavily used in ME)
  "COPPER",
  "DRAGON",
  "GRIZZLY",
  "POLAR",
  "SLIDER",
  "HOMER",
  "SLAM",
  "STORM",
  "BOXER",
  "DUKE",
  "ROCKY",
  "BISON",
  "BUCK",
  "RANGER",
  "LOBO",
  "DRACO",
  "CLAW",
  "FLASH",
  "SKULL",
  "HAVOC",
  "BLADE",
  "FORCE",
  "KNIFE",
  "SKIER",
  "GREY",
  "MAZDA",
  "GATOR",
  "VALOR",
  "NOBLE",
  "SWIFT",
  "IRON",
  "STEEL",
  "POLO",
  "GOLF",
  "HUNT",
  "SWORD",

  // ── US Special Air Mission (SPAR / SAM = VIP/State Dept) ──────
  "SPAR",
  "SAM",
  "EXEC",

  // ── US ISR / surveillance ──────────────────────────────────────
  "SENTRY",   // E-3 AWACS
  "RIVET",    // RC-135 Rivet Joint (SIGINT) — regular in ME
  "SCOPE",    // RC-135 Rivet Joint variant
  "COBRA",    // ISR
  "REAPER",   // MQ-9
  "RAVEN",    // USAF special ops
  "GHOST",

  // ── US fighter / strike ────────────────────────────────────────
  "EAGLE",    // F-15
  "VIPER",    // F-16
  "TIGER",
  "HAWK",
  "JAKE",
  "VENUS",    // Tanker
  "HERKY",    // C-130 Hercules
  "ATLAS",
  "TRIDENT",

  // ── NATO / E-3 AWACS ───────────────────────────────────────────
  "MAGIC",    // USAF AWACS callsign over Middle East
  "FOCUS",    // NATO AWACS
  "NATO",
  "DARK",     // Various NATO ops

  // ── UK RAF ─────────────────────────────────────────────────────
  "ASCOT",    // RAF Air Transport — very common, regular ME ops
  "RRR",      // RAF air-to-air refueling tanker
  "BAM",      // British Army Air Corps
  "TARTAN",   // RAF strike
  "KINGFISHER",
  "COMET",    // RAF Voyager tanker

  // ── France ─────────────────────────────────────────────────────
  "COTAM",    // French Air Force transport (Commandement du Transport)
  "FAF",      // French Air Force
  "FRENCH",

  // ── Israel (some IAF flights do appear on OpenSky) ─────────────
  "IAF",      // Israeli Air Force — sometimes used on ATC
  "ISAF",
  "ELB",      // Elbit / IAI test flights that surface

  // ── Tanker support callsigns seen over the Gulf ────────────────
  "TEXACO",   // Generic tanker
  "ARCO",     // Generic tanker
  "PETRO",    // Tanker
  "ESSO",     // Tanker

  // ── Other notable ──────────────────────────────────────────────
  "USAF",
  "NAVY",
  "USMC",
  "ARMY",
  "MIL",
];

// ─── MILITARY SQUAWK CODES ───────────────────────────────────────────────────
// Military aircraft sometimes broadcast these known squawk codes.
// Note: squawk alone isn't conclusive — use as a tie-breaker, not primary filter.

export const MILITARY_SQUAWKS = new Set([
  "7777",  // Military intercept in progress
  "7400",  // Lost link (UAS/drone — often military)
  // US military IFF Mode 3/A squawk blocks (4400–4477 range commonly cited)
  // We do a range check in the filter function instead of listing all 78.
]);

// ─── CALLSIGN → TYPE MAP ─────────────────────────────────────────────────────

export const CALLSIGN_TYPE_MAP: Record<string, AircraftType> = {
  // Transports
  RCH: "transport",
  REACH: "transport",
  EVAC: "transport",
  SPAR: "transport",
  HERKY: "transport",
  ATLAS: "transport",
  ASCOT: "transport",
  COTAM: "transport",
  // Tankers
  SHELL: "tanker",
  VENUS: "tanker",
  JAKE: "tanker",
  IRON: "tanker",
  TEXACO: "tanker",
  ARCO: "tanker",
  PETRO: "tanker",
  ESSO: "tanker",
  RRR: "tanker",
  COMET: "tanker",
  // Surveillance / ISR
  SENTRY: "surveillance",
  MAGIC: "surveillance",
  FOCUS: "surveillance",
  RIVET: "surveillance",
  SCOPE: "surveillance",
  REAPER: "surveillance",
  COBRA: "surveillance",
  // Fighters / Strike
  STEEL: "fighter",
  EAGLE: "fighter",
  VIPER: "fighter",
  GHOST: "fighter",
  RAVEN: "fighter",
  TIGER: "fighter",
  HAWK: "fighter",
  TOPCAT: "fighter",
  TARTAN: "fighter",
  SLAM: "fighter",
};

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

export function isICAOMilitary(icao24: string): boolean {
  const hex = parseInt(icao24, 16);
  if (isNaN(hex)) return false;
  return MILITARY_ICAO_RANGES.some((r) => hex >= r.min && hex <= r.max);
}

export function isMilitarySquawk(squawk: string | null): boolean {
  if (!squawk) return false;
  if (MILITARY_SQUAWKS.has(squawk)) return true;
  // US military IFF squawk range 4400–4477
  const code = parseInt(squawk, 8); // squawks are octal
  if (!isNaN(code) && code >= 0o4400 && code <= 0o4477) return true;
  return false;
}

export function getCallsignType(callsign: string): AircraftType {
  const upper = callsign.trim().toUpperCase();
  for (const [prefix, type] of Object.entries(CALLSIGN_TYPE_MAP)) {
    if (upper.startsWith(prefix)) return type;
  }
  return "unknown";
}

export function isMilitaryCallsign(callsign: string): boolean {
  const upper = callsign.trim().toUpperCase();
  return MILITARY_CALLSIGN_PREFIXES.some((p) => upper.startsWith(p));
}
