import { Aircraft, AircraftType, Geofence, OpenSkyState, RegionKey } from "@/types/flight";
import {
  isICAOMilitary,
  isMilitaryCallsign,
  isMilitarySquawk,
  getCallsignType,
} from "@/constants/military";
import { REGIONS } from "@/constants/regions";

export function parseOpenSkyState(state: OpenSkyState): Aircraft | null {
  const [
    icao24,
    callsignRaw,
    origin_country,
    time_position,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    sensors,
    geo_altitude,
    squawk,
    spi,
    position_source,
  ] = state;

  if (latitude === null || longitude === null) return null;

  const callsign = (callsignRaw ?? "").trim();
  const isMilitary =
    isICAOMilitary(icao24) ||
    isMilitaryCallsign(callsign) ||
    isMilitarySquawk(squawk);

  if (!isMilitary) return null;

  const aircraftType: AircraftType = getCallsignType(callsign);

  return {
    icao24,
    callsign: callsign || icao24.toUpperCase(),
    origin_country,
    time_position,
    last_contact,
    longitude,
    latitude,
    baro_altitude,
    on_ground,
    velocity,
    true_track,
    vertical_rate,
    sensors,
    geo_altitude,
    squawk,
    spi,
    position_source,
    isMilitary: true,
    aircraftType,
    region: detectRegion(latitude, longitude),
  };
}

export function detectRegion(lat: number, lon: number): RegionKey {
  for (const [key, region] of Object.entries(REGIONS)) {
    if (key === "global") continue;
    const { lat_min, lat_max, lon_min, lon_max } = region.bounds;
    if (lat >= lat_min && lat <= lat_max && lon >= lon_min && lon <= lon_max) {
      return key as RegionKey;
    }
  }
  return "global";
}

export function filterAircraft(
  aircraft: Aircraft[],
  region: RegionKey,
  type: AircraftType | "all",
  showGrounded: boolean,
  geofence?: Geofence | null,
): Aircraft[] {
  return aircraft.filter((a) => {
    if (!showGrounded && a.on_ground) return false;
    if (type !== "all" && a.aircraftType !== type) return false;

    if (geofence) {
      // Geofence overrides region filter
      if (a.latitude == null || a.longitude == null) return false;
      if (a.latitude  < geofence.lat_min || a.latitude  > geofence.lat_max) return false;
      if (a.longitude < geofence.lon_min || a.longitude > geofence.lon_max) return false;
    } else {
      if (region !== "global" && a.region !== region) return false;
    }
    return true;
  });
}

export function metersToFeet(meters: number | null): string {
  if (meters === null) return "Unknown";
  return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
}

export function msToKnots(ms: number | null): string {
  if (ms === null) return "Unknown";
  return `${Math.round(ms * 1.94384)} kts`;
}

export function headingToCardinal(deg: number | null): string {
  if (deg === null) return "—";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
