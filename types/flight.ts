export interface Aircraft {
  icao24: string;       // Unique ICAO 24-bit address (hex)
  callsign: string;
  origin_country: string;
  time_position: number | null;
  last_contact: number;
  longitude: number | null;
  latitude: number | null;
  baro_altitude: number | null; // meters
  on_ground: boolean;
  velocity: number | null;      // m/s
  true_track: number | null;    // degrees (0=North, clockwise)
  vertical_rate: number | null; // m/s
  sensors: number[] | null;
  geo_altitude: number | null;
  squawk: string | null;
  spi: boolean;
  position_source: number;

  // Enriched fields (we add these)
  isMilitary: boolean;
  aircraftType: AircraftType;
  region?: RegionKey;
  isWatchlisted?: boolean;
  watchlistTooltip?: string;
}

export type AircraftType =
  | "tanker"
  | "transport"
  | "surveillance"
  | "fighter"
  | "helicopter"
  | "unknown";

export type RegionKey =
  | "middle-east"
  | "pacific"
  | "europe"
  | "us"
  | "india"
  | "global";

export interface Region {
  label: string;
  bounds: {
    lat_min: number;
    lon_min: number;
    lat_max: number;
    lon_max: number;
  };
}

export interface FlightFilters {
  region: RegionKey;
  aircraftType: AircraftType | "all";
  showGrounded: boolean;
  showVessels: boolean;
  showAircraft: boolean;
}

export interface AIAnalysis {
  summary: string;
  notableMovements: string[];
  generatedAt: number;
}

// Raw tuple from OpenSky API
export type OpenSkyState = [
  string,           // 0: icao24
  string | null,    // 1: callsign
  string,           // 2: origin_country
  number | null,    // 3: time_position
  number,           // 4: last_contact
  number | null,    // 5: longitude
  number | null,    // 6: latitude
  number | null,    // 7: baro_altitude
  boolean,          // 8: on_ground
  number | null,    // 9: velocity
  number | null,    // 10: true_track
  number | null,    // 11: vertical_rate
  number[] | null,  // 12: sensors
  number | null,    // 13: geo_altitude
  string | null,    // 14: squawk
  boolean,          // 15: spi
  number            // 16: position_source
];

export interface Geofence {
  lat_min: number;
  lat_max: number;
  lon_min: number;
  lon_max: number;
}

export interface OpenSkyResponse {
  time: number;
  states: OpenSkyState[] | null;
}
