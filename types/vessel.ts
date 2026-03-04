import { RegionKey } from "./flight";

export interface Vessel {
  mmsi: string;
  name: string;
  callsign: string;
  shipType: number;           // AIS type code (35 = military)
  latitude: number;
  longitude: number;
  speed: number | null;       // knots
  course: number | null;      // degrees COG
  heading: number | null;     // degrees true heading
  navStatus: number;          // 0=underway, 1=anchor, 5=moored, 15=unknown
  destination: string;
  isMilitary: boolean;
  country: string;            // ISO-2 e.g. "US", "RU", "CN"
  navy: NavyKey;
  vesselCategory: VesselCategory;
  lastUpdate: number;         // unix ms
  region?: RegionKey;
}

export type VesselCategory =
  | "carrier"
  | "destroyer"
  | "cruiser"
  | "submarine"
  | "supply"
  | "amphibious"
  | "patrol"
  | "frigate"
  | "military-other";

export type NavyKey =
  | "us"
  | "uk"
  | "russia"
  | "china"
  | "india"
  | "israel"
  | "france"
  | "nato-other"
  | "other";

export const NAV_STATUS: Record<number, string> = {
  0: "Underway",
  1: "At Anchor",
  2: "Not Under Command",
  3: "Restricted Maneuverability",
  5: "Moored",
  6: "Aground",
  7: "Fishing",
  8: "Sailing",
  15: "Unknown",
};
