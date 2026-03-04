import { Aircraft, OpenSkyResponse, RegionKey } from "@/types/flight";
import { REGIONS } from "@/constants/regions";
import { parseOpenSkyState } from "./military-filter";

const BASE_URL = "https://opensky-network.org/api/states/all";

export async function fetchMilitaryFlights(region: RegionKey): Promise<Aircraft[]> {
  const bounds = REGIONS[region].bounds;
  const params = new URLSearchParams({
    lamin: bounds.lat_min.toString(),
    lomin: bounds.lon_min.toString(),
    lamax: bounds.lat_max.toString(),
    lomax: bounds.lon_max.toString(),
  });

  const url = `${BASE_URL}?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 30 }, // cache for 30s — OpenSky rate limits unauthenticated to 10 req/min
    headers: {
      "Accept": "application/json",
    },
  });

  if (!res.ok) {
    if (res.status === 429) throw new Error("OpenSky rate limit hit — try again in 60s");
    throw new Error(`OpenSky API error: ${res.status}`);
  }

  const data: OpenSkyResponse = await res.json();

  if (!data.states) return [];

  const aircraft: Aircraft[] = [];
  for (const state of data.states) {
    const parsed = parseOpenSkyState(state);
    if (parsed) aircraft.push(parsed);
  }

  return aircraft;
}
