import { Aircraft, RegionKey } from "@/types/flight";
import { REGIONS } from "@/constants/regions";
import { getCallsignType } from "@/constants/military";
import { matchWatchlist } from "@/constants/watchlist";

// adsb.fi — free, no API key, community ADS-B feeders, no cloud IP blocking
// /v1/mil returns all military aircraft globally (~150-300 at any time)
const ADSB_FI_URL = "https://opendata.adsb.fi/api/v2/mil";

interface AdsbFiAircraft {
  hex: string;
  flight?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | "ground";
  gs?: number;       // knots
  track?: number;    // degrees true
  baro_rate?: number; // ft/min
  squawk?: string;
}

interface AdsbFiResponse {
  ac: AdsbFiAircraft[];
  now: number;
  total: number;
}

function parseAdsbFiAircraft(raw: AdsbFiAircraft, region: RegionKey): Aircraft | null {
  if (raw.lat == null || raw.lon == null) return null;

  // Filter to region bounding box (adsb.fi returns global, we slice)
  if (region !== "global") {
    const b = REGIONS[region].bounds;
    if (raw.lat < b.lat_min || raw.lat > b.lat_max ||
        raw.lon < b.lon_min || raw.lon > b.lon_max) return null;
  }

  const callsign = (raw.flight ?? "").trim();
  const onGround = raw.alt_baro === "ground" || raw.alt_baro === 0;
  const altFt = typeof raw.alt_baro === "number" ? raw.alt_baro : null;
  const watchlistTooltip = matchWatchlist(callsign) ?? undefined;

  return {
    icao24: raw.hex,
    callsign,
    origin_country: "",
    time_position: null,
    last_contact: Date.now() / 1000,
    longitude: raw.lon,
    latitude: raw.lat,
    baro_altitude: altFt != null ? altFt * 0.3048 : null,
    on_ground: onGround,
    velocity: raw.gs != null ? raw.gs * 0.514444 : null,
    true_track: raw.track ?? null,
    vertical_rate: raw.baro_rate != null ? raw.baro_rate * 0.00508 : null,
    sensors: null,
    geo_altitude: null,
    squawk: raw.squawk ?? null,
    spi: false,
    position_source: 0,
    isMilitary: true,
    aircraftType: getCallsignType(callsign),
    region,
    isWatchlisted: !!watchlistTooltip,
    watchlistTooltip,
  };
}

export async function fetchMilitaryFlights(region: RegionKey): Promise<Aircraft[]> {
  const res = await fetch(ADSB_FI_URL, {
    next: { revalidate: 30 },
    headers: { "Accept": "application/json", "User-Agent": "FlightInt/1.0" },
  });

  if (!res.ok) throw new Error(`ADSB.fi returned ${res.status}`);

  const data: AdsbFiResponse = await res.json();
  if (!data.ac?.length) return [];

  const aircraft: Aircraft[] = [];
  for (const raw of data.ac) {
    const parsed = parseAdsbFiAircraft(raw, region);
    if (parsed) aircraft.push(parsed);
  }

  return aircraft;
}
