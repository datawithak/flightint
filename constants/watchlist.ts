export interface WatchlistEntry {
  prefix: string;
  tooltip: string;
}

export const WATCHLIST: WatchlistEntry[] = [
  { prefix: "RIVET",  tooltip: "SIGINT — Electronic eavesdropping & radar mapping" },
  { prefix: "JAKE",   tooltip: "SIGINT — Electronic eavesdropping & radar mapping" },
  { prefix: "FORTE",  tooltip: "UAV — High-altitude long-endurance surveillance drone" },
  { prefix: "HAWK",   tooltip: "UAV — High-altitude long-endurance surveillance drone" },
  { prefix: "LAGR",   tooltip: "TANKER — Aerial refueling for fighter jet strike packages" },
  { prefix: "NCHO",   tooltip: "TANKER — Aerial refueling for fighter jet strike packages" },
  { prefix: "SENTRY", tooltip: "AWACS — Airborne early warning and battle management" },
  { prefix: "NIGHTW", tooltip: "COMMAND — Doomsday aircraft for high-level command" },
  { prefix: "SPAR",   tooltip: "VIP — Transport for senior government/military officials" },
  { prefix: "SAM",    tooltip: "VIP — Transport for senior government/military officials" },
  { prefix: "PETRO",  tooltip: "STRIKE — Callsign linked to B-2 bomber refueling ops" },
];

export function matchWatchlist(callsign: string): string | null {
  const cs = callsign.trim().toUpperCase();
  for (const entry of WATCHLIST) {
    if (cs.startsWith(entry.prefix)) return entry.tooltip;
  }
  return null;
}
